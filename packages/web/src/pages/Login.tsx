import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAppStore } from "../store/useAppStore";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setProject } = useAppStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    
    if (!email || !name) {
      setError("Por favor, completa todos los campos");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un email válido");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/login", { email, name });
      const loggedUser = res.data;
      setUser(loggedUser);
      
      // Verificar si viene de una invitación (parámetro fromInvite en URL)
      const inviteToken = searchParams.get("fromInvite");
      if (inviteToken) {
        console.log("🎟️ [Login] Vinculando usuario a proyecto desde invitación:", inviteToken);
        
        try {
          // Vincular usuario al proyecto
          await api.post("/api/invitations/accept", { 
            token: inviteToken, 
            userId: loggedUser.id 
          });
          
          // Obtener datos del proyecto
          const inviteRes = await api.get(`/api/invitations/${inviteToken}`);
          const project = inviteRes.data.project;
          
          setProject(project);
          navigate(`/project/${project.id}`);
          return;
        } catch (err) {
          console.error("❌ [Login] Error vinculando invitación:", err);
          setError("Error al vincular con el proyecto");
          setLoading(false);
          return;
        }
      }
      
      // Verificar si hay una URL de retorno guardada
      const returnUrl = sessionStorage.getItem("returnUrl");
      if (returnUrl) {
        sessionStorage.removeItem("returnUrl");
        navigate(returnUrl);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Error al iniciar sesión. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#1b2838",
      color: "#c7d5e0",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "400px",
        padding: "40px",
        background: "#171a21",
        borderRadius: "12px",
        border: "1px solid #2c3a48",
        boxShadow: "0 8px 30px rgba(0,0,0,0.35)"
      }}>
        <h1 style={{ 
          fontSize: "26px", 
          marginBottom: "8px",
          color: "#e6edf3",
          fontWeight: 700
        }}>
          Diagramador ER Colaborativo
        </h1>
        <p style={{ 
          fontSize: "15px", 
          color: "#8f98a0", 
          marginBottom: "32px" 
        }}>
          Diseña, colabora y genera SQL
        </p>
        
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "#f4b1b1",
            textAlign: "left"
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: "16px" }}>
          <input 
            type="email"
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #2c3a48",
              background: "#1b2838",
              color: "#c7d5e0",
              fontSize: "15px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s"
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#66c0f4"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102,192,244,0.2)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#2c3a48"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <input 
            type="text"
            placeholder="Nombre completo" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #2c3a48",
              background: "#1b2838",
              color: "#c7d5e0",
              fontSize: "15px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s"
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#66c0f4"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102,192,244,0.2)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#2c3a48"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: loading ? "#2c3a48" : "#66c0f4",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s, transform 0.1s",
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#4da6e0")}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#66c0f4")}
        >
          {loading ? "Entrando..." : "Iniciar Sesión / Registrarse"}
        </button>
      </div>
    </div>
  );
}