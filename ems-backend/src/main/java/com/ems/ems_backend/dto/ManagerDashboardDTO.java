package com.ems.ems_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDashboardDTO {
    private long totalEmployees;
    private long totalDepartments;
    private long pendingLeaves;
    private long todayAttendance;
}