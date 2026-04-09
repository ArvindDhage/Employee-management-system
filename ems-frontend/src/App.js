import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Auth / Layout ────────────────────────────────────────────────────────────
import Login from "./Components/LoginEMS/login";
import Unauthorized from "./util/Unauthorized";
import PrivateRoute from "./util/PrivateRoutes";
import AdminLayout from "./Components/Layout/AdminLayout";
import ManagerLayout from "./Components/Layout/ManagerLayout";
import MainLayout from "./Components/Layout/MainLayout";

// ── Admin pages ──────────────────────────────────────────────────────────────
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import EmployeeManagement from "./Pages/Admin/Employeemanagement";
import DepartmentManagement from "./Pages/Admin/Departmentmanagement";
import RoleManagement from "./Pages/Admin/Rolemanagement";
import LeaveApproval from "./Pages/Admin/LeaveApprovalPanel";
import AttendanceView from "./Pages/Admin/AttendanceView";
import AnnouncementManagement from "./Pages/Admin/AnnouncementManagement";

// ── HR pages ─────────────────────────────────────────────────────────────────
import HrDashboard from "./Pages/HR/HRDashboard";
import AddEmployee from "./Pages/HR/AddEmployee";
import ViewEmployee from "./Pages/HR/ViewEmployee";
import Payroll from "./Pages/HR/Payroll";
import ApplyLeaves from "./Pages/HR/ApplyLeaves";
import Attendance from "./Pages/HR/Attendance";
import Profile from "./Pages/HR/Profile";

// ── Manager pages ─────────────────────────────────────────────────────────────
import ManagerDashboard from "./Pages/Manager/ManagerDashboard";
import Teams from "./Pages/Manager/Teams";
import CreateTeam from "./Pages/Manager/CreateTeam";
import Tasks from "./Pages/Manager/Tasks";
import TeamLeaves from "./Pages/Manager/TeamLeaves";

// ── Employee pages ────────────────────────────────────────────────────────────
import EmployeeDashboard from "./Pages/Employee/EmployeeDashboard";

const NotFound = () => (
  <div style={{ textAlign: "center", marginTop: 80, fontSize: 24 }}>
    404 — Page Not Found
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ── Admin ── */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="leave-approval" element={<LeaveApproval />} />
          <Route path="attendance" element={<AttendanceView />} />
          <Route path="announcements" element={<AnnouncementManagement />} />
        </Route>

        {/* ── HR ── */}
        <Route
          path="/hr"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<HrDashboard />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="view-employee" element={<ViewEmployee />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="apply-leaves" element={<ApplyLeaves />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ── Manager ── */}
        <Route
          path="/manager"
          element={
            <PrivateRoute allowedRoles={["MANAGER"]}>
              <ManagerLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="teams" element={<Teams />} />
          <Route path="team/create" element={<CreateTeam />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team-leaves" element={<TeamLeaves />} />
          <Route path="apply-leaves" element={<ApplyLeaves />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ── Employee ──*/}
        <Route
          path="/employee"
          element={
            <PrivateRoute allowedRoles={["EMPLOYEE"]}>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="apply-leaves" element={<ApplyLeaves />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;