import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, MenuItem, FormControl, InputLabel,
  Select, Checkbox, Button, Paper, Grid, Avatar, Chip,
  CircularProgress, Alert, Stack, Divider, LinearProgress,
} from '@mui/material';
import { GroupAdd, ArrowBack, Person, Business, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const getToken = () => {
  const t = localStorage.getItem('token') || localStorage.getItem('jwtToken');
  return t && t !== 'null' && t !== 'undefined' ? t : null;
};
const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing',
  'Sales', 'HR', 'Operations', 'Finance',
];
const DEPT_COLORS = {
  Engineering: '#3b82f6', Design: '#8b5cf6', Marketing: '#ec4899',
  Sales: '#f59e0b', HR: '#10b981', Product: '#06b6d4',
  Operations: '#f97316', Finance: '#14b8a6',
};
const deptColor = (d) => DEPT_COLORS[d] || '#64748b';

// ── All IDs stored as STRINGS throughout the form ─────────────────────────────
// MUI Select does strict === comparison between `value` prop and MenuItem `value`.
// API returns numeric IDs. If formData holds a number but MenuItem has a string
// (or vice-versa), nothing shows as selected. Fix: always String everywhere.
const EMPTY_FORM = {
  teamName:    '',
  department:  '',
  teamLeadId:  '',    // string — converted to Number only in handleSubmit
  description: '',
  active:      true,
  members:     [],    // string[] — converted to Number[] only in handleSubmit
};

const CreateTeam = () => {
  const navigate = useNavigate();

  const [employees,  setEmployees]  = useState([]);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(false);
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [step,       setStep]       = useState(0);

  // ── Fetch employees once ────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoadingEmp(true);
    setError(null);
    const headers = authHeaders();
    if (!headers.Authorization) {
      setError('Session expired. Please log in again.');
      setLoadingEmp(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/employees/get-all`, { headers });
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load employees. Please check your connection.');
    } finally {
      setLoadingEmp(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // ── FIX 1: Dedicated handlers instead of one generic handleChange ─────────
  // Using a single `handleChange` that reads `e.target.name` fails for MUI
  // Select because MUI fires the event with the Select's `name` prop only if
  // the browser native select is rendered. With the default MUI Select (which
  // renders a div + hidden input), `e.target.name` is undefined in some React
  // versions, silently corrupting state under the `undefined` key.
  // Solution: use explicit setters per field.

  const setField = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  // ── FIX 2: Team lead selection clears members that match the new lead ──────
  // When the user picks a team lead AFTER already selecting members, the chosen
  // lead must be removed from the members list automatically — otherwise the lead
  // appears in both roles.
  const handleTeamLeadChange = (e) => {
    const newLeadId = e.target.value; // string
    setFormData(prev => ({
      ...prev,
      teamLeadId: newLeadId,
      // Remove the new lead from members if they were already selected
      members: prev.members.filter(m => m !== newLeadId),
    }));
  };

  // ── FIX 3: toggleMember uses string IDs consistently ──────────────────────
  // Previously mixed Number() conversions caused two bugs:
  //   a) Number('') === 0 made the lead-guard always fail when no lead was set
  //   b) Comparing number vs string IDs produced wrong results
  // Fix: keep everything as strings; guard simply compares strings.
  const toggleMember = (empId) => {
    const id = String(empId);

    // Guard: never add the current team lead as a member
    if (id === formData.teamLeadId) return;

    setFormData(prev => {
      const already = prev.members.includes(id);
      return {
        ...prev,
        members: already
          ? prev.members.filter(m => m !== id)
          : [...prev.members, id],
      };
    });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.teamName.trim()) {
      setError('Team name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        teamName:    formData.teamName.trim(),
        department:  formData.department,
        description: formData.description,
        active:      formData.active,
        // Convert to Numbers for backend Long fields
        teamLeadId: formData.teamLeadId !== '' ? Number(formData.teamLeadId) : null,
        members:    formData.members.map(Number),
      };
      await axios.post(`${API_URL}/api/teams`, payload, { headers: authHeaders() });
      setSuccess(true);
      setTimeout(() => navigate('/manager/teams'), 1800);
    } catch (err) {
      const msg = err.response?.data?.error
               || err.response?.data?.message
               || err.response?.data
               || 'Error creating team. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Error creating team.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Next step with validation ───────────────────────────────────────────────
  const handleNext = () => {
    if (step === 0 && !formData.teamName.trim()) {
      setError('Team name is required before continuing.');
      return;
    }
    setError(null);
    setStep(s => s + 1);
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  // FIX: compare as strings — formData.teamLeadId is always a string
  const teamLead = employees.find(e => String(e.id) === formData.teamLeadId);

  // FIX: members is string[], compare as strings
  const selectedMembs = employees.filter(e => formData.members.includes(String(e.id)));

  const deptCol = deptColor(formData.department);
  const steps   = ['Team Details', 'Add Members', 'Review & Create'];

  const getEmpDisplay = (emp) =>
    [emp.department?.name || emp.departmentName, emp.roleName || emp.role?.name]
      .filter(Boolean).join(' · ');

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{
        p: { xs: 2, md: 4 }, maxWidth: 860, mx: 'auto',
        borderRadius: 3, border: '1px solid #e2e8f0',
      }}>

        {/* ── Header ── */}
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/manager/teams')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0f172a">
              Create New Team
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step {step + 1} of {steps.length} — {steps[step]}
            </Typography>
          </Box>
        </Stack>

        {/* ── Progress ── */}
        <Stack direction="row" spacing={1} mb={4}>
          {steps.map((label, i) => (
            <Box key={label} sx={{ flex: 1 }}>
              <Box sx={{
                height: 4, borderRadius: 2, mb: 1,
                bgcolor: i <= step ? '#3b82f6' : '#e2e8f0',
                transition: '0.3s',
              }} />
              <Typography
                variant="caption"
                color={i === step ? '#3b82f6' : 'text.disabled'}
                fontWeight={i === step ? 700 : 400}>
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<CheckCircle />}>
            Team "<strong>{formData.teamName}</strong>" created! Redirecting…
          </Alert>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 0 — Team Details
        ════════════════════════════════════════════════════════ */}
        {step === 0 && (
          <Grid container spacing={3}>

            {/* Team Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Team Name *" fullWidth autoFocus
                value={formData.teamName}
                onChange={setField('teamName')}
                placeholder="e.g. Frontend Squad"
                InputProps={{
                  startAdornment: <Business sx={{ mr: 1, color: '#94a3b8', fontSize: 18 }} />,
                }}
              />
            </Grid>

            {/* Department */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                {/*
                  FIX: Use onChange={setField('department')} — explicit setter.
                  Do NOT use a generic handleChange with e.target.name here
                  because MUI Select doesn't reliably populate e.target.name.
                */}
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={setField('department')}>
                  <MenuItem value=""><em>No department</em></MenuItem>
                  {DEPARTMENTS.map(d => (
                    <MenuItem key={d} value={d}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: deptColor(d) }} />
                        <span>{d}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Team Lead */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Team Lead</InputLabel>
                {/*
                  FIX 1: value={formData.teamLeadId} is a string.
                          MenuItem value={String(emp.id)} is also a string.
                          Strict === now matches correctly → selected item shows.

                  FIX 2: onChange={handleTeamLeadChange} removes the chosen lead
                          from the members array if they were already selected,
                          preventing the same person from being in both roles.

                  FIX 3: No sx={{width:150}} — that was overriding fullWidth.
                */}
                <Select
                  value={formData.teamLeadId}
                  label="Team Lead"
                  onChange={(e) => {
                    // e.target.value is reliably set by MUI Select's own onChange
                    // (not affected by inner child elements)
                    handleTeamLeadChange(e);
                  }}
                  renderValue={(selected) => {
                    if (!selected) return <em>No lead assigned</em>;
                    const lead = employees.find(e => String(e.id) === selected);
                    if (!lead) return selected;
                    return (
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#3b82f6', fontSize: '0.7rem' }}>
                          {lead.firstName?.[0]}{lead.lastName?.[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {lead.firstName} {lead.lastName}
                        </Typography>
                      </Stack>
                    );
                  }}>
                  <MenuItem value=""><em>No lead assigned</em></MenuItem>
                  {loadingEmp
                    ? <MenuItem disabled>Loading employees…</MenuItem>
                    : employees.map(emp => (
                        <MenuItem key={emp.id} value={String(emp.id)}>
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pointerEvents: 'none' }}>
                            <Avatar sx={{
                              width: 28, height: 28,
                              bgcolor: '#3b82f6', fontSize: '0.7rem',
                            }}>
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {emp.firstName} {emp.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getEmpDisplay(emp)}
                              </Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                      ))
                  }
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Team Description" fullWidth multiline rows={3}
                value={formData.description}
                onChange={setField('description')}
                placeholder="What does this team do? Goals, responsibilities…"
              />
            </Grid>
          </Grid>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 1 — Add Members
        ════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={700}>Select Team Members</Typography>
              {formData.members.length > 0 && (
                <Chip
                  label={`${formData.members.length} selected`}
                  color="primary" size="small" sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>

            {teamLead && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }} icon={<Person />}>
                Team lead <strong>{teamLead.firstName} {teamLead.lastName}</strong> is
                already on the team. Add additional members below.
              </Alert>
            )}

            {loadingEmp && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {!loadingEmp && employees.length === 0 ? (
                <Typography color="text.secondary" p={3} textAlign="center">
                  No employees found.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                  {/*
                    FIX: Exclude team lead by comparing strings.
                    Previously used Number(formData.teamLeadId) which gave 0
                    when teamLeadId was '' — incorrectly filtering out emp.id=0
                    or including the lead when they should be excluded.
                  */}
                  {employees
                    .filter(e =>
                      formData.teamLeadId === '' ||
                      String(e.id) !== formData.teamLeadId
                    )
                    .map(emp => {
                      // FIX: members is string[] — compare strings
                      const sel = formData.members.includes(String(emp.id));
                      return (
                        <Box
                          component="label"
                          key={emp.id}
                          sx={{
                            display: 'flex', alignItems: 'center', p: 1.5,
                            cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                            bgcolor: sel ? '#eff6ff' : 'white',
                            '&:hover': { bgcolor: sel ? '#dbeafe' : '#f8fafc' },
                            '&:last-child': { borderBottom: 'none' },
                            transition: '0.15s',
                          }}>
                          <Checkbox
                            checked={sel}
                            size="small"
                            sx={{ mr: 1, p: 0, color: '#3b82f6' }}
                            onChange={() => toggleMember(emp.id)}
                          />
                          <Avatar sx={{
                            width: 34, height: 34, mr: 1.5,
                            bgcolor: sel ? '#3b82f6' : '#e2e8f0',
                            color:   sel ? 'white'   : '#64748b',
                            fontSize: '0.75rem', fontWeight: 700,
                          }}>
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600}>
                              {emp.firstName} {emp.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getEmpDisplay(emp)}
                            </Typography>
                          </Box>
                          {sel && <CheckCircle sx={{ color: '#3b82f6', fontSize: 18 }} />}
                        </Box>
                      );
                    })
                  }
                </Box>
              )}
            </Paper>

            {/* Selected chips with remove */}
            {selectedMembs.length > 0 && (
              <Box mt={2}>
                <Typography
                  variant="caption" color="text.secondary"
                  fontWeight={700} display="block" mb={1}>
                  SELECTED ({selectedMembs.length})
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {selectedMembs.map(emp => (
                    <Chip
                      key={emp.id}
                      avatar={
                        <Avatar sx={{ bgcolor: '#3b82f6 !important', fontSize: '0.65rem !important' }}>
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </Avatar>
                      }
                      label={`${emp.firstName} ${emp.lastName}`}
                      onDelete={() => toggleMember(emp.id)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* ════════════════════════════════════════════════════════
            STEP 2 — Review & Create
        ════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Review Your Team
            </Typography>
            <Paper elevation={0} sx={{
              p: 3, borderRadius: 3,
              border: `2px solid ${deptCol}`,
              bgcolor: deptCol + '10',
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="h5" fontWeight={800} color="#0f172a">
                  {formData.teamName || '—'}
                </Typography>
                <Chip label="Active" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Stack>

              {formData.department && (
                <Stack direction="row" alignItems="center" spacing={0.8} mb={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: deptCol }} />
                  <Typography variant="caption" fontWeight={700} color={deptCol}>
                    {formData.department}
                  </Typography>
                </Stack>
              )}

              {formData.description && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {formData.description}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" fontWeight={700} display="block" mb={1}>
                TEAM LEAD
              </Typography>
              {teamLead ? (
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: deptCol, fontWeight: 700 }}>
                    {teamLead.firstName?.[0]}{teamLead.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {teamLead.firstName} {teamLead.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getEmpDisplay(teamLead)}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  No lead assigned
                </Typography>
              )}

              <Typography variant="caption" fontWeight={700} display="block" mb={1}>
                MEMBERS ({selectedMembs.length})
              </Typography>
              {selectedMembs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No additional members added
                </Typography>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {selectedMembs.map(emp => (
                    <Chip
                      key={emp.id}
                      size="small"
                      label={`${emp.firstName} ${emp.lastName}`}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        )}

        {/* ── Navigation ── */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/manager/teams')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          {step < 2 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}>
              Next Step
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || success}
              startIcon={
                submitting
                  ? <CircularProgress size={18} color="inherit" />
                  : <GroupAdd />
              }
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4 }}>
              {submitting ? 'Creating…' : 'Create Team'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default CreateTeam;