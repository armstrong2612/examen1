import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { ensureUserExists } from "./utils/ensureUserExists.js";

import sessionsRouter from "./routes/sessions.js";
import locksRouter from "./routes/locks.js";
import changesRouter from "./routes/changes.js";
import usersRouter from "./routes/users.js";
import projectsRouter from "./routes/projects.js";
import invitationsRouter from "./routes/invitations.js";
import diagramsRouter from "./routes/diagrams.js";
// 🧠 AI Integration
import aiRouter from "./routes/ai.js";

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// REST endpoints
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/dbcheck", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ ok: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.use("/api/sessions", sessionsRouter);
app.use("/api/locks", locksRouter);
app.use("/api/changes", changesRouter);
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/invitations", invitationsRouter);
app.use("/api/diagrams", diagramsRouter);
// 🧠 AI Integration
app.use("/api/ai", aiRouter);

// Servir archivos estáticos del frontend (SPA)
const webDistPath = path.resolve("/app/packages/web/dist");
app.use(express.static(webDistPath));

// Catch-all route para SPA routing (debe ir después de las rutas API)
app.get("*", (_req, res) => {
  res.sendFile(path.join(webDistPath, "index.html"));
});

// --- SOCKET.IO logic ---
// @ts-ignore - Mapa de presencia en memoria
if (!io.presence) io.presence = new Map();

