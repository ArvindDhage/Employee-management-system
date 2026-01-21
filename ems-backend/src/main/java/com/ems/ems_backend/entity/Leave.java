package com.ems.ems_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "leaves", uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "start_date", "end_date"}))
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "leave_seq")
    @SequenceGenerator(
            name = "leave_seq",
            sequenceName = "leave_seq",
            allocationSize = 1
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "leave_type", length = 50, nullable = false)
    private String leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 20, nullable = false)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String reason;

    public Leave() {
    }

    public Leave(Long id, Employee employee, String leaveType, LocalDate startDate, LocalDate endDate, String status, String reason) {
        this.id = id;
        this.employee = employee;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.reason = reason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

