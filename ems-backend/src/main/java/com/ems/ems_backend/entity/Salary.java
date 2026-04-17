package com.ems.ems_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;

@Entity
@Table(name = "salaries",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "month", "year"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salary_seq")
    @SequenceGenerator(
            name = "salary_seq",
            sequenceName = "salary_seq",
            allocationSize = 1
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"user", "department", "leaveBalance",
            "phone", "dateOfBirth", "joiningDate", "active"})
    private Employee employee;

    @Column(name = "basic_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 10, scale = 2)
    private BigDecimal hra;

    @Column(precision = 10, scale = 2)
    private BigDecimal allowances;

    @Column(precision = 10, scale = 2)
    private BigDecimal deductions;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private Month month;

    private Integer year;

    @Column(name = "paid_date")
    private LocalDate paidDate;
}