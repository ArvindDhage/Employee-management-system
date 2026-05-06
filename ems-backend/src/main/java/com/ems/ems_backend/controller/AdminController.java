package com.ems.ems_backend.controller;

import com.ems.ems_backend.entity.Attendance;
import com.ems.ems_backend.entity.Department;
import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.entity.Leave;
import com.ems.ems_backend.entity.Role;
import com.ems.ems_backend.repo.DepartmentRepo;
import com.ems.ems_backend.repo.RoleRepo;
import com.ems.ems_backend.service.AdminService;
import com.ems.ems_backend.service.AttendanceService;
import com.ems.ems_backend.service.LeaveService;
import com.ems.ems_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
//@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private UserService       userService;
    @Autowired private LeaveService      leaveService;
    @Autowired private AttendanceService attendanceService;
    @Autowired private DepartmentRepo    departmentRepo;
    @Autowired private RoleRepo          roleRepo;
    @Autowired private AdminService      adminService;

    // ════════════════════════════════════════════════════════════════════════
    //  DASHBOARD STATS
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<Employee> employees = userService.getAllEmployees();
        List<Leave>    leaves    = leaveService.getAllLeaves();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees",   employees.size());
        stats.put("totalDepartments", departmentRepo.count());
        stats.put("totalRoles",       roleRepo.count());
        stats.put("pendingLeaves",    leaves.stream().filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count());
        stats.put("approvedLeaves",   leaves.stream().filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus())).count());
        stats.put("rejectedLeaves",   leaves.stream().filter(l -> "REJECTED".equalsIgnoreCase(l.getStatus())).count());
        stats.put("totalLeaves",      leaves.size());
        return ResponseEntity.ok(stats);
    }

    // ════════════════════════════════════════════════════════════════════════
    //  EMPLOYEE MANAGEMENT
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees() {
        return ResponseEntity.ok(
                userService.getAllEmployees().stream().map(emp -> {
                    Map<String, Object> data = new HashMap<>();

                    data.put("id", emp.getId());
                    data.put("firstName", emp.getFirstName());
                    data.put("lastName", emp.getLastName());
                    data.put("email", emp.getEmail());
                    data.put("empCode", emp.getEmpCode()); // or getEmployeeCode()
                    data.put("department",
                            emp.getDepartment() != null
                                    ? emp.getDepartment().getName()
                                    : null
                    );
                    data.put("jobTitle", emp.getJobTitle()); // or getDesignation()
                    data.put("salary", emp.getSalary());
                    data.put("role",
                            emp.getUser() != null && !emp.getUser().getRoles().isEmpty()
                                    ? emp.getUser().getRoles().iterator().next().getName()
                                    : "EMPLOYEE"
                    );
                    data.put("active", emp.isActive()); // or getActive()
                    return data;
                }).toList()
        );
    }

    @PatchMapping("/employees/{id}/salary")
    public ResponseEntity<?> updateSalary(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body) {
        Double salary = body.get("salary");
        if (salary == null || salary < 0)
            return ResponseEntity.badRequest().body("Invalid salary");
        userService.updateSalary(id, salary);
        return ResponseEntity.ok("Salary updated");
    }

    @PatchMapping("/employees/{id}/deactivate")
    public ResponseEntity<?> deactivateEmployee(@PathVariable Long id) {
        userService.deactivateEmployee(id);
        return ResponseEntity.ok("Employee deactivated");
    }

    @PatchMapping("/employees/{id}/activate")
    public ResponseEntity<?> activateEmployee(@PathVariable Long id) {
        userService.activateEmployee(id);
        return ResponseEntity.ok("Employee activated");
    }

    @PostMapping("/employees/{id}/promote")
    public ResponseEntity<?> promoteEmployee(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            String roleName = (String) body.get("roleName");
            Object salaryObj = body.get("salary");

            if (roleName == null || roleName.isBlank())
                return ResponseEntity.badRequest().body("roleName is required");

            adminService.changeEmployeeRole(id, roleName.toUpperCase());

            if (salaryObj != null) {
                double salary = Double.parseDouble(salaryObj.toString());
                if (salary > 0) userService.updateSalary(id, salary);
            }

            return ResponseEntity.ok("Employee promoted to " + roleName + " successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  LEAVE MANAGEMENT
    //  FIX: Now delegates to LeaveService so balance is correctly updated.
    //  Previous code called leaveRepo directly and never touched leave balance.
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/leaves")
    public ResponseEntity<List<Leave>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/leaves/pending")
    public ResponseEntity<List<Leave>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    @PatchMapping("/leaves/{id}/approve")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        try {
            leaveService.approveLeave(id);
            return ResponseEntity.ok("Approved");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/leaves/{id}/reject")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        try {
            leaveService.rejectLeave(id);
            return ResponseEntity.ok("Rejected");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  ATTENDANCE
    // ════════════════════════════════════════════════════════════════════════

    @GetMapping("/attendance")
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.findAll());
    }

    // ════════════════════════════════════════════════════════════════════════
    //  DEPARTMENT MANAGEMENT

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepo.findAll());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Department dept) {
        return ResponseEntity.ok(departmentRepo.save(dept));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @RequestBody Department updated) {
        Department existing = departmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return ResponseEntity.ok(departmentRepo.save(existing));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        List<Employee> empInDept = userService.getAllEmployees().stream()
                .filter(e -> e.getDepartment() != null && id.equals(e.getDepartment().getId()))
                .toList();
        if (!empInDept.isEmpty())
            return ResponseEntity.badRequest()
                    .body("Cannot delete department with " + empInDept.size() + " employees");
        departmentRepo.deleteById(id);
        return ResponseEntity.ok("Department deleted");
    }

    //  ROLE MANAGEMENT

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleRepo.findAll());
    }

    @PostMapping("/roles")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        role.setName(role.getName().toUpperCase());
        return ResponseEntity.ok(roleRepo.save(role));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<Role> updateRole(
            @PathVariable Long id,
            @RequestBody Role updated) {
        Role existing = roleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        existing.setName(updated.getName().toUpperCase());
        if (updated.getDescription() != null)
            existing.setDescription(updated.getDescription());
        return ResponseEntity.ok(roleRepo.save(existing));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        roleRepo.deleteById(id);
        return ResponseEntity.ok("Role deleted");
    }
}