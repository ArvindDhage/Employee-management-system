import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box, Paper, Typography, TextField, IconButton, Avatar,
  CircularProgress, Chip, Tooltip, Divider, Collapse,
} from "@mui/material";
import {
  Send as SendIcon,
  Close as CloseIcon,
  ChatBubbleOutline as ChatIcon,
  DeleteOutline as ClearIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const axiosChat = axios.create({ baseURL: API_URL });
axiosChat.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingDots = () => (
  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", px: 1, py: 0.5 }}>
    {[0, 0.2, 0.4].map((delay) => (
      <Box key={delay} component="span" sx={{
        width: 6, height: 6, borderRadius: "50%", bgcolor: "#94a3b8",
        animation: "bounce 1.2s infinite",
        animationDelay: `${delay}s`,
        "@keyframes bounce": {
          "0%, 80%, 100%": { transform: "translateY(0)" },
          "40%":           { transform: "translateY(-6px)" },
        },
      }} />
    ))}
  </Box>
);

// ── Single message bubble ─────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === "USER";
  const isSystem = msg.role === "SYSTEM";

  if (isSystem) {
    return (
      <Box sx={{ textAlign: "center", my: 1 }}>
        <Typography variant="caption" color="text.secondary"
          sx={{ bgcolor: "rgba(0,0,0,0.04)", px: 2, py: 0.4, borderRadius: 10, fontSize: "0.7rem" }}>
          {msg.text}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      mb: 1.5, gap: 1, alignItems: "flex-end" }}>

      {!isUser && (
        <Avatar sx={{ width: 28, height: 28, bgcolor: "#3b82f6", flexShrink: 0 }}>
          <BotIcon sx={{ fontSize: 16 }} />
        </Avatar>
      )}

      <Box sx={{
        maxWidth: "75%",
        bgcolor: isUser ? "#3b82f6" : "white",
        color: isUser ? "white" : "#0f172a",
        px: 1.75, py: 1.25,
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: isUser ? "none" : "0.5px solid #e2e8f0",
      }}>
        {msg.typing ? (
          <TypingDots />
        ) : (
          <Typography variant="body2" sx={{
            fontSize: "0.85rem", lineHeight: 1.6,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {msg.text}
          </Typography>
        )}
        {!msg.typing && (
          <Typography variant="caption" sx={{
            display: "block", mt: 0.3,
            fontSize: "0.65rem",
            color: isUser ? "rgba(255,255,255,0.6)" : "#94a3b8",
            textAlign: "right",
          }}>
            {msg.time}
          </Typography>
        )}
      </Box>

      {isUser && (
        <Avatar sx={{ width: 28, height: 28, bgcolor: "#64748b", flexShrink: 0 }}>
          <PersonIcon sx={{ fontSize: 16 }} />
        </Avatar>
      )}
    </Box>
  );
};

// ── Main ChatWidget component ─────────────────────────────────────────────────
const ChatWidget = () => {
  const [open,       setOpen]       = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [sessionId,  setSessionId]  = useState(null);
  const [online,     setOnline]     = useState(null); // null=checking, true, false
  const [unread,     setUnread]     = useState(0);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  const username = localStorage.getItem("username") || "User";
  const role     = localStorage.getItem("role")     || "EMPLOYEE";

  // ── Initial greeting ────────────────────────────────────────────────────────
  const initMessages = useCallback(() => {
    const greetings = {
      ADMIN:    `Hi ${username}! I'm your EMS Assistant. Ask me about stats, employees, departments, leaves, or attendance.`,
      MANAGER:  `Hi ${username}! I'm your EMS Assistant. Ask me about pending leaves, team attendance, or employee counts.`,
      HR:       `Hi ${username}! I'm your EMS Assistant. I can help with employee info, payroll questions, leave management, and attendance.`,
      EMPLOYEE: `Hi ${username}! I'm your EMS Assistant. Ask me about your leaves, attendance, or profile.`,
    };
    setMessages([{
      id:   "welcome",
      role: "BOT",
      text: greetings[role] || greetings.EMPLOYEE,
      time: now(),
    }]);
  }, [username, role]);

  // ── Check health on mount ────────────────────────────────────────────────────
  useEffect(() => {
    axiosChat.get("/api/chat/health")
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
    initMessages();
  }, [initMessages]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!open && messages.length > 1) setUnread(u => u + 1);
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    // Add user bubble immediately
    const userMsg = { id: Date.now(), role: "USER", text, time: now() };
    setMessages(prev => [...prev, userMsg]);

    // Add typing indicator
    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, role: "BOT", typing: true, time: "" }]);
    setLoading(true);

    try {
      const res = await axiosChat.post("/api/chat/message", {
        message:   text,
        sessionId: sessionId,
      });

      // Store session ID from first response
      if (!sessionId && res.data.sessionId) {
        setSessionId(res.data.sessionId);
      }

      // Replace typing indicator with real reply
      setMessages(prev => prev
        .filter(m => m.id !== typingId)
        .concat({
          id:   Date.now() + 2,
          role: "BOT",
          text: res.data.reply || "I didn't get a response. Please try again.",
          time: now(),
        })
      );

    } catch (err) {
      setMessages(prev => prev
        .filter(m => m.id !== typingId)
        .concat({
          id:   Date.now() + 2,
          role: "BOT",
          text: err.response?.status === 401
            ? "Session expired. Please log in again."
            : "Something went wrong. Please try again in a moment.",
          time: now(),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Clear conversation ────────────────────────────────────────────────────────
  const clearChat = async () => {
    if (sessionId) {
      try { await axiosChat.post("/api/chat/clear", { sessionId }); } catch {}
    }
    setSessionId(null);
    initMessages();
    setMessages(prev => [
      ...prev.slice(0, 1),
      { id: Date.now(), role: "SYSTEM", text: "Conversation cleared", time: now() },
      prev[0],
    ]);
    initMessages();
  };

  // ── Quick suggestion chips ────────────────────────────────────────────────────
  const suggestions = {
    ADMIN:    ["Dashboard stats", "Show all departments", "Pending leaves"],
    MANAGER:  ["Pending leave requests", "Today's attendance", "Employee count"],
    HR:       ["Employee count by dept", "Today's attendance", "Pending leaves"],
    EMPLOYEE: ["My leave balance", "Today's attendance", "My profile"],
  }[role] || ["My leave balance", "Today's attendance", "My profile"];

  return (
    <>
      {/* ── Floating toggle button ── */}
      <Box sx={{ position: "fixed", bottom: 28, right: 28, zIndex: 1300 }}>
        <Tooltip title={open ? "Close chat" : "EMS AI Assistant"} placement="left">
          <Box onClick={() => setOpen(o => !o)} sx={{
            width: 56, height: 56, borderRadius: "50%",
            bgcolor: open ? "#64748b" : "#3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
            transition: "all 0.2s",
            "&:hover": { transform: "scale(1.08)", bgcolor: open ? "#475569" : "#2563eb" },
          }}>
            {open
              ? <CloseIcon sx={{ color: "white", fontSize: 22 }} />
              : <ChatIcon  sx={{ color: "white", fontSize: 22 }} />
            }
            {!open && unread > 0 && (
              <Box sx={{
                position: "absolute", top: 2, right: 2,
                width: 18, height: 18, borderRadius: "50%",
                bgcolor: "#ef4444", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <Typography sx={{ color: "white", fontSize: "0.6rem", fontWeight: 700 }}>
                  {unread > 9 ? "9+" : unread}
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>

      {/* ── Chat window ── */}
      <Collapse in={open} unmountOnExit>
        <Paper elevation={0} sx={{
          position: "fixed", bottom: 96, right: 28, zIndex: 1299,
          width: 360, height: 520,
          display: "flex", flexDirection: "column",
          borderRadius: 3,
          border: "0.5px solid #e2e8f0",
          boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
          overflow: "hidden",
        }}>

          {/* Header */}
          <Box sx={{
            px: 2, py: 1.5,
            background: "linear-gradient(135deg, #1e40af, #3b82f6)",
            display: "flex", alignItems: "center", gap: 1.5,
          }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "rgba(255,255,255,0.2)" }}>
              <BotIcon sx={{ fontSize: 18, color: "white" }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="white" lineHeight={1.2}>
                EMS Assistant
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <DotIcon sx={{
                  fontSize: 8,
                  color: online === false ? "#fca5a5" : "#86efac",
                }} />
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.68rem" }}>
                  {online === null ? "Connecting…" : online ? "Online · Gemini AI" : "Offline"}
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Clear chat">
              <IconButton onClick={clearChat} size="small"
                sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white" } }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages area */}
          <Box sx={{
            flex: 1, overflowY: "auto", px: 1.5, py: 1.5,
            bgcolor: "#f8fafc",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 2 },
          }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </Box>

          {/* Quick suggestions — show only if no user messages yet */}
          {messages.filter(m => m.role === "USER").length === 0 && (
            <Box sx={{ px: 1.5, py: 1, borderTop: "0.5px solid #e2e8f0", bgcolor: "white" }}>
              <Typography variant="caption" color="text.secondary"
                sx={{ fontSize: "0.68rem", display: "block", mb: 0.8 }}>
                Try asking:
              </Typography>
              <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                {suggestions.map(s => (
                  <Chip key={s} label={s} size="small"
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    sx={{
                      fontSize: "0.7rem", height: 24, cursor: "pointer",
                      bgcolor: "#eff6ff", color: "#1d4ed8",
                      border: "0.5px solid #bfdbfe",
                      "&:hover": { bgcolor: "#dbeafe" },
                    }} />
                ))}
              </Box>
            </Box>
          )}

          {/* Input area */}
          <Box sx={{
            px: 1.5, py: 1.25, borderTop: "0.5px solid #e2e8f0", bgcolor: "white",
            display: "flex", gap: 1, alignItems: "flex-end",
          }}>
            <TextField
              inputRef={inputRef}
              fullWidth multiline maxRows={3}
              placeholder="Ask me anything about your EMS data…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || online === false}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3, fontSize: "0.85rem",
                  bgcolor: "#f8fafc",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset":   { borderColor: "#93c5fd" },
                  "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                },
              }}
            />
            <IconButton
              onClick={sendMessage}
              disabled={!input.trim() || loading || online === false}
              sx={{
                width: 38, height: 38, flexShrink: 0,
                bgcolor: !input.trim() || loading ? "#e2e8f0" : "#3b82f6",
                color: !input.trim() || loading ? "#94a3b8" : "white",
                borderRadius: 2,
                "&:hover": { bgcolor: !input.trim() || loading ? "#e2e8f0" : "#2563eb" },
                transition: "0.15s",
              }}>
              {loading
                ? <CircularProgress size={16} sx={{ color: "#94a3b8" }} />
                : <SendIcon sx={{ fontSize: 18 }} />
              }
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
};

export default ChatWidget;

// Helper
function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}