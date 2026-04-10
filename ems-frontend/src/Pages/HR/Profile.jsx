import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Avatar,
  InputAdornment, Divider, CircularProgress, Stack, Chip, Paper,
} from "@mui/material";
import {
  Person, Email, Phone, Business, CalendarMonth, Badge,
  WorkOutline, AttachMoney,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function stringToColor(str = "") {
  const palette = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const Profile = () => {
  const [profile,     setProfile]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/employees/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ height: 140, borderRadius: 4, mb: 3,
          background: "linear-gradient(135deg, #1e40af, #3b82f6)",
          display: "flex", alignItems: "center", px: 4, gap: 3 }}>
          <Box sx={{ width: 96, height: 96, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.2)" }} />
          <Stack spacing={1}>
            <Box sx={{ width: 160, height: 20, borderRadius: 1, bgcolor: "rgba(255,255,255,0.2)" }} />
            <Box sx={{ width: 100, height: 14, borderRadius: 1, bgcolor: "rgba(255,255,255,0.15)" }} />
          </Stack>
        </Box>
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <CircularProgress />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (fetchError || !profile) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", textAlign: "center", py: 10 }}>
        <Person sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Failed to load profile</Typography>
        <Typography variant="body2" color="text.disabled">Please check your connection and try again.</Typography>
      </Box>
    );
  }

 
  const user = {
    name:         `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
    email:        profile.email        || "—",
    phone:        profile.phone        || "—",
    department:   profile.departmentName || "—",
    role:         profile.roleName || "—",
    jobTitle:     profile.jobTitle || "—",
    joiningDate:  profile.joiningDate,
    empCode:      profile.empCode || "—",
    salary:       profile.salary,
    leaveBalance: profile.leaveBalance,
    status:       profile.status || "ACTIVE",
  };

  const initials    = user.name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const avatarColor = stringToColor(user.name);

  const infoFields = [
    { label: "Full Name",      value: user.name,       icon: <Person /> },
    { label: "Email Address",  value: user.email,      icon: <Email /> },
    { label: "Phone Number",   value: user.phone,      icon: <Phone /> },
    { label: "Employee Code",  value: user.empCode,    icon: <Badge /> },
    { label: "Department",     value: user.department, icon: <Business /> },
    { label: "Designation",    value: user.jobTitle !== "—" ? user.jobTitle : user.role, icon: <WorkOutline /> },
    {
      label: "Joining Date",
      value: user.joiningDate
        ? new Date(user.joiningDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
        : "—",
      icon: <CalendarMonth />,
    },
    {
      label: "Annual Salary",
      value: user.salary != null ? `₹${Number(user.salary).toLocaleString()}` : "—",
      icon: <AttachMoney />,
    },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>

      {/* Profile Banner */}
      <Card elevation={0} sx={{
        background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #06b6d4 100%)",
        color: "white", mb: 3, borderRadius: 4, overflow: "hidden", position: "relative",
        "&::before": { content: '""', position: "absolute", top: -30, right: -30,
          width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" },
      }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "center", sm: "flex-start" }} spacing={3}>
            <Avatar sx={{
              width: 96, height: 96, bgcolor: alpha(avatarColor, 0.9),
              fontSize: "2rem", fontWeight: 800,
              border: "4px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}>
              {initials}
            </Avatar>
            <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
              <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">{user.name}</Typography>
              <Typography sx={{ opacity: 0.85, fontSize: "1rem" }}>
                {user.jobTitle !== "—" ? user.jobTitle : user.role}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>{user.department}</Typography>
              <Stack direction="row" spacing={1} mt={1.5} justifyContent={{ xs: "center", sm: "flex-start" }} flexWrap="wrap">
                <Chip label={user.status} size="small" sx={{
                  bgcolor: user.status === "ACTIVE" ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.15)",
                  color: "white", fontWeight: 700, fontSize: "0.7rem",
                  border: "1px solid rgba(255,255,255,0.2)",
                }} />
                {user.leaveBalance != null && (
                  <Chip label={`${user.leaveBalance} leave days`} size="small" sx={{
                    bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: "0.7rem",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }} />
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Person fontSize="small" color="action" />
            <Typography variant="h6" fontWeight={700}>Personal Information</Typography>
          </Stack>

          <Grid container spacing={2.5}>
            {infoFields.map((field) => (
              <Grid item xs={12} md={6} key={field.label}>
                <TextField fullWidth label={field.label}
                  value={field.value || ""}
                  disabled size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {React.cloneElement(field.icon, { fontSize: "small", sx: { color: "text.disabled" } })}
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#374151", fontWeight: 500 } }}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="subtitle1" fontWeight={700} mb={2}>Account Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <StatBox label="Annual Salary" value={user.salary ? `₹${Math.round(user.salary / 1000)}K` : "—"} color="#3b82f6" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatBox label="Monthly" value={user.salary ? `₹${Math.round(user.salary / 12000)}K` : "—"} color="#8b5cf6" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatBox label="Leave Days" value={user.leaveBalance != null ? user.leaveBalance : "—"} color="#10b981" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatBox label="Since" value={user.joiningDate ? new Date(user.joiningDate).getFullYear() : "—"} color="#f59e0b" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

const StatBox = ({ label, value, color }) => (
  <Paper variant="outlined" sx={{
    p: 2, textAlign: "center", borderRadius: 2,
    borderColor: alpha(color, 0.25), bgcolor: alpha(color, 0.05),
    transition: "0.2s", "&:hover": { bgcolor: alpha(color, 0.1) },
  }}>
    <Typography variant="h6" fontWeight={800} sx={{ color }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
  </Paper>
);

export default Profile;