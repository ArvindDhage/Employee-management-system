import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  MenuItem, InputAdornment, CircularProgress, Divider, Chip,
  Snackbar, Alert,
} from "@mui/material";
import {
  PersonAdd, Badge, Email, Phone, CalendarMonth, Lock,
  AccountCircle, ManageAccounts, CheckCircle, Work,
} from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const SYSTEM_ROLES = ["ADMIN", "MANAGER", "HR", "EMPLOYEE"];

const AddEmployee = () => {
  const currentYear = new Date().getFullYear();
  const initialEmpCode = `EMP-${currentYear}-001`;

  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    empCode:     initialEmpCode,
    firstName:   "",
    lastName:    "",
    email:       "",
    phone:       "",
    dateOfBirth: "",
    joiningDate: "",
    salary:      "",
    jobTitle:    "",
    departmentId: "",
    leaveBalance: 15,
    username:    "",
    password:    "",
    userRole:    "",   // must be ADMIN | MANAGER | HR | EMPLOYEE
  });

  const [loading,  setLoading]  = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const toast = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/admin/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(Array.isArray(res.data) ? res.data : []);
      } catch {
      }
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      empCode: initialEmpCode,
      firstName: "", lastName: "", email: "", phone: "",
      dateOfBirth: "", joiningDate: "",
      salary: "", jobTitle: "", departmentId: "",
      leaveBalance: 15,
      username: "", password: "", userRole: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.empCode || !formData.firstName || !formData.email ||
        !formData.username || !formData.password || !formData.userRole) {
      toast("Please fill all required fields including credentials!", "error");
      return;
    }

    const empCodePattern = /^EMP-\d{4}-\d{3}$/;
    if (!empCodePattern.test(formData.empCode)) {
      toast(`Employee Code must follow format: EMP-${currentYear}-001`, "error");
      return;
    }

    if (!SYSTEM_ROLES.includes(formData.userRole.toUpperCase())) {
      toast(`System role must be one of: ${SYSTEM_ROLES.join(", ")}`, "error");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        empCode:      formData.empCode,
        firstName:    formData.firstName,
        lastName:     formData.lastName,
        email:        formData.email,
        phone:        formData.phone || null,
        dateOfBirth:  formData.dateOfBirth  || null,
        joiningDate:  formData.joiningDate  || null,
        salary:       formData.salary ? parseFloat(formData.salary) : null,
        jobTitle:     formData.jobTitle     || null,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        leaveBalance: Number(formData.leaveBalance) || 15,
        username:     formData.username,
        password:     formData.password,
        userRole:     formData.userRole.toUpperCase(),
      };

      await axios.post(`${API_URL}/employees/add-user`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast("Employee registered successfully! 🎉");
      handleReset();
    } catch (error) {
      const msg = error.response?.data?.error
               || error.response?.data?.message
               || error.response?.data
               || "Error registering employee!";
      toast(typeof msg === "string" ? msg : "Error registering employee!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: 4, px: { xs: 2, md: 0 } }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0", overflow: "hidden" }}>

        {/* Header */}
        <Box sx={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          px: 4, py: 3, display: "flex", alignItems: "center", gap: 2,
        }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PersonAdd sx={{ color: "white" }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="white">
              New Employee Registration
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
              Fill in the details below to onboard a new team member
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>

          {/* ── Personal Information ── */}
          <SectionLabel label="Personal Information" />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Employee Code *" name="empCode"
                value={formData.empCode} onChange={handleChange}
                helperText={`Format: EMP-${currentYear}-001`}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="First Name *" name="firstName"
                value={formData.firstName} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><AccountCircle sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last Name" name="lastName"
                value={formData.lastName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email *" name="email" type="email"
                value={formData.email} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" name="phone"
                value={formData.phone} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Job Title" name="jobTitle"
                value={formData.jobTitle} onChange={handleChange}
                placeholder="e.g. Software Engineer"
                InputProps={{ startAdornment: <InputAdornment position="start"><Work sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Annual Salary (₹)" name="salary" type="number"
                value={formData.salary} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Leave Balance (days)" name="leaveBalance" type="number"
                value={formData.leaveBalance} onChange={handleChange}
                helperText="Default: 15 days"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Date of Birth" name="dateOfBirth"
                value={formData.dateOfBirth} onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonth sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Joining Date" name="joiningDate"
                value={formData.joiningDate} onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonth sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* ── Account Credentials ── */}
          <SectionLabel label="Account Credentials" />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Username *" name="username"
                value={formData.username} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><AccountCircle sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="password" label="Password *" name="password"
                value={formData.password} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: "text.disabled" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="System Role *" name="userRole"
                value={formData.userRole} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><ManageAccounts sx={{ color: "text.disabled" }} /></InputAdornment> }}
              >
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="MANAGER">MANAGER</MenuItem>
                <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* ── Organisation ── */}
          <SectionLabel label="Organisation" />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {/* FIX: departments loaded from API, not hardcoded */}
              <TextField select fullWidth label="Department" name="departmentId"
                value={formData.departmentId} onChange={handleChange} sx={{width:150}}>
                <MenuItem value=""><em>Select Department</em></MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              sx={{ flex: 1, borderRadius: 2, textTransform: "none", fontWeight: 700, py: 1.5 }}>
              {loading ? "Registering…" : "Register Employee"}
            </Button>
            <Button variant="outlined" size="large" onClick={handleReset}
              sx={{ flex: 1, borderRadius: 2, textTransform: "none", fontWeight: 600, py: 1.5 }}>
              Reset Form
            </Button>
          </Box>
        </CardContent>
      </Card>

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

const SectionLabel = ({ label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
    <Chip label={label} size="small" color="primary" variant="outlined"
      sx={{ fontWeight: 700, fontSize: "0.75rem" }} />
  </Box>
);

export default AddEmployee;