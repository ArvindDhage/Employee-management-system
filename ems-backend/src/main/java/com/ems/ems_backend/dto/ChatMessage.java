package com.ems.ems_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    private String message;
    private String reply;
    private String sessionId;
    private String role;

    // ── convenience factories ─────────────────────────────────────────────────
    public static ChatMessage userMessage(String message, String sessionId) {
        ChatMessage m = new ChatMessage();
        m.setMessage(message);
        m.setSessionId(sessionId);
        m.setRole("USER");
        return m;
    }

    public static ChatMessage botReply(String reply, String sessionId) {
        ChatMessage m = new ChatMessage();
        m.setReply(reply);
        m.setSessionId(sessionId);
        m.setRole("BOT");
        return m;
    }
}