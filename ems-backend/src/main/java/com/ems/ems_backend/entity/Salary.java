package com.ems.ems_backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;

@Entity
@Table(name = "salaries", uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "month", "year"}))
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

    public Salary() {
    }

    public Salary(Long id, Employee employee, BigDecimal basicSalary, BigDecimal hra, BigDecimal allowances, BigDecimal deductions, Month month, Integer year, LocalDate paidDate) {
        this.id = id;
        this.employee = employee;
        this.basicSalary = basicSalary;
        this.hra = hra;
        this.allowances = allowances;
        this.deductions = deductions;
        this.month = month;
        this.year = year;
        this.paidDate = paidDate;
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

    public BigDecimal getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(BigDecimal basicSalary) {
        this.basicSalary = basicSalary;
    }

    public BigDecimal getHra() {
        return hra;
    }

    public void setHra(BigDecimal hra) {
        this.hra = hra;
    }

    public BigDecimal getAllowances() {
        return allowances;
    }

    public void setAllowances(BigDecimal allowances) {
        this.allowances = allowances;
    }

    public BigDecimal getDeductions() {
        return deductions;
    }

    public void setDeductions(BigDecimal deductions) {
        this.deductions = deductions;
    }

    public Month getMonth() {
        return month;
    }

    public void setMonth(Month month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }
}



