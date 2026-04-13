import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Card, CardContent, Chip, Grid, IconButton,
  InputAdornment, MenuItem, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography, Avatar,
  Tooltip, CircularProgress, Alert, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select,
  Divider, LinearProgress, Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon,
  CheckCircle as CheckCircleIcon, Pending as PendingIcon,
  HourglassBottom as InProgressIcon, Task as TaskIcon,
  Refresh as RefreshIcon, Edit as EditIcon, Delete as DeleteIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const priorityColor = (p) => ({ HIGH: 'error', MEDIUM: 'warning', LOW: 'info' })[(p || '').toUpperCase()] || 'default';
const priorityHex   = (p) => ({ HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#3b82f6' })[(p || '').toUpperCase()] || '#64748b';

const statusConfig = (s) => {
  const st = (s || '').toUpperCase();
  if (st === 'COMPLETED')       return { color: 'success', icon: <CheckCircleIcon fontSize="small" />, hex: '#10b981' };
  if (st.includes('PROGRESS'))  return { color: 'info',    icon: <InProgressIcon  fontSize="small" />, hex: '#3b82f6' };
  return                               { color: 'default', icon: <PendingIcon     fontSize="small" />, hex: '#64748b' };
};

const STATUSES   = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

const EMPTY_FORM = {
  title: '', description: '', priority: 'MEDIUM', status: 'PENDING',
  dueDate: '', assignedToId: '',
};

const Tasks = () => {
  const [tasks,          setTasks]          = useState([]);
  const [employees,      setEmployees]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask,   setSelectedTask]   = useState(null);
  const [formData,       setFormData]       = useState(EMPTY_FORM);
  const [deleteOpen,     setDeleteOpen]     = useState(false);
  const [deleteTask,     setDeleteTask]     = useState(null);
  const [snack,          setSnack]          = useState({ open: false, msg: '', sev: 'success' });

  const toast = (msg, sev = 'success') => setSnack({ open: true, msg, sev });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskRes, empRes] = await Promise.all([
        axios.get(`${API_URL}/api/tasks/manager`, { headers: authHeaders() }),
        axios.get(`${API_URL}/employees/get-all`, { headers: authHeaders() }),
      ]);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
    } catch (err) {
      if (err.response?.status === 404) {
        setTasks([]);
      } else {
        setError('Failed to load tasks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.title?.trim())   { toast('Task title is required.', 'error'); return; }
    if (!formData.assignedToId)    { toast('Please assign this task to an employee.', 'error'); return; }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        assignedToId: Number(formData.assignedToId),
      };

      if (selectedTask) {
        await axios.put(`${API_URL}/api/tasks/${selectedTask.id}`, payload, { headers: authHeaders() });
        toast('Task updated!');
      } else {
        await axios.post(`${API_URL}/api/tasks`, payload, { headers: authHeaders() });
        toast('Task created!');
      }
      setTaskDialogOpen(false);
      await fetchAll();
    } catch (err) {
      toast(err.response?.data?.error || err.response?.data?.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: authHeaders() }
      );
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast('Status updated!');
    } catch (err) {
      toast(err.response?.data?.error || 'Status update failed.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${deleteTask.id}`, { headers: authHeaders() });
      setDeleteOpen(false);
      toast('Task deleted!');
      // FIX: remove from local state directly — avoids a full re-fetch
      setTasks(prev => prev.filter(t => t.id !== deleteTask.id));
    } catch (err) {
      toast(err.response?.data?.error || 'Delete failed.', 'error');
    }
  };

  const openCreate = () => {
    setSelectedTask(null);
    setFormData(EMPTY_FORM);
    setTaskDialogOpen(true);
  };

  const openEdit = (task) => {
    setSelectedTask(task);
    setFormData({
      title:        task.title || '',
      description:  task.description || '',
      priority:     task.priority || 'MEDIUM',
      status:       task.status || 'PENDING',
      dueDate:      task.dueDate || '',
      assignedToId: task.assignedTo?.id ?? task.assignedToId ?? '',
    });
    setTaskDialogOpen(true);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    const ms  = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const mst = statusFilter   === 'All' || (t.status   || '').toUpperCase() === statusFilter.toUpperCase();
    const mp  = priorityFilter === 'All' || (t.priority || '').toUpperCase() === priorityFilter.toUpperCase();
    return ms && mst && mp;
  });

  const counts = {
    total:      tasks.length,
    pending:    tasks.filter(t => (t.status || '').toUpperCase() === 'PENDING').length,
    inProgress: tasks.filter(t => (t.status || '').toUpperCase() === 'IN_PROGRESS').length,
    completed:  tasks.filter(t => (t.status || '').toUpperCase() === 'COMPLETED').length,
  };

  const summaryCards = [
    { title: 'Total Tasks',  value: counts.total,      color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Pending',      value: counts.pending,    color: '#f59e0b', bg: '#fffbeb' },
    { title: 'In Progress',  value: counts.inProgress, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Completed',    value: counts.completed,  color: '#10b981', bg: '#ecfdf5' },
  ];

  // FIX: resolve department name from nested Employee object
  const getEmpDept = (emp) => emp.department?.name || emp.departmentName || '';

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Tasks</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create and manage tasks for your team
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchAll} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
            Create Task
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        {summaryCards.map(s => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)', transform: 'translateY(-2px)' }, transition: '0.2s' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: s.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TaskIcon sx={{ color: s.color }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color={s.color}>{s.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.title}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField placeholder="Search tasks…" size="small" sx={{ flex: 1 }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }} />
          <TextField select size="small" value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
            {['All', ...STATUSES].map(s => (
              <MenuItem key={s} value={s}>{s === 'All' ? 'All Status' : s.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)} sx={{ minWidth: 150 }}>
            {['All', ...PRIORITIES].map(p => (
              <MenuItem key={p} value={p}>{p === 'All' ? 'All Priority' : p}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Task', 'Assigned To', 'Priority', 'Due Date', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <TaskIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">
                      {tasks.length === 0 ? 'No tasks yet. Create your first task!' : 'No tasks match the filters.'}
                    </Typography>
                    {tasks.length === 0 && (
                      <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
                        sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}>
                        Create Task
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : filtered.map(task => {
                const assignee     = task.assignedTo || {};
                const assigneeName = `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || 'Unassigned';
                const initials     = assigneeName !== 'Unassigned'
                  ? assigneeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                const pHex = priorityHex(task.priority);
                const isDue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

                return (
                  <TableRow key={task.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        <Box sx={{ width: 3, height: 36, borderRadius: 4, bgcolor: pHex, flexShrink: 0, mt: 0.3 }} />
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{task.title}</Typography>
                          {task.description && (
                            <Typography variant="caption" color="text.secondary"
                              sx={{ display: '-webkit-box', WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {task.description}
                            </Typography>
                          )}
                          {task.assignedBy && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              by <em>{task.assignedBy}</em>
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#3b82f6', fontSize: '0.65rem', fontWeight: 700 }}>
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{assigneeName}</Typography>
                          {/* FIX: show department from enriched assignedTo object */}
                          {assignee.department && (
                            <Typography variant="caption" color="text.secondary">{assignee.department}</Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FlagIcon sx={{ fontSize: 14, color: pHex }} />
                        <Chip label={task.priority || 'LOW'} color={priorityColor(task.priority)}
                          size="small" sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color={isDue ? '#ef4444' : 'text.secondary'}
                        fontWeight={isDue ? 700 : 400}>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                        {isDue && <Typography component="span" variant="caption" display="block" color="#ef4444">Overdue</Typography>}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {/* Inline status changer — calls PATCH /api/tasks/{id}/status */}
                      <TextField select size="small" value={task.status || 'PENDING'}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.78rem' } }}>
                        {STATUSES.map(s => (
                          <MenuItem key={s} value={s} sx={{ fontSize: '0.78rem' }}>
                            {s.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => openEdit(task)}
                            sx={{ bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error"
                            onClick={() => { setDeleteTask(task); setDeleteOpen(true); }}
                            sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}>
                            <DeleteIcon fontSize="small" />
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
      </Paper>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={taskDialogOpen} onClose={() => !saving && setTaskDialogOpen(false)}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700} sx={{ pb: 1 }}>
          {selectedTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            <TextField fullWidth label="Task Title *" autoFocus
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })} />

            <TextField fullWidth label="Description" multiline rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formData.priority} label="Priority"
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    {PRIORITIES.map(p => (
                      <MenuItem key={p} value={p}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FlagIcon sx={{ fontSize: 14, color: priorityHex(p) }} />
                          <span>{p}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status"
                    onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }}
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />

            <FormControl fullWidth>
              <InputLabel>Assign To *</InputLabel>
              {/* FIX: value stored as string (Select behaviour) and converted to Number on submit */}
              <Select value={formData.assignedToId} label="Assign To *"
                onChange={e => setFormData({ ...formData, assignedToId: e.target.value })}>
                <MenuItem value=""><em>Select employee…</em></MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: '#3b82f6', fontSize: '0.65rem', fontWeight: 700 }}>
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{emp.firstName} {emp.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getEmpDept(emp)}
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setTaskDialogOpen(false)} disabled={saving}
            sx={{ color: 'text.secondary', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateOrUpdate} disabled={saving}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (selectedTask ? 'Update Task' : 'Create Task')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{deleteTask?.title}"</strong>?
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snack.sev} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Tasks;