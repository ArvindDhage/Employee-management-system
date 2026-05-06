package com.ems.ems_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRegisterDTO {

    // Employee fields
    private String empCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private LocalDate joiningDate;
    private Double salary;
    private Integer leaveBalance;
    private String jobTitle;
    private Long departmentId;
    private String username;
    private String password;
    private String userRole;
}