package com.ems.ems_backend.controller;

import com.ems.ems_backend.entity.Leave;
import com.ems.ems_backend.service.LeaveService;
import com.ems.ems_backend.service.ManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
public class ManagerController {

    @Autowired private ManagerService managerService;
    @Autowired private LeaveService leaveService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(managerService.getDashboardStats());
    }

    @GetMapping("/pending-leaves")
    public ResponseEntity<List<Leave>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @PatchMapping("/leave/{id}/approve")
    public ResponseEntity<String> approveLeave(@PathVariable Long id) {
        try {
            leaveService.approveLeave(id);
            return ResponseEntity.ok("Leave APPROVED");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/leave/{id}/reject")
    public ResponseEntity<String> rejectLeave(@PathVariable Long id) {
        try {
            leaveService.rejectLeave(id);
            return ResponseEntity.ok("Leave REJECTED");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}