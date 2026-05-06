package com.ems.ems_backend.controller;

import com.ems.ems_backend.entity.Leave;
import com.ems.ems_backend.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
public class LeaveController {

    @Autowired private LeaveService leaveService;

    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','MANAGER','ADMIN')")
    @PostMapping("/apply/{empId}")
    public ResponseEntity<?> applyLeave(@PathVariable Long empId, @RequestBody Leave leave) {
        try {
            return ResponseEntity.ok(leaveService.applyLeave(empId, leave));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','MANAGER','ADMIN')")
    @GetMapping("/employee/{empId}")
    public ResponseEntity<List<Leave>> getHistory(@PathVariable Long empId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaves(empId));
    }

    @PreAuthorize("hasAnyRole('MANAGER','ADMIN','HR')")
    @GetMapping("/all")
    public ResponseEntity<List<Leave>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @PreAuthorize("hasAnyRole('MANAGER','ADMIN','HR')")
    @GetMapping("/pending")
    public ResponseEntity<List<Leave>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }
}