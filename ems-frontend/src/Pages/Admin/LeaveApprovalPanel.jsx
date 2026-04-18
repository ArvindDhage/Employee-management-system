import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar, Alert, Snackbar,
  Tooltip, Checkbox, Stack, CircularProgress, Divider, LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon, CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon, Visibility as VisibilityIcon,
  Assignment as AssignmentIcon, AccessTime, Close as CloseIcon,
  Refresh, EventBusy,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const LEAVE_TYPE_COLORS = {
  SICK:    { bg: '#fef2f2', color: '#dc2626' },
  CASUAL:  { bg: '#eff6ff', color: '#2563eb' },
  ANNUAL:  { bg: '#f0fdf4', color: '#16a34a' },
};

const statusChipColor = s => ({ APPROVED: 'success', REJECTED: 'error', PENDING: 'warning' }[s] || 'warning');

const calcDays = (start, end) => {
  if (!start || !end) return null;
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
};

const StatCard = ({ title, value, color, icon: Icon, trend }) => (
  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0',
    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)', transform: 'translateY(-2px)' }, transition: '0.2s' }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: color, width: 46, height: 46, boxShadow: `0 4px 12px ${color}40` }}>
          <Icon />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const LeaveApprovalPanel = () => {
  const [leaves,        setLeaves]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selected,      setSelected]      = useState([]);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [detailOpen,    setDetailOpen]    = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [snack,         setSnack]         = useState({ open: false, msg: '', sev: 'success' });

  const toast = (msg, sev = 'success') => setSnack({ open: true, msg, sev });

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      // ✅ AdminController: GET /api/admin/leaves — returns all leave requests
      const res = await axios.get(`${API_URL}/api/admin/leaves`, { headers: authHeaders() });
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ AdminController: PATCH /api/admin/leaves/{id}/approve or /reject
  // FIX: LeaveService correctly deducts/refunds balance — admin must use this endpoint not direct repo
  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await axios.patch(
        `${API_URL}/api/admin/leaves/${id}/${action}`,
        {},
        { headers: authHeaders() }
      );
      toast(`Leave ${action}d successfully!`);
      if (detailOpen) setDetailOpen(false);
      await fetchLeaves();
    } catch (err) {
      toast(err.response?.data?.error || err.response?.data || `Failed to ${action} leave.`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk action — only acts on PENDING leaves in the selection
  const handleBulkAction = async (action) => {
    const pending = selected.filter(id => leaves.find(l => l.id === id && l.status === 'PENDING'));
    if (pending.length === 0) { toast('No pending leaves selected.', 'warning'); return; }
    for (const id of pending) {
      await handleAction(id, action);
    }
    setSelected([]);
  };

  // FIX: filter also by leave type
  const filtered = leaves.filter(l => {
    const name        = `${l.employee?.firstName || ''} ${l.employee?.lastName || ''}`.toLowerCase();
    const matchSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || (l.status || 'PENDING') === statusFilter;
    const matchType   = typeFilter === 'all' || (l.leaveType || '').toUpperCase() === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const counts = {
    total:    leaves.length,
    pending:  leaves.filter(l => !l.status || l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  const allSelected = filtered.length > 0 && filtered.every(l => selected.includes(l.id));

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Leave Approval Panel</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Review and approve employee leave requests
          </Typography>
        </Box>
        <IconButton onClick={fetchLeaves} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
          <Refresh fontSize="small" />
        </IconButton>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Requests" value={counts.total}    color="#3b82f6" icon={AssignmentIcon} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending"        value={counts.pending}  color="#f59e0b" icon={AccessTime} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Approved"       value={counts.approved} color="#10b981" icon={CheckCircleIcon} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Rejected"       value={counts.rejected} color="#ef4444" icon={CancelIcon} />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField placeholder="Search employee name…" size="small" sx={{ flex: 1 }}
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Leave Type</InputLabel>
              <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} label="Leave Type">
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="SICK">Sick</MenuItem>
                <MenuItem value="CASUAL">Casual</MenuItem>
                <MenuItem value="ANNUAL">Annual</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <Card elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}>
          <CardContent sx={{ py: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <Typography variant="body2" fontWeight={700} color="#1d4ed8">
                {selected.length} selected
              </Typography>
              <Button size="small" variant="contained" color="success"
                onClick={() => handleBulkAction('approve')} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                Approve Selected
              </Button>
              <Button size="small" variant="contained" color="error"
                onClick={() => handleBulkAction('reject')} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                Reject Selected
              </Button>
              <Button size="small" onClick={() => setSelected([])}
                sx={{ textTransform: 'none', color: 'text.secondary' }}>
                Clear Selection
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={selected.length > 0 && !allSelected}
                    onChange={() => setSelected(allSelected ? [] : filtered.map(l => l.id))}
                  />
                </TableCell>
                {['Employee', 'Leave Type', 'Dates', 'Days', 'Balance Left', 'Reason', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <EventBusy sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary">No leave requests found</Typography>
                  </TableCell>
                </TableRow>
              ) : filtered.map(leave => {
                const days    = calcDays(leave.startDate, leave.endDate);
                const ltColor = LEAVE_TYPE_COLORS[(leave.leaveType || '').toUpperCase()] || { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <TableRow key={leave.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(leave.id)}
                        onChange={() => setSelected(prev =>
                          prev.includes(leave.id) ? prev.filter(i => i !== leave.id) : [...prev, leave.id]
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#3b82f6', fontSize: '0.72rem', fontWeight: 700 }}>
                          {leave.employee?.firstName?.[0]}{leave.employee?.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {/* FIX: resolve department from nested object */}
                            {leave.employee?.department?.name || leave.employee?.departmentName || '—'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={leave.leaveType || 'LEAVE'} size="small"
                        sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: ltColor.bg, color: ltColor.color, border: 'none' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{leave.startDate}</Typography>
                      <Typography variant="caption" color="text.secondary">→ {leave.endDate}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${days ?? '?'} day${days !== 1 ? 's' : ''}`} size="small"
                        variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      {/* FIX: show employee leave balance */}
                      <Typography variant="body2" fontWeight={700}
                        color={leave.employee?.leaveBalance > 0 ? '#10b981' : '#ef4444'}>
                        {leave.employee?.leaveBalance ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 160 }}>
                      <Typography variant="caption" color="text.secondary"
                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.reason || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={leave.status || 'PENDING'} color={statusChipColor(leave.status || 'PENDING')}
                        size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.3}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => { setSelectedLeave(leave); setDetailOpen(true); }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {(!leave.status || leave.status === 'PENDING') && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton size="small" color="success" disabled={!!actionLoading}
                                onClick={() => handleAction(leave.id, 'approve')}>
                                {actionLoading === leave.id + 'approve'
                                  ? <CircularProgress size={14} /> : <CheckCircleIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error" disabled={!!actionLoading}
                                onClick={() => handleAction(leave.id, 'reject')}>
                                {actionLoading === leave.id + 'reject'
                                  ? <CircularProgress size={14} /> : <CancelIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedLeave && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography fontWeight={700}>Leave Request Details</Typography>
              <IconButton size="small" onClick={() => setDetailOpen(false)}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2.5}>
                {/* Employee info */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 52, height: 52, bgcolor: '#3b82f6', fontSize: '1rem', fontWeight: 700 }}>
                    {selectedLeave.employee?.firstName?.[0]}{selectedLeave.employee?.lastName?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={800} fontSize="1rem">
                      {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedLeave.employee?.department?.name || selectedLeave.employee?.departmentName || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Leave Balance: <strong>{selectedLeave.employee?.leaveBalance ?? '—'} days</strong>
                    </Typography>
                  </Box>
                  <Chip label={selectedLeave.status || 'PENDING'}
                    color={statusChipColor(selectedLeave.status || 'PENDING')}
                    sx={{ fontWeight: 700 }} />
                </Stack>
                <Divider />
                <Grid container spacing={2}>
                  {[
                    ['Leave Type', selectedLeave.leaveType || '—'],
                    ['Duration',   `${calcDays(selectedLeave.startDate, selectedLeave.endDate) ?? '?'} day(s)`],
                    ['From',       selectedLeave.startDate],
                    ['To',         selectedLeave.endDate],
                  ].map(([label, value]) => (
                    <Grid item xs={6} key={label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                        {label.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} mt={0.3}>{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
                {selectedLeave.reason && (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                      REASON
                    </Typography>
                    <Typography variant="body2">{selectedLeave.reason}</Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button onClick={() => setDetailOpen(false)}
                sx={{ color: 'text.secondary', textTransform: 'none' }}>Close</Button>
              {(!selectedLeave.status || selectedLeave.status === 'PENDING') && (
                <>
                  <Button variant="outlined" color="error" onClick={() => handleAction(selectedLeave.id, 'reject')}
                    disabled={!!actionLoading} sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Reject
                  </Button>
                  <Button variant="contained" color="success" onClick={() => handleAction(selectedLeave.id, 'approve')}
                    disabled={!!actionLoading}
                    startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                    sx={{ textTransform: 'none', borderRadius: 2 }}>
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snack.sev} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
          {typeof snack.msg === 'string' ? snack.msg : 'An error occurred'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveApprovalPanel;