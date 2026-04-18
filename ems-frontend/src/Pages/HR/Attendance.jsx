import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box, Card, CardContent, Typography, Grid, Button, IconButton,
  CircularProgress, Alert, Tooltip, Divider, Stack, Chip, Paper,
  Skeleton, useTheme
} from "@mui/material";
import {
  AccessTime, ChevronLeft, ChevronRight, CheckCircle, Logout,
  CalendarToday, TrendingUp, FiberManualRecord, InfoOutlined
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Utility for auth (same logic as yours)
const getToken = () => localStorage.getItem("token") || localStorage.getItem("jwtToken") || null;
const getEmpId = () => {
  const direct = localStorage.getItem("empId") || localStorage.getItem("employeeId");
  if (direct) return direct;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.empId || user?.id || null;
  } catch { return null; }
};

const Attendance = () => {
  const theme = useTheme();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [alertMsg, setAlertMsg] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = useCallback(async () => {
    const token = getToken();
    const empId = getEmpId();

    if (!token || !empId) {
      setAlertMsg({ type: "error", text: "Authentication missing. Please log in." });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/attendance/history/${empId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setAttendanceData(data);

      const todayStr = new Date().toISOString().split("T")[0];
      setTodayStatus(data.find((rec) => rec.attendanceDate === todayStr) || null);
    } catch (err) {
      setAlertMsg({ type: "error", text: "Failed to sync records." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleAttendanceAction = async (actionType) => {
    setMarking(true);
    try {
      const endpoint = actionType === "check-in" ? "check-in" : "check-out";
      const method = actionType === "check-in" ? "post" : "put";
      
      const res = await axios[method](`${API_URL}/api/attendance/${endpoint}/${getEmpId()}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (res.status < 300) {
        await fetchAttendance();
        setAlertMsg({ type: "success", text: `Successfully ${actionType}ed!` });
      }
    } catch (err) {
      setAlertMsg({ type: "error", text: err.response?.data?.message || "Action failed." });
    } finally {
      setMarking(false);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split("T")[0];
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ dayNum: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const record = attendanceData.find((a) => a.attendanceDate === dateStr);
      days.push({ dayNum: d, record, isToday: dateStr === todayStr });
    }
    return days;
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      width: "100%",
      maxWidth: "100%",
      margin: 0,
      bgcolor: "#f8fafc",
      minHeight: "100vh",
      display: "flex",              
      justifyContent: "space-between"
    }}>
      {alertMsg && (
        <Alert 
          severity={alertMsg.type} 
          variant="filled" 
          sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} 
          onClose={() => setAlertMsg(null)}
        >
          {alertMsg.text}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ width: "100%" }}>
        {/* Left: Calendar Column */}
        <Grid item xs={12} md={7} lg={8}>
          <Card sx={{ 
            borderRadius: 5, 
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)", 
            border: "1px solid rgba(226, 232, 240, 0.8)",
            overflow: "hidden",
            width: "100%",
            height: "100%",
          }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="text.primary">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Typography>
                  <Chip 
                    icon={<TrendingUp sx={{ fontSize: '1rem !important' }} />}
                    label={`${attendanceData.length} Days Recorded`}
                    size="small"
                    sx={{ mt: 1, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.dark', fontWeight: 600 }}
                  />
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
                    sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", "&:hover": { bgcolor: "#f1f5f9" } }}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                    sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", "&:hover": { bgcolor: "#f1f5f9" } }}>
                    <ChevronRight />
                  </IconButton>
                </Stack>
              </Stack>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                {daysOfWeek.map(day => (
                  <Typography key={day} variant="caption" sx={{ textAlign: 'center', fontWeight: 700, color: 'text.disabled', pb: 2 }}>
                    {day}
                  </Typography>
                ))}
                
                {loading ? Array(30).fill(0).map((_, i) => <Skeleton key={i} variant="rounded" sx={{ aspectRatio: "1/1", borderRadius: 3 }} />) :
                  generateCalendar().map((item, i) => (
                    <Box key={i} sx={{
                      aspectRatio: "1/1",
                      borderRadius: 3,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      bgcolor: item.isToday ? theme.palette.primary.main : item.record ? alpha(theme.palette.success.main, 0.08) : "transparent",
                      border: item.isToday ? "none" : `1px solid ${item.record ? alpha(theme.palette.success.main, 0.2) : "#f1f5f9"}`,
                      color: item.isToday ? "#fff" : item.record ? theme.palette.success.dark : "text.secondary",
                      transition: "all 0.2s ease",
                      visibility: item.dayNum === 0 ? "hidden" : "visible",
                      "&:hover": { transform: item.dayNum > 0 ? "translateY(-2px)" : "none", boxShadow: item.dayNum > 0 ? "0 4px 12px rgba(0,0,0,0.05)" : "none" }
                    }}>
                      <Typography variant="body2" fontWeight={item.isToday ? 800 : 600}>{item.dayNum || ""}</Typography>
                      {item.record && !item.isToday && <FiberManualRecord sx={{ fontSize: 6, mt: 0.5 }} />}
                    </Box>
                  ))
                }
              </Box>

              <Stack direction="row" spacing={3} mt={4} justifyContent="center">
                 <LegendItem color={theme.palette.primary.main} label="Today" />
                 <LegendItem color={alpha(theme.palette.success.main, 0.2)} label="Present" border={`1px solid ${theme.palette.success.main}`} />
                 <LegendItem color="#f1f5f9" label="No Data" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Interaction Column */}
        <Grid item xs={12} md={5} lg={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Stack spacing={3} sx={{ width: "100%", maxWidth: 380 }}>
            {/* Real-time Punch Card */}
            <Card sx={{ 
              borderRadius: 5, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "#fff",
              boxShadow: "0 20px 40px -12px rgba(59, 130, 246, 0.5)",
              position: "relative",
            }}>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>Current Time</Typography>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
                  {liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 4 }}>
                  {liveTime.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                </Typography>

                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  {!todayStatus ? (
                    <Button fullWidth variant="contained" size="large" 
                      onClick={() => handleAttendanceAction("check-in")} disabled={marking}
                      sx={{ bgcolor: "#fff", color: "primary.main", fontWeight: 700, "&:hover": { bgcolor: "#f8fafc" }, py: 1.5, borderRadius: 3 }}>
                      {marking ? <CircularProgress size={24} /> : "Punch In Now"}
                    </Button>
                  ) : !todayStatus.checkOut ? (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Shift Started At</Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {new Date(todayStatus.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Button fullWidth variant="contained" color="warning" size="large"
                        onClick={() => handleAttendanceAction("check-out")} disabled={marking}
                        sx={{ fontWeight: 700, py: 1.5, borderRadius: 3, boxShadow: "none" }}>
                        Punch Out
                      </Button>
                    </Stack>
                  ) : (
                    <Stack alignItems="center" spacing={1}>
                      <CheckCircle sx={{ fontSize: 40, color: "#4ade80" }} />
                      <Typography variant="h6" fontWeight={700}>Shift Completed</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>See you tomorrow!</Typography>
                    </Stack>
                  )}
                </Paper>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card sx={{ borderRadius: 5, border: "1px solid #e2e8f0" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                  <InfoOutlined fontSize="small" /> Monthly Insight
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.05), textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={800} color="success.main">{attendanceData.length}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>PRESENT</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.error.main, 0.05), textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={800} color="error.main">
                        {Math.max(0, 22 - attendanceData.length)} {/* Assuming 22 working days */}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>ABSENT</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

// Small helper component for legend
const LegendItem = ({ color, label, border = "none" }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: color, border }} />
    <Typography variant="caption" fontWeight={600} color="text.secondary">{label}</Typography>
  </Stack>
);

export default Attendance;