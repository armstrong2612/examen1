import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { ensureUserExists } from "./utils/ensureUserExists.js";
import { answerProjectQuestion } from "./services/aiService.js";

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

interface ProjectSocketAccess {
  userId: string;
  name: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  isGuest: boolean;
}

async function resolveProjectSocketAccess(
  userId: string,
  projectId: string,
  invitationToken: string | undefined,
  socketId: string
): Promise<ProjectSocketAccess | null> {
  if (userId.startsWith("guest_")) {
    if (!invitationToken) return null;

    const invitation = await prisma.invitation.findUnique({
      where: { token: invitationToken },
      select: { projectId: true },
    });

    if (!invitation || invitation.projectId !== projectId) return null;

    return {
      userId: `guest:${socketId}`,
      name: `Invitado ${socketId.slice(-4)}`,
      role: "VIEWER",
      isGuest: true,
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      owner: { select: { name: true } },
      users: {
        where: { userId },
        select: {
          role: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!project) return null;

  const membership = project.users[0];
  if (project.ownerId !== userId && !membership) return null;

  return {
    userId,
    name: project.ownerId === userId ? project.owner.name : membership!.user.name,
    role: project.ownerId === userId ? "OWNER" : membership!.role,
    isGuest: false,
  };
}

function getDiagramContext(data: unknown): string {
  if (!data || typeof data !== "object") return "El proyecto todavía no tiene un diagrama guardado.";

  const diagram = data as Record<string, unknown>;
  const nodes = Array.isArray(diagram.nodes) ? diagram.nodes : [];
  const edges = Array.isArray(diagram.edges) ? diagram.edges : [];
  const nodeNames = new Map<string, string>();

  const tables = nodes.slice(0, 40).map((value) => {
    const node = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const nodeData = node.data && typeof node.data === "object"
      ? node.data as Record<string, unknown>
      : {};
    const id = typeof node.id === "string" ? node.id : "";
    const name = typeof nodeData.name === "string"
      ? nodeData.name
      : typeof nodeData.label === "string" ? nodeData.label : "Tabla sin nombre";
    if (id) nodeNames.set(id, name);

    const fields = Array.isArray(nodeData.fields) ? nodeData.fields : [];
    return {
      name,
      fields: fields.slice(0, 30).map((fieldValue) => {
        const field = fieldValue && typeof fieldValue === "object"
          ? fieldValue as Record<string, unknown>
          : {};
        return {
          name: field.name,
          type: field.type,
          primary: field.isPrimary,
          foreign: field.isForeign,
          references: field.references,
        };
      }),
    };
  });

  const relations = edges.slice(0, 80).map((value) => {
    const edge = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const edgeData = edge.data && typeof edge.data === "object"
      ? edge.data as Record<string, unknown>
      : {};
    return {
      from: typeof edge.source === "string" ? nodeNames.get(edge.source) ?? edge.source : undefined,
      to: typeof edge.target === "string" ? nodeNames.get(edge.target) ?? edge.target : undefined,
      type: edgeData.relationType,
      multiplicity: edgeData.sourceMultiplicity && edgeData.targetMultiplicity
        ? `${String(edgeData.sourceMultiplicity)} - ${String(edgeData.targetMultiplicity)}`
        : undefined,
    };
  });

  const context = JSON.stringify({
    tables,
    relations,
    truncated: nodes.length > 40 || edges.length > 80,
  });
  return context.slice(0, 12000);
}

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

  const getCurrentProjectAccess = async (): Promise<ProjectSocketAccess | null> => {
    const data = socket.data || {};
    if (typeof data.projectId !== "string" || typeof data.userId !== "string") {
      return null;
    }

    return resolveProjectSocketAccess(
      data.isGuest ? "guest_socket" : data.userId,
      data.projectId,
      data.invitationToken,
      socket.id
    );
  };

  const getOrCreateConversation = (projectId: string) =>
    prisma.aiConversation.upsert({
      where: { projectId },
      create: { projectId },
      update: {},
    });

  const loadChatHistory = async (projectId: string) => {
    const conversation = await getOrCreateConversation(projectId);
    const messages = await prisma.aiChatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return messages.reverse();
  };

  // Only project members or visitors with a valid invitation may join the room.
  socket.on("join-project", async (payload: any = {}) => {
    try {
      const { userId, projectId, invitationToken } = payload;
      
      if (typeof userId !== "string" || typeof projectId !== "string") {
        console.error(`❌ [join-project] Missing required fields:`, { socketId: socket.id });
        return socket.emit("error", { message: "Missing userId or projectId" });
      }

      const access = await resolveProjectSocketAccess(
        userId,
        projectId,
        typeof invitationToken === "string" ? invitationToken : undefined,
        socket.id
      );

      if (!access) {
        console.warn(`⛔ [join-project] Access denied for user ${userId} in project ${projectId}`);
        return socket.emit("error", { message: "You are not authorized to join this project" });
      }

      if (currentUser && currentUser.projectId !== projectId) {
        const previousProjectId = currentUser.projectId;
        // @ts-ignore
        const previousUsers = (io.presence.get(previousProjectId) || [])
          .filter((u: any) => u.socketId !== socket.id);
        // @ts-ignore
        io.presence.set(previousProjectId, previousUsers);
        io.to(previousProjectId).emit("presence-update", previousUsers);
        socket.leave(previousProjectId);
        currentUser = null;
      }

      // Verificar si el socket ya está en el room para evitar re-join múltiple
      const rooms = Array.from(socket.rooms);
      if (rooms.includes(projectId)) {
        socket.data = {
          ...socket.data,
          userId: access.userId,
          projectId,
          role: access.role,
          name: access.name,
          isGuest: access.isGuest,
          invitationToken: access.isGuest ? invitationToken : undefined,
        };
        currentUser = { ...currentUser, ...access, projectId, socketId: socket.id };
        console.warn(`⚠️ [join-project] Socket already in room ${projectId}, skipping re-join`);
        socket.emit("project-joined", { projectId, role: access.role });
        return;
      }

      socket.data = {
        userId: access.userId,
        projectId,
        role: access.role,
        name: access.name,
        isGuest: access.isGuest,
        invitationToken: access.isGuest ? invitationToken : undefined,
      };
      socket.join(projectId);
      console.log(`✅ [join-project] ${access.userId} joined project ${projectId} as ${access.role}`);
      
      // Crear entrada de presencia
      currentUser = { 
        userId: access.userId, 
        name: access.name, 
        role: access.role, 
        projectId, 
        socketId: socket.id,
        connectedAt: new Date().toISOString(),
        lastPing: Date.now()
      };

      // @ts-ignore
      const projectUsers = io.presence.get(projectId) || [];
      // Remover entrada anterior del mismo userId (si reconectó)
      const filteredUsers = projectUsers.filter((u: any) => u.userId !== access.userId);
      // @ts-ignore
      io.presence.set(projectId, [...filteredUsers, currentUser]);

      // Emitir lista actualizada de usuarios conectados
      // @ts-ignore
      const onlineUsers = io.presence.get(projectId) || [];
      io.to(projectId).emit("presence-update", onlineUsers);
      
      console.log(`📡 [join-project] Broadcasting presence: ${onlineUsers.length} user(s) online in ${projectId}`);
      socket.emit("project-joined", { projectId, role: access.role });
    } catch (err) {
      console.error(`🚨 [join-project] Error:`, err instanceof Error ? err.message : "Unknown error");
      socket.emit("error", { message: "Failed to join project" });
    }
  });

  socket.on("ai-chat-history-request", async () => {
    try {
      const access = await getCurrentProjectAccess();
      if (!access) {
        return socket.emit("ai-chat-error", { message: "Join an authorized project before opening its AI chat" });
      }

      const history = await loadChatHistory(socket.data.projectId);
      socket.emit("ai-chat-history", { projectId: socket.data.projectId, messages: history });
    } catch (err) {
      console.error("[ai-chat] Failed to load history:", err instanceof Error ? err.message : "Unknown error");
      socket.emit("ai-chat-error", { message: "No se pudo cargar la conversación del equipo." });
    }
  });

  socket.on("ai-chat-send", async (payload: any = {}) => {
    const requestId = typeof payload.requestId === "string" && payload.requestId.length <= 100
      ? payload.requestId
      : undefined;

    try {
      const access = await getCurrentProjectAccess();
      const message = typeof payload.message === "string" ? payload.message.trim() : "";

      if (!access) {
        return socket.emit("ai-chat-error", { requestId, message: "No tienes acceso a este proyecto." });
      }
      if (!message || message.length > 2000) {
        return socket.emit("ai-chat-error", {
          requestId,
          message: "La pregunta debe tener entre 1 y 2000 caracteres.",
        });
      }
      if (!process.env.OPENAI_API_KEY) {
        return socket.emit("ai-chat-error", {
          requestId,
          message: "El moderador de IA no está configurado en el servidor.",
        });
      }

      const projectId = socket.data.projectId as string;
      const conversation = await getOrCreateConversation(projectId);
      const previousMessages = await prisma.aiChatMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      const history = previousMessages.reverse().map((item) => ({
        kind: item.kind,
        authorName: item.authorName,
        content: item.content,
      }));

      const userMessage = await prisma.aiChatMessage.create({
        data: {
          conversationId: conversation.id,
          kind: "USER",
          authorId: access.userId,
          authorName: access.name,
          content: message,
          requestId,
        },
      });

      io.to(projectId).emit("ai-chat-message", userMessage);

      const diagram = await prisma.diagram.findFirst({
        where: { projectId },
        select: { data: true },
      });
      const answer = await answerProjectQuestion(
        message,
        access.name,
        getDiagramContext(diagram?.data),
        history
      );

      const currentAccess = await getCurrentProjectAccess();
      if (!currentAccess) {
        return socket.emit("ai-chat-error", {
          requestId,
          message: "Se perdió el acceso al proyecto antes de completar la respuesta.",
        });
      }

      const assistantMessage = await prisma.aiChatMessage.create({
        data: {
          conversationId: conversation.id,
          kind: "ASSISTANT",
          authorName: "Moderador IA",
          content: answer,
          requestId,
        },
      });
      io.to(projectId).emit("ai-chat-message", assistantMessage);
    } catch (err) {
      console.error("[ai-chat] Failed to answer:", err instanceof Error ? err.message : "Unknown error");
      socket.emit("ai-chat-error", {
        requestId,
        message: "No se pudo generar la respuesta. Revisa la configuración del servicio de IA e inténtalo otra vez.",
      });
    }
  });

  // Ping para mantener presencia activa
  socket.on("ping-diagram", () => {
    try {
      if (!currentUser) return;
      const { projectId, userId, socketId } = currentUser;
      // @ts-ignore
      const users = io.presence?.get(projectId) || [];
      const updatedUsers = users.map((u: any) => 
        u.socketId === socketId ? { ...u, lastPing: Date.now() } : u
      );
      // @ts-ignore
      io.presence.set(projectId, updatedUsers);
      console.log(`💓 [ping-diagram] User ${userId} pinged in project ${projectId}`);
    } catch (err) {
      console.error(`❌ [ping-diagram] Error:`, err);
    }
  });

  // Salir del proyecto manualmente (antes de desconexión)
  socket.on("leave-project", () => {
    try {
      if (!currentUser) return;
      const { projectId, socketId, name } = currentUser;
      // @ts-ignore
      const users = io.presence?.get(projectId) || [];
      const filteredUsers = users.filter((u: any) => u.socketId !== socketId);
      // @ts-ignore
      io.presence.set(projectId, filteredUsers);
      io.to(projectId).emit("presence-update", filteredUsers);
      socket.leave(projectId);
      currentUser = null;
      socket.data = {};
      console.log(`🚪 [leave-project] ${name} left project ${projectId}`);
    } catch (err) {
      console.error(`❌ [leave-project] Error:`, err);
    }
  });

  // Desconexión - limpiar presencia
  socket.on("disconnect", () => {
    if (currentUser) {
      const { projectId, socketId, name } = currentUser;
      // @ts-ignore
      const users = (io.presence.get(projectId) || []).filter((u: any) => u.socketId !== socketId);
      // @ts-ignore
      io.presence.set(projectId, users);
      io.to(projectId).emit("presence-update", users);
      console.log(`🔌 [ws] ${name} disconnected from ${projectId}`);
    }
  });

  // Diagram changes with role validation and incremental updates
  socket.on("diagram-change", async ({ projectId, action, payload }) => {
    try {
      const access = await getCurrentProjectAccess();
      const { userId, role } = access || {};
      if (access) socket.data.role = access.role;
      
      console.log(`📨 [diagram-change] RECEIVED:`, { 
        projectId, 
        action, 
        payloadId: payload?.id,
        userId, 
        role,
        socketData: socket.data 
      });
      
      if (!userId || !projectId || projectId !== socket.data.projectId) {
        console.error("❌ [diagram-change] Rejected unauthenticated or cross-project change");
        return socket.emit("error", { message: "Not authorized for this project" });
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
