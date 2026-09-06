import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAppStore } from "../store/useAppStore";

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, setUser, setProject } = useAppStore();
  const [status, setStatus] = useState("Validando invitación...");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    const loadInvite = async () => {
      try {
        console.log("🎟️ [AcceptInvite] Loading invitation:", token);
        
        const res = await api.get(`/api/invitations/${token}`);
        const invitation = res.data;
        
        console.log("✅ [AcceptInvite] Invitation found:", invitation);
        setProjectName(invitation.project.name);
        setStatus("Invitación válida");

        if (!user) {
          // Crear usuario temporal VIEWER y mostrar proyecto
          console.log("👥 [AcceptInvite] No user, entering as guest VIEWER");
          setStatus(`Accediendo al proyecto "${invitation.project.name}" como invitado...`);
          
          const guestUser = {
            id: `guest_${Date.now()}`,
            name: "Invitado",
            email: "guest@temp.com",
          };
          
          setUser(guestUser);
          setProject(invitation.project);
          
          setTimeout(() => {
            navigate(`/project/${invitation.project.id}?fromInvite=${token}`);
          }, 1500);
        } else {
          // Usuario ya autenticado: vincular al proyecto
          console.log("✅ [AcceptInvite] User logged in, accepting invitation");
          setStatus(`Uniéndote al proyecto "${invitation.project.name}"...`);
          
          await api.post("/api/invitations/accept", { 
            token, 
            userId: user.id 
          });
          
          setProject(invitation.project);
          
          setTimeout(() => {
            navigate(`/project/${invitation.project.id}`);
          }, 1500);
        }
      } catch (err: any) {
        console.error("❌ [AcceptInvite] Error:", err);
        console.error("❌ [AcceptInvite] Error details:", err.response?.data);
        if (err.response?.status === 404) {
          setStatus("Invitación no encontrada");
        } else {
          setStatus(`Error al procesar la invitación: ${err.message}`);
        }
      }
    };

    if (token) {
      loadInvite();
    }
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1b2838",
        color: "#c7d5e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#171a21",
          border: "1px solid #2c3a48",
          borderRadius: "12px",
          padding: "40px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)"
        }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "24px", color: "#e6edf3" }}>
          Invitación de Proyecto
        </h1>
        
        <div style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#8f98a0"
        }}>
          {status}
        </div>

        {projectName && (
          <div style={{
            marginTop: "24px",
            padding: "16px",
            background: "rgba(102,192,244,0.12)",
            border: "1px solid rgba(102,192,244,0.35)",
            borderRadius: "8px",
            fontSize: "16px"
          }}>
            <strong style={{ color: "#9cc9f5" }}>{projectName}</strong>
          </div>
        )}
      </div>
    </div>
  );
}