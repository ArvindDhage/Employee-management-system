package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Leave;
import com.ems.ems_backend.repo.AttendanceRepo;
import com.ems.ems_backend.repo.DepartmentRepo;
import com.ems.ems_backend.repo.EmployeeRepo;
import com.ems.ems_backend.repo.LeaveRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ManagerService {

    @Autowired private EmployeeRepo employeeRepo;
    @Autowired private LeaveRepo leaveRepo;
    @Autowired private DepartmentRepo departmentRepo;
    @Autowired private AttendanceRepo attendanceRepo;

    public Map<String, Object> getDashboardStats() {
        long totalEmp = employeeRepo.count();
        long pendingLeaves = leaveRepo.countByStatus("PENDING");
        long totalDepartments = departmentRepo.count();
        long todayAttendance = attendanceRepo.countByAttendanceDate(LocalDate.now());

        return Map.of(
                "totalEmployees", totalEmp,
                "pendingLeaves", pendingLeaves,
                "totalDepartments", totalDepartments,
                "todayAttendance", todayAttendance
        );
    }

    public List<Leave> getPendingLeaves() {
        return leaveRepo.findByStatus("PENDING");
    }
}