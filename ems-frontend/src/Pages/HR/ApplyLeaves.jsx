import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box, Card, CardContent, Typography, Grid, TextField, MenuItem,
  Button, Chip, Divider, CircularProgress, Alert, Paper, Stack,
  InputAdornment, useTheme, Zoom, Fade
} from "@mui/material";
import {
  CalendarMonth, Send, AccessTime, CheckCircle, Cancel, EventNote,
  Description, History, InfoOutlined, DateRange
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const leaveTypes = [
  { label: "Sick Leave", value: "SICK", color: "#f43f5e", emoji: "🤒", desc: "For medical reasons" },
  { label: "Casual Leave", value: "CASUAL", color: "#3b82f6", emoji: "🏖️", desc: "Short-term personal time" },
  { label: "Annual Leave", value: "ANNUAL", color: "#8b5cf6", emoji: "📅", desc: "Vacation and long rest" },
];

const ApplyLeave = () => {
  const theme = useTheme();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const empId = localStorage.getItem("employeeId") || localStorage.getItem("empId");

  const [formData, setFormData] = useState({
    leaveType: "", startDate: "", endDate: "", reason: "",
  });

  const fetchLeaveHistory = useCallback(async () => {
    if (!empId) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const [historyRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/api/leaves/employee/${empId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/employees/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLeaveRequests(Array.isArray(historyRes.data) ? historyRes.data : []);
      setLeaveBalance(profileRes.data?.leaveBalance ?? null);
    } catch (err) {
      setError("Sync failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [empId]);

  useEffect(() => { fetchLeaveHistory(); }, [fetchLeaveHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/api/leaves/apply/${empId}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" });
      setSuccessMsg("Application sent to your manager.");
      fetchLeaveHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") return { color: "#10b981", icon: <CheckCircle sx={{ fontSize: 14 }} />, label: "Approved" };
    if (s === "REJECTED") return { color: "#f43f5e", icon: <Cancel sx={{ fontSize: 14 }} />, label: "Rejected" };
    return { color: "#f59e0b", icon: <AccessTime sx={{ fontSize: 14 }} />, label: "Pending" };
  };

  const daysRequested = formData.startDate && formData.endDate
    ? Math.max(1, Math.round((new Date(formData.endDate) - new Date(formData.startDate)) / 86400000) + 1)
    : null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: "0 auto" }}>
      {/* Notifications */}
      <Stack sx={{ position: "fixed", top: 20, right: 20, zIndex: 2000, width: 320 }} spacing={1}>
        {error && <Zoom in><Alert severity="error" variant="filled" onClose={() => setError(null)}>{error}</Alert></Zoom>}
        {successMsg && <Zoom in><Alert severity="success" variant="filled" onClose={() => setSuccessMsg("")}>{successMsg}</Alert></Zoom>}
      </Stack>

      <Grid container spacing={4}>
        {/* LEFT: Application Form */}
        <Grid item xs={12} lg={6}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1, letterSpacing: -1 }}>Leave Portal</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Submit new requests and track your time off.</Typography>

          <Card sx={{ 
            borderRadius: 6, 
            boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: "visible"
          }}>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField 
                    fullWidth select label="Leave Category" 
                    value={formData.leaveType}
                    onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><InfoOutlined color="action" /></InputAdornment>,
                    }}
                  >
                    {leaveTypes.map((t) => (
                      <MenuItem key={t.value} value={t.value} sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(t.color, 0.1), color: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {t.emoji}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{t.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField fullWidth type="date" label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        InputProps={{ startAdornment: <InputAdornment position="start"><DateRange fontSize="small"/></InputAdornment> }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField fullWidth type="date" label="End Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        InputProps={{ startAdornment: <InputAdornment position="start"><DateRange fontSize="small"/></InputAdornment> }}
                      />
                    </Grid>
                  </Grid>

                  {daysRequested && (
                    <Fade in>
                      <Paper sx={{ 
                        p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.04), 
                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                      }}>
                        <Typography variant="body2" fontWeight={600} color="primary">Total Duration</Typography>
                        <Chip label={`${daysRequested} Work Days`} color="primary" sx={{ fontWeight: 800 }} />
                      </Paper>
                    </Fade>
                  )}

                  <TextField 
                    fullWidth multiline rows={4} label="Reason for Leave"
                    placeholder="e.g. Family function in my hometown..."
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}><Description color="action" /></InputAdornment>,
                    }}
                  />

                  <Button 
                    type="submit" variant="contained" fullWidth
                    disabled={submitting || !formData.leaveType}
                    sx={{ 
                      py: 2, borderRadius: 4, fontSize: "1rem", fontWeight: 700,
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      textTransform: "none"
                    }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Request Approval"}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: History & Balance */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={4}>
            {/* Balance Card */}
            <Paper sx={{ 
              p: 4, borderRadius: 6, position: "relative", overflow: "hidden",
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, #6366f1)`,
              color: "white", boxShadow: "0 15px 30px rgba(99, 102, 241, 0.3)"
            }}>
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Available Balance</Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ my: 1 }}>
                  <Typography variant="h2" fontWeight={900}>{leaveBalance ?? "—"}</Typography>
                  <Typography variant="h6">Days</Typography>
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Paid time off remaining for this fiscal year.</Typography>
              </Box>
              <CalendarMonth sx={{ position: "absolute", right: -20, bottom: -20, fontSize: 180, opacity: 0.1 }} />
            </Paper>

            {/* History List */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} px={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <History color="primary" />
                  <Typography variant="h6" fontWeight={800}>Application History</Typography>
                </Stack>
                <Chip label={`${leaveRequests.length} Total`} size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }} />
              </Stack>

              <Box sx={{ maxHeight: 500, overflowY: "auto", px: 1 }}>
                {loading ? (
                  <Stack alignItems="center" py={10}><CircularProgress thickness={5} /></Stack>
                ) : leaveRequests.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: "center", borderRadius: 6, border: "1px dashed #ccc", bgcolor: "transparent" }}>
                    <EventNote sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                    <Typography color="text.secondary">No records found.</Typography>
                  </Paper>
                ) : (
                  leaveRequests.map((req, idx) => {
                    const config = getStatusConfig(req.status);
                    const type = leaveTypes.find(l => l.value === req.leaveType);
                    return (
                      <Card key={idx} sx={{ 
                        mb: 2, borderRadius: 4, transition: "0.2s",
                        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" },
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(type?.color || "#64748b", 0.1), color: type?.color }}>
                                {type?.emoji || "📝"}
                              </Box>
                              <Box>
                                <Typography variant="body1" fontWeight={700}>{type?.label || req.leaveType}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <DateRange sx={{ fontSize: 12 }} /> {req.startDate} → {req.endDate}
                                </Typography>
                              </Box>
                            </Stack>
                            <Stack alignItems="flex-end">
                              <Chip 
                                label={config.label} 
                                size="small" 
                                icon={config.icon}
                                sx={{ 
                                  bgcolor: alpha(config.color, 0.1), 
                                  color: config.color, 
                                  fontWeight: 800,
                                  border: `1px solid ${alpha(config.color, 0.2)}`,
                                  "& .MuiChip-icon": { color: "inherit" }
                                }} 
                              />
                            </Stack>
                          </Stack>
                          {req.reason && (
                            <Typography variant="body2" sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", color: "text.secondary", fontSize: "0.85rem", borderLeft: `3px solid ${alpha(type?.color || "#000", 0.3)}` }}>
                              {req.reason}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </Box>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplyLeave;