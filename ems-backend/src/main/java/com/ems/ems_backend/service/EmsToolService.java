package com.ems.ems_backend.service;

import com.ems.ems_backend.entity.Attendance;
import com.ems.ems_backend.entity.Employee;
import com.ems.ems_backend.entity.Leave;
import com.ems.ems_backend.repo.EmployeeRepo;
import com.ems.ems_backend.repo.LeaveRepo;
import com.ems.ems_backend.repo.AttendanceRepo;
import com.ems.ems_backend.repo.DepartmentRepo;
import com.ems.ems_backend.repo.UserRepo;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmsToolService {

    @Autowired private EmployeeRepo    employeeRepo;
    @Autowired private LeaveRepo       leaveRepo;
    @Autowired private AttendanceRepo  attendanceRepo;
    @Autowired private DepartmentRepo  departmentRepo;
    @Autowired private UserRepo        userRepo;


    @Tool(description = "Get the leave balance (remaining leave days) for the current employee")
    public String getMyLeaveBalance(Long employeeId) {
        return employeeRepo.findById(employeeId)
            .map(e -> String.format(
                "Employee %s %s has %d leave day(s) remaining.",
                e.getFirstName(), e.getLastName(),
                e.getLeaveBalance() != null ? e.getLeaveBalance() : 0))
            .orElse("Employee not found.");
    }

    @Tool(description = "Get the leave request history for the current employee")
    public String getMyLeaveHistory(Long employeeId) {
        List<Leave> leaves = leaveRepo.findByEmployeeIdOrderByStartDateDesc(employeeId);
        if (leaves.isEmpty()) return "You have no leave requests on record.";

        return leaves.stream()
            .limit(5)
            .map(l -> String.format(
                "[%s] %s → %s | Type: %s | Status: %s | Reason: %s",
                l.getStatus(),
                l.getStartDate(), l.getEndDate(),
                l.getLeaveType() != null ? l.getLeaveType() : "N/A",
                l.getStatus(),
                l.getReason() != null ? l.getReason() : "—"))
            .collect(Collectors.joining("\n",
                "Your recent leave requests (latest 5):\n", ""));
    }

    @Tool(description = "Get today's attendance status (check-in/check-out times) for the current employee")
    public String getTodayAttendance(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId).orElse(null);
        if (employee == null) return "Employee not found.";

        return attendanceRepo.findByEmployeeAndAttendanceDate(employee, LocalDate.now())
            .map(a -> {
                String checkIn  = a.getCheckIn()  != null
                    ? a.getCheckIn().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a"))
                    : "Not yet";
                String checkOut = a.getCheckOut() != null
                    ? a.getCheckOut().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a"))
                    : "Not yet";
                return String.format(
                    "Today's attendance for %s %s:\n  Check-in:  %s\n  Check-out: %s\n  Status:    %s",
                    employee.getFirstName(), employee.getLastName(),
                    checkIn, checkOut, a.getStatus());
            })
            .orElse("No attendance record found for today. You haven't checked in yet.");
    }

    @Tool(description = "Get the attendance history for the current month for the current employee")
    public String getMonthlyAttendance(Long employeeId) {
        List<Attendance> records = attendanceRepo.findByEmployeeId(employeeId);
        String monthPrefix = LocalDate.now().toString().substring(0, 7); // YYYY-MM

        long present = records.stream()
            .filter(a -> a.getAttendanceDate() != null
                && a.getAttendanceDate().toString().startsWith(monthPrefix))
            .count();

        int totalDays = LocalDate.now().getDayOfMonth();

        return String.format(
            "This month (%s): %d day(s) present out of %d working day(s) so far.",
            LocalDate.now().getMonth().toString(), present, totalDays);
    }

    @Tool(description = "Get the current employee's profile information including name, email, department, job title, salary and joining date")
    public String getMyProfile(Long employeeId) {
        return employeeRepo.findById(employeeId)
            .map(e -> String.format(
                "Profile:\n  Name:       %s %s\n  Email:      %s\n  Phone:      %s\n" +
                "  Department: %s\n  Job Title:  %s\n  Status:     %s\n" +
                "  Joining:    %s\n  Salary:     ₹%s",
                e.getFirstName(), e.getLastName(),
                e.getEmail(),
                e.getPhone() != null ? e.getPhone() : "—",
                e.getDepartment() != null ? e.getDepartment().getName() : "—",
                e.getJobTitle() != null ? e.getJobTitle() : "—",
                e.getStatus(),
                e.getJoiningDate() != null ? e.getJoiningDate().toString() : "—",
                e.getSalary() != null ? String.format("%,.0f", e.getSalary()) : "—"))
            .orElse("Profile not found.");
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  MANAGER TOOLS  (registered only when role == MANAGER or ADMIN)
    // ══════════════════════════════════════════════════════════════════════════

    @Tool(description = "Get all pending leave requests — for managers and admins to review")
    public String getPendingLeaves() {
        List<Leave> pending = leaveRepo.findByStatus("PENDING");
        if (pending.isEmpty()) return "No pending leave requests at the moment.";

        return pending.stream()
            .map(l -> String.format(
                "• %s %s | %s → %s | %s | \"%s\"",
                l.getEmployee() != null ? l.getEmployee().getFirstName() : "?",
                l.getEmployee() != null ? l.getEmployee().getLastName()  : "?",
                l.getStartDate(), l.getEndDate(),
                l.getLeaveType() != null ? l.getLeaveType() : "Leave",
                l.getReason() != null ? l.getReason() : "No reason given"))
            .collect(Collectors.joining("\n",
                pending.size() + " pending leave request(s):\n", ""));
    }

    @Tool(description = "Get today's attendance summary across all employees — count of present, checked-in, and absent")
    public String getTodayAttendanceSummary() {
        long totalEmp    = employeeRepo.count();
        long todayRecords = attendanceRepo.countByAttendanceDate(LocalDate.now());
        long checkedOut  = attendanceRepo.findAll().stream()
            .filter(a -> LocalDate.now().equals(a.getAttendanceDate()) && a.getCheckOut() != null)
            .count();
        long checkedIn   = todayRecords - checkedOut;

        return String.format(
            "Today's attendance summary (%s):\n" +
            "  Total employees: %d\n" +
            "  Checked in:      %d\n" +
            "  Complete (out):  %d\n" +
            "  Not yet in:      %d",
            LocalDate.now(), totalEmp, checkedIn + checkedOut,
            checkedOut, totalEmp - todayRecords);
    }

    @Tool(description = "Get the total number of employees in the organisation")
    public String getTotalEmployeeCount() {
        long total  = employeeRepo.count();
        long active = employeeRepo.findByActiveTrue().size();
        return String.format("Total employees: %d (%d active, %d inactive)",
            total, active, total - active);
    }

    @Tool(description = "Get a summary of all employees grouped by department")
    public String getEmployeesByDepartment() {
        List<Employee> all = employeeRepo.findAll();
        return all.stream()
            .collect(Collectors.groupingBy(
                e -> e.getDepartment() != null ? e.getDepartment().getName() : "No Department",
                Collectors.counting()))
            .entrySet().stream()
            .map(en -> String.format("  %s: %d employee(s)", en.getKey(), en.getValue()))
            .collect(Collectors.joining("\n", "Employees by department:\n", ""));
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  ADMIN TOOLS  (registered only when role == ADMIN)
    // ══════════════════════════════════════════════════════════════════════════

    @Tool(description = "Get dashboard statistics: total employees, pending leaves, total departments, today's attendance count")
    public String getDashboardStats() {
        long employees   = employeeRepo.count();
        long pending     = leaveRepo.findByStatus("PENDING").size();
        long departments = departmentRepo.count();
        long todayAtt    = attendanceRepo.countByAttendanceDate(LocalDate.now());

        return String.format(
            "Dashboard stats:\n" +
            "  Total employees:    %d\n" +
            "  Pending leaves:     %d\n" +
            "  Total departments:  %d\n" +
            "  Today's attendance: %d",
            employees, pending, departments, todayAtt);
    }

    @Tool(description = "Get a list of all departments in the organisation")
    public String getAllDepartments() {
        return departmentRepo.findAll().stream()
            .map(d -> String.format("  • %s%s",
                d.getName(),
                d.getDescription() != null ? " — " + d.getDescription() : ""))
            .collect(Collectors.joining("\n", "Departments:\n", ""));
    }
}