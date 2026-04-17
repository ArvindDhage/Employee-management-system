import React, { useEffect, useState } from "react";
import {
  Grid, Box, Typography, Card, CardContent, CardHeader,
  Chip, CircularProgress, Alert, Stack, Avatar, Divider,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FlagIcon from "@mui/icons-material/Flag";
import WarningIcon from "@mui/icons-material/Warning";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("jwtToken") || localStorage.getItem("authToken") || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };
const getEmpId = () => {
  const d = localStorage.getItem("empId") || localStorage.getItem("employeeId");
  if (d) return d;
  try { const u = JSON.parse(localStorage.getItem("user")); return u?.empId || u?.employeeId || u?.id || null; }
  catch { return null; }
};

// ── Helpers ───────────────────────────────────────────────────────────────
const priorityHex = (p) =>
  ({ HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#3b82f6" })[(p || "").toUpperCase()] || "#64748b";
const priorityColor = (p) =>
  ({ HIGH: "error", MEDIUM: "warning", LOW: "info" })[(p || "").toUpperCase()] || "default";
const taskStatusColor = (s) => {
  const st = (s || "").toUpperCase();
  if (st === "COMPLETED")      return "success";
  if (st.includes("PROGRESS")) return "info";
  return "default";
};
const isOverdue = (dueDate, status) =>
  !!(dueDate && (status || "").toUpperCase() !== "COMPLETED" && new Date(dueDate) < new Date());

const formatDue = (dueDate) => {
  if (!dueDate) return "—";
  const d = new Date(dueDate);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / 86400000);
  if (diff === 0)  return "Today";
  if (diff === 1)  return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0)   return `${Math.abs(diff)}d overdue`;
  if (diff <= 7)  return `In ${diff} days`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// ── Stats Card ────────────────────────────────────────────────────────────
const StatsCard = ({ title, value, icon: Icon, color, bg }) => (
  <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Box sx={{ bgcolor: bg, p: 1.5, borderRadius: 2, display: "flex" }}>
          <Icon sx={{ color, fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>{title}</Typography>
          <Typography variant="h6" fontWeight={800} lineHeight={1.2}>{value}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const EmployeeDashboard = () => {
  const [employee,      setEmployee]      = useState(null);
  const [attendance,    setAttendance]    = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tasks,         setTasks]         = useState([]);   
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const empId = getEmpId();
      if (!token) { setError("Not authenticated. Please log in again."); setLoading(false); return; }

      try {
        const [profileRes, announceRes] = await Promise.all([
          axios.get(`${API_URL}/employees/dashboard`, { headers: authHeaders() }),
          axios.get(`${API_URL}/api/announcements`,   { headers: authHeaders() }),
        ]);
        setEmployee(profileRes.data);
        setAnnouncements(Array.isArray(announceRes.data) ? announceRes.data : []);

        // Attendance
        if (empId) {
          try {
            const attRes = await axios.get(`${API_URL}/api/attendance/history/${empId}`, { headers: authHeaders() });
            setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
          } catch { setAttendance([]); }

          // Tasks assigned to this employee
          try {
            const taskRes = await axios.get(`${API_URL}/api/tasks/employee/${empId}`, { headers: authHeaders() });
            setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
          } catch { setTasks([]); }
        }
      } catch (err) {
        setError(err.response?.status === 401 || err.response?.status === 403
          ? "Session expired. Please log in again."
          : "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error)   return <Box p={3}><Alert severity="error">{error}</Alert></Box>;

  // ── Derived ────────────────────────────────────────────────────────────
  const monthStr         = new Date().toISOString().slice(0, 7);
  const presentThisMonth = attendance.filter(a => a.attendanceDate?.startsWith(monthStr)).length;
  const todayStr         = new Date().toLocaleDateString("en-CA");
  const todayRecord      = attendance.find(a => a.attendanceDate === todayStr);
  const recentAttendance = [...attendance]
    .sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate))
    .slice(0, 5);

  const pendingTasks  = tasks.filter(t => (t.status || "").toUpperCase() === "PENDING").length;
  const overdueTasks  = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;

  const fullName = employee
    ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Employee"
    : "Employee";

  const statsConfig = [
    { title: "Present This Month", value: presentThisMonth,  icon: PersonIcon,        color: "#10b981", bg: "#ecfdf5" },
    { title: "Today Status",       value: todayRecord ? (todayRecord.checkOut ? "Complete" : "Checked In") : "Not In",
                                                              icon: AccessTimeIcon,     color: "#3b82f6", bg: "#eff6ff" },
    { title: "Tasks Assigned",     value: tasks.length,      icon: AssignmentIcon,    color: "#8b5cf6", bg: "#f5f3ff" },
    { title: "Announcements",      value: announcements.length, icon: CampaignIcon,   color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <Box p={3} sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: "#3b82f6", fontWeight: 800, fontSize: "1.2rem" }}>
          {fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a">
            Hello, {fullName} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee?.roleName || ""}{employee?.roleName && employee?.departmentName ? " • " : ""}{employee?.departmentName || ""}
          </Typography>
        </Box>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        {statsConfig.map((stat, i) => (
          <Grid key={i} item xs={12} sm={6} lg={3}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* ── Row 1: Announcements + Assigned Tasks ── */}
      <Grid container spacing={3} mb={3}>

        {/* Announcements */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
            <CardHeader
              avatar={<CampaignIcon color="primary" fontSize="small" />}
              title={<Typography variant="subtitle1" fontWeight={700}>Announcements</Typography>}
              action={<Chip label={announcements.length} size="small" color="primary" variant="outlined" sx={{ fontSize: "0.7rem" }} />}
              sx={{ pb: 0, pt: 2.5, px: 2.5 }}
            />
            <Divider sx={{ mx: 2.5, mt: 1.5 }} />
            <CardContent sx={{ px: 2.5, pt: 2 }}>
              {announcements.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <CampaignIcon sx={{ fontSize: 36, color: "#cbd5e1", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No announcements at this time.</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {announcements.slice(0, 4).map((a, i) => (
                    <Box key={a.id || i} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#fafafa" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                          <CampaignIcon color="primary" sx={{ fontSize: 15 }} />
                          <Typography variant="body2" fontWeight={700}
                            sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {a.title}
                          </Typography>
                        </Stack>
                        <Chip label={a.priority || "MEDIUM"} size="small"
                          color={a.priority === "HIGH" ? "error" : a.priority === "LOW" ? "default" : "warning"}
                          sx={{ fontSize: "0.65rem", fontWeight: 700, flexShrink: 0, ml: 1 }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary"
                        sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {a.content || a.message || ""}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Assigned Tasks */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
            <CardHeader
              avatar={<AssignmentIcon color="action" fontSize="small" />}
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" fontWeight={700}>My Tasks</Typography>
                  {overdueTasks > 0 && (
                    <Chip icon={<WarningIcon sx={{ fontSize: "13px !important" }} />}
                      label={`${overdueTasks} overdue`} color="error" size="small"
                      sx={{ fontWeight: 700, fontSize: "0.68rem" }} />
                  )}
                </Stack>
              }
              action={
                <Stack direction="row" spacing={1}>
                  <Chip label={`${pendingTasks} pending`} size="small" color="warning" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                </Stack>
              }
              sx={{ pb: 0, pt: 2.5, px: 2.5 }}
            />
            <Divider sx={{ mx: 2.5, mt: 1.5 }} />
            <CardContent sx={{ px: 2.5, pt: 2 }}>
              {tasks.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <AssignmentIcon sx={{ fontSize: 36, color: "#cbd5e1", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No tasks assigned to you yet.</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {tasks
                    .sort((a, b) => {
                      // overdue first, then by due date
                      const ao = isOverdue(a.dueDate, a.status);
                      const bo = isOverdue(b.dueDate, b.status);
                      if (ao && !bo) return -1;
                      if (!ao && bo) return 1;
                      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
                      return 0;
                    })
                    .slice(0, 4)
                    .map((task, i) => {
                      const overdue = isOverdue(task.dueDate, task.status);
                      const pHex   = priorityHex(task.priority);
                      return (
                        <Box key={task.id || i} sx={{
                          p: 2, borderRadius: 2,
                          border: `1px solid ${overdue ? "#fecaca" : "#e2e8f0"}`,
                          bgcolor: overdue ? "#fff9f9" : "#fafafa",
                        }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                            <Stack direction="row" alignItems="flex-start" spacing={1}>
                              {/* Priority indicator bar */}
                              <Box sx={{ width: 3, height: 32, borderRadius: 4, bgcolor: pHex, mt: 0.3, flexShrink: 0 }} />
                              <Box>
                                <Typography variant="body2" fontWeight={700}
                                  sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {task.title || "Untitled"}
                                </Typography>
                                {task.description && (
                                  <Typography variant="caption" color="text.secondary"
                                    sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {task.description}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                            <Chip label={(task.status || "PENDING").replace("_", " ")}
                              color={taskStatusColor(task.status)} size="small" variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "0.65rem", flexShrink: 0, ml: 1 }} />
                          </Stack>

                          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                            {/* Priority */}
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <FlagIcon sx={{ fontSize: 13, color: pHex }} />
                              <Chip label={task.priority || "LOW"} color={priorityColor(task.priority)}
                                size="small" sx={{ fontWeight: 700, fontSize: "0.65rem", height: 18 }} />
                            </Stack>
                            {/* Due date */}
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              {overdue && <WarningIcon sx={{ fontSize: 13, color: "#ef4444" }} />}
                              <Typography variant="caption"
                                fontWeight={overdue ? 700 : 500}
                                color={overdue ? "#ef4444" : task.dueDate ? "text.secondary" : "text.disabled"}>
                                {task.dueDate ? `Due: ${formatDue(task.dueDate)}` : "No due date"}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Row 2: Recent Attendance + My Info (side by side) ── */}
      <Grid container spacing={3}>

        {/* Recent Attendance — last 5 days */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardHeader
              avatar={<AccessTimeIcon color="action" fontSize="small" />}
              title={<Typography variant="subtitle1" fontWeight={700}>Recent Attendance</Typography>}
              subheader={<Typography variant="caption" color="text.secondary">Last 5 days</Typography>}
              sx={{ pb: 0, pt: 2.5, px: 2.5 }}
            />
            <Divider sx={{ mx: 2.5, mt: 1.5 }} />
            <CardContent sx={{ px: 2.5, pt: 2 }}>
              {recentAttendance.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <AccessTimeIcon sx={{ fontSize: 36, color: "#cbd5e1", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No attendance records found.</Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {recentAttendance.map((record, i) => (
                    <Box key={i} sx={{
                      p: 1.5, borderRadius: 2, border: "1px solid #e2e8f0",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      bgcolor: record.attendanceDate === todayStr ? "#eff6ff" : "#fafafa",
                    }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{
                          width: 8, height: 8, borderRadius: "50%",
                          bgcolor: record.checkOut ? "#10b981" : record.checkIn ? "#3b82f6" : "#cbd5e1",
                        }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(record.attendanceDate).toLocaleDateString("en-IN",
                              { weekday: "short", day: "numeric", month: "short" })}
                            {record.attendanceDate === todayStr && (
                              <Chip label="Today" size="small" color="primary"
                                sx={{ ml: 1, fontSize: "0.62rem", height: 18, fontWeight: 700 }} />
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary" display="block">
                            {record.checkIn
                              ? `In: ${new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                              : "—"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {record.checkOut
                              ? `Out: ${new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                              : record.checkIn ? "Not checked out" : ""}
                          </Typography>
                        </Box>
                        <Chip
                          label={record.checkOut ? "Complete" : record.checkIn ? "In Progress" : "Absent"}
                          color={record.checkOut ? "success" : record.checkIn ? "info" : "default"}
                          size="small" sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* My Info */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardHeader
              avatar={<PersonIcon color="action" fontSize="small" />}
              title={<Typography variant="subtitle1" fontWeight={700}>My Info</Typography>}
              sx={{ pb: 0, pt: 2.5, px: 2.5 }}
            />
            <Divider sx={{ mx: 2.5, mt: 1.5 }} />
            <CardContent sx={{ px: 2.5, pt: 2 }}>
              {[
                { label: "Employee ID",  value: employee?.empCode },
                { label: "Email",        value: employee?.email },
                { label: "Phone",        value: employee?.phone },
                { label: "Department",   value: employee?.departmentName },
                { label: "Role",         value: employee?.roleName },
                { label: "Joining Date", value: employee?.joiningDate
                    ? new Date(employee.joiningDate).toLocaleDateString("en-IN",
                        { day: "2-digit", month: "short", year: "numeric" }) : null },
                { label: "Salary",       value: employee?.salary
                    ? `₹ ${Number(employee.salary).toLocaleString("en-IN")}` : null },
              ].map(({ label, value }) => (
                <Box key={label} display="flex" justifyContent="space-between" alignItems="center"
                  sx={{ py: 1.2, borderBottom: "1px solid #f1f5f9", "&:last-child": { borderBottom: "none" } }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600} color={value ? "#0f172a" : "text.disabled"}>
                    {value || "N/A"}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;