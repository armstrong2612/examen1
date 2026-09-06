import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAppStore } from "../store/useAppStore";
import { disconnectSocket } from "../socketManager";

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteProject, setInviteProject] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { setProject, logout } = useAppStore();

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      const res = await api.get(`/api/projects/${user.id}`);
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!name) {
      alert("Ingresa un nombre para el proyecto");
      return;
    }

    try {
      const res = await api.post("/api/projects", { name, userId: user.id });
      setProjects([...projects, res.data]);
      setName("");
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Error al crear proyecto");
    }
  };

  const createInvitation = async (projectId: string) => {
    try {
      const res = await api.post("/api/invitations/create", {
        projectId,
        role: "EDITOR",
      });
      setInviteLink(res.data.url);
      setInviteProject(projectId);
      console.log("✉️ [Dashboard] Universal invitation created:", res.data.url);
    } catch (err: any) {
      console.error("Failed to create invitation:", err);
      const errorMsg = err.response?.data?.error || "Error al crear invitación";
      alert(errorMsg);
    }
  };

  const openProject = (p: any) => {
    console.log("📂 [Dashboard] Opening project:", p.name);
    setProject(p);
    navigate(`/project/${p.id}`);
  };

  const joinByLink = () => {
    if (!joinLink) {
      alert("Ingresa un enlace de invitación");
      return;
    }

    // Extract token from link
    const tokenMatch = joinLink.match(/\/invite\/([a-f0-9]+)/);
    if (!tokenMatch) {
      alert("Enlace inválido. Debe ser: http://localhost:3001/invite/TOKEN");
      return;
    }

    const token = tokenMatch[1];
    console.log("🔗 [Dashboard] Navigating to invitation:", token);
    navigate(`/invite/${token}`);
  };

  const handleLogout = () => {
    console.log("🔒 [Dashboard] Logging out");
    disconnectSocket();
    logout();
    navigate("/");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1b2838",
      color: "#c7d5e0",
      padding: "40px"
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "26px", marginBottom: "8px", color: "#e6edf3" }}>
              Hola, {user.name}
            </h1>
            <p style={{ color: "#8f98a0" }}>{user.email}</p>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              background: "#dc4b4b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#b03838"}
            onMouseOut={(e) => e.currentTarget.style.background = "#dc4b4b"}
          >
            Cerrar sesión
          </button>
        </div>

        {loading ? (
          <p>Cargando proyectos...</p>
        ) : (
          <>
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "16px", color: "#e6edf3" }}>
                Mis Proyectos
              </h2>
              
              {projects.length === 0 ? (
                <div style={{
                  padding: "60px",
                  textAlign: "center",
                  background: "#171a21",
                  borderRadius: "12px",
                  border: "1px dashed #2c3a48"
                }}>
                  <p style={{ fontSize: "18px", color: "#8f98a0" }}>
                    No tienes proyectos aún. Crea uno para comenzar.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: "#171a21",
                        border: "1px solid #2c3a48",
                        padding: "20px",
                        borderRadius: "12px",
                        transition: "border-color 0.2s, box-shadow 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#66c0f4"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102,192,244,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2c3a48"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px"
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: "18px", marginBottom: "4px", color: "#e6edf3" }}>
                            {p.name}
                          </h3>
                          <p style={{ fontSize: "14px", color: "#8f98a0" }}>
                            {p.users?.length || 0} miembro(s) · {p.diagrams?.length || 0} diagrama(s)
                          </p>
                        </div>
                        
                        <button
                          onClick={() => openProject(p)}
                          style={{
                            padding: "10px 24px",
                            background: "#66c0f4",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#4da6e0"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#66c0f4"}
                        >
                          Abrir
                        </button>
                      </div>

                      {/* Invite section */}
                      <div style={{
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px solid #2c3a48"
                      }}>
                        <button
                          onClick={() => createInvitation(p.id)}
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            background: "rgba(59, 130, 246, 0.12)",
                            border: "1px solid rgba(59, 130, 246, 0.35)",
                            color: "#9cc9f5",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)"; e.currentTarget.style.borderColor = "#66c0f4"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.12)"; e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.35)"; }}
                        >
                          Generar Link de Invitación
                        </button>
                        
                        {inviteProject === p.id && inviteLink && (
                          <div style={{
                            marginTop: "12px",
                            padding: "12px",
                            background: "rgba(34, 197, 94, 0.1)",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                            borderRadius: "6px",
                            fontSize: "13px"
                          }}>
                            <div style={{ marginBottom: "8px", color: "#a5d96a", fontWeight: "bold" }}>
                              Link universal generado:
                            </div>
                            <code style={{
                              display: "block",
                              padding: "8px",
                              background: "#1b2838",
                              borderRadius: "4px",
                              wordBreak: "break-all",
                              color: "#a5d96a",
                              border: "1px solid #2c3a48"
                            }}>
                              {inviteLink}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create new project */}
            <div style={{
              padding: "24px",
              background: "#171a21",
              borderRadius: "12px",
              border: "1px solid #2c3a48"
            }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#e6edf3" }}>
                Crear Nuevo Proyecto
              </h3>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Nombre del proyecto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && createProject()}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #2c3a48",
                    background: "#1b2838",
                    color: "#c7d5e0",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#66c0f4"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#2c3a48"}
                />
                <button
                  onClick={createProject}
                  style={{
                    padding: "12px 32px",
                    background: "#66c0f4",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#4da6e0"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#66c0f4"}
                >
                  Crear
                </button>
              </div>
            </div>

            {/* Join by invitation link */}
            <div style={{
              padding: "24px",
              background: "#171a21",
              borderRadius: "12px",
              border: "1px solid #2c3a48",
              marginTop: "16px"
            }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#e6edf3" }}>
                Unirse con Enlace de Invitación
              </h3>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="http://localhost:3001/invite/XXXXXXXXXX"
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && joinByLink()}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #2c3a48",
                    background: "#1b2838",
                    color: "#c7d5e0",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#66c0f4"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#2c3a48"}
                />
                <button
                  onClick={joinByLink}
                  style={{
                    padding: "12px 32px",
                    background: "#7ab540",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#69983a"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#7ab540"}
                >
                  Unirme
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}