io.on("connection", (socket) => {
  console.log(`[ws] client connected: ${socket.id}`);
  
  // Variable para almacenar info del usuario actual
  let currentUser: any = null;

  // New project-based collaboration with presence tracking
  socket.on("join-project", async ({ userId, projectId, name, role }: any) => {
    try {
      console.log(`🔌 [join-project] Payload received:`, { userId, projectId, name, role, socketId: socket.id });
      
      if (!userId || !projectId) {
        console.error(`❌ [join-project] Missing required fields:`, { userId, projectId });
        return socket.emit("error", { message: "Missing userId or projectId" });
      }

      // Verificar si el socket ya está en el room para evitar re-join múltiple
      const rooms = Array.from(socket.rooms);
      if (rooms.includes(projectId)) {
        console.warn(`⚠️ [join-project] Socket already in room ${projectId}, skipping re-join`);
        return;
      }

      socket.join(projectId);
      console.log(`✅ [join-project] User ${userId} joined project ${projectId}`);

      // Ensure user exists (solo si no es guest)
      if (!userId.startsWith("guest_")) {
        await ensureUserExists(userId);
      }

      // Obtener proyecto y rol desde DB
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { users: { include: { user: true } } },
      });

      if (!project) {
        console.error(`❌ [join-project] Project not found:`, projectId);
        return socket.emit("error", { message: "Project not found" });
      }

      const membership = project.users.find((u: any) => u.userId === userId);
      const effectiveRole = membership?.role || "VIEWER";
      const userName = name || membership?.user?.name || "Invitado";

      console.log(`👤 [join-project] User role:`, { userId, effectiveRole, membershipFound: !!membership });

      // Store user context in socket
      socket.data = { userId, projectId, role: effectiveRole, name: userName };
      console.log(`💾 [join-project] Socket data stored:`, socket.data);
      
      // Crear entrada de presencia
      currentUser = { 
        userId, 
        name: userName, 
        role: effectiveRole, 
        projectId, 
        socketId: socket.id,
        connectedAt: new Date().toISOString(),
        lastPing: Date.now()
      };

      // @ts-ignore
      const projectUsers = io.presence.get(projectId) || [];
      // Remover entrada anterior del mismo userId (si reconectó)
      const filteredUsers = projectUsers.filter((u: any) => u.userId !== userId);
      // @ts-ignore
      io.presence.set(projectId, [...filteredUsers, currentUser]);

      // Emitir lista actualizada de usuarios conectados
      // @ts-ignore
      const onlineUsers = io.presence.get(projectId) || [];
      io.to(projectId).emit("presence-update", onlineUsers);
      
      console.log(`📡 [join-project] Broadcasting presence: ${onlineUsers.length} user(s) online in ${projectId}`);
    } catch (err) {
      console.error(`🚨 [join-project] Error:`, err);
      socket.emit("error", { message: "Failed to join project" });
    }
  });

  // Ping para mantener presencia activa
  socket.on("ping-diagram", ({ projectId, userId }: any) => {
    try {
      // @ts-ignore
      const users = io.presence?.get(projectId) || [];
      const updatedUsers = users.map((u: any) => 
        u.userId === userId ? { ...u, lastPing: Date.now() } : u
      );
      // @ts-ignore
      io.presence.set(projectId, updatedUsers);
      console.log(`💓 [ping-diagram] User ${userId} pinged in project ${projectId}`);
    } catch (err) {
      console.error(`❌ [ping-diagram] Error:`, err);
    }
  });

  // Salir del proyecto manualmente (antes de desconexión)
  socket.on("leave-project", ({ projectId, userId }: any) => {
    try {
      // @ts-ignore
      const users = io.presence?.get(projectId) || [];
      const filteredUsers = users.filter((u: any) => u.userId !== userId);
      // @ts-ignore
      io.presence.set(projectId, filteredUsers);
      io.to(projectId).emit("presence-update", filteredUsers);
      socket.leave(projectId);
      console.log(`🚪 [leave-project] User ${userId} left project ${projectId}`);
    } catch (err) {
      console.error(`❌ [leave-project] Error:`, err);
    }
  });

  // Desconexión - limpiar presencia
  socket.on("disconnect", () => {
    if (currentUser) {
      const { projectId, userId, name } = currentUser;
      // @ts-ignore
      const users = (io.presence.get(projectId) || []).filter((u: any) => u.userId !== userId);
      // @ts-ignore
      io.presence.set(projectId, users);
      io.to(projectId).emit("presence-update", users);
      console.log(`🔌 [ws] ${name} disconnected from ${projectId}`);
    }
  });

  // Diagram changes with role validation and incremental updates
  socket.on("diagram-change", async ({ projectId, action, payload }) => {
    try {
      const { userId, role } = socket.data || {};
      
      console.log(`📨 [diagram-change] RECEIVED:`, { 
        projectId, 
        action, 
        payloadId: payload?.id,
        userId, 
        role,
        socketData: socket.data 
      });
      
      if (!userId || !projectId) {
        console.error("❌ [diagram-change] Not authenticated - missing userId or projectId");
        return socket.emit("error", { message: "Not authenticated" });
      }

      if (role === "VIEWER") {
        console.warn("⚠️ [diagram-change] VIEWER attempted to modify");
        return socket.emit("warning", { message: "VIEWER cannot modify diagram" });
      }

      console.log(`🔄 [diagram-change] ${action} by user ${userId} in project ${projectId}`);

      // Broadcast to all OTHER users in the project (not the sender)
      socket.to(projectId).emit("diagram-update", { action, payload });
      console.log(`📡 [diagram-change] Broadcasted ${action} to room ${projectId}`);

      // Apply incremental changes to database for persistence
      if (["ADD_NODE", "UPDATE_NODE", "MOVE_NODE", "DELETE_NODE", "ADD_EDGE", "DELETE_EDGE", "SYNC_EDGES"].includes(action)) {
        const existing = await prisma.diagram.findFirst({ 
          where: { projectId } 
        });

        if (existing) {
          const data: any = existing.data || { nodes: [], edges: [] };
          let updatedData = { ...data };

          switch (action) {
            case "ADD_NODE":
              // Evitar duplicados
              if (!updatedData.nodes.find((n: any) => n.id === payload.id)) {
                updatedData.nodes = [...(updatedData.nodes || []), payload];
                console.log(`➕ [diagram-change] Node ${payload.id} added`);
              }
              break;

            case "DELETE_NODE":
              updatedData.nodes = (updatedData.nodes || []).filter((n: any) => n.id !== payload.id);
              console.log(`🗑️ [diagram-change] Node ${payload.id} deleted`);
              break;

            case "UPDATE_NODE":
              // Actualizar todos los campos del nodo
              updatedData.nodes = (updatedData.nodes || []).map((n: any) =>
                n.id === payload.id ? { ...n, ...payload } : n
              );
              console.log(`✏️ [diagram-change] Node ${payload.id} updated (full)`);
              break;

            case "MOVE_NODE":
              // Solo actualizar la posición (optimizado para movimientos)
              updatedData.nodes = (updatedData.nodes || []).map((n: any) =>
                n.id === payload.id ? { ...n, position: payload.position } : n
              );
              console.log(`🎯 [diagram-change] Node ${payload.id} moved to`, payload.position);
              break;

            case "ADD_EDGE":
              if (!updatedData.edges.find((e: any) => e.id === payload.id)) {
                updatedData.edges = [...(updatedData.edges || []), payload];
                console.log(`🔗 [diagram-change] Edge ${payload.id} added`);
              }
              break;

            case "DELETE_EDGE":
              updatedData.edges = (updatedData.edges || []).filter((e: any) => e.id !== payload.id);
              console.log(`✂️ [diagram-change] Edge ${payload.id} deleted`);
              break;

            case "SYNC_EDGES":
              updatedData.edges = payload.edges || [];
              console.log(`🔗 [diagram-change] Edges synced (${updatedData.edges.length} total)`);
              break;
          }

          await prisma.diagram.update({
            where: { id: existing.id },
            data: { 
              data: updatedData, 
              version: { increment: 1 } 
            },
          });
          console.log(`💾 [diagram-change] Diagram ${existing.id} saved, version ${existing.version + 1}`);
        } else {
          // No existe diagrama, crear uno nuevo con el cambio actual
          console.warn(`⚠️ [diagram-change] No diagram found for project ${projectId}, creating new one...`);
          
          let initialData: any = { nodes: [], edges: [] };
          
          // Aplicar el cambio al diagrama vacío
          switch (action) {
            case "ADD_NODE":
              initialData.nodes = [payload];
              console.log(`➕ [diagram-change] Initial node ${payload.id} added`);
              break;
            case "ADD_EDGE":
              initialData.edges = [payload];
              console.log(`🔗 [diagram-change] Initial edge ${payload.id} added`);
              break;
            case "UPDATE_NODE":
            case "MOVE_NODE":
              initialData.nodes = [payload];
              console.log(`📝 [diagram-change] Initial node ${payload.id} created with update`);
              break;
          }
          
          const newDiagram = await prisma.diagram.create({
            data: {
              name: `Diagram for ${projectId}`,
              projectId,
              authorId: userId,
              data: initialData,
              version: 1
            }
          });
          console.log(`✅ [diagram-change] New diagram ${newDiagram.id} created for project ${projectId}`);
        }
      }
    } catch (err) {
      console.error("🚨 [diagram-change] Error:", err);
      socket.emit("error", { message: "Failed to process diagram change" });
    }
  });

  // Legacy diagram events (mantener compatibilidad)
  socket.on("join-diagram", async ({ userId, diagramId }) => {
    socket.join(diagramId);
    console.log(`[ws] ${userId} joined diagram ${diagramId}`);

    await ensureUserExists(userId);

    await prisma.session.create({
      data: { userId, diagramId },
    }).catch(() => {});

    io.to(diagramId).emit("presence-update", {
      diagramId,
      users: await prisma.session.findMany({
        where: {
          diagramId,
          endedAt: null,
          lastPing: { gt: new Date(Date.now() - 60000) },
        },
        include: { user: true },
      }),
    });
  });

  socket.on("ping-diagram", async ({ userId, diagramId }) => {
    await prisma.session.updateMany({
      where: { userId, diagramId, endedAt: null },
      data: { lastPing: new Date() },
    });
  });

  socket.on("leave-diagram", async ({ userId, diagramId }) => {
    await prisma.session.updateMany({
      where: { userId, diagramId, endedAt: null },
      data: { endedAt: new Date() },
    });
    io.to(diagramId).emit("presence-update", {
      diagramId,
      users: await prisma.session.findMany({
        where: {
          diagramId,
          endedAt: null,
          lastPing: { gt: new Date(Date.now() - 60000) },
        },
        include: { user: true },
      }),
    });
    socket.leave(diagramId);
    console.log(`[ws] ${userId} left diagram ${diagramId}`);
  });

  socket.on("lock-acquire", async ({ userId, diagramId, resourceId }) => {
    await ensureUserExists(userId);
    
    const expiresAt = new Date(Date.now() + 30000);
    const lock = await prisma.lock.upsert({
      where: { diagramId_resourceId: { diagramId, resourceId } },
      create: { diagramId, userId, resourceId, expiresAt },
      update: { userId, expiresAt, acquiredAt: new Date() },
    });
    io.to(diagramId).emit("lock-update", lock);
  });

  socket.on("lock-release", async ({ lockId, diagramId }) => {
    try {
      await prisma.lock.delete({ where: { id: lockId } });
    } catch {}
    io.to(diagramId).emit("lock-removed", { lockId });
  });

  socket.on("disconnect", async () => {
    console.log(`[ws] client disconnected: ${socket.id}`);
  });
});

// --- Global error handler ---
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[global-error]", err);
  res.status(500).json({ error: "Internal server error" });
});

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

// --- Limpieza automática de usuarios inactivos (cada 60s) ---
setInterval(() => {
  // @ts-ignore
  if (!io.presence) return;
  
  // @ts-ignore
  io.presence.forEach((users: any[], projectId: string) => {
    const now = Date.now();
    const active = users.filter((u: any) => now - u.lastPing < 60000);
    
    if (active.length !== users.length) {
      // @ts-ignore
      io.presence.set(projectId, active);
      io.to(projectId).emit("presence-update", active);
      console.log(`🧹 [cleanup] Removed ${users.length - active.length} inactive user(s) from ${projectId}`);
    }
  });
}, 60000);

// --- Start server ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`[server+ws] running on port ${PORT}`));
