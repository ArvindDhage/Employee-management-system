package com.ems.ems_backend.repo;

import com.ems.ems_backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmpCode(String empCode);

    Optional<Employee> findByEmail(String email);

    List<Employee> findByStatus(String status);

    List<Employee> findByDepartmentId(Long departmentId);
}

