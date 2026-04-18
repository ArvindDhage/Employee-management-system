import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Grid, Paper, Button,
  Chip, Avatar, Stack, Divider, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon, CheckCircle as CheckCircleIcon,
  Pending as PendingIcon, Cancel as CancelIcon,
  Check, Close, Refresh, Campaign, Business,
  TrendingUp, AssignmentTurnedIn,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, bg, subtitle }) => (
  <Card elevation={0} sx={{
    borderRadius: 3, border: '1px solid #e2e8f0',
    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.07)', transform: 'translateY(-2px)' },
    transition: '0.2s',
  }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>{title}</Typography>
          <Typography variant="h4" fontWeight={800} color={color}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats,         setStats]         = useState({});
  const [employees,     setEmployees]     = useState([]);
  const [leaves,        setLeaves]        = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // FIX: read username from localStorage consistently
  const username = localStorage.getItem('username') || 'Admin';

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, empRes, leaveRes, announceRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`,           { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/employees`,       { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/leaves/pending`,  { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/announcements`,   { headers: authHeaders() })
             .catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data || {});
      setEmployees(Array.isArray(empRes.data)      ? empRes.data      : []);
      setLeaves(Array.isArray(leaveRes.data)        ? leaveRes.data    : []);
      setAnnouncements(Array.isArray(announceRes.data) ? announceRes.data : []);
    } catch (err) {
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await axios.patch(
        `${API_URL}/api/admin/leaves/${id}/${action}`,
        {},
        { headers: authHeaders() }
      );
      await fetchAll();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.error || err.response?.data || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh" gap={2}>
        <CircularProgress size={40} />
        <Typography color="text.secondary" variant="body2">Loading dashboard…</Typography>
      </Box>
    );
  }

  const statsConfig = [
    { title: 'Total Employees', value: stats.totalEmployees  ?? 0, icon: PeopleIcon,       color: '#3b82f6', bg: '#eff6ff', subtitle: `${employees.filter(e => e.active !== false).length} active` },
    { title: 'Pending Leaves',  value: stats.pendingLeaves   ?? 0, icon: PendingIcon,       color: '#f59e0b', bg: '#fffbeb', subtitle: 'Awaiting action' },
    { title: 'Approved Leaves', value: stats.approvedLeaves  ?? 0, icon: CheckCircleIcon,   color: '#10b981', bg: '#ecfdf5', subtitle: 'This cycle' },
    { title: 'Rejected Leaves', value: stats.rejectedLeaves  ?? 0, icon: CancelIcon,        color: '#ef4444', bg: '#fef2f2', subtitle: 'This cycle' },
    { title: 'Departments',     value: stats.totalDepartments ?? 0, icon: Business,          color: '#8b5cf6', bg: '#f5f3ff', subtitle: 'Total teams' },
    { title: 'Total Leaves',    value: stats.totalLeaves     ?? 0, icon: AssignmentTurnedIn, color: '#06b6d4', bg: '#ecfeff', subtitle: 'All requests' },
  ];

  const pieData = [
    { name: 'Approved', value: stats.approvedLeaves ?? 0 },
    { name: 'Pending',  value: stats.pendingLeaves  ?? 0 },
    { name: 'Rejected', value: stats.rejectedLeaves ?? 0 },
  ];

  const publishedAnnouncements = announcements.filter(a => a.status === 'PUBLISHED');

  const priorityColor = p => ({ HIGH: 'error', MEDIUM: 'warning', LOW: 'success' }[p] || 'default');

  console.log(authHeaders());
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Welcome back, <strong>{username}</strong> · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton onClick={fetchAll} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <Refresh fontSize="small" />
          </IconButton>
          <Avatar sx={{ bgcolor: '#3b82f6', fontWeight: 700, width: 40, height: 40 }}>
            {username[0]?.toUpperCase()}
          </Avatar>
        </Stack>
      </Stack>

      {/* ── Stats (2 rows × 3) ── */}
      <Grid container spacing={2} mb={4}>
        {statsConfig.map(s => (
          <Grid item xs={12} sm={6} md={4} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mb={3}>

        {/* ── Employee Table ── */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight={700}>Active Workforce</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Showing top 8 of {employees.length} employees
                  </Typography>
                </Box>
                <Chip label={`${employees.filter(e => e.active !== false).length} Active`}
                  color="success" size="small" variant="outlined" />
              </Stack>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Employee', 'Department', 'Role', 'Salary', 'Status'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem',
                        textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.slice(0, 8).map(emp => (
                    <TableRow key={emp.id} hover sx={{ '&:last-child td': { border: 0 }, opacity: emp.active !== false ? 1 : 0.5 }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.72rem', fontWeight: 700 }}>
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{emp.firstName} {emp.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.empCode}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {/* FIX: backend Employee entity returns department object, not departmentName directly */}
                          {emp.department?.name || emp.departmentName || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={emp.user?.roles?.[0]?.name || emp.roleName || 'EMPLOYEE'}
                          size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#10b981">
                          {emp.salary ? `₹${Number(emp.salary).toLocaleString('en-IN')}` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={emp.active !== false ? 'Active' : 'Inactive'}
                          color={emp.active !== false ? 'success' : 'error'}
                          size="small" sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* ── Leave Pie Chart ── */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="h6" fontWeight={700}>Leave Overview</Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.totalLeaves ?? 0} total requests
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {pieData.every(d => d.value === 0) ? (
                <Box textAlign="center" py={6}>
                  <AssignmentTurnedIn sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">No leave data yet</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} requests`, n]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        {/* ── Pending Leave Approvals ── */}
        <Grid item xs={12} lg={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight={700}>Pending Leave Approvals</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {leaves.length} request{leaves.length !== 1 ? 's' : ''} awaiting action
                  </Typography>
                </Box>
                <Chip label={`${leaves.length} Pending`}
                  color={leaves.length > 0 ? 'warning' : 'default'} size="small" />
              </Stack>
            </Box>
            <Box sx={{ p: 2, maxHeight: 380, overflowY: 'auto' }}>
              {leaves.length === 0 ? (
                <Box textAlign="center" py={5}>
                  <CheckCircleIcon sx={{ fontSize: 44, color: '#10b981', mb: 1 }} />
                  <Typography color="text.secondary" fontWeight={600}>All caught up!</Typography>
                  <Typography variant="body2" color="text.secondary">No pending requests.</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {leaves.map(leave => {
                    const days = leave.startDate && leave.endDate
                      ? Math.max(1, Math.round((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1)
                      : null;
                    return (
                      <Box key={leave.id} sx={{
                        p: 2, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fafafa',
                        '&:hover': { bgcolor: '#f1f5f9' }, transition: '0.15s',
                      }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#3b82f6', fontSize: '0.75rem', mt: 0.2 }}>
                              {leave.employee?.firstName?.[0]}{leave.employee?.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {leave.employee?.firstName} {leave.employee?.lastName}
                              </Typography>
                              <Stack direction="row" spacing={1} mt={0.3} flexWrap="wrap">
                                <Chip label={leave.leaveType || 'Leave'} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                                {days && <Chip label={`${days} day${days > 1 ? 's' : ''}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />}
                              </Stack>
                              <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
                                {leave.startDate} → {leave.endDate}
                              </Typography>
                              {leave.reason && (
                                <Typography variant="caption" color="text.secondary" display="block"
                                  sx={{ mt: 0.2, fontStyle: 'italic', maxWidth: 280, overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  "{leave.reason}"
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={0.5}>
                            <Button size="small" variant="contained" color="success"
                              startIcon={actionLoading === leave.id + 'approve'
                                ? <CircularProgress size={12} color="inherit" /> : <Check />}
                              disabled={!!actionLoading}
                              onClick={() => handleLeaveAction(leave.id, 'approve')}
                              sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.72rem', minWidth: 80 }}>
                              Approve
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              startIcon={actionLoading === leave.id + 'reject'
                                ? <CircularProgress size={12} color="inherit" /> : <Close />}
                              disabled={!!actionLoading}
                              onClick={() => handleLeaveAction(leave.id, 'reject')}
                              sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.72rem', minWidth: 72 }}>
                              Reject
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Card>
        </Grid>

        {/* ── Recent Announcements ── */}
        <Grid item xs={12} lg={5}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>Announcements</Typography>
                <Chip label={`${publishedAnnouncements.length} Published`}
                  color="success" size="small" variant="outlined" />
              </Stack>
            </Box>
            <Box sx={{ p: 2, maxHeight: 380, overflowY: 'auto' }}>
              {publishedAnnouncements.length === 0 ? (
                <Box textAlign="center" py={5}>
                  <Campaign sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography color="text.secondary" fontWeight={600}>No announcements</Typography>
                  <Typography variant="body2" color="text.secondary">Create one from Announcements tab</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {publishedAnnouncements.slice(0, 5).map(ann => (
                    <Box key={ann.id} sx={{
                      p: 2, borderRadius: 2,
                      border: `1px solid ${ann.priority === 'HIGH' ? '#fecaca' : '#e2e8f0'}`,
                      bgcolor: ann.priority === 'HIGH' ? '#fef2f2' : '#fafafa',
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                        <Typography variant="body2" fontWeight={700} sx={{ flex: 1, mr: 1 }}>{ann.title}</Typography>
                        <Chip label={ann.priority || 'MEDIUM'} size="small"
                          color={priorityColor(ann.priority)}
                          sx={{ fontSize: '0.62rem', height: 18, fontWeight: 700, flexShrink: 0 }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        {ann.content?.slice(0, 90)}{ann.content?.length > 90 ? '…' : ''}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        <Chip label={ann.audience || 'ALL'} size="small" variant="outlined" sx={{ fontSize: '0.62rem', height: 16 }} />
                        <Chip label={ann.type || 'GENERAL'} size="small" sx={{ fontSize: '0.62rem', height: 16, bgcolor: '#f1f5f9' }} />
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

export default AdminDashboard;