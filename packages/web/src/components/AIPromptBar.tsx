// 🧠 AI Integration - Prompt Bar Component (Compact ChatGPT-style)
import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";

interface AIPromptBarProps {
  projectId: string;
  userId: string;
  onActionsReceived: (actions: any[]) => void;
  disabled?: boolean;
}

// Declaración de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function AIPromptBar({
  projectId,
  userId,
  onActionsReceived,
  disabled = false,
}: AIPromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar soporte de Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("🎤 [Voice] Transcribed:", transcript);
        setPrompt(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("❌ [Voice] Error:", event.error);
        setError(`Error de reconocimiento de voz: ${event.error}`);
        setIsRecording(false);
        setTimeout(() => setError(null), 3000);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) return;

    if (trimmedPrompt.length > 500) {
      setError("Prompt demasiado largo (máximo 500 caracteres)");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🧠 [AIPromptBar] Sending prompt to AI:", trimmedPrompt);

      const response = await api.post("/api/ai/parse-intent", {
        prompt: trimmedPrompt,
        projectId,
        userId,
      });

      const { actions, metadata } = response.data;

      console.log(
        `✅ [AIPromptBar] Received ${actions.length} action(s) from AI:`,
        actions
      );
      console.log("📊 [AIPromptBar] Metadata:", metadata);

      if (actions.length === 0) {
        setError("La IA no generó acciones válidas. Intenta reformular el prompt.");
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Enviar acciones al componente padre (DiagramEditor)
      console.log("📤 [AIPromptBar] Calling onActionsReceived with actions:", actions);
      onActionsReceived(actions);

      // Limpiar input después de éxito
      setPrompt("");
    } catch (err: any) {
      console.error("❌ [AIPromptBar] Error:", err);

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Error al procesar el prompt. Intenta de nuevo.";

      setError(errorMessage);

      // Auto-limpiar error después de 5 segundos
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enviar con Enter (sin Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleMicClick = () => {
    if (!speechSupported) {
      setError("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isRecording) {
      // Detener grabación
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      // Iniciar grabación
      setError(null);
      setIsRecording(true);
      try {
        recognitionRef.current?.start();
        console.log("🎤 [Voice] Recording started...");
      } catch (err) {
        console.error("❌ [Voice] Failed to start:", err);
        setIsRecording(false);
      }
    }
  };

  /**
   * Función auxiliar para redimensionar y comprimir imagen
   */
  const resizeAndCompressImage = (
    file: File,
    maxSize = 1200,
    quality = 0.8
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"));
      };

      img.onload = () => {
        try {
          // Calcular escala manteniendo proporción
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No se pudo obtener contexto del canvas"));
            return;
          }

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convertir a JPEG con calidad 0.8
          const compressed = canvas.toDataURL("image/jpeg", quality);

          // Extraer solo el Base64 (sin el prefijo data:image/jpeg;base64,)
          const base64 = compressed.split(",")[1];

          console.log(
            `📷 [Image] Resized to ${canvas.width}x${canvas.height}, size: ${Math.round(
              base64.length / 1024
            )}KB`
          );

          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error("Error al cargar la imagen"));
      };

      reader.readAsDataURL(file);
    });
  };

  /**
   * Manejar selección de archivo de imagen
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validar tamaño (máximo 20MB antes de comprimir)
    if (file.size > 20 * 1024 * 1024) {
      setError("La imagen es muy grande. Tamaño máximo: 20MB");
      setTimeout(() => setError(null), 3000);
      return;
    }

    console.log(`📷 [Image] File size: ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`);

    setLoading(true);
    setError(null);

    try {
      console.log("📷 [Image] Processing image:", file.name);

      // Redimensionar y comprimir imagen
      // Para diagramas simples: tamaño 1600px con calidad 0.7
      const imageBase64 = await resizeAndCompressImage(file, 1600, 0.7);

      // Validar tamaño después de comprimir
      const compressedSizeMB = (imageBase64.length * 0.75) / (1024 * 1024);
      console.log(`📷 [Image] Compressed size: ${compressedSizeMB.toFixed(2)}MB`);

      if (compressedSizeMB > 10) {
        setError(`Imagen muy grande después de comprimir (${compressedSizeMB.toFixed(1)}MB). Intenta con una imagen más pequeña o simple.`);
        setTimeout(() => setError(null), 5000);
        return;
      }

      console.log("🧠 [AIPromptBar] Sending image to AI...");

      // Enviar imagen al backend
      const response = await api.post("/api/ai/parse-image", {
        imageBase64,
        projectId,
        userId,
      });

      const { actions, metadata } = response.data;

      console.log(
        `✅ [AIPromptBar] Received ${actions.length} action(s) from image analysis:`,
        actions
      );
      console.log("📊 [AIPromptBar] Metadata:", metadata);

      if (actions.length === 0) {
        setError(
          "No se detectaron tablas o relaciones en la imagen. Intenta con otra imagen más clara."
        );
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Enviar acciones al componente padre (DiagramEditor)
      onActionsReceived(actions);

      // Limpiar input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("❌ [AIPromptBar] Image processing error:", err);
      console.error("❌ [AIPromptBar] Full error object:", JSON.stringify(err, null, 2));

      let errorMessage = "Error al analizar la imagen. Intenta con otra imagen.";

      if (err.response) {
        // Error del servidor
        errorMessage = err.response?.data?.error || err.response?.data?.details || errorMessage;
        console.error(`❌ [AIPromptBar] Server error (${err.response.status}):`, err.response.data);
      } else if (err.message) {
        // Error local (compresión, etc.)
        errorMessage = `Error procesando imagen: ${err.message}`;
        console.error("❌ [AIPromptBar] Local error:", err.message);
      }

      setError(errorMessage);

      // Auto-limpiar error después de 5 segundos
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir selector de archivos
   */
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Barra compacta */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(800px, 92%)",
          maxWidth: 800,
          zIndex: 1000,
        }}
      >
        {/* Mensaje de error discreto encima */}
        {error && (
          <div
            style={{
              marginBottom: 8,
              padding: "8px 16px",
              background: "#dc4b4b",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <span>{error}</span>
          </div>
        )}

        {/* Barra principal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#171a21",
            borderRadius: 24,
            padding: "8px 12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            border: "1px solid #2c3a48",
            gap: 8,
          }}
        >
          {/* Input principal */}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? "Escuchando..."
                : 'Ej: "Crea tabla cliente con id, nombre, email..."'
            }
            disabled={loading || disabled || isRecording}
            maxLength={500}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#c7d5e0",
              fontSize: 14,
              padding: "8px 12px",
            }}
          />

          {/* Contador de caracteres */}
          <span
            style={{
              fontSize: 11,
              color: prompt.length > 450 ? "#dc4b4b" : "#8f98a0",
              whiteSpace: "nowrap",
            }}
          >
            {prompt.length}/500
          </span>

          {/* Input oculto para archivos de imagen */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          {/* Botón de cámara/imagen */}
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={loading || disabled}
            style={{
              background: "transparent",
              border: "none",
              cursor: loading || disabled ? "not-allowed" : "pointer",
              padding: "6px 8px",
              transition: "all 0.2s",
              opacity: loading || disabled ? 0.3 : 1,
display: "flex",
                alignItems: "center",
                color: "#8f98a0",
                borderRadius: 8,
              }}
              title="Analizar imagen de diagrama"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>

          {/* Botón de micrófono (solo si está soportado) */}
          {speechSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={loading || disabled}
              style={{
                background: "transparent",
                border: "none",
                cursor: loading || disabled ? "not-allowed" : "pointer",
                padding: "6px 8px",
                transition: "all 0.2s",
                opacity: loading || disabled ? 0.3 : 1,
                display: "flex",
                alignItems: "center",
                color: isRecording ? "#dc4b4b" : "#8f98a0",
                borderRadius: 8,
              }}
              title={isRecording ? "Detener grabación" : "Grabar con voz"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          )}

          {/* Botón de enviar */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || disabled || !prompt.trim() || isRecording}
            style={{
              background:
                loading || disabled || !prompt.trim() || isRecording
                  ? "#2c3a48"
                  : "#66c0f4",
              color: loading || disabled || !prompt.trim() || isRecording ? "#6b7989" : "#fff",
              border: "none",
              borderRadius: 16,
              padding: "8px 20px",
              cursor:
                loading || disabled || !prompt.trim() || isRecording
                  ? "not-allowed"
                  : "pointer",
              fontSize: 14,
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            title="Enviar prompt (Enter)"
          >
            {loading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span>Generar</span>
              </>
            )}
          </button>
        </div>

        {/* Ayuda rápida (solo cuando está vacío) */}
        {!loading && !error && prompt.length === 0 && !isRecording && (
          <div
            style={{
              marginTop: 8,
              padding: "6px 16px",
              background: "#171a21",
              borderRadius: 8,
              color: "#8f98a0",
              fontSize: 11,
              textAlign: "center",
              border: "1px solid #2c3a48",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            Presiona{" "}
            <kbd
              style={{
                background: "#2c3a48",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace",
                border: "1px solid #42596e",
              }}
            >
              Enter
            </kbd>{" "}
            para enviar
            {speechSupported && (
              <>
                {" "}
                o{" "}
                <kbd
                  style={{
                    background: "#2c3a48",
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: "1px solid #42596e",
                  }}
                >
                  mic
                </kbd>{" "}
                para dictar
              </>
            )}
          </div>
        )}
      </div>

      {/* Keyframe animation para spinner */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}
