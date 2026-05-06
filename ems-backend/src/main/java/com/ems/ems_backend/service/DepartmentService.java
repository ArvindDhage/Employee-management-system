package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Department;
import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.repo.DepartmentRepo;
import com.ems.ems_backend.repo.EmployeeRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired private DepartmentRepo departmentRepo;
    @Autowired private EmployeeRepo employeeRepo;

    public Department save(Department department) {
        return departmentRepo.save(department);
    }

    public List<Department> findAll() {
        return departmentRepo.findAll();
    }

    @Transactional
    public void assignEmployeeToDepartment(Long employeeId, Long departmentId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Department department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        employee.setDepartment(department);
        employeeRepo.save(employee);
    }
}