import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box, Button, Typography, Avatar, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Stack, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Snackbar, Alert, InputAdornment, Tooltip, Skeleton, MenuItem,
} from "@mui/material";
import {
  Add as PlusIcon, Edit as EditIcon, Delete as TrashIcon,
  Search as SearchIcon, People as PeopleIcon,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function stringToColor(str = "") {
  const palette = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f43f5e"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const ViewEmp = () => {
  const [employees,       setEmployees]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [isDialogOpen,    setIsDialogOpen]    = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [snackbar,        setSnackbar]        = useState({ open: false, message: "", severity: "success" });

  // FIX: ViewEmployee shows read-only info; edit dialog should only expose
  // fields that have backend endpoints. Full employee update (PUT) is not
  // in EmployeeController — only deactivate/activate/salary/promote via AdminController.
  // This dialog is intentionally limited to showing details only.
  const [formData, setFormData] = useState({
    empCode: "", firstName: "", lastName: "", email: "",
    phone: "", salary: "", status: "ACTIVE",
  });

  const showToast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // ✅ EmployeeController: GET /employees/get-all
      const response = await axios.get(`${API_URL}/employees/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast("Could not load employees.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        empCode:   employee.empCode   || "",
        firstName: employee.firstName || "",
        lastName:  employee.lastName  || "",
        email:     employee.email     || "",
        phone:     employee.phone     || "",
        salary:    employee.salary    || "",
        status:    employee.status    || "ACTIVE",
      });
    } else {
      setEditingEmployee(null);
      setFormData({ empCode: "", firstName: "", lastName: "", email: "", phone: "", salary: "", status: "ACTIVE" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token  = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editingEmployee) {
        // FIX: EmployeeController has no PUT /employees/update/{id}.
        // The only salary-related endpoint is PATCH /api/admin/employees/{id}/salary.
        // For status: PATCH /api/admin/employees/{id}/deactivate or /activate.
        // We update salary and status separately through the correct admin endpoints.

        const updates = [];

        if (formData.salary && Number(formData.salary) !== editingEmployee.salary) {
          updates.push(
            axios.patch(
              `${API_URL}/api/admin/employees/${editingEmployee.id}/salary`,
              { salary: parseFloat(formData.salary) },
              config
            )
          );
        }

        const wasActive   = editingEmployee.active !== false;
        const nowActive   = formData.status === "ACTIVE";
        if (wasActive !== nowActive) {
          const action = nowActive ? "activate" : "deactivate";
          updates.push(
            axios.patch(
              `${API_URL}/api/admin/employees/${editingEmployee.id}/${action}`,
              {},
              config
            )
          );
        }

        if (updates.length > 0) {
          await Promise.all(updates);
          showToast("Employee updated successfully.");
        } else {
          showToast("No changes detected.", "info");
        }
      } else {
        // ✅ EmployeeController: POST /employees/add-user — requires full EmployeeRegisterDTO
        // For a quick add from ViewEmployee we at minimum need username/password/userRole.
        // Redirect to the proper AddEmployee page for full registration.
        showToast("Please use the Add Employee page for full registration.", "info");
        handleCloseDialog();
        return;
      }
      handleCloseDialog();
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || "Action failed.", "error");
    }
  };

  const handleToggleStatus = async (emp) => {
    const isActive = emp.active !== false;
    const action   = isActive ? "deactivate" : "activate";
    if (!window.confirm(`${isActive ? "Deactivate" : "Activate"} ${emp.firstName} ${emp.lastName}?`)) return;
    try {
      const token = localStorage.getItem("token");
      // ✅ AdminController: PATCH /api/admin/employees/{id}/deactivate or /activate
      await axios.patch(
        `${API_URL}/api/admin/employees/${emp.id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Employee ${action}d.`);
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed.", "error");
    }
  };

  // FIX: no DELETE endpoint exists in EmployeeController or AdminController.
  // AdminController has deactivate/activate (soft delete). Hard delete is not exposed.
  // Show a proper message instead of calling a non-existent endpoint.
  const handleDelete = (emp) => {
    showToast("Hard delete is not supported. Use Deactivate to disable the account.", "info");
  };

  const filtered = employees.filter((e) =>
    `${e.firstName} ${e.lastName} ${e.email} ${e.empCode}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = employees.filter((e) => e.active !== false).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>

      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }} gap={2} mb={4}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.main", color: "white", display: "flex" }}>
              <PeopleIcon fontSize="small" />
            </Box>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
              Employee Directory
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" color="text.secondary">{employees.length} total</Typography>
            <Typography variant="body2" color="success.main" fontWeight={600}>{activeCount} active</Typography>
          </Stack>
        </Box>
        {/* FIX: navigate to AddEmployee page for full registration instead of inline dialog */}
        <Button variant="contained" startIcon={<PlusIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3, py: 1.2 }}>
          Edit Employee
        </Button>
      </Stack>

      {/* Search */}
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <TextField fullWidth size="small" placeholder="Search by name, email or code…"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment>,
            sx: { borderRadius: 2, bgcolor: "white" },
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f1f5f9" }}>
              {["Employee", "Code", "Department", "Job Title", "Salary", "Status", "Actions"].map((h, i) => (
                <TableCell key={h} align={i === 6 ? "right" : "left"}
                  sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem",
                    textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton variant="rounded" height={20} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((emp) => {
                  // FIX: resolve department from nested object
                  const deptName = emp.department?.name || emp.departmentName || "—";
                  const isActive = emp.active !== false;
                  return (
                    <TableRow key={emp.id} hover
                      sx={{ "&:last-child td": { border: 0 }, opacity: isActive ? 1 : 0.55 }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{
                            bgcolor: stringToColor(`${emp.firstName}${emp.lastName}`),
                            width: 38, height: 38, fontSize: "0.85rem", fontWeight: 700,
                          }}>
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{emp.firstName} {emp.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" color="text.secondary">{emp.empCode}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{deptName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{emp.jobTitle || "—"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {emp.salary != null ? `₹${Number(emp.salary).toLocaleString()}` : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={isActive ? "Active" : "Inactive"} size="small"
                          color={isActive ? "success" : "default"}
                          sx={{ fontWeight: 600, fontSize: "0.7rem" }} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit salary / status">
                          <IconButton onClick={() => handleOpenDialog(emp)} size="small" sx={{ mr: 0.5 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isActive ? "Deactivate" : "Activate"}>
                          <IconButton onClick={() => handleToggleStatus(emp)} size="small"
                            color={isActive ? "warning" : "success"}>
                            <TrashIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No employees found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog — salary and status only (fields with backend endpoints) */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {editingEmployee
              ? `Edit — ${editingEmployee.firstName} ${editingEmployee.lastName}`
              : "Employee Info"}
          </DialogTitle>
          <DialogContent dividers>
            {editingEmployee ? (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name" value={formData.firstName} disabled size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Last Name" value={formData.lastName} disabled size="small" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email" value={formData.email} disabled size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" value={formData.phone} disabled size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* FIX: salary update via PATCH /api/admin/employees/{id}/salary */}
                  <TextField fullWidth label="Salary (Annual ₹)" name="salary" type="number"
                    value={formData.salary} onChange={handleInputChange} size="small"
                    helperText="Leave unchanged to keep current salary" />
                </Grid>
                <Grid item xs={12}>
                  {/* FIX: status update via PATCH /api/admin/employees/{id}/deactivate|activate */}
                  <TextField fullWidth select label="Status" name="status"
                    value={formData.status} onChange={handleInputChange} size="small"
                    helperText="Changing status calls deactivate/activate endpoint">
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                To register a new employee with full credentials, please use the
                <strong> Add Employee</strong> page which supports all required fields.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>Cancel</Button>
            {editingEmployee && (
              <Button type="submit" variant="contained"
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
                Save Changes
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewEmp;