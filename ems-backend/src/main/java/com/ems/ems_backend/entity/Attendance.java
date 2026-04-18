package com.ems.ems_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "attendance",
        uniqueConstraints = {
                // One record per employee per day — enforced at DB level.
                // AttendanceService also checks this in code as a second layer.
                @UniqueConstraint(
                        name = "uq_employee_date",
                        columnNames = {"employee_id", "attendance_date"}
                )
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"user", "department", "leaveBalance", "salary",
            "phone", "dateOfBirth", "joiningDate", "active"})
    private Employee employee;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    // check-in
    @Column(name = "check_in")
    private LocalDateTime checkIn;

    // check-out
    @Column(name = "check_out")
    private LocalDateTime checkOut;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "PRESENT";
}