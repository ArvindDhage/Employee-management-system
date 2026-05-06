package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.entity.Role;
import com.ems.ems_backend.entity.User;
import com.ems.ems_backend.repo.EmployeeRepo;
import com.ems.ems_backend.repo.RoleRepo;
import com.ems.ems_backend.repo.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AdminService {

    @Autowired private EmployeeRepo employeeRepo;
    @Autowired private RoleRepo roleRepo;
    @Autowired private UserRepo userRepo;

    @Transactional
    public void changeEmployeeRole(Long id, String roleName) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        User user = employee.getUser();
        if (user == null) {
            throw new RuntimeException("No user account linked to this employee");
        }

        Role role = roleRepo.findByName(roleName)
                .orElseThrow(() -> new RuntimeException(
                        "Role '" + roleName + "' does not exist. Valid values: ADMIN, MANAGER, EMPLOYEE"));

        Set<Role> newRoles = new HashSet<>();
        newRoles.add(role);
        user.setRoles(newRoles);
        userRepo.save(user);
    }

}