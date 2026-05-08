package com.ems.ems_backend.service;

import com.ems.ems_backend.dto.EmployeeProfileDTO;
import com.ems.ems_backend.dto.EmployeeRegisterDTO;
import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.entity.Role;
import com.ems.ems_backend.entity.User;
import com.ems.ems_backend.entity.Department;
import com.ems.ems_backend.repo.EmployeeRepo;
import com.ems.ems_backend.repo.RoleRepo;
import com.ems.ems_backend.repo.UserRepo;
import com.ems.ems_backend.repo.DepartmentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired private UserRepo userRepository;
    @Autowired private RoleRepo roleRepository;
    @Autowired private EmployeeRepo employeeRepo;
    @Autowired private DepartmentRepo departmentRepo;
    @Autowired private PasswordEncoder encoder;

    @Transactional
    public void registerEmployeeWithUser(EmployeeRegisterDTO dto) {

        Employee employee = new Employee();
        employee.setEmpCode(dto.getEmpCode());
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDateOfBirth(dto.getDateOfBirth());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setSalary(dto.getSalary());
        employee.setStatus("ACTIVE");
        employee.setActive(true);
        employee.setLeaveBalance(dto.getLeaveBalance() != null ? dto.getLeaveBalance() : 15);

        if (dto.getJobTitle() != null) {
            employee.setJobTitle(dto.getJobTitle());
        }

        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepo.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            employee.setDepartment(dept);
        }

        employee = employeeRepo.save(employee);

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setEnabled(true);
        user.setEmployee(employee);

        Set<Role> authRoles = new HashSet<>();
        Role authRole = roleRepository.findByName(dto.getUserRole())
                .orElseThrow(() -> new RuntimeException(
                        "Security role '" + dto.getUserRole() + "' not found. " +
                                "Valid values: ADMIN, MANAGER, EMPLOYEE"));
        authRoles.add(authRole);
        user.setRoles(authRoles);

        userRepository.save(user);
    }

    public EmployeeProfileDTO findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employee employee = user.getEmployee();
        if (employee == null) {
            throw new RuntimeException("No employee record linked to this user");
        }

        EmployeeProfileDTO dto = new EmployeeProfileDTO();
        dto.setEmpCode(employee.getEmpCode());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setJoiningDate(employee.getJoiningDate());
        dto.setLeaveBalance(employee.getLeaveBalance());
        dto.setSalary(employee.getSalary());
        dto.setStatus(employee.getStatus());
        dto.setJobTitle(employee.getJobTitle());

        if (employee.getDepartment() != null) {
            dto.setDepartmentName(employee.getDepartment().getName());
        }

        return dto;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepo.findAll();
    }

    public List<EmployeeProfileDTO> getAllEmployeesAsDTOs() {
        return employeeRepo.findAll().stream()
                .map(emp -> {
                    EmployeeProfileDTO dto = new EmployeeProfileDTO();

                    // Basic fields
                    dto.setEmpCode(emp.getEmpCode());
                    dto.setFirstName(emp.getFirstName());
                    dto.setLastName(emp.getLastName());
                    dto.setEmail(emp.getEmail());
                    dto.setPhone(emp.getPhone());
                    dto.setJoiningDate(emp.getJoiningDate());
                    dto.setStatus(emp.getStatus());
                    dto.setSalary(emp.getSalary());
                    dto.setLeaveBalance(emp.getLeaveBalance());
                    dto.setJobTitle(emp.getJobTitle());

                    if (emp.getDepartment() != null) {
                        dto.setDepartmentName(emp.getDepartment().getName());
                    } else {
                        dto.setDepartmentName(null);
                    }

                    if (emp.getUser() != null) {
                        if (emp.getUser().getRoles() != null && !emp.getUser().getRoles().isEmpty()) {
                            dto.setRoleName(
                                    emp.getUser().getRoles().iterator().next().getName()
                            );
                        } else {
                            dto.setRoleName("NO_ROLE");
                        }
                    } else {
                        dto.setRoleName("NO_USER");
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<Employee> findAllActive() {
        return employeeRepo.findByActiveTrue();
    }


    @Transactional
    public void updateJobTitle(Long employeeId, String jobTitle) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setJobTitle(jobTitle);
        employeeRepo.save(employee);
    }

    @Transactional
    public void deactivateEmployee(Long id) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setActive(false);
        employee.setStatus("DEACTIVATED");
        if (employee.getUser() != null) {
            employee.getUser().setEnabled(false);
        }
        employeeRepo.save(employee);
    }

    @Transactional
    public void activateEmployee(Long id) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setActive(true);
        employee.setStatus("ACTIVE");
        if (employee.getUser() != null) {
            employee.getUser().setEnabled(true);
        }
        employeeRepo.save(employee);
    }

    @Transactional
    public void updateSalary(Long id, Double newSalary) {
        Employee emp = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        emp.setSalary(newSalary);
        employeeRepo.save(emp);
    }

    public Employee saveEmployee(Employee emp) {
        return employeeRepo.save(emp);
    }
}