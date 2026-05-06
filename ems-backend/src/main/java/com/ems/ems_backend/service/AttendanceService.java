package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Attendance;
import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.repo.AttendanceRepo;
import com.ems.ems_backend.repo.EmployeeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired private AttendanceRepo attendanceRepo;
    @Autowired private EmployeeRepo employeeRepo;

    public Attendance checkIn(Long empId) {
        Employee employee = employeeRepo.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee ID " + empId + " not found"));

        // Prevent double check-in on the same day
        attendanceRepo.findByEmployeeAndAttendanceDate(employee, LocalDate.now())
                .ifPresent(a -> {
                    throw new RuntimeException("Already checked in for today");
                });

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(LocalDate.now());
        attendance.setCheckIn(LocalDateTime.now());
        attendance.setStatus("PRESENT");

        return attendanceRepo.save(attendance);
    }

    public Attendance checkOut(Long empId) {
        Employee employee = employeeRepo.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Attendance attendance = attendanceRepo.findByEmployeeAndAttendanceDate(employee, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("No check-in record found for today"));

        if (attendance.getCheckOut() != null) {
            throw new RuntimeException("Already checked out for today");
        }
        attendance.setCheckOut(LocalDateTime.now());
        return attendanceRepo.save(attendance);
    }

    public List<Attendance> getEmployeeHistory(Long empId) {
        return attendanceRepo.findByEmployeeId(empId);
    }

    public List<Attendance> findAll() {
        return attendanceRepo.findAll();
    }
}