package com.ems.ems_backend.controller;

import com.ems.ems_backend.entity.Task;
import com.ems.ems_backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired private TaskService taskService;

    @GetMapping("/manager")
    public ResponseEntity<List<Map<String, Object>>> getManagerTasks(Authentication auth) {
        return ResponseEntity.ok(taskService.getTasksByAssignedBy(auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<List<Map<String, Object>>> getEmployeeTasks(@PathVariable Long empId) {
        return ResponseEntity.ok(taskService.getTasksByEmployee(empId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTask(
            @RequestBody Task task,
            Authentication auth) {
        return ResponseEntity.ok(taskService.createTask(task, auth.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(taskService.updateStatus(id, body.get("status")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestBody Task updated) {
        try {
            return ResponseEntity.ok(taskService.updateTask(id, updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        if (!taskService.exists(id)) return ResponseEntity.notFound().build();
        taskService.deleteTask(id);
        return ResponseEntity.ok("Deleted");
    }
}