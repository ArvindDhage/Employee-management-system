import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Grid, TextField, InputAdornment,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Tooltip,
  Stack, CircularProgress, Switch, FormControlLabel, Divider, LinearProgress,
  Tabs, Tab, Paper, Avatar,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, Visibility as VisibilityIcon,
  Publish as PublishIcon, Refresh,
  Announcement as AnnouncementIcon, Campaign,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const STATUS_COLORS = {
  PUBLISHED: { bg: '#dcfce7', color: '#16a34a' },
  DRAFT:     { bg: '#fef9c3', color: '#a16207' },
  SCHEDULED: { bg: '#dbeafe', color: '#1d4ed8' },
  ARCHIVED:  { bg: '#f1f5f9', color: '#64748b' },
};

const PRIORITY_COLORS = {
  HIGH:   { bg: '#fee2e2', color: '#dc2626' },
  MEDIUM: { bg: '#fef9c3', color: '#a16207' },
  LOW:    { bg: '#dcfce7', color: '#16a34a' },
};

const StatusChip = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return <Chip label={status || 'DRAFT'} size="small"
    sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: c.bg, color: c.color, border: 'none' }} />;
};

const PriorityChip = ({ priority }) => {
  const c = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
  return <Chip label={priority || 'MEDIUM'} size="small"
    sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: c.bg, color: c.color, border: 'none' }} />;
};

const EMPTY_FORM = { title: '', content: '', type: 'GENERAL', audience: 'ALL', priority: 'MEDIUM', expiresAt: '', publishImmediately: true };

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState(null);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [tab,           setTab]           = useState(0);
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [viewOpen,      setViewOpen]      = useState(false);
  const [selected,      setSelected]      = useState(null);
  const [formData,      setFormData]      = useState(EMPTY_FORM);
  const [snack,         setSnack]         = useState({ open: false, msg: '', sev: 'success' });

  const toast = (msg, sev = 'success') => setSnack({ open: true, msg, sev });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // ✅ AnnouncementController: GET /api/admin/announcements — returns all (draft + published)
      const res = await axios.get(`${API_URL}/api/admin/announcements`, { headers: authHeaders() });
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => { setSelected(null); setFormData(EMPTY_FORM); setDialogOpen(true); };

  const handleEdit = (ann) => {
    setSelected(ann);
    setFormData({
      title: ann.title || '', content: ann.content || '',
      type: ann.type || 'GENERAL', audience: ann.audience || 'ALL',
      priority: ann.priority || 'MEDIUM', expiresAt: ann.expiresAt || '',
      publishImmediately: false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      toast('Title and content are required.', 'warning'); return;
    }
    setSaving(true);
    try {
      if (selected) {
        // ✅ PUT /api/admin/announcements/{id}
        await axios.put(`${API_URL}/api/admin/announcements/${selected.id}`, formData, { headers: authHeaders() });
        toast('Announcement updated!');
      } else {
        // ✅ POST /api/admin/announcements — body includes publishImmediately flag
        await axios.post(`${API_URL}/api/admin/announcements`, formData, { headers: authHeaders() });
        toast(formData.publishImmediately ? 'Announcement published!' : 'Draft saved!');
      }
      setDialogOpen(false);
      await fetchAll();
    } catch (err) {
      toast('Save failed: ' + (err.response?.data?.error || err.response?.data || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      // ✅ PATCH /api/admin/announcements/{id}/publish
      await axios.patch(`${API_URL}/api/admin/announcements/${id}/publish`, {}, { headers: authHeaders() });
      toast('Announcement published!');
      await fetchAll();
    } catch (err) {
      toast('Publish failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement permanently?')) return;
    try {
      // ✅ DELETE /api/admin/announcements/{id}
      await axios.delete(`${API_URL}/api/admin/announcements/${id}`, { headers: authHeaders() });
      toast('Announcement deleted!');
      await fetchAll();
    } catch (err) {
      toast('Delete failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  // FIX: Tab filter logic was broken — array index mapping was off
  const TAB_STATUSES = [null, 'PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED'];
  const tabFiltered = announcements.filter(a => {
    const matchTab    = tab === 0 || a.status === TAB_STATUSES[tab];
    const matchSearch = !searchTerm || a.title?.toLowerCase().includes(searchTerm.toLowerCase())
                     || a.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    total:  announcements.length,
    pub:    announcements.filter(a => a.status === 'PUBLISHED').length,
    draft:  announcements.filter(a => a.status === 'DRAFT').length,
    views:  announcements.reduce((s, a) => s + (a.viewCount || 0), 0),
  };

  const statsConfig = [
    { label: 'Total',       value: counts.total, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Published',   value: counts.pub,   color: '#10b981', bg: '#ecfdf5' },
    { label: 'Drafts',      value: counts.draft, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Views', value: counts.views, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Announcements</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create and manage company-wide announcements
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchAll} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <Refresh fontSize="small" />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 2.5 }}>
            Create Announcement
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        {statsConfig.map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0',
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }, transition: '0.2s' }}>
              <CardContent sx={{ p: 2.5 , width:150}}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs + Search */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: '1px solid #f1f5f9', px: 2 }}
          variant="scrollable" scrollButtons="auto">
          {['All', 'Published', 'Draft', 'Scheduled', 'Archived'].map((t, i) => (
            <Tab key={t} label={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <span>{t}</span>
                {i === 0 && <Chip label={counts.total} size="small" sx={{ height: 16, fontSize: '0.65rem' }} />}
                {i === 1 && <Chip label={counts.pub}   size="small" color="success" sx={{ height: 16, fontSize: '0.65rem' }} />}
                {i === 2 && <Chip label={counts.draft}  size="small" color="warning" sx={{ height: 16, fontSize: '0.65rem' }} />}
              </Stack>
            } sx={{ textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
        <Box sx={{ p: 2 }}>
          <TextField placeholder="Search by title or content…" size="small" sx={{ width: { xs: '100%', sm: 380 } }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }} />
        </Box>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Table */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['Title', 'Type', 'Audience', 'Priority', 'Status', 'Views', 'Created By', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tabFiltered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Campaign sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary">No announcements found</Typography>
                  </TableCell>
                </TableRow>
              ) : tabFiltered.map(ann => (
                <TableRow key={ann.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{ann.title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{
                      display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200,
                    }}>
                      {ann.content?.slice(0, 60)}{ann.content?.length > 60 ? '…' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ann.type || 'GENERAL'} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#f1f5f9' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={ann.audience || 'ALL'} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell><PriorityChip priority={ann.priority} /></TableCell>
                  <TableCell><StatusChip status={ann.status} /></TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="text.secondary">{ann.viewCount ?? 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{ann.createdBy || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{ann.createdAt || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.3}>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => { setSelected(ann); setViewOpen(true); }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(ann)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {ann.status === 'DRAFT' && (
                        <Tooltip title="Publish Now">
                          <IconButton size="small" sx={{ color: '#10b981' }} onClick={() => handlePublish(ann.id)}>
                            <PublishIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDelete(ann.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700} sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnnouncementIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
            </Box>
            {selected ? 'Edit Announcement' : 'Create Announcement'}
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title *" value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Write a clear, concise title…" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Content *" multiline rows={5}
                value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full announcement content…" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={formData.type} label="Type"
                  onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  {['GENERAL', 'POLICY', 'SYSTEM', 'ACHIEVEMENT'].map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Audience</InputLabel>
                <Select value={formData.audience} label="Audience"
                  onChange={e => setFormData({ ...formData, audience: e.target.value })}>
                  {['ALL', 'MANAGERS', 'HR', 'ENGINEERING', 'SALES'].map(a => (
                    <MenuItem key={a} value={a}>{a}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={formData.priority} label="Priority"
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  {[{ v: 'HIGH', label: '🔴 HIGH' }, { v: 'MEDIUM', label: '🟡 MEDIUM' }, { v: 'LOW', label: '🟢 LOW' }]
                    .map(p => <MenuItem key={p.v} value={p.v}>{p.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Expires On" InputLabelProps={{ shrink: true }}
                value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} />
            </Grid>
            {/* FIX: publishImmediately only shown on create, not edit */}
            {!selected && (
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Switch checked={!!formData.publishImmediately}
                    onChange={e => setFormData({ ...formData, publishImmediately: e.target.checked })} />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Publish Immediately</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.publishImmediately ? 'Will be visible to employees right away' : 'Saved as draft'}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}
            sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 3 }}>
            {saving ? <CircularProgress size={18} color="inherit" /> :
              selected ? 'Update' : (formData.publishImmediately ? 'Publish' : 'Save Draft')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>{selected?.title}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selected && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={selected.type || 'GENERAL'} size="small" sx={{ bgcolor: '#f1f5f9' }} />
                <Chip label={`Audience: ${selected.audience || 'ALL'}`} size="small" variant="outlined" />
                <PriorityChip priority={selected.priority} />
                <StatusChip status={selected.status} />
              </Stack>
              <Divider />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {selected.content}
              </Typography>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Created by</Typography>
                  <Typography variant="body2" fontWeight={600}>{selected.createdBy || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Created at</Typography>
                  <Typography variant="body2" fontWeight={600}>{selected.createdAt || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Published at</Typography>
                  <Typography variant="body2" fontWeight={600}>{selected.publishedAt || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Views</Typography>
                  <Typography variant="body2" fontWeight={600}>{selected.viewCount ?? 0}</Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {selected?.status === 'DRAFT' && (
            <Button variant="contained" color="success" onClick={() => { handlePublish(selected.id); setViewOpen(false); }}
              sx={{ textTransform: 'none', borderRadius: 2 }}>
              Publish Now
            </Button>
          )}
          <Button onClick={() => setViewOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
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

export default AnnouncementManagement;