import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
  Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Alert, Snackbar, Tooltip, Stack, CircularProgress, LinearProgress,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Collapse, List, ListItem, ListItemAvatar, ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon, Security as SecurityIcon, Add as AddIcon,
  Edit as EditIcon, Delete as DeleteIcon, Refresh,
  AdminPanelSettings, SupervisorAccount, Person, Group, Shield,
  ExpandMore, ExpandLess,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const SYSTEM_ROLES = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE'];

const ROLE_CONFIG = {
  ADMIN:    { color: '#ef4444', bg: '#fef2f2', icon: AdminPanelSettings, desc: 'Full system access' },
  MANAGER:  { color: '#f59e0b', bg: '#fffbeb', icon: SupervisorAccount,  desc: 'Team management' },
  HR:       { color: '#3b82f6', bg: '#eff6ff', icon: Person,             desc: 'HR operations' },
  EMPLOYEE: { color: '#10b981', bg: '#ecfdf5', icon: Group,              desc: 'Basic access' },
};
const getRoleConfig = (name) =>
  ROLE_CONFIG[(name || '').toUpperCase()] || { color: '#8b5cf6', bg: '#f5f3ff', icon: Shield, desc: 'Custom role' };

// ── Robust field resolvers (mirror EmployeeManagement) ────────────────────────
const getEmpRole  = (emp) =>
  emp?.roleName || emp?.role?.name || emp?.user?.role?.name ||
  emp?.user?.roles?.[0]?.name || (Array.isArray(emp?.roles) ? emp.roles[0]?.name : undefined) || '';

const getEmpCode  = (emp) => emp?.empCode || emp?.employeeCode || emp?.emp_code || '—';
const getDeptName = (emp) => emp?.department?.name || emp?.departmentName || emp?.dept?.name || '—';
const getJobTitle = (emp) => emp?.jobTitle || emp?.job_title || emp?.designation || emp?.position || '—';

const EMPTY_FORM = { name: '', description: '' };

const RoleManagement = () => {
  const [roles,        setRoles]        = useState([]);
  const [employees,    setEmployees]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState(null);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const [expandedRole, setExpandedRole] = useState(null);  // which role's user list is open
  const [snack,        setSnack]        = useState({ open: false, msg: '', sev: 'success' });

  const toast = (msg, sev = 'success') => setSnack({ open: true, msg, sev });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [roleRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/roles`,     { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/employees`, { headers: authHeaders() }),
      ]);
      setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
    } catch (err) {
      setError('Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  // Returns employees assigned to a given role name
  const empsForRole = (roleName) =>
    employees.filter(e => getEmpRole(e).toUpperCase() === (roleName || '').toUpperCase());

  const handleCreate = () => { setSelected(null); setFormData(EMPTY_FORM); setDialogOpen(true); };
  const handleEdit   = (role) => {
    setSelected(role);
    setFormData({ name: role.name, description: role.description || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) { toast('Role name is required.', 'warning'); return; }
    setSaving(true);
    try {
      if (selected) {
        await axios.put(`${API_URL}/api/admin/roles/${selected.id}`, formData, { headers: authHeaders() });
        toast('Role updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/admin/roles`, formData, { headers: authHeaders() });
        toast('Role created successfully!');
      }
      setDialogOpen(false);
      await fetchAll();
    } catch (err) {
      toast('Save failed: ' + (err.response?.data?.error || err.response?.data || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    const isSystem = SYSTEM_ROLES.includes((role.name || '').toUpperCase());
    if (isSystem) { toast('System roles cannot be deleted.', 'warning'); return; }
    const emps = empsForRole(role.name);
    if (emps.length > 0) {
      toast(`Cannot delete — ${emps.length} employee${emps.length > 1 ? 's have' : ' has'} this role.`, 'warning');
      return;
    }
    if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_URL}/api/admin/roles/${role.id}`, { headers: authHeaders() });
      toast('Role deleted!');
      await fetchAll();
    } catch (err) {
      toast('Delete failed: ' + (err.response?.data?.error || err.response?.data || err.message), 'error');
    }
  };

  const toggleExpand = (roleId) =>
    setExpandedRole(prev => prev === roleId ? null : roleId);

  const filtered   = roles.filter(r =>
    (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const unassigned = employees.filter(e => !getEmpRole(e)).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Role Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage system roles · click a row to see assigned users
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchAll} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <Refresh fontSize="small" />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 2.5 }}>
            Add Role
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        {[
          { label: 'Total Roles',     value: roles.length,     color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Total Employees', value: employees.length, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Unassigned',      value: unassigned,       color: '#f59e0b', bg: '#fffbeb' },
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
          <TextField placeholder="Search roles…" size="small" sx={{ width: { xs: '100%', sm: 340 } }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }} />
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Role Cards */}
      <Grid container spacing={2} mb={4}>
        {filtered.map(role => {
          const emps     = empsForRole(role.name);
          const count    = emps.length;
          const cfg      = getRoleConfig(role.name);
          const isSystem = SYSTEM_ROLES.includes((role.name || '').toUpperCase());
          const isOpen   = expandedRole === role.id;
          const RoleIcon = cfg.icon;

          return (
            <Grid item xs={12} sm={6} md={3} key={role.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `2px solid ${isOpen ? cfg.color + '60' : '#e2e8f0'}`,
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }, transition: '0.2s' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: cfg.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RoleIcon sx={{ color: cfg.color, fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography fontWeight={800} color={cfg.color}>{role.name}</Typography>
                        {isSystem && (
                          <Chip label="System" size="small"
                            sx={{ fontSize: '0.62rem', height: 18, mt: 0.3, bgcolor: '#f1f5f9', color: '#64748b' }} />
                        )}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.3}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(role)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!isSystem && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(role)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" mb={1.5} minHeight={36}>
                    {role.description || cfg.desc}
                  </Typography>

                  <Divider sx={{ mb: 1.5 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack alignItems="center">
                      <Typography variant="h5" fontWeight={800} color={cfg.color}>{count}</Typography>
                      <Typography variant="caption" color="text.secondary">Users</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Chip label={count > 0 ? 'In Use' : 'Unused'}
                        color={count > 0 ? 'success' : 'default'} size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                      {count > 0 && (
                        <Tooltip title={isOpen ? 'Hide users' : 'Show users'}>
                          <IconButton size="small" onClick={() => toggleExpand(role.id)}>
                            {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  {/* ── Expandable user list ── */}
                  <Collapse in={isOpen} unmountOnExit>
                    <Divider sx={{ mt: 1.5, mb: 1 }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', px: 0.5 }}>
                      Assigned Users
                    </Typography>
                    <List dense disablePadding sx={{ mt: 0.5, maxHeight: 200, overflowY: 'auto' }}>
                      {emps.map(emp => (
                        <ListItem key={emp.id} disableGutters sx={{ py: 0.5 }}>
                          <ListItemAvatar sx={{ minWidth: 36 }}>
                            <Avatar sx={{ width: 26, height: 26, bgcolor: cfg.color, fontSize: '0.62rem', fontWeight: 700 }}>
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                                {emp.firstName} {emp.lastName}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {getEmpCode(emp)}{getDeptName(emp) !== '—' ? ` · ${getDeptName(emp)}` : ''}
                              </Typography>
                            }
                          />
                          <Chip
                            label={emp.active !== false ? 'Active' : 'Inactive'}
                            size="small"
                            color={emp.active !== false ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 18 }}
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
              <SecurityIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
              <Typography color="text.secondary" fontWeight={600}>No roles found</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* ── Table view — breakdown with expandable user rows ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
          <Typography variant="h6" fontWeight={700}>Role Breakdown</Typography>
          <Typography variant="caption" color="text.secondary">Employee count per role · click a row to toggle users</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Role', 'Description', 'Users', 'Type', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(role => {
                const emps     = empsForRole(role.name);
                const count    = emps.length;
                const cfg      = getRoleConfig(role.name);
                const isSystem = SYSTEM_ROLES.includes((role.name || '').toUpperCase());
                const isOpen   = expandedRole === role.id;

                return (
                  <React.Fragment key={role.id}>
                    {/* ── Role row ── */}
                    <TableRow hover sx={{ cursor: count > 0 ? 'pointer' : 'default', '&:last-child td': { border: 0 } }}
                      onClick={() => count > 0 && toggleExpand(role.id)}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{ width: 10, height: 32, borderRadius: 1, bgcolor: cfg.color }} />
                          <Typography variant="body2" fontWeight={700} color={cfg.color}>{role.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{role.description || cfg.desc}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip label={`${count} user${count !== 1 ? 's' : ''}`} size="small"
                            color={count > 0 ? 'primary' : 'default'} variant="outlined"
                            sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                          {count > 0 && (isOpen
                            ? <ExpandLess fontSize="small" sx={{ color: '#64748b' }} />
                            : <ExpandMore fontSize="small" sx={{ color: '#64748b' }} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={isSystem ? 'System' : 'Custom'} size="small"
                          sx={{ fontSize: '0.7rem', fontWeight: 600,
                            bgcolor: isSystem ? '#f1f5f9' : '#f5f3ff',
                            color:   isSystem ? '#64748b' : '#8b5cf6' }} />
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(role)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {!isSystem && (
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => handleDelete(role)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {/* ── Expandable user sub-rows ── */}
                    {isOpen && emps.map(emp => (
                      <TableRow key={`emp-${emp.id}`} sx={{ bgcolor: '#fafafa' }}>
                        <TableCell sx={{ pl: 6 }} colSpan={1}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: cfg.color, fontSize: '0.65rem', fontWeight: 700 }}>
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
                            {getDeptName(emp) !== '—' ? getDeptName(emp) : getJobTitle(emp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={emp.active !== false ? 'Active' : 'Inactive'}
                            size="small"
                            color={emp.active !== false ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ fontSize: '0.68rem', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell /><TableCell />
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
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700} sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f5f3ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SecurityIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
            </Box>
            {selected ? 'Edit Role' : 'Create Role'}
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2.5}>
            <TextField fullWidth label="Role Name *" placeholder="e.g. MANAGER, HR, EMPLOYEE"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/[^A-Z_]/g, '') })}
              helperText="Uppercase letters only — e.g. MANAGER, HR" autoFocus />
            <TextField fullWidth label="Description" multiline rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this role can access…" />
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

export default RoleManagement;