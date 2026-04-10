import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Card, CardContent, Typography, Grid, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Stack, Chip, Paper, Skeleton, Tooltip,
} from "@mui/material";
import { Search, TrendingUp, People, Edit } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

// FIX: base URL only — endpoint paths constructed below with correct routes
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function stringToColor(str = "") {
  const palette = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const Payroll = () => {
  const [employees,       setEmployees]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [dialogOpen,      setDialogOpen]      = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newSalary,       setNewSalary]       = useState("");
  const [saving,          setSaving]          = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/employees/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleUpdateSalary = async () => {
    if (!editingEmployee) return;
    if (!newSalary || isNaN(newSalary) || Number(newSalary) <= 0) {
      setError("Please enter a valid salary amount.");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/admin/employees/${editingEmployee.id}/salary`,
        { salary: parseFloat(newSalary) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state immediately — no refetch needed
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id ? { ...emp, salary: parseFloat(newSalary) } : emp
        )
      );
      setDialogOpen(false);
      setEditingEmployee(null);
      setNewSalary("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update salary. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDialog = (emp) => {
    setEditingEmployee(emp);
    setNewSalary(emp.salary ? emp.salary.toString() : "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
    setNewSalary("");
  };

  // department from nested object — backend Employee entity returns department as object
  const filteredEmployees = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.department?.name || emp.departmentName || ""}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + (emp.salary || 0) / 12, 0);
  const avgSalary = employees.length > 0
    ? employees.reduce((s, e) => s + (e.salary || 0), 0) / employees.length
    : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { icon: <CurrencyRupeeIcon />, color: "primary",  label: "Monthly Payroll",    value: `₹${Math.round(totalMonthlyPayroll).toLocaleString()}` },
          { icon: <People />,            color: "success",  label: "Employees Listed",   value: employees.length },
          { icon: <TrendingUp />,        color: "warning",  label: "Avg. Annual Salary", value: `₹${Math.round(avgSalary).toLocaleString()}` },
        ].map(({ icon, color, label, value }) => (
          <Grid item xs={12} md={4} key={label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
                    color: `${color}.main`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
                    <Typography variant="h5" fontWeight={800}>{value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }} gap={2} mb={3}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Employee Salaries</Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredEmployees.length} of {employees.length} employees
              </Typography>
            </Box>
            <TextField size="small" placeholder="Search by name or department…"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: "100%", sm: 280 } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ color: "text.disabled", fontSize: 18 }} /></InputAdornment>,
                sx: { borderRadius: 2 },
              }}
            />
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  {["Employee", "Department", "Annual Salary", "Monthly", "Actions"].map((h, i) => (
                    <TableCell key={h} align={i === 4 ? "right" : "left"}
                      sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.72rem",
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
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton variant="rounded" height={18} /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : filteredEmployees.map((employee) => {
                      const initials = `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`;
                      const color    = stringToColor(`${employee.firstName}${employee.lastName}`);
                      // FIX: resolve department name from nested object
                      const deptName = employee.department?.name || employee.departmentName || "N/A";
                      return (
                        <TableRow key={employee.id} hover
                          sx={{ "&:last-child td": { border: 0 } }}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar sx={{ bgcolor: alpha(color, 0.15), color, fontWeight: 700, width: 38, height: 38, fontSize: "0.85rem" }}>
                                {initials}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {employee.firstName} {employee.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{employee.email}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip label={deptName} size="small"
                              sx={{ bgcolor: "#f1f5f9", color: "text.secondary", fontWeight: 600, fontSize: "0.72rem" }} />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={700}>
                              {employee.salary != null ? `₹${Number(employee.salary).toLocaleString()}` : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {employee.salary ? `₹${Math.round(employee.salary / 12).toLocaleString()}` : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit Salary">
                              <Button variant="outlined" size="small" startIcon={<Edit fontSize="small" />}
                                onClick={() => handleOpenDialog(employee)}
                                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
                                Edit
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                }
                {!loading && filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No employees match your search</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Salary Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Update Salary
          {editingEmployee && (
            <Typography variant="body2" color="text.secondary" fontWeight={400}>
              {editingEmployee.firstName} {editingEmployee.lastName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {editingEmployee && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: "#f8fafc" }}>
              <Typography variant="caption" color="text.secondary">Current Annual Salary</Typography>
              <Typography fontWeight={700}>
                {editingEmployee.salary != null ? `₹${Number(editingEmployee.salary).toLocaleString()}` : "Not set"}
              </Typography>
            </Paper>
          )}
          <TextField fullWidth label="New Annual Salary (₹)" type="number"
            value={newSalary} onChange={(e) => setNewSalary(e.target.value)}
            sx={{ mt: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon fontSize="small" /></InputAdornment> }}
            autoFocus
          />
          {newSalary && !isNaN(newSalary) && Number(newSalary) > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Monthly: ₹{Math.round(Number(newSalary) / 12).toLocaleString()}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSalary} disabled={saving}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Update Salary"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payroll;