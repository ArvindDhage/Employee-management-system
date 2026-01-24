package com.ems.ems_backend.service;

import com.ems.ems_backend.dto.UserRequest;
import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.entity.Role;
import com.ems.ems_backend.entity.User;
import com.ems.ems_backend.repo.EmployeeRepo;
import com.ems.ems_backend.repo.RoleRepo;
import com.ems.ems_backend.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private RoleRepo roleRepository;

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private PasswordEncoder encoder;

    public void saveUser(UserRequest req) {
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));

        Set<Role> roleSet = new HashSet<>();
        for(String roleName : req.getRoles()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(roleName);
                        return roleRepository.save(newRole);
                    });
            roleSet.add(role);
        }
        user.setRoles(roleSet);
        userRepository.save(user);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepo.findAll();
    }

    public Employee saveEmployee(Employee emp){
        return employeeRepo.save(emp);
    }
}