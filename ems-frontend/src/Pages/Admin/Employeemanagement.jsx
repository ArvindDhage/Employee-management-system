import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar, Alert, Snackbar,
  Tooltip, Stack, CircularProgress, LinearProgress, Divider, Paper,
  Stepper, Step, StepLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  AttachMoney,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as PromoteIcon,
  Refresh,
  ArrowUpward,
  WorkspacePremium,
  Email as EmailIcon,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const authHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
  if (!token || token === 'null' || token === 'undefined') return {};
  return { Authorization: `Bearer ${token.trim()}` };
};

const ROLES = ['EMPLOYEE', 'HR', 'MANAGER', 'ADMIN'];
const ROLE_COLOR = {
  ADMIN:    { color: '#ef4444', bg: '#fef2f2' },
  MANAGER:  { color: '#f59e0b', bg: '#fffbeb' },
  HR:       { color: '#3b82f6', bg: '#eff6ff' },
  EMPLOYEE: { color: '#10b981', bg: '#ecfdf5' },
};
const getRoleStyle = (name) => ROLE_COLOR[(name || '').toUpperCase()] || { color: '#64748b', bg: '#f8fafc' };

// ── Robust field resolvers ────────────────────────────────────────────────────
// Backend may return fields at different nesting levels depending on serialization
const getEmpRole = (emp) => {
  if (!emp) return 'EMPLOYEE';
  return (
    emp.roleName ||
    emp.role?.name ||
    emp.user?.role?.name ||
    emp.user?.roles?.[0]?.name ||
    (Array.isArray(emp.roles) ? emp.roles[0]?.name : undefined) ||
    'EMPLOYEE'
  );
};

const getEmpCode = (emp) =>
  emp?.empCode || emp?.employeeCode || emp?.emp_code || '—';

const getDeptName = (emp) =>
  emp?.department?.name ||
  emp?.departmentName ||
  emp?.dept?.name ||
  emp?.deptName ||
  '—';

const getJobTitle = (emp) =>
  emp?.jobTitle ||
  emp?.job_title ||
  emp?.designation ||
  emp?.position ||
  '—';

