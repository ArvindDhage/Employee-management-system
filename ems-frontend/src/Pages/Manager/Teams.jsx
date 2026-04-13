import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, InputAdornment, MenuItem, Select,
  FormControl, Card, CardContent, CardActions, Button, IconButton,
  Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Grid, Stack, CircularProgress, Alert, Tooltip,
  LinearProgress, Divider, AvatarGroup, Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon, Visibility as ViewIcon,
  Delete as DeleteIcon, CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon, Refresh, People, Groups,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const getToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || null;
const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const DEPT_COLORS = {
  Engineering: '#3b82f6', Design: '#8b5cf6', Marketing: '#ec4899',
  Sales: '#f59e0b', HR: '#10b981', Product: '#06b6d4', Operations: '#f97316',
};
const deptColor = (d) => DEPT_COLORS[d] || '#64748b';

const StatCard = ({ title, value, color, bg, icon: Icon }) => (
  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0',
    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)', transform: 'translateY(-2px)' }, transition: '0.2s' }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
          <Typography variant="h4" fontWeight={800} color={color}>{value}</Typography>
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon sx={{ color, fontSize: 22 }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const Teams = () => {
  const navigate = useNavigate();
  const [teams,        setTeams]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter,   setDeptFilter]   = useState('all');
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewOpen,     setViewOpen]     = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [snack,        setSnack]        = useState({ open: false, msg: '', sev: 'success' });

  const toast = (msg, sev = 'success') => setSnack({ open: true, msg, sev });

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await axios.get(`${API_URL}/api/teams`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    console.log("Teams:", res.data);

    setTeams(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error(err);

    setError(
      err.response?.data ||
      err.response?.data?.message ||
      "Failed to load teams"
    );
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // ✅ TeamController: DELETE /api/teams/{id}
      await axios.delete(`${API_URL}/api/teams/${selectedTeam.id}`, { headers: authHeaders() });
      setDeleteOpen(false);
      toast(`Team "${selectedTeam.teamName}" deleted.`);
      await fetchTeams();
    } catch (err) {
      toast(err.response?.data?.error || 'Delete failed.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (team) => {
    try {
      // ✅ TeamController: PATCH /api/teams/{id}/toggle-status
      // FIX: backend returns the updated team — update local state directly
      // instead of re-fetching all teams (avoids flicker)
      const res = await axios.patch(
        `${API_URL}/api/teams/${team.id}/toggle-status`,
        {},
        { headers: authHeaders() }
      );
      setTeams(prev => prev.map(t => t.id === team.id ? res.data : t));
      toast(`Team ${res.data.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      toast(err.response?.data?.error || 'Status update failed.', 'error');
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const departments  = [...new Set(teams.map(t => t.department).filter(Boolean))];

  // FIX: backend serialises isActive field from boolean `active` on Team entity
  // (after fixing Team.java `isActive` → `active`). The enrichTeam() method in
  // TeamService returns the key as "isActive" via the map, so t.isActive is correct.
  const filtered = teams.filter(t => {
    const ms  = (t.teamName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const mst = statusFilter === 'all'
      || (statusFilter === 'active'   &&  t.isActive)
      || (statusFilter === 'inactive' && !t.isActive);
    const md  = deptFilter === 'all' || t.department === deptFilter;
    return ms && mst && md;
  });

  const activeCount  = teams.filter(t => t.isActive).length;
  const totalMembers = teams.reduce((s, t) => s + (t.memberCount || 0), 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0f172a">Teams</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage and oversee all teams
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchTeams} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <Refresh fontSize="small" />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate('/manager/team/create')}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
            Create Team
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={4}><StatCard title="Total Teams"   value={teams.length} color="#3b82f6" bg="#eff6ff" icon={Groups} /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Active Teams"  value={activeCount}  color="#10b981" bg="#ecfdf5" icon={CheckCircleIcon} /></Grid>
        <Grid item xs={12} sm={4}><StatCard title="Total Members" value={totalMembers} color="#8b5cf6" bg="#f5f3ff" icon={People} /></Grid>
      </Grid>

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField size="small" placeholder="Search teams…" sx={{ flex: 1 }}
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Teams Grid */}
      <Grid container spacing={3}>
        {filtered.length === 0 && !loading ? (
          <Grid item xs={12}>
            <Box textAlign="center" py={8}>
              <Groups sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>No teams found</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {teams.length === 0 ? 'Create your first team to get started.' : 'Try adjusting the filters.'}
              </Typography>
              {teams.length === 0 && (
                <Button variant="contained" startIcon={<AddIcon />}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                  onClick={() => navigate('/manager/team/create')}>
                  Create First Team
                </Button>
              )}
            </Box>
          </Grid>
        ) : (
          filtered.map(team => {
            const color   = deptColor(team.department);
            // FIX: backend enrichTeam() returns members as List<Map> with full employee info
            const members = Array.isArray(team.members) ? team.members : [];

            return (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <Card elevation={0} sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  borderRadius: 3, border: '1px solid #e2e8f0',
                  borderTop: `3px solid ${color}`,
                  transition: '0.2s',
                  '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>

                    {/* Name + status */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Typography variant="h6" fontWeight={800} color="#0f172a" lineHeight={1.3} sx={{ pr: 1 }}>
                        {team.teamName}
                      </Typography>
                      <Chip size="small"
                        label={team.isActive ? 'Active' : 'Inactive'}
                        color={team.isActive ? 'success' : 'default'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }} />
                    </Stack>

                    {/* Department badge */}
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5,
                      px: 1.5, py: 0.5, borderRadius: 10, bgcolor: color + '15', mb: 2 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
                      <Typography variant="caption" fontWeight={700} color={color}>
                        {team.department || 'No Department'}
                      </Typography>
                    </Box>

                    {/* Description */}
                    {team.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}
                        sx={{ display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {team.description}
                      </Typography>
                    )}

                    {/* Team Lead — from enriched response */}
                    {team.teamLead && (
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: color, fontSize: '0.7rem', fontWeight: 700 }}>
                          {team.teamLead.firstName?.[0]}{team.teamLead.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Team Lead</Typography>
                          <Typography variant="body2" fontWeight={600} lineHeight={1}>
                            {team.teamLead.firstName} {team.teamLead.lastName}
                          </Typography>
                        </Box>
                      </Stack>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    {/* Members — enriched as objects from backend */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {members.length > 0 ? (
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.65rem' } }}>
                          {members.map((m, i) => (
                            <Tooltip key={m.id || i} title={`${m.firstName} ${m.lastName}`}>
                              <Avatar sx={{ bgcolor: color + 'cc', fontSize: '0.65rem' }}>
                                {m.firstName?.[0]}{m.lastName?.[0]}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                      ) : (
                        <Typography variant="caption" color="text.secondary">No members yet</Typography>
                      )}
                      <Chip label={`${team.memberCount || 0} member${team.memberCount !== 1 ? 's' : ''}`}
                        size="small" sx={{ fontSize: '0.7rem', bgcolor: '#f1f5f9' }} />
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button size="small" startIcon={<ViewIcon />}
                      onClick={() => { setSelectedTeam(team); setViewOpen(true); }}
                      sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                      Details
                    </Button>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={team.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small"
                          onClick={() => handleToggleStatus(team)}
                          sx={{ color: team.isActive ? '#f59e0b' : '#10b981',
                            bgcolor: team.isActive ? '#fffbeb' : '#ecfdf5',
                            '&:hover': { bgcolor: team.isActive ? '#fef3c7' : '#d1fae5' } }}>
                          {team.isActive ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error"
                          onClick={() => { setSelectedTeam(team); setDeleteOpen(true); }}
                          sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* ── View Details Dialog ── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700} sx={{ pb: 1 }}>{selectedTeam?.teamName}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedTeam && (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {selectedTeam.department && (
                  <Chip label={selectedTeam.department} size="small"
                    sx={{ bgcolor: deptColor(selectedTeam.department) + '20',
                      color: deptColor(selectedTeam.department), fontWeight: 700 }} />
                )}
                <Chip label={selectedTeam.isActive ? 'Active' : 'Inactive'}
                  color={selectedTeam.isActive ? 'success' : 'default'} size="small" />
                <Chip label={`${selectedTeam.memberCount || 0} members`} size="small" variant="outlined" />
              </Stack>

              {selectedTeam.description && (
                <Typography variant="body2" color="text.secondary">{selectedTeam.description}</Typography>
              )}

              <Divider />

              {/* Team Lead */}
              {selectedTeam.teamLead && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
                    TEAM LEAD
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#3b82f6', fontSize: '0.8rem', fontWeight: 700 }}>
                      {selectedTeam.teamLead.firstName?.[0]}{selectedTeam.teamLead.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {selectedTeam.teamLead.firstName} {selectedTeam.teamLead.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedTeam.teamLead.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* Members */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
                  MEMBERS ({selectedTeam.memberCount || 0})
                </Typography>
                {(!selectedTeam.members || selectedTeam.members.length === 0) ? (
                  <Typography variant="body2" color="text.secondary">No members assigned.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {selectedTeam.members.map((m, i) => (
                      <Stack key={m.id || i} direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: '#8b5cf6', fontSize: '0.7rem', fontWeight: 700 }}>
                          {m.firstName?.[0]}{m.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {m.firstName} {m.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{m.email}</Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>

              {selectedTeam.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Created: {selectedTeam.createdAt}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Team</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>"{selectedTeam?.teamName}"</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
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

export default Teams;