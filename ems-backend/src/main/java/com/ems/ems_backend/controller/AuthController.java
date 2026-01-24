package com.ems.ems_backend.controller;

import com.ems.ems_backend.dto.LoginRequest;
import com.ems.ems_backend.dto.LoginResponse;
import com.ems.ems_backend.dto.UserRequest;
import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.repo.UserRepo;
import com.ems.ems_backend.security.JwtUtil;
import com.ems.ems_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private UserService service;

    @PostMapping("/addUser")
    public String addUser(@RequestBody UserRequest request) {
        service.saveUser(request);
        return "User added successfully";
    }



    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getUsername(),
                                request.getPassword()
                        )
                );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Extract roles
        String roles = userDetails.getAuthorities()
                .stream()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.joining(","));

        String token = jwtUtil.generateToken(
                userDetails.getUsername(),
                roles
        );

        LoginResponse response =
                new LoginResponse(token, userDetails.getUsername(), roles);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<Employee>> getAllEmployees(){
        List<Employee> employees = service.getAllEmployees();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

}

