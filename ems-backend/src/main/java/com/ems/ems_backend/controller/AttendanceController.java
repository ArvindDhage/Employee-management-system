package com.ems.ems_backend.controller;

import com.ems.ems_backend.entity.Attendance;
import com.ems.ems_backend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
public class AttendanceController {

    @Autowired private AttendanceService attendanceService;

    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','MANAGER','ADMIN')")
    @PostMapping("/check-in/{empId}")
    public ResponseEntity<?> checkIn(@PathVariable Long empId) {
        try {
            return ResponseEntity.ok(attendanceService.checkIn(empId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','MANAGER','ADMIN')")
    @PutMapping("/check-out/{empId}")
    public ResponseEntity<?> checkOut(@PathVariable Long empId) {
        try {
            return ResponseEntity.ok(attendanceService.checkOut(empId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PreAuthorize("hasAnyRole('EMPLOYEE','HR','MANAGER','ADMIN')")
    @GetMapping("/history/{empId}")
    public ResponseEntity<List<Attendance>> getHistory(@PathVariable Long empId) {
        return ResponseEntity.ok(attendanceService.getEmployeeHistory(empId));
    }
}