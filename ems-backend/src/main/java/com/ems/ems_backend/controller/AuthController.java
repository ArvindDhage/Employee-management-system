package com.ems.ems_backend.controller;

import com.ems.ems_backend.dto.EmployeeRegisterDTO;
import com.ems.ems_backend.dto.LoginRequest;
import com.ems.ems_backend.dto.LoginResponse;
import com.ems.ems_backend.entity.User;
import com.ems.ems_backend.repo.UserRepo;
import com.ems.ems_backend.security.JwtUtil;
import com.ems.ems_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "${app.cors.allowed-origins}", allowCredentials = "true")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserService service;
    @Autowired private UserRepo userRepo;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody EmployeeRegisterDTO request) {
        service.registerEmployeeWithUser(request);
        return ResponseEntity.ok("Employee and User account created and linked successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toList());

        String token = jwtUtil.generateToken(userDetails.getUsername(), roles);

        User user = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long employeeId = (user.getEmployee() != null) ? user.getEmployee().getId() : null;

        LoginResponse response = new LoginResponse(token, userDetails.getUsername(), roles, employeeId);
        return ResponseEntity.ok(response);
    }
}