package com.ems.ems_backend.controller;

import com.ems.ems_backend.dto.ChatMessage;
import com.ems.ems_backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
public class ChatController {

    @Autowired private ChatService chatService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/message")
    public ResponseEntity<ChatMessage> sendMessage(
            @RequestBody ChatMessage request,
            Authentication auth) {

        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Generate a new session ID
        String sessionId = (request.getSessionId() != null && !request.getSessionId().isBlank())
            ? request.getSessionId()
            : UUID.randomUUID().toString();

        // Extract role
        String role = auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.replace("ROLE_", ""))
            .findFirst()
            .orElse("EMPLOYEE");
        String username = auth.getName();

        // Call the AI
        String reply = chatService.chat(
            request.getMessage(), username, sessionId, role
        );
        return ResponseEntity.ok(ChatMessage.botReply(reply, sessionId));
    }


    @PreAuthorize("isAuthenticated()")
    @PostMapping("/clear")
    public ResponseEntity<Map<String, String>> clearSession(
            @RequestBody Map<String, String> body) {

        String sessionId = body.get("sessionId");
        if (sessionId != null && !sessionId.isBlank()) {
            chatService.clearSession(sessionId);
        }
        return ResponseEntity.ok(Map.of("status", "cleared"));
    }


    @PreAuthorize("isAuthenticated()")
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status",       "online",
            "model",        "gemini-1.5-flash",
            "activeSessions", chatService.activeSessionCount()
        ));
    }
}