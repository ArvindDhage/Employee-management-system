import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Alert, Snackbar, Tooltip, Stack, CircularProgress, LinearProgress,
  Divider, Collapse, List, ListItem, ListItemAvatar, ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon, Business as BusinessIcon,
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Refresh, People, ExpandMore, ExpandLess, Person,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const DEPT_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#14b8a6'];
const EMPTY_FORM  = { name: '', description: '' };

// ── Robust field resolvers (mirror what EmployeeManagement uses) ──────────────
const getEmpRole = (emp) =>
  emp?.roleName || emp?.role?.name || emp?.user?.role?.name ||
  emp?.user?.roles?.[0]?.name || (Array.isArray(emp?.roles) ? emp.roles[0]?.name : undefined) || 'EMPLOYEE';

const getDeptId   = (emp) => emp?.department?.id   || emp?.departmentId   || null;
const getDeptName = (emp) => emp?.department?.name || emp?.departmentName || emp?.dept?.name || '';
const getEmpCode  = (emp) => emp?.empCode || emp?.employeeCode || emp?.emp_code || '—';
const getJobTitle = (emp) => emp?.jobTitle || emp?.job_title || emp?.designation || emp?.position || '—';

const DepartmentManagement = () => {
  const [departments,  setDepartments]  = useState([]);
  const [employees,    setEmployees]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState(null);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const [expandedDept, setExpandedDept] = useState(null);   // which dept's user list is open
  const [snack,        setSnack]        = useState({ open: false, msg: '', sev: 'success' });

  const toast = (msg, sev = 'success') => setSnack({ open: true, msg, sev });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/departments`, { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/employees`,   { headers: authHeaders() }),
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setEmployees(Array.isArray(empRes.data)   ? empRes.data   : []);
    } catch (err) {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  // Returns employees belonging to a given department (by id or name)
  const empsForDept = (dept) =>
    employees.filter(e =>
      (getDeptId(e)   && getDeptId(e)   === dept.id)   ||
      (getDeptName(e) && getDeptName(e) === dept.name)
    );

  const handleCreate = () => { setSelected(null); setFormData(EMPTY_FORM); setDialogOpen(true); };
  const handleEdit   = (dept) => {
    setSelected(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) { toast('Department name is required.', 'warning'); return; }
    setSaving(true);
    try {
      if (selected) {
        await axios.put(`${API_URL}/api/admin/departments/${selected.id}`, formData, { headers: authHeaders() });
        toast('Department updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/admin/departments`, formData, { headers: authHeaders() });
        toast('Department created successfully!');
      }
      setDialogOpen(false);
      await fetchAll();
    } catch (err) {
      toast('Save failed: ' + (err.response?.data?.error || err.response?.data || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    const emps = empsForDept(dept);
    if (emps.length > 0) {
      toast(`Cannot delete — ${emps.length} employee${emps.length > 1 ? 's are' : ' is'} still in this department.`, 'warning');
      return;
    }
    if (!window.confirm(`Delete department "${dept.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_URL}/api/admin/departments/${dept.id}`, { headers: authHeaders() });
      toast('Department deleted!');
      await fetchAll();
    } catch (err) {
      toast('Delete failed: ' + (err.response?.data?.error || err.response?.data || err.message), 'error');
    }
  };

  const toggleExpand = (deptId) =>
    setExpandedDept(prev => prev === deptId ? null : deptId);

  const filtered = departments.filter(d =>
    (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployees = employees.length;
  const avgTeamSize    = departments.length ? Math.round(totalEmployees / departments.length) : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Department Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create and manage company departments · click a row to see its members
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchAll} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <Refresh fontSize="small" />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 2.5 }}>
            Add Department
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        {[
          { label: 'Total Departments', value: departments.length, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Total Employees',   value: totalEmployees,     color: '#10b981', bg: '#ecfdf5' },
          { label: 'Avg Team Size',     value: avgTeamSize,        color: '#8b5cf6', bg: '#f5f3ff' },
        ].map(s => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }, transition: '0.2s' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ py: 2 }}>
          <TextField placeholder="Search departments…" size="small" sx={{ width: { xs: '100%', sm: 340 } }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }} />
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Department Cards */}
      <Grid container spacing={2} mb={4}>
        {filtered.map((dept, i) => {
          const color    = DEPT_COLORS[i % DEPT_COLORS.length];
          const emps     = empsForDept(dept);
          const count    = emps.length;
          const isOpen   = expandedDept === dept.id;

          return (
            <Grid item xs={12} sm={6} md={4} key={dept.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid #e2e8f0`,
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }, transition: '0.2s' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: color + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BusinessIcon sx={{ color, fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>{dept.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{
                          display: 'block', maxWidth: 160, overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {dept.description || 'No description'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.3}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(dept)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(dept)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Divider sx={{ mb: 1.5 }} />
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <People fontSize="small" sx={{ color: '#64748b' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{count}</strong>
                        &nbsp;employee{count !== 1 ? 's' : ''}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Chip label={count > 0 ? 'Active' : 'Empty'} size="small"
                        color={count > 0 ? 'success' : 'default'} variant="outlined"
                        sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                      {count > 0 && (
                        <Tooltip title={isOpen ? 'Hide members' : 'Show members'}>
                          <IconButton size="small" onClick={() => toggleExpand(dept.id)}>
                            {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  {/* ── Expandable member list ── */}
                  <Collapse in={isOpen} unmountOnExit>
                    <Divider sx={{ mt: 1.5, mb: 1 }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', px: 0.5 }}>
                      Members
                    </Typography>
                    <List dense disablePadding sx={{ mt: 0.5, maxHeight: 220, overflowY: 'auto' }}>
                      {emps.map(emp => (
                        <ListItem key={emp.id} disableGutters sx={{ py: 0.5 }}>
                          <ListItemAvatar sx={{ minWidth: 36 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: color, fontSize: '0.65rem', fontWeight: 700 }}>
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                                {emp.firstName} {emp.lastName}
                                <Chip label={getEmpRole(emp)} size="small"
                                  sx={{ ml: 0.8, fontSize: '0.6rem', height: 16, fontWeight: 700,
                                    bgcolor: '#f1f5f9', color: '#475569' }} />
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {getEmpCode(emp)} {getJobTitle(emp) !== '—' ? `· ${getJobTitle(emp)}` : ''}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {filtered.length === 0 && !loading && (
          <Grid item xs={12}>
            <Box textAlign="center" py={8}>
              <BusinessIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
              <Typography color="text.secondary" fontWeight={600}>No departments found</Typography>
              <Typography variant="body2" color="text.secondary">Create one using the button above</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* ── Table view with expandable member rows ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
          <Typography variant="h6" fontWeight={700}>All Departments</Typography>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} department{filtered.length !== 1 ? 's' : ''} · click a row to toggle members
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Department', 'Description', 'Members', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((dept, i) => {
                const color  = DEPT_COLORS[i % DEPT_COLORS.length];
                const emps   = empsForDept(dept);
                const count  = emps.length;
                const isOpen = expandedDept === dept.id;

                return (
                  <React.Fragment key={dept.id}>
                    {/* ── Department row ── */}
                    <TableRow hover sx={{ cursor: count > 0 ? 'pointer' : 'default', '&:last-child td': { border: 0 } }}
                      onClick={() => count > 0 && toggleExpand(dept.id)}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{ width: 8, height: 32, borderRadius: 1, bgcolor: color }} />
                          <Typography variant="body2" fontWeight={700}>{dept.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
                          {dept.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip label={`${count} employee${count !== 1 ? 's' : ''}`} size="small"
                            color={count > 0 ? 'primary' : 'default'} variant="outlined"
                            sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                          {count > 0 && (isOpen
                            ? <ExpandLess fontSize="small" sx={{ color: '#64748b' }} />
                            : <ExpandMore fontSize="small" sx={{ color: '#64748b' }} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(dept)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(dept)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {/* ── Expandable member sub-rows ── */}
                    {isOpen && emps.map(emp => (
                      <TableRow key={`emp-${emp.id}`} sx={{ bgcolor: '#fafafa' }}>
                        <TableCell sx={{ pl: 6 }} colSpan={1}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: color, fontSize: '0.65rem', fontWeight: 700 }}>
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {emp.firstName} {emp.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getEmpCode(emp)}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getJobTitle(emp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.8}>
                            <Chip label={getEmpRole(emp)} size="small"
                              sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#f1f5f9', color: '#475569' }} />
                            <Chip
                              label={emp.active !== false ? 'Active' : 'Inactive'}
                              size="small"
                              color={emp.active !== false ? 'success' : 'error'}
                              variant="outlined"
                              sx={{ fontSize: '0.68rem', fontWeight: 600 }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700} sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BusinessIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
            </Box>
            {selected ? 'Edit Department' : 'Create Department'}
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField fullWidth label="Department Name *" autoFocus
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Engineering, Sales, HR…" />
            <TextField fullWidth label="Description" multiline rows={3}
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional — brief description of this department's function" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}
            sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 3 }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (selected ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
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

export default DepartmentManagement;