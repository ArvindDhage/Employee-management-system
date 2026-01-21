package com.ems.ems_backend.repo;

import com.ems.ems_backend.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Month;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryRepo extends JpaRepository<Salary, Long> {

    List<Salary> findByEmployeeId(Long employeeId);

    Optional<Salary> findByEmployeeIdAndMonthAndYear(Long employeeId, Month month, Integer year);
}
