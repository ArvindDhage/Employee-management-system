import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, Button, Stack, Paper, Grid, Card, CardContent,
  CardHeader, Divider, Avatar, Chip, CircularProgress, Alert,
} from "@mui/material";
import AddIcon      from "@mui/icons-material/PersonAdd";
import GroupIcon    from "@mui/icons-material/Group";
import ApartmentIcon from "@mui/icons-material/Apartment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const getToken = () => localStorage.getItem("token") || localStorage.getItem("jwtToken") || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ bgcolor: "white", border: "1px solid #e2e8f0", borderRadius: 2, px: 2, py: 1.5 }}>
        {label && <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>}
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {payload[0].value} {payload[0].name === "count" ? "employees" : payload[0].name}
        </Typography>
      </Box>
    );
  }
  return null;
};

const HRDashboard = () => {
  const navigate  = useNavigate();
  const username  = localStorage.getItem("username") || localStorage.getItem("userEmail") || "HR Manager";

  const [employees,     setEmployees]     = useState([]);
  const [departments,   setDepartments]   = useState([]);
  const [attendance,    setAttendance]    = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, attRes, announceRes] = await Promise.all([
        // ✅ EmployeeController: GET /employees/get-all
        axios.get(`${API_URL}/employees/get-all`,     { headers: authHeaders() }),
        // ✅ AdminController: GET /api/admin/departments
        axios.get(`${API_URL}/api/admin/departments`, { headers: authHeaders() }),
        // ✅ AdminController: GET /api/admin/attendance
        axios.get(`${API_URL}/api/admin/attendance`,  { headers: authHeaders() }),
        // ✅ AnnouncementController: GET /api/announcements — published only, accessible by HR
        axios.get(`${API_URL}/api/announcements`,     { headers: authHeaders() })
             .catch(() => ({ data: [] })), // non-fatal if HR lacks access
      ]);
      setEmployees(Array.isArray(empRes.data)      ? empRes.data      : []);
      setDepartments(Array.isArray(deptRes.data)   ? deptRes.data     : []);
      setAttendance(Array.isArray(attRes.data)     ? attRes.data      : []);
      setAnnouncements(Array.isArray(announceRes.data) ? announceRes.data : []);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  // FIX: use ISO date format to match backend LocalDate serialization
  const todayStr       = new Date().toISOString().split("T")[0];
  const todayRecords   = attendance.filter(a => a.attendanceDate === todayStr);
  const presentToday   = todayRecords.filter(a => a.checkOut).length;
  const checkedInToday = todayRecords.filter(a => a.checkIn && !a.checkOut).length;
  const monthStr       = new Date().toISOString().slice(0, 7);
  const presentMonth   = attendance.filter(a => a.attendanceDate?.startsWith(monthStr)).length;
  const activeEmp      = employees.filter(e => e.active !== false).length;

  // FIX: resolve department name from nested object — backend returns `department: { name }` on Employee
  const deptChartData = departments.map(d => ({
    name:  d.name,
    count: employees.filter(e =>
      (e.department?.name || e.departmentName || "") === d.name
    ).length,
  })).filter(d => d.count > 0);

  const attendancePie = [
    { name: "Complete",   value: presentToday,   color: "#10b981" },
    { name: "Checked In", value: checkedInToday, color: "#3b82f6" },
    { name: "Not In",     value: Math.max(0, employees.length - presentToday - checkedInToday), color: "#f43f5e" },
  ];

  const statsItems = [
    {
      title:    "Total Employees",
      value:    employees.length,
      subtitle: `${activeEmp} active · ${departments.length} departments`,
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    },
    {
      title:    "Present Today",
      value:    presentToday + checkedInToday,
      subtitle: `${checkedInToday} still checked in`,
      gradient: "linear-gradient(135deg, #10b981, #047857)",
    },
    {
      title:    "Present This Month",
      value:    presentMonth,
      subtitle: "attendance records",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    {
      title:    "Announcements",
      value:    announcements.length,
      subtitle: "published",
      gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── Welcome Banner ── */}
      <Paper elevation={0} sx={{
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)",
        color: "white", borderRadius: 4, px: { xs: 3, md: 5 }, py: 4, mb: 4,
        position: "relative", overflow: "hidden",
        "&::before": { content: '""', position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" },
        "&::after": { content: '""', position: "absolute", bottom: -60, right: 80,
          width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.04)" },
      }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 48, height: 48, fontSize: "1.4rem" }}>👋</Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
              Welcome back, {username}
            </Typography>
            <Typography sx={{ opacity: 0.8, fontSize: "0.9rem" }}>
              Here's your organization pulse for today
            </Typography>
          </Box>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate("/hr/add-employee")} sx={actionBtnStyle}>
            Add Employee
          </Button>
          <Button variant="contained" startIcon={<GroupIcon />}
            onClick={() => navigate("/hr/view-employee")} sx={actionBtnStyle}>
            View Employees
          </Button>
          <Button variant="contained" startIcon={<ApartmentIcon />}
            onClick={() => navigate("/hr/attendance")} sx={actionBtnStyle}>
            Attendance
          </Button>
        </Stack>
      </Paper>

      {/* ── Section Title ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>Overview</Typography>
        <Chip label="Live" size="small" color="success" sx={{ height: 20, fontSize: "0.7rem" }} />
      </Stack>

      {/* ── Stats ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsItems.map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{
              borderRadius: 3, background: item.gradient, color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 32px rgba(0,0,0,0.12)" },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600, mb: 1 }}>{item.title}</Typography>
                <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>{item.value}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>{item.subtitle}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Charts ── */}
      <Grid container spacing={3}>

        {/* Department Bar Chart */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
            <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Employees by Department</Typography>} sx={{ pb: 0 }} />
            <Divider sx={{ mx: 2, mt: 1 }} />
            <CardContent>
              {deptChartData.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                  <Typography color="text.secondary">No department data available</Typography>
                </Box>
              ) : (
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptChartData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Pie */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
            <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Today's Attendance</Typography>} sx={{ pb: 0 }} />
            <Divider sx={{ mx: 2, mt: 1 }} />
            <CardContent>
              <Box sx={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendancePie} cx="50%" cy="50%"
                      innerRadius={65} outerRadius={95} paddingAngle={4}
                      dataKey="value" strokeWidth={0}>
                      {attendancePie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1.5} mt={1}>
                {attendancePie.map((item) => (
                  <Stack key={item.name} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color }} />
                      <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Announcements */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CampaignIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={700}>Announcements</Typography>
                  <Chip label={`${announcements.length} active`} size="small" color="primary" variant="outlined"
                    sx={{ fontSize: "0.7rem" }} />
                </Stack>
              }
              sx={{ pb: 0 }}
            />
            <Divider sx={{ mx: 2, mt: 1 }} />
            <CardContent>
              {announcements.length === 0 ? (
                <Typography color="text.secondary" variant="body2" sx={{ py: 2, textAlign: "center" }}>
                  No announcements at this time.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {announcements.slice(0, 4).map((ann, i) => (
                    <Grid item xs={12} sm={6} md={3} key={ann.id || i}>
                      <Box sx={{
                        p: 2, borderRadius: 2, border: "1px solid #e2e8f0",
                        bgcolor: ann.priority === "HIGH" ? "#fef2f2" : "#fafafa",
                        height: "100%",
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
                        <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                          <Chip label={ann.type || "GENERAL"} size="small" sx={{ fontSize: "0.65rem" }} />
                          <Chip label={ann.audience || "ALL"} size="small" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const actionBtnStyle = {
  bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600,
  backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)",
  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
  textTransform: "none", borderRadius: 2,
};

export default HRDashboard;