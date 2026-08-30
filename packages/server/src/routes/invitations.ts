import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { ensureUserExists } from "../utils/ensureUserExists.js";

const prisma = new PrismaClient();
const router = Router();

// POST /api/invitations/create
router.post("/create", async (req, res) => {
  try {
    const { projectId, role } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const token = crypto.randomBytes(16).toString("hex");

    const invitation = await prisma.invitation.create({
      data: { 
        projectId, 
        role: role || "EDITOR", 
        token 
      },
    });

    const url = `${process.env.APP_URL || "http://localhost:3001"}/invite/${token}`;
    console.log(`✉️ [invitations] Created universal invitation for project ${projectId}`);
    
    res.json({ url, token, invitation });
  } catch (err) {
    console.error("❌ [invitations] universal create failed:", err);
    res.status(500).json({ error: "Cannot create invitation" });
  }
});

// GET /api/invitations/:token
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { project: true },
    });
    
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    
    res.json(invitation);
  } catch (err) {
    console.error("[invitations] fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch invitation" });
  }
});

// POST /api/invitations/accept
router.post("/accept", async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    if (!token || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const invitation = await prisma.invitation.findUnique({ 
      where: { token },
      include: { project: true }
    });
    
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    // Garantizar que el usuario exista en la BD antes de enlazarlo al proyecto
    await ensureUserExists(userId);

    // Agregar usuario al proyecto (o actualizar rol si ya existe)
    await prisma.projectUser.upsert({
      where: { 
        userId_projectId: { 
          userId, 
          projectId: invitation.projectId 
        } 
      },
      create: { 
        userId, 
        projectId: invitation.projectId, 
        role: invitation.role 
      },
      update: { 
        role: invitation.role 
      },
    });

    // NO marcar como aceptada para que sea reutilizable
    console.log(`✅ [invitations] User ${userId} joined project ${invitation.projectId} as ${invitation.role}`);
    
    res.json({ 
      success: true, 
      project: invitation.project,
      role: invitation.role
    });
  } catch (err) {
    console.error("❌ [invitations] accept failed:", err);
    res.status(500).json({ error: "Failed to accept invitation" });
  }
});

export default router;
