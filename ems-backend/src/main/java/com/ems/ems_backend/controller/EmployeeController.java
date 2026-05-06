package com.ems.ems_backend.controller;

import com.ems.ems_backend.dto.EmployeeProfileDTO;
import com.ems.ems_backend.dto.EmployeeRegisterDTO;
import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
@RequestMapping("/employees")
public class EmployeeController {

    @Autowired private UserService service;

    @GetMapping("/get-all")
    public ResponseEntity<List<EmployeeProfileDTO>> getAllEmployees() {
        List<EmployeeProfileDTO> employees = service.getAllEmployeesAsDTOs();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @PostMapping("/add-user")
    public ResponseEntity<?> registerEmployee(@RequestBody EmployeeRegisterDTO dto) {
        service.registerEmployeeWithUser(dto);
        return ResponseEntity.ok("Employee and user created successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        String username = authentication.getName();
        EmployeeProfileDTO profile = service.findByUsername(username);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        String username = authentication.getName();
        EmployeeProfileDTO employee = service.findByUsername(username);
        return ResponseEntity.ok(employee);
    }
}