const getSalary = (emp) =>
  emp?.salary ?? emp?.annualSalary ?? emp?.currentSalary ?? null;

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, color, bg, icon: Icon, subtitle }) => (
  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0',
    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)', transform: 'translateY(-2px)' }, transition: '0.2s' }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
          <Typography variant="h4" fontWeight={800} color={color}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon sx={{ color, fontSize: 22 }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────────────────────────────────────
const EmployeeManagement = () => {
  const [employees,    setEmployees]    = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [roles,        setRoles]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [deptFilter,   setDeptFilter]   = useState('all');
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Promote dialog ──────────────────────────────────────────────────────
  const [promoteOpen,  setPromoteOpen]  = useState(false);
  const [promoteEmp,   setPromoteEmp]   = useState(null);
  const [promoteStep,  setPromoteStep]  = useState(0);
  const [newRole,      setNewRole]      = useState('');
  const [newSalary,    setNewSalary]    = useState('');
  const [promoteLoad,  setPromoteLoad]  = useState(false);

  // ── Salary dialog ───────────────────────────────────────────────────────
  const [salaryOpen,   setSalaryOpen]   = useState(false);
  const [salaryEmp,    setSalaryEmp]    = useState(null);
  const [salaryVal,    setSalaryVal]    = useState('');
  const [salaryLoad,   setSalaryLoad]   = useState(false);

  // ── Status toggle ───────────────────────────────────────────────────────
  const [actionLoad,   setActionLoad]   = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });
  const toast = (msg, sev = 'success') =>
    setSnack({ open: true, msg: typeof msg === 'string' ? msg : JSON.stringify(msg), sev });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, roleRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/employees`,   { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/departments`, { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/roles`,       { headers: authHeaders() }),
      ]);
      setEmployees(Array.isArray(empRes.data)   ? empRes.data   : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setRoles(Array.isArray(roleRes.data)       ? roleRes.data  : []);
    } catch (err) {
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openPromote = (emp) => {
    setPromoteEmp(emp);
    setNewRole(getEmpRole(emp));
    setNewSalary(getSalary(emp) || '');
    setPromoteStep(0);
    setPromoteOpen(true);
  };

  // ✅ POST /api/admin/employees/{id}/promote — { roleName, salary }
  const handlePromote = async () => {
    if (!newRole) { toast('Select a role.', 'warning'); return; }
    setPromoteLoad(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/employees/${promoteEmp.id}/promote`,
        { roleName: newRole.toUpperCase(), salary: newSalary ? Number(newSalary) : undefined },
        { headers: authHeaders() }
      );
      toast(`${promoteEmp.firstName} promoted to ${newRole}!`);
      setPromoteOpen(false);
      await fetchAll();
    } catch (err) {
      toast(err.response?.data?.error || err.response?.data || 'Promotion failed.', 'error');
    } finally {
      setPromoteLoad(false);
    }
  };

  // ✅ PATCH /api/admin/employees/{id}/salary — { salary }
  const handleSalaryUpdate = async () => {
    if (!salaryVal || isNaN(salaryVal) || Number(salaryVal) < 0) {
      toast('Enter a valid salary amount.', 'warning'); return;
    }
    setSalaryLoad(true);
    try {
      await axios.patch(
        `${API_URL}/api/admin/employees/${salaryEmp.id}/salary`,
        { salary: Number(salaryVal) },
        { headers: authHeaders() }
      );
      toast('Salary updated successfully!');
      setSalaryOpen(false);
      await fetchAll();
    } catch (err) {
      toast(err.response?.data?.error || err.response?.data || 'Salary update failed.', 'error');
    } finally {
      setSalaryLoad(false);
    }
  };

  // ✅ PATCH /api/admin/employees/{id}/deactivate or /activate
  const handleToggle = async (emp) => {
    const isActive = emp.active !== false;
    const action = isActive ? 'deactivate' : 'activate';
    setActionLoad(emp.id);
    try {
      await axios.patch(
        `${API_URL}/api/admin/employees/${emp.id}/${action}`,
        {},
        { headers: authHeaders() }
      );
      toast(`Employee ${action}d successfully!`);
      await fetchAll();
    } catch (err) {
      toast(err.response?.data?.error || err.response?.data || 'Action failed.', 'error');
    } finally {
      setActionLoad(null);
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = employees.filter(e => {
    const name = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
    const ms   = name.includes(searchTerm.toLowerCase())
              || getEmpCode(e).toLowerCase().includes(searchTerm.toLowerCase())
              || (e.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const dept = getDeptName(e);
    const role = getEmpRole(e);
    const md   = deptFilter === 'all' || dept === deptFilter;
    const mr   = roleFilter === 'all' || role.toUpperCase() === roleFilter;
    const mst  = statusFilter === 'all'
              || (statusFilter === 'active'   && e.active !== false)
              || (statusFilter === 'inactive' && e.active === false);
    return ms && md && mr && mst;
  });

  const active    = employees.filter(e => e.active !== false).length;
  const managers  = employees.filter(e => getEmpRole(e).toUpperCase() === 'MANAGER').length;
  const avgSalary = employees.length
    ? Math.round(employees.reduce((s, e) => s + (getSalary(e) || 0), 0) / employees.length) : 0;

  const promoteSteps = ['Select New Role', 'Set New Salary', 'Confirm & Submit'];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Employee Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Promote employees, adjust salaries and manage access
          </Typography>
        </Box>
        <IconButton onClick={fetchAll} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
          <Refresh fontSize="small" />
        </IconButton>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Employees" value={employees.length} color="#3b82f6" bg="#eff6ff" icon={PeopleIcon} subtitle={`${active} active`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active" value={active} color="#10b981" bg="#ecfdf5" icon={CheckCircleIcon} subtitle={`${employees.length - active} inactive`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Managers" value={managers} color="#f59e0b" bg="#fffbeb" icon={WorkspacePremium} subtitle="With manager role" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg Salary" value={`₹${avgSalary.toLocaleString('en-IN')}`} color="#8b5cf6" bg="#f5f3ff" icon={AttachMoney} subtitle="Annual" />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <TextField placeholder="Search name, code or email…" size="small" sx={{ flex: 1, minWidth: 220 }}
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Department</InputLabel>
              <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} label="Department">
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(d => <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} label="Role">
                <MenuItem value="all">All Roles</MenuItem>
                {(roles.length > 0 ? roles.map(r => r.name) : ROLES).map(r => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Results count */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{filtered.length}</strong> of <strong>{employees.length}</strong> employees
        </Typography>
      </Stack>

      {/* Table */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Employee', 'Emp Code', 'Department', 'Job Title', 'Role', 'Salary', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary">No employees match your filters</Typography>
                  </TableCell>
                </TableRow>
              ) : filtered.map(emp => {
                const roleName  = getEmpRole(emp);
                const roleStyle = getRoleStyle(roleName);
                const isActive  = emp.active !== false;
                const deptName  = getDeptName(emp);
                const empCode   = getEmpCode(emp);
                const jobTitle  = getJobTitle(emp);
                const salary    = getSalary(emp);

                return (
                  <TableRow key={emp.id} hover
                    sx={{ '&:last-child td': { border: 0 }, opacity: isActive ? 1 : 0.55,
                      transition: 'background 0.15s' }}>

                    {/* Employee Name + Email */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: roleStyle.color,
                          fontSize: '0.8rem', fontWeight: 700, border: `2px solid ${roleStyle.bg}` }}>
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{emp.firstName} {emp.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <EmailIcon sx={{ fontSize: 10 }} />{emp.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Emp Code */}
                    <TableCell>
                      <Typography variant="body2" color={empCode !== '—' ? '#0f172a' : 'text.secondary'}
                        fontWeight={600} sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {empCode}
                      </Typography>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      {deptName !== '—'
                        ? <Chip label={deptName} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#f1f5f9' }} />
                        : <Typography variant="body2" color="text.secondary">—</Typography>}
                    </TableCell>

                    {/* Job Title */}
                    <TableCell>
                      <Typography variant="body2" color={jobTitle !== '—' ? 'text.primary' : 'text.secondary'}>
                        {jobTitle}
                      </Typography>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip label={roleName} size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem',
                          color: roleStyle.color, bgcolor: roleStyle.bg,
                          border: `1px solid ${roleStyle.color}40` }} />
                    </TableCell>

                    {/* Salary */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color={salary ? '#10b981' : 'text.secondary'}>
                        {salary ? `₹${Number(salary).toLocaleString('en-IN')}` : '—'}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip label={isActive ? 'Active' : 'Inactive'}
                        color={isActive ? 'success' : 'error'}
                        size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Promote / Change Role">
                          <IconButton size="small" color="warning" onClick={() => openPromote(emp)}
                            sx={{ bgcolor: '#fffbeb', '&:hover': { bgcolor: '#fef3c7' } }}>
                            <PromoteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Salary">
                          <IconButton size="small" color="primary"
                            onClick={() => { setSalaryEmp(emp); setSalaryVal(getSalary(emp) || ''); setSalaryOpen(true); }}
                            sx={{ bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}>
                            <AttachMoney fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isActive ? 'Deactivate Account' : 'Activate Account'}>
                          <IconButton size="small"
                            color={isActive ? 'error' : 'success'}
                            disabled={actionLoad === emp.id}
                            onClick={() => handleToggle(emp)}
                            sx={{ bgcolor: isActive ? '#fef2f2' : '#ecfdf5',
                              '&:hover': { bgcolor: isActive ? '#fee2e2' : '#d1fae5' } }}>
                            {actionLoad === emp.id
                              ? <CircularProgress size={16} />
                              : isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ─── PROMOTE DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={promoteOpen} onClose={() => !promoteLoad && setPromoteOpen(false)}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#fffbeb',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WorkspacePremium sx={{ color: '#f59e0b' }} />
            </Box>
            <Box>
              <Typography fontWeight={800}>Promote Employee</Typography>
              <Typography variant="caption" color="text.secondary">
                {promoteEmp?.firstName} {promoteEmp?.lastName} · {getEmpCode(promoteEmp)}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stepper activeStep={promoteStep} sx={{ mb: 3 }}>
            {promoteSteps.map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
          </Stepper>

          {/* Step 0 — Role */}
          {promoteStep === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Current role: <Chip label={getEmpRole(promoteEmp)} size="small"
                  sx={{ ml: 0.5, ...getRoleStyle(getEmpRole(promoteEmp)) }} />
              </Typography>
              <Grid container spacing={1.5}>
                {(roles.length > 0 ? roles.map(r => r.name) : ROLES).map(role => {
                  const rs = getRoleStyle(role);
                  const isCurrent = getEmpRole(promoteEmp).toUpperCase() === role.toUpperCase();
                  return (
                    <Grid item xs={6} key={role}>
                      <Paper onClick={() => setNewRole(role)} elevation={0} sx={{
                        p: 2, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                        border: newRole?.toUpperCase() === role.toUpperCase()
                          ? `2px solid ${rs.color}` : '2px solid #e2e8f0',
                        bgcolor: newRole?.toUpperCase() === role.toUpperCase() ? rs.bg : 'white',
                        transition: '0.15s', '&:hover': { borderColor: rs.color, bgcolor: rs.bg },
                      }}>
                        <Typography fontWeight={700} color={rs.color}>{role}</Typography>
                        {isCurrent && <Chip label="Current" size="small" sx={{ mt: 0.5, fontSize: '0.65rem', height: 18 }} />}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Step 1 — Salary */}
          {promoteStep === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Promoting <strong>{promoteEmp?.firstName}</strong> to <strong>{newRole}</strong>.
                Set the new salary below or leave blank to keep unchanged.
              </Alert>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 2.5 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Current Salary</Typography>
                  <Typography variant="body2" fontWeight={700} color="#10b981">
                    {getSalary(promoteEmp) ? `₹${Number(getSalary(promoteEmp)).toLocaleString('en-IN')}` : 'Not set'}
                  </Typography>
                </Stack>
                {newSalary && getSalary(promoteEmp) && Number(newSalary) !== Number(getSalary(promoteEmp)) && (
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">Difference</Typography>
                    <Typography variant="caption" fontWeight={700}
                      color={Number(newSalary) > Number(getSalary(promoteEmp)) ? '#10b981' : '#ef4444'}>
                      {Number(newSalary) > Number(getSalary(promoteEmp)) ? '+' : ''}
                      ₹{(Number(newSalary) - Number(getSalary(promoteEmp))).toLocaleString('en-IN')}
                    </Typography>
                  </Stack>
                )}
              </Paper>
              <TextField fullWidth label="New Annual Salary (₹)" type="number"
                value={newSalary} onChange={e => setNewSalary(e.target.value)}
                inputProps={{ min: 0 }} helperText="Leave blank to keep current salary unchanged" />
            </Box>
          )}

          {/* Step 2 — Confirm */}
          {promoteStep === 2 && (
            <Box>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '2px solid #f59e0b', bgcolor: '#fffbeb', mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Avatar sx={{ bgcolor: '#f59e0b', width: 48, height: 48 }}>
                    {promoteEmp?.firstName?.[0]}{promoteEmp?.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={800}>{promoteEmp?.firstName} {promoteEmp?.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{getEmpCode(promoteEmp)}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                {[
                  ['Current Role',    getEmpRole(promoteEmp)],
                  ['New Role',        newRole],
                  ['Current Salary',  getSalary(promoteEmp) ? `₹${Number(getSalary(promoteEmp)).toLocaleString('en-IN')}` : 'Not set'],
                  ['New Salary',      newSalary ? `₹${Number(newSalary).toLocaleString('en-IN')}` : 'Unchanged'],
                ].map(([label, value]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={700}>{value}</Typography>
                  </Stack>
                ))}
              </Paper>
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                The employee will need to <strong>log out and log back in</strong> for the role change to take effect.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setPromoteOpen(false)} disabled={promoteLoad}
            sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          {promoteStep > 0 && (
            <Button onClick={() => setPromoteStep(s => s - 1)} disabled={promoteLoad}
              sx={{ textTransform: 'none' }}>Back</Button>
          )}
          {promoteStep < 2 ? (
            <Button variant="contained" onClick={() => setPromoteStep(s => s + 1)}
              disabled={promoteStep === 0 && !newRole}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handlePromote} disabled={promoteLoad}
              startIcon={promoteLoad ? <CircularProgress size={18} color="inherit" /> : <ArrowUpward />}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}>
              {promoteLoad ? 'Promoting…' : 'Confirm Promotion'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ─── SALARY DIALOG ──────────────────────────────────────────────────── */}
      <Dialog open={salaryOpen} onClose={() => !salaryLoad && setSalaryOpen(false)}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AttachMoney sx={{ color: '#3b82f6' }} />
            </Box>
            <Box>
              <Typography fontWeight={800}>Update Salary</Typography>
              <Typography variant="caption" color="text.secondary">
                {salaryEmp?.firstName} {salaryEmp?.lastName}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Current Salary</Typography>
              <Typography variant="body2" fontWeight={700} color="#10b981">
                {getSalary(salaryEmp) ? `₹${Number(getSalary(salaryEmp)).toLocaleString('en-IN')}` : 'Not set'}
              </Typography>
            </Stack>
            {salaryVal && getSalary(salaryEmp) && Number(salaryVal) !== Number(getSalary(salaryEmp)) && (
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography variant="caption" color="text.secondary">Change</Typography>
                <Typography variant="caption" fontWeight={700}
                  color={Number(salaryVal) > Number(getSalary(salaryEmp)) ? '#10b981' : '#ef4444'}>
                  {Number(salaryVal) > Number(getSalary(salaryEmp)) ? '+' : ''}
                  ₹{(Number(salaryVal) - Number(getSalary(salaryEmp))).toLocaleString('en-IN')}
                </Typography>
              </Stack>
            )}
          </Paper>
          <TextField fullWidth label="New Annual Salary (₹)" type="number"
            value={salaryVal} onChange={e => setSalaryVal(e.target.value)}
            inputProps={{ min: 0 }} autoFocus />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSalaryOpen(false)} disabled={salaryLoad}
            sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSalaryUpdate} disabled={salaryLoad}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
            {salaryLoad ? <CircularProgress size={18} color="inherit" /> : 'Update Salary'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snack.sev} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeManagement;