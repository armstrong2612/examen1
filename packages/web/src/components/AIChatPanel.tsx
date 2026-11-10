import { useEffect, useRef, useState, FormEvent } from "react";
import type { Socket } from "socket.io-client";

interface AIChatMessage {
  id: string;
  kind: "USER" | "ASSISTANT";
  authorId: string | null;
  authorName: string;
  content: string;
  requestId: string | null;
  createdAt: string;
}

interface AIChatPanelProps {
  socket: Socket | null;
  projectId: string;
  userId: string;
}

export function AIChatPanel({ socket, projectId, userId }: AIChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(socket?.connected ?? false);
  const [joinedProjectId, setJoinedProjectId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ready = connected && joinedProjectId === projectId;

  useEffect(() => {
    if (!socket) {
      setConnected(false);
      setJoinedProjectId(null);
      return;
    }

    setMessages([]);
    setConnected(socket.connected);
    setJoinedProjectId(null);

    const requestHistory = () => socket.emit("ai-chat-history-request");
    const onConnect = () => {
      setConnected(true);
      setJoinedProjectId(null);
      requestHistory();
    };
    const onDisconnect = () => {
      setConnected(false);
      setJoinedProjectId(null);
    };
    const onProjectJoined = (event: { projectId: string }) => {
      if (event.projectId !== projectId) return;
      setJoinedProjectId(projectId);
      requestHistory();
    };
    const onHistory = (history: { projectId: string; messages: AIChatMessage[] }) => {
      if (history.projectId !== projectId) return;
      setJoinedProjectId(projectId);
      setMessages(Array.isArray(history.messages) ? history.messages : []);
      setError(null);
    };
    const onMessage = (message: AIChatMessage) => {
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message]
      );
      if (message.kind === "ASSISTANT" && message.requestId) {
        setPendingRequests((current) => {
          const next = new Set(current);
          next.delete(message.requestId!);
          return next;
        });
      }
    };
    const onError = (response: { message?: string; requestId?: string }) => {
      setError(response.message || "Ocurrió un error en el chat.");
      if (response.requestId) {
        setPendingRequests((current) => {
          const next = new Set(current);
          next.delete(response.requestId!);
          return next;
        });
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("project-joined", onProjectJoined);
    socket.on("ai-chat-history", onHistory);
    socket.on("ai-chat-message", onMessage);
    socket.on("ai-chat-error", onError);

    const retryTimer = window.setTimeout(requestHistory, 500);
    if (socket.connected) requestHistory();

    return () => {
      window.clearTimeout(retryTimer);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("project-joined", onProjectJoined);
      socket.off("ai-chat-history", onHistory);
      socket.off("ai-chat-message", onMessage);
      socket.off("ai-chat-error", onError);
    };
  }, [socket, projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, pendingRequests]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (!socket?.connected || !ready) {
      setError("Espera a que el proyecto termine de conectarse para enviar una pregunta.");
      return;
    }
    if (!trimmedQuestion || trimmedQuestion.length > 2000) return;

    const requestId = globalThis.crypto?.randomUUID?.()
      ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setPendingRequests((current) => new Set(current).add(requestId));
    setError(null);
    setQuestion("");
    socket.emit("ai-chat-send", { message: trimmedQuestion, requestId });
  };

  const isOwnMessage = (message: AIChatMessage) =>
    message.kind === "USER" &&
    (message.authorId === userId || message.authorId === `guest:${socket?.id}`);

  return (
    <div style={{ position: "fixed", right: 18, bottom: 18, zIndex: 1100 }}>
      {open && (
        <section
          aria-label="Chat compartido con el moderador de IA"
          style={{
            width: "min(370px, calc(100vw - 36px))",
            height: "min(520px, calc(100vh - 110px))",
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            color: "#c7d5e0",
            background: "#171a21",
            border: "1px solid #2c3a48",
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          <header
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #2c3a48",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong style={{ color: "#e6edf3", fontSize: 14 }}>Moderador de IA</strong>
              <div style={{ color: "#8f98a0", fontSize: 11, marginTop: 3 }}>
                La conversación es visible para el equipo
              </div>
            </div>
            <span
              aria-label={ready ? "Conectado" : "Desconectado"}
              title={ready ? "Conectado" : "Desconectado"}
              style={{ color: ready ? "#7ee787" : "#f0883e", fontSize: 12 }}
            >
              {ready ? "● En línea" : "● Conectando"}
            </span>
          </header>

          <div
            role="log"
            aria-live="polite"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.length === 0 && (
              <p style={{ color: "#8f98a0", fontSize: 13, textAlign: "center", margin: "auto 8px" }}>
                Pregunta sobre el diagrama o pide una recomendación. Tus compañeros también verán la respuesta.
              </p>
            )}
            {messages.map((message) => {
              const own = isOwnMessage(message);
              return (
                <article
                  key={message.id}
                  style={{
                    alignSelf: own ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                    padding: "9px 11px",
                    borderRadius: 10,
                    background: message.kind === "ASSISTANT"
                      ? "#202b38"
                      : own ? "#164b68" : "#26323e",
                    border: message.kind === "ASSISTANT" ? "1px solid #36506a" : "1px solid transparent",
                  }}
                >
                  <div style={{ color: "#9cc9f5", fontSize: 11, marginBottom: 4 }}>
                    {message.kind === "ASSISTANT" ? "Moderador IA" : message.authorName}
                  </div>
                  <div style={{ color: "#e6edf3", fontSize: 13, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                    {message.content}
                  </div>
                  <time
                    dateTime={message.createdAt}
                    style={{ display: "block", color: "#8f98a0", fontSize: 10, textAlign: "right", marginTop: 5 }}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </article>
              );
            })}
            {pendingRequests.size > 0 && (
              <div style={{ color: "#8f98a0", fontSize: 12 }} aria-live="polite">
                El moderador está preparando una respuesta…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div role="alert" style={{ padding: "8px 12px", color: "#ffb4ab", fontSize: 12, borderTop: "1px solid #2c3a48" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #2c3a48" }}>
            <input
              aria-label="Pregunta para el moderador de IA"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={2000}
              placeholder="Escribe una pregunta…"
              style={{
                minWidth: 0,
                flex: 1,
                padding: "10px 12px",
                color: "#e6edf3",
                background: "#0d1117",
                border: "1px solid #394b59",
                borderRadius: 8,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!question.trim() || !ready}
              style={{
                padding: "0 13px",
                color: "#fff",
                background: question.trim() && ready ? "#238636" : "#2c3a48",
                border: 0,
                borderRadius: 8,
                cursor: question.trim() && ready ? "pointer" : "not-allowed",
              }}
            >
              Enviar
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        style={{
          display: "block",
          marginLeft: "auto",
          padding: "11px 16px",
          color: "#fff",
          background: "#238636",
          border: "1px solid #3fb950",
          borderRadius: 22,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {open ? "Cerrar moderador" : "Preguntar al moderador"}
      </button>
    </div>
  );
}
