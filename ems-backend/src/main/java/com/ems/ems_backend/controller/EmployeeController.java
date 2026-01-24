package com.ems.ems_backend.controller;

import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emp")
public class EmployeeController {
    @Autowired
    private UserService service;

    @GetMapping("/get-all")
    public ResponseEntity<List<Employee>> getAllEmployees(){
        List<Employee> employees = service.getAllEmployees();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @PostMapping("/add-user")
    public ResponseEntity<?> addUser(@RequestBody Employee employee) {
        try {
            Employee savedEmployee = service.saveEmployee(employee);
            return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
