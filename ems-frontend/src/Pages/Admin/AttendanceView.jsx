import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Alert, Stack, LinearProgress,
  Avatar, Divider, Paper, Tabs, Tab,
} from '@mui/material';
import {
  Search as SearchIcon, CheckCircle, AccessTime, Pending,
  Refresh, Visibility, EventNote,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const fmtTime = dt => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDuration = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const mins = Math.round((new Date(checkOut) - new Date(checkIn)) / 60000);
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}h ${m}m`;
};

// Robust dept resolver — handles all nesting patterns the backend may return
const getDept = (rec) =>
  rec?.employee?.department?.name ||
  rec?.employee?.departmentName  ||
  rec?.employee?.dept?.name      ||
  rec?.departmentName            ||
  rec?.department?.name          ||
  '';

const AttendanceView = () => {
  const [attendance,   setAttendance]   = useState([]);
  const [departments,  setDepartments]  = useState([]);   // ← fetched directly from backend
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [tab,          setTab]          = useState(0);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [deptFilter,   setDeptFilter]   = useState('all');
  const [detailOpen,   setDetailOpen]   = useState(false);
  const [selected,     setSelected]     = useState(null);

  useEffect(() => { fetchAll(); }, []);

  // Fetch attendance AND departments concurrently so the department dropdown
  // is always populated even when attendance records have missing/null dept data.
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [attRes, deptRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/attendance`,   { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/departments`,  { headers: authHeaders() }),
      ]);
      setAttendance(Array.isArray(attRes.data)  ? attRes.data  : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
    } catch (err) {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  // Today's stats
  const todayStr   = new Date().toISOString().split('T')[0];
  const todayRecs  = attendance.filter(a => a.attendanceDate === todayStr);
  const complete   = todayRecs.filter(a => a.checkOut).length;
  const inProgress = todayRecs.filter(a => a.checkIn && !a.checkOut).length;
  const totalToday = todayRecs.length;

  const filtered = attendance.filter(a => {
    const name        = `${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`.toLowerCase();
    const matchSearch = !searchTerm
      || name.includes(searchTerm.toLowerCase())
      || (a.employee?.empCode || a.employee?.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept   = deptFilter === 'all' || getDept(a) === deptFilter;
    return matchSearch && matchDept;
  });

  // Last 7 days chart data
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayRecs = attendance.filter(a => a.attendanceDate === dateStr);
    return {
      date:          d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      Complete:      dayRecs.filter(a => a.checkOut).length,
      'In Progress': dayRecs.filter(a => a.checkIn && !a.checkOut).length,
    };
  });

  const statsConfig = [
    { title: 'Today Complete',  value: complete,          icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' },
    { title: 'In Progress',     value: inProgress,        icon: AccessTime,  color: '#3b82f6', bg: '#eff6ff' },
    { title: "Today's Total",   value: totalToday,        icon: Pending,     color: '#f59e0b', bg: '#fffbeb' },
    { title: 'All Records',     value: attendance.length, icon: EventNote,   color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Attendance View</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Monitor all employee attendance records · Today:&nbsp;
            <strong>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</strong>
          </Typography>
        </Box>
        <IconButton onClick={fetchAll} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
          <Refresh fontSize="small" />
        </IconButton>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        {statsConfig.map(s => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)', transform: 'translateY(-2px)' }, transition: '0.2s' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.title}</Typography>
                    <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
                  </Box>
                  <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: s.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon sx={{ color: s.color }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs + Filters */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #f1f5f9', px: 2 }}>
          <Tab label="All Records"  sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="7-Day Trend"  sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by name or employee code…"
              size="small" sx={{ flex: 1 }}
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }}
            />

            {/* ── Department filter — populated from backend, not from attendance data ── */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Department</InputLabel>
              <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} label="Department">
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(d => (
                  <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Tab 0: Table */}
      {tab === 0 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{Math.min(filtered.length, 100)}</strong> of <strong>{filtered.length}</strong> records
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  {['Employee', 'Department', 'Date', 'Check In', 'Check Out', 'Duration', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem',
                      textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <EventNote sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                      <Typography color="text.secondary">No attendance records found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filtered.slice(0, 100).map((rec, i) => {
                  const isComplete   = !!rec.checkOut;
                  const isInProgress = rec.checkIn && !rec.checkOut;
                  const duration     = fmtDuration(rec.checkIn, rec.checkOut);
                  const dept         = getDept(rec);

                  return (
                    <TableRow key={rec.id || i} hover sx={{ '&:last-child td': { border: 0 } }}>

                      {/* Employee */}
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.72rem', fontWeight: 700 }}>
                            {rec.employee?.firstName?.[0]}{rec.employee?.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {rec.employee?.firstName} {rec.employee?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rec.employee?.empCode || rec.employee?.employeeCode || ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Department — resolved from employee object or record directly */}
                      <TableCell>
                        {dept
                          ? <Chip label={dept} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#f1f5f9' }} />
                          : <Typography variant="body2" color="text.secondary">—</Typography>}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{rec.attendanceDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={rec.checkIn ? '#10b981' : 'text.secondary'} fontWeight={rec.checkIn ? 600 : 400}>
                          {fmtTime(rec.checkIn)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={rec.checkOut ? '#3b82f6' : 'text.secondary'}>
                          {fmtTime(rec.checkOut)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {duration
                          ? <Chip label={duration} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                          : <Typography variant="body2" color="text.secondary">—</Typography>}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isComplete ? 'Complete' : isInProgress ? 'In Progress' : 'No Data'}
                          color={isComplete ? 'success' : isInProgress ? 'info' : 'default'}
                          size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => { setSelected(rec); setDetailOpen(true); }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Tab 1: Chart */}
      {tab === 1 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={0.5}>Last 7 Days Attendance</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Complete = checked in and out · In Progress = checked in, not yet out
            </Typography>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={last7} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <RTooltip contentStyle={{ borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="Complete"     fill="#10b981" radius={[4,4,0,0]} maxBarSize={50} />
                <Bar dataKey="In Progress"  fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700} sx={{ pb: 1 }}>Attendance Details</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selected && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ width: 52, height: 52, bgcolor: '#3b82f6', fontWeight: 700 }}>
                  {selected.employee?.firstName?.[0]}{selected.employee?.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight={800}>{selected.employee?.firstName} {selected.employee?.lastName}</Typography>
                  {getDept(selected) && (
                    <Chip label={getDept(selected)} size="small" sx={{ mt: 0.3, fontSize: '0.7rem', bgcolor: '#f1f5f9' }} />
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
                    {selected.employee?.empCode || selected.employee?.employeeCode || ''}
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Grid container spacing={2}>
                {[
                  ['Date',       selected.attendanceDate],
                  ['Check In',   fmtTime(selected.checkIn)],
                  ['Check Out',  selected.checkOut ? fmtTime(selected.checkOut) : 'Not yet checked out'],
                  ['Duration',   fmtDuration(selected.checkIn, selected.checkOut) || '—'],
                  ['Department', getDept(selected) || '—'],
                  ['Status',     selected.checkOut ? 'Complete' : selected.checkIn ? 'In Progress' : 'No data'],
                ].map(([label, value]) => (
                  <Grid item xs={6} key={label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                      {label.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} mt={0.2}>{value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceView;