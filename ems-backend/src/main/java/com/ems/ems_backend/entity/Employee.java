package com.ems.ems_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;


@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"department", "user"})
@ToString(exclude = {"department", "user"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emp_code", unique = true, nullable = false, length = 20)
    private String empCode;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "salary")
    private Double salary;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE";

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "leave_balance")
    private Integer leaveBalance = 15;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"employees"})
    private Department department;

    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private User user;
}