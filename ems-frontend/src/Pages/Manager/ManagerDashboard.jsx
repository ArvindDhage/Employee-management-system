import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, Avatar,
  CircularProgress, Alert, Stack, Grid, Tooltip,
} from "@mui/material";
import {
  Check, Close, PendingActions, CheckCircle, Cancel,
  Groups, EventNote, Campaign, Assignment, ArrowForward,
  Flag as FlagIcon, Warning as WarningIcon,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("jwtToken") || null;
const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};
const getEmpId = () => {
  const direct = localStorage.getItem("empId") || localStorage.getItem("employeeId");
  if (direct) return direct;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.empId || user?.employeeId || user?.id || null;
  } catch (_) { return null; }
};

// ── Helpers ───────────────────────────────────────────────────────────────
const priorityHex = (p) =>
  ({ HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#3b82f6" })[(p || "").toUpperCase()] || "#64748b";

const priorityColor = (p) =>
  ({ HIGH: "error", MEDIUM: "warning", LOW: "info" })[(p || "").toUpperCase()] || "default";

const statusColor = (s) =>
  s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

const taskStatusColor = (s) => {
  const st = (s || "").toUpperCase();
  if (st === "COMPLETED")    return "success";
  if (st.includes("PROGRESS")) return "info";
  return "default";
};

// ── Is overdue? ───────────────────────────────────────────────────────────
const isOverdue = (dueDate, status) => {
  if (!dueDate || (status || "").toUpperCase() === "COMPLETED") return false;
  return new Date(dueDate) < new Date();
};

// ── Format due date nicely ────────────────────────────────────────────────
const formatDue = (dueDate) => {
  if (!dueDate) return "—";
  const d    = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff  = Math.ceil((d - today) / (1000 * 60 * 60 * 24));

  if (diff === 0)  return "Today";
  if (diff === 1)  return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0)   return `${Math.abs(diff)}d overdue`;
  if (diff <= 7)  return `In ${diff} days`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", flex: 1 }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>{title}</Typography>
          <Typography variant="h4" fontWeight={800} color={color}>{value}</Typography>
        </Box>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: bg,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats,         setStats]         = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance,    setAttendance]    = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tasks,         setTasks]         = useState([]);   // ✅ new
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const username = localStorage.getItem("username") || "Manager";

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    const token = getToken();
    if (!token) { setError("Not authenticated."); setLoading(false); return; }

    try {
      const [statsRes, leaveRes, announceRes, taskRes] = await Promise.all([
        axios.get(`${API_URL}/api/manager/stats`,          { headers: authHeaders() }),
        axios.get(`${API_URL}/api/manager/pending-leaves`, { headers: authHeaders() }),
        axios.get(`${API_URL}/api/announcements`,          { headers: authHeaders() }),
        axios.get(`${API_URL}/api/tasks/manager`,          { headers: authHeaders() }),
      ]);

      setStats(statsRes.data || {});
      setLeaveRequests(Array.isArray(leaveRes.data) ? leaveRes.data : []);
      setAnnouncements(Array.isArray(announceRes.data) ? announceRes.data : []);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);

      // Attendance for logged-in manager
      const empId = getEmpId();
      if (empId) {
        try {
          const attRes = await axios.get(
            `${API_URL}/api/attendance/history/${empId}`,
            { headers: authHeaders() }
          );
          setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
        } catch (_) { setAttendance([]); }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.status === 401 || err.response?.status === 403
        ? "Session expired. Please log in again."
        : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
  if (!id) return;

  setActionLoading(id + status);

  try {
    const endpoint =
      status === "APPROVED"
        ? `${API_URL}/api/manager/leave/${id}/approve`
        : `${API_URL}/api/manager/leave/${id}/reject`;

    await axios.patch(endpoint, {}, { headers: authHeaders() });

    await fetchDashboardData();
  } catch (err) {
    alert("Action failed: " + (err.response?.data || err.message));
  } finally {
    setActionLoading(null);
  }
};

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;

  // ── Derived ────────────────────────────────────────────────────────────
  const todayStr         = new Date().toLocaleDateString("en-CA");
  const todayRecord      = attendance.find(a => a.attendanceDate === todayStr);
  const monthStr         = new Date().toISOString().slice(0, 7);
  const presentThisMonth = attendance.filter(a => a.attendanceDate?.startsWith(monthStr)).length;

  // Task stats
  const pendingTasks    = tasks.filter(t => (t.status || "").toUpperCase() === "PENDING").length;
  const inProgressTasks = tasks.filter(t => (t.status || "").toUpperCase().includes("PROGRESS")).length;
  const completedTasks  = tasks.filter(t => (t.status || "").toUpperCase() === "COMPLETED").length;
  const overdueTasks    = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;

  // Sort tasks: overdue first, then by due date ascending, then no due date last
  const sortedTasks = [...tasks].sort((a, b) => {
    const aOver = isOverdue(a.dueDate, a.status);
    const bOver = isOverdue(b.dueDate, b.status);
    if (aOver && !bOver) return -1;
    if (!aOver && bOver) return 1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const statsConfig = [
    { title: "Total Employees", value: stats.totalEmployees ?? 0, icon: Groups,        color: "#3b82f6", bg: "#eff6ff" },
    { title: "Pending Leaves",  value: stats.pendingLeaves  ?? 0, icon: PendingActions, color: "#f59e0b", bg: "#fffbeb" },
    { title: "Approved Leaves", value: stats.approvedLeaves ?? 0, icon: CheckCircle,   color: "#10b981", bg: "#ecfdf5" },
    { title: "Tasks Assigned",  value: tasks.length,              icon: Assignment,    color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Manager Dashboard</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Welcome back, <strong>{username}</strong>
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: "white",
            border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1 }}>
            <EventNote fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={600}>
              {todayRecord
                ? todayRecord.checkOut ? "✅ Day Complete" : "🟢 Checked In"
                : "⚪ Not Checked In"}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: "#3b82f6", fontWeight: 700 }}>
            {username[0]?.toUpperCase()}
          </Avatar>
        </Stack>
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4} flexWrap="wrap">
        {statsConfig.map(s => <StatCard key={s.title} {...s} />)}
      </Stack>

      {/* Attendance Summary */}
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>My Attendance This Month</Typography>
          <Stack direction="row" spacing={3}>
            <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: "#ecfdf5", flex: 1 }}>
              <Typography variant="h4" fontWeight={800} color="#10b981">{presentThisMonth}</Typography>
              <Typography variant="caption" color="text.secondary">Days Present</Typography>
            </Box>
            <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: "#eff6ff", flex: 1 }}>
              <Typography variant="h4" fontWeight={800} color="#3b82f6">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - presentThisMonth}
              </Typography>
              <Typography variant="caption" color="text.secondary">Days Absent</Typography>
            </Box>
            <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: "#fffbeb", flex: 1 }}>
              <Typography variant="h4" fontWeight={800} color="#f59e0b">
                {todayRecord?.checkIn
                  ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "—"}
              </Typography>
              <Typography variant="caption" color="text.secondary">Today Check-in</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── Tasks I Assigned ─────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Assignment fontSize="small" color="action" />
                <Typography variant="h6" fontWeight={700}>Tasks I Assigned</Typography>
                {overdueTasks > 0 && (
                  <Chip
                    icon={<WarningIcon sx={{ fontSize: "14px !important" }} />}
                    label={`${overdueTasks} overdue`}
                    color="error" size="small"
                    sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={2} mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Pending: <strong>{pendingTasks}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  In Progress: <strong>{inProgressTasks}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed: <strong>{completedTasks}</strong>
                </Typography>
              </Stack>
            </Box>
            <Button size="small" endIcon={<ArrowForward />}
              onClick={() => navigate("/manager/tasks")}
              sx={{ textTransform: "none", fontWeight: 600 }}>
              View All
            </Button>
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {["Task", "Assigned To", "Priority", "Due Date", "Status"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem",
                    textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No tasks assigned yet.{" "}
                    <Button size="small" onClick={() => navigate("/manager/tasks")}
                      sx={{ textTransform: "none", fontWeight: 700 }}>
                      Create a task
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTasks.slice(0, 6).map(task => {
                  const overdue  = isOverdue(task.dueDate, task.status);
                  const pHex     = priorityHex(task.priority);
                  const assignee = task.assignedTo || {};
                  const name     = `${assignee.firstName || ""} ${assignee.lastName || ""}`.trim() || "Unassigned";
                  const initials = name !== "Unassigned"
                    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

                  return (
                    <TableRow key={task.id} hover
                      sx={{
                        "&:last-child td": { border: 0 },
                        bgcolor: overdue ? "#fff9f9" : "inherit",
                      }}>

                      {/* Task name with priority indicator */}
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                          <Box sx={{ width: 3, minHeight: 32, borderRadius: 4,
                            bgcolor: pHex, flexShrink: 0, mt: 0.3 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={700} lineHeight={1.3}>
                              {task.title || "Untitled"}
                            </Typography>
                            {task.description && (
                              <Typography variant="caption" color="text.secondary"
                                sx={{ display: "-webkit-box", WebkitLineClamp: 1,
                                  WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {task.description}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Assigned to */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 26, height: 26, bgcolor: "#3b82f6", fontSize: "0.65rem" }}>
                            {initials}
                          </Avatar>
                          <Typography variant="body2">{name}</Typography>
                        </Stack>
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <FlagIcon sx={{ fontSize: 13, color: pHex }} />
                          <Chip label={task.priority || "LOW"} color={priorityColor(task.priority)}
                            size="small" sx={{ fontWeight: 700, fontSize: "0.68rem" }} />
                        </Stack>
                      </TableCell>

                      {/* Due date — highlighted if overdue */}
                      <TableCell>
                        <Tooltip title={task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("en-IN",
                              { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                          : "No due date"}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {overdue && (
                              <WarningIcon sx={{ fontSize: 14, color: "#ef4444" }} />
                            )}
                            <Typography variant="body2" fontWeight={overdue ? 700 : 400}
                              color={overdue ? "#ef4444" : task.dueDate ? "text.primary" : "text.disabled"}>
                              {formatDue(task.dueDate)}
                            </Typography>
                          </Stack>
                        </Tooltip>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={(task.status || "PENDING").replace("_", " ")}
                          color={taskStatusColor(task.status)}
                          size="small" variant="outlined"
                          sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Show more link if more than 6 */}
        {tasks.length > 6 && (
          <Box sx={{ p: 2, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
            <Button size="small" onClick={() => navigate("/manager/tasks")}
              endIcon={<ArrowForward />}
              sx={{ textTransform: "none", fontWeight: 600, color: "#3b82f6" }}>
              View all {tasks.length} tasks
            </Button>
          </Box>
        )}
      </Card>

      <Grid container spacing={3}>

        {/* Leave Requests Table */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9" }}>
              <Typography variant="h6" fontWeight={700}>Pending Leave Requests</Typography>
              <Typography variant="caption" color="text.secondary">
                {leaveRequests.length} request{leaveRequests.length !== 1 ? "s" : ""} awaiting review
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    {["Employee", "Department", "Dates", "Reason", "Status", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem",
                        textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        No pending leave requests 🎉
                      </TableCell>
                    </TableRow>
                  ) : leaveRequests.map(req => (
                    <TableRow key={req.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#3b82f6", fontSize: "0.75rem" }}>
                            {req.employee?.firstName?.[0]}{req.employee?.lastName?.[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {req.employee?.firstName} {req.employee?.lastName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {req.employee?.departmentName || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{req.startDate} → {req.endDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{req.reason}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={req.status || "PENDING"} color={statusColor(req.status)}
                          size="small" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                      </TableCell>
                      <TableCell>
                        {(!req.status || req.status === "PENDING") && (
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="contained" color="success"
                              startIcon={actionLoading === req.id + "APPROVED"
                                ? <CircularProgress size={14} color="inherit" /> : <Check />}
                              disabled={!!actionLoading}
                              onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                              sx={{ textTransform: "none", borderRadius: 1.5, fontSize: "0.72rem" }}>
                              Approve
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              startIcon={actionLoading === req.id + "REJECTED"
                                ? <CircularProgress size={14} color="inherit" /> : <Close />}
                              disabled={!!actionLoading}
                              onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                              sx={{ textTransform: "none", borderRadius: 1.5, fontSize: "0.72rem" }}>
                              Reject
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Announcements Panel */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #f1f5f9" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Campaign fontSize="small" color="primary" />
                <Typography variant="h6" fontWeight={700}>Announcements</Typography>
                <Chip label={announcements.length} size="small" color="primary" variant="outlined"
                  sx={{ fontSize: "0.7rem", ml: "auto" }} />
              </Stack>
            </Box>
            <Box sx={{ p: 2 }}>
              {announcements.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Campaign sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No announcements.</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {announcements.slice(0, 5).map((ann, i) => (
                    <Box key={ann.id || i} sx={{
                      p: 2, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#fafafa",
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                        <Typography variant="body2" fontWeight={700} sx={{
                          overflow: "hidden", textOverflow: "ellipsis",
                          display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
                        }}>
                          {ann.title}
                        </Typography>
                        <Chip label={ann.priority || "MEDIUM"} size="small"
                          color={ann.priority === "HIGH" ? "error" : ann.priority === "LOW" ? "default" : "warning"}
                          sx={{ fontSize: "0.65rem", fontWeight: 700, ml: 1, flexShrink: 0 }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {ann.content}
                      </Typography>
                      <Stack direction="row" spacing={0.5} mt={1}>
                        <Chip label={ann.type || "GENERAL"} size="small" sx={{ fontSize: "0.65rem" }} />
                        <Chip label={ann.audience || "ALL"} size="small" variant="outlined"
                          sx={{ fontSize: "0.65rem" }} />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ManagerDashboard;