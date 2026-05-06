package com.ems.ems_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeProfileDTO {

    private String empCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate joiningDate;
    private String status;
    private Double salary;
    private Integer leaveBalance;
    private String jobTitle;
    private String departmentName;
    private String roleName;
}