package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.entity.Leave;
import com.ems.ems_backend.repo.EmployeeRepo;
import com.ems.ems_backend.repo.LeaveRepo;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveService {

    @Autowired private LeaveRepo leaveRepo;
    @Autowired private EmployeeRepo employeeRepo;


    @Transactional
    public Leave applyLeave(Long empId, Leave leaveRequest) {
        Employee employee = employeeRepo.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (leaveRequest.getEndDate().isBefore(leaveRequest.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        long daysRequested = ChronoUnit.DAYS.between(
                leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;

        Integer currentBalance = employee.getLeaveBalance();
        if (currentBalance == null || currentBalance < daysRequested) {
            throw new RuntimeException(
                    "Insufficient leave balance. Requested: " + daysRequested
                            + ", Available: " + (currentBalance == null ? 0 : currentBalance));
        }

        leaveRequest.setEmployee(employee);
        leaveRequest.setStatus("PENDING");
        return leaveRepo.save(leaveRequest);
    }

    @Transactional
    public Leave approveLeave(Long id) {
        Leave leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if ("APPROVED".equals(leave.getStatus())) {
            throw new RuntimeException("Leave is already approved");
        }
        if ("REJECTED".equals(leave.getStatus())) {
            throw new RuntimeException("Cannot approve a rejected leave");
        }

        long daysRequested = ChronoUnit.DAYS.between(
                leave.getStartDate(), leave.getEndDate()) + 1;

        // Fetch employee with pessimistic write lock to prevent concurrent balance deduction
        Employee employee = employeeRepo.findByIdWithLock(leave.getEmployee().getId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Integer currentBalance = employee.getLeaveBalance();

        if (currentBalance == null || currentBalance < daysRequested) {
            throw new RuntimeException(
                    "Employee no longer has sufficient balance to approve this leave");
        }

        employee.setLeaveBalance(currentBalance - (int) daysRequested);
        employeeRepo.save(employee);

        leave.setStatus("APPROVED");
        return leaveRepo.save(leave);
    }

    @Transactional
    public Leave rejectLeave(Long id) {
        Leave leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if ("REJECTED".equals(leave.getStatus())) {
            throw new RuntimeException("Leave is already rejected");
        }

        if ("APPROVED".equals(leave.getStatus())) {
            long daysToRefund = ChronoUnit.DAYS.between(
                    leave.getStartDate(), leave.getEndDate()) + 1;
            Employee employee = leave.getEmployee();
            employee.setLeaveBalance(employee.getLeaveBalance() + (int) daysToRefund);
            employeeRepo.save(employee);
        }

        leave.setStatus("REJECTED");
        return leaveRepo.save(leave);
    }

    public List<Leave> getEmployeeLeaves(Long empId) {
        return leaveRepo.findByEmployeeIdOrderByStartDateDesc(empId);
    }

    public List<Leave> getAllLeaves() {
        return leaveRepo.findAll();
    }

    public List<Leave> getPendingLeaves() {
        return leaveRepo.findByStatus("PENDING");
    }
}