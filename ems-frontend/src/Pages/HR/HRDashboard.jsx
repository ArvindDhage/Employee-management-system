import React from "react";
import DashboardLayout from "../../Components/Layout/MainLayout";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { useNavigate } from "react-router-dom";


import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { stats } from "../../Services/api";

// ------------------ SAMPLE DATA ------------------ //
const departmentData = [
  { name: "HR", count: 12 },
  { name: "Engineering", count: 35 },
  { name: "Sales", count: 20 },
  { name: "Marketing", count: 10 },
];

const attendanceData = [
  { name: "Present", value: 120, color: "#4caf50" },
  { name: "Absent", value: 15, color: "#f44336" },
  { name: "Leave", value: 10, color: "#ff9800" },
];

// -------------------------------------------------- //

const HRDashboard = () => {
  const navigate = useNavigate();
  const statsItems = stats();
  const userEmail = "registrar@example.com"; // make dynamic later

  return (
    <DashboardLayout title="HR Dashboard">
    <Box sx={{p:4}}>
      {/* ------------------ WELCOME SECTION ------------------ */}
      <Paper
        elevation={4}
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 4,
          px: 5,
          py: 5,
          mx: 4,
          mb: 5,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Welcome back, {userEmail} 👋
        </Typography>

        <Typography sx={{ mt: 1, opacity: 0.9 }}>
          Your organization pulse at a glance...
        </Typography>

        {/* ACTION BUTTONS */}
        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={buttonStyle}
            onClick={() => navigate("/add-employee")}
          >
            Add Employee
          </Button>

          <Button
            variant="contained"
            startIcon={<ApartmentIcon />}
            sx={buttonStyle}
          >
            New Department
          </Button>

          <Button
            variant="contained"
            startIcon={<GroupIcon />}
            sx={buttonStyle}
          >
            View Employees
          </Button>
        </Stack>
      </Paper>

      {/* ------------------ OVERVIEW TITLE ------------------ */}
      <Typography variant="h4" align="center" fontWeight={700} mb={4}>
        Overview Dashboard
      </Typography>

      {/* ------------------ STATS CARDS ------------------ */}
      <Grid container spacing={8} justifyContent="center" sx={{ mb: 5 }} >
        {statsItems.map((item, index) => (
          <Grid item xs={12} sm={9} md={3} key={index}>
            <Box sx={{ ...statsCardStyle, background: item.gradient }}>
              <Typography variant="h6" fontWeight={600}>
                {item.title}
              </Typography>

              <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 1 }}>
                {item.value}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {item.subtitle}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ------------------ CHARTS SECTION ------------------ */}
      <Grid container spacing={3} columns={16}>
        {/* Department Bar Chart */}
        <Grid item xs={12} md={6} size={8} pl={4}>
          <Card elevation={3}>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={600}>
                  Employees by Department
                </Typography>
              }
            />
            <Divider />
            <CardContent sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#757575" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#757575" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="count" fill="#3f51b5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Pie Chart */}
        <Grid item xs={12} md={6} size={8} pr={4}>
          <Card elevation={3}>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={600}>
                  Today's Attendance
                </Typography>
              }
            />
            <Divider />

            <CardContent sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>

              {/* LEGEND */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}>
                {attendanceData.map((item) => (
                  <Box key={item.name} sx={legendItemStyle}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography variant="body2">{item.name}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </DashboardLayout>
  );
};

// ------------------ STYLES ------------------ //

const buttonStyle = {
  bgcolor: "white",
  color: "primary.main",
  fontWeight: 600,
  px: 2.5,
  "&:hover": { bgcolor: "#eaeaea" },
};

const statsCardStyle = {
  borderRadius: 4,
  p: 4,
  textAlign: "center",
  color: "white",
  boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
};

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: 8,
};

const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export default HRDashboard;
