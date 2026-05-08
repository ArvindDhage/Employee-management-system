package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.User;
import com.ems.ems_backend.repo.UserRepo;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {

    @Autowired private ChatClient.Builder chatClientBuilder;
    @Autowired private EmsToolService toolService;
    @Autowired private UserRepo userRepo;

    @Value("${ems.chat.history.max-messages:20}")
    private int maxMessages;

    private final Map<String, InMemoryChatMemory> sessions = new ConcurrentHashMap<>();

    // ── Main entry point ─────────────────────────────────────────────────────

    /**
     * Process a chat message for an authenticated user.
     *
     * @param userMessage the text the user typed
     * @param username    the authenticated username (from JWT, server-side)
     * @param sessionId   browser session ID for conversation continuity
     * @param role        the user's role ("EMPLOYEE", "HR", "MANAGER", "ADMIN")
     * @return the AI's reply text
     */
    public String chat(String userMessage, String username, String sessionId, String role) {


        Long empId = resolveEmployeeId(username);

        InMemoryChatMemory memory = sessions.computeIfAbsent(
            sessionId, id -> new InMemoryChatMemory()
        );

        String systemPrompt = buildSystemPrompt(username, role, empId);

        Object[] tools = buildToolsForRole(role);

        try {
            return chatClientBuilder.build()
                .prompt()
                .system(systemPrompt)
                .user(u -> u.text(userMessage)
                            .param("employeeId", empId != null ? empId.toString() : "unknown"))
                .advisors(MessageChatMemoryAdvisor.builder(memory)
                    .conversationId(sessionId)
                    .build())
                .tools(tools)
                .call()
                .content();

        } catch (Exception e) {
            System.err.println(" CHAT ERROR START ===================");
            e.printStackTrace();

            Throwable cause = e.getCause();
            while (cause != null) {
                System.err.println("👉 Cause: " + cause.getMessage());
                cause = cause.getCause();
            }

            System.err.println("CHAT ERROR END =====================");

            return "Sorry, something went wrong while processing your request. Please try again.";
        }
    }

    // ── System prompt ────────────────────────────────────────────────────────

    private String buildSystemPrompt(String username, String role, Long empId) {
        String roleContext = switch (role.toUpperCase()) {
            case "ADMIN" -> "You are speaking with an Administrator who has full access " +
                "to all employee, leave, attendance, and department data.";
            case "MANAGER" -> "You are speaking with a Manager who can view team leave " +
                "requests, attendance summaries, and employee counts.";
            case "HR" -> "You are speaking with an HR professional who manages employees, " +
                "payroll, attendance, and leave management.";
            default -> "You are speaking with an Employee who can only view their own " +
                "leave balance, attendance history, and profile.";
        };

        return String.format("""
            You are EMS Assistant, an intelligent HR chatbot for the Employee Management System (EMS).
            
            %s
            
            Current user: %s
            Employee ID: %s
            Role: %s
            
            Guidelines:
            - Be concise and professional. Keep answers under 150 words unless detailed info is needed.
            - Always use the available tools to fetch real data — never guess or make up numbers.
            - When an employee asks about leaves, attendance, or profile, use their employee ID (%s).
            - Format numbers clearly (use ₹ for salary, days for leave).
            - If asked something outside HR/EMS scope (politics, coding help, etc.), politely decline.
            - If a tool returns an error, apologise and suggest contacting HR directly.
            - Greet the user by their first name when appropriate.
            - For sensitive data (salary, exact leave balances), only share with the owner or admin/HR.
            """,
            roleContext, username, empId != null ? empId : "unknown", role,
            empId != null ? empId : "unknown");
    }

    // ── Tool registration ────────────────────────────────────────────────────

    private Object[] buildToolsForRole(String role) {
        return switch (role.toUpperCase()) {
            case "ADMIN" -> new Object[]{
                toolService   // all tools
            };
            case "MANAGER", "HR" -> new Object[]{
                toolService
            };
            default -> new Object[]{
                toolService   // employee tools only — enforced by prompt + method-level logic
            };
        };
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Long resolveEmployeeId(String username) {
        try {
            return userRepo.findByUsername(username)
                .map(User::getEmployee)
                .filter(emp -> emp != null)
                .map(emp -> emp.getId())
                .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    public void clearSession(String sessionId) {
        sessions.remove(sessionId);
    }

    public int activeSessionCount() {
        return sessions.size();
    }
}