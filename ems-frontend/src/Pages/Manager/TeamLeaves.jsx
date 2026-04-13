import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Button, Card, CardContent, Chip, Container, IconButton,
  InputAdornment, MenuItem, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
  Avatar, Tooltip, Stack, CircularProgress, Alert,
} from '@mui/material';
import {
  Search as SearchIcon, CheckCircle as ApproveIcon,
  Cancel as RejectIcon, Event as CalendarIcon,
  ArrowBack as ArrowBackIcon, PendingActions,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("jwtToken") || null;
const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const statusColor = (s) =>
  s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

const TeamLeave = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/manager/pending-leaves`, { headers: authHeaders() });
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
  setActionLoading(id + status);
  try {
    const endpoint =
      status === "APPROVED"
        ? `${API_URL}/api/manager/leave/${id}/approve`
        : `${API_URL}/api/manager/leave/${id}/reject`;

    await axios.patch(endpoint, {}, { headers: authHeaders() });

    await fetchLeaves();
  } catch (err) {
    alert("Action failed: " + (err.response?.data || err.message));
  } finally {
    setActionLoading(null);
  }
};

  const filtered = leaves.filter((l) => {
    const name = `${l.employee?.firstName || ""} ${l.employee?.lastName || ""}`.toLowerCase();
    const matchSearch = name.includes(searchTerm.toLowerCase()) ||
      (l.reason || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "All" || (l.status || "PENDING") === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    All: leaves.length,
    PENDING:  leaves.filter(l => !l.status || l.status === "PENDING").length,
    APPROVED: leaves.filter(l => l.status === "APPROVED").length,
    REJECTED: leaves.filter(l => l.status === "REJECTED").length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* Header */}
      <Box mb={4}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/manager/dashboard')}
          sx={{ mb: 1, textTransform: 'none', color: "text.secondary" }}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" fontWeight={800} color="#0f172a">Team Leaves</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Review and manage all leave requests from your team
        </Typography>
      </Box>

      {/* Summary Chips */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        {[
          { label: "All", color: "default" },
          { label: "PENDING",  color: "warning" },
          { label: "APPROVED", color: "success" },
          { label: "REJECTED", color: "error" },
        ].map(({ label, color }) => (
          <Chip key={label}
            label={`${label === "All" ? "All" : label.charAt(0) + label.slice(1).toLowerCase()} (${counts[label] ?? 0})`}
            color={statusFilter === label ? color : "default"}
            onClick={() => setStatusFilter(label)}
            sx={{ fontWeight: 600, cursor: "pointer" }}
          />
        ))}
      </Stack>

      {/* Search */}
      <Card elevation={0} sx={{ mb: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <TextField
            placeholder="Search by employee name or reason..."
            size="small" fullWidth sx={{ maxWidth: 420 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
            }}
          />
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {["Employee", "Leave Type", "Reason", "Dates", "Status", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem",
                    textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((leave) => (
                  <TableRow key={leave.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: "#3b82f6", fontSize: "0.75rem" }}>
                          {leave.employee?.firstName?.[0]}{leave.employee?.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {leave.employee?.departmentName || ""}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={leave.leaveType || leave.type || "Leave"} size="small"
                        sx={{ fontWeight: 600, fontSize: "0.72rem" }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{leave.reason || "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {leave.startDate} → {leave.endDate}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={leave.status || "PENDING"}
                        color={statusColor(leave.status || "PENDING")}
                        size="small" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                    </TableCell>
                    <TableCell>
                      {(!leave.status || leave.status === "PENDING") && (
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success"
                              disabled={!!actionLoading}
                              onClick={() => handleAction(leave.id, "APPROVED")}>
                              {actionLoading === leave.id + "APPROVED"
                                ? <CircularProgress size={16} /> : <ApproveIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error"
                              disabled={!!actionLoading}
                              onClick={() => handleAction(leave.id, "REJECTED")}>
                              {actionLoading === leave.id + "REJECTED"
                                ? <CircularProgress size={16} /> : <RejectIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default TeamLeave;