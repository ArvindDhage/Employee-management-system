import React, { useMemo } from "react";
import DashboardLayout from '../../Components/Layout/MainLayout';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Chip,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChecklistIcon from "@mui/icons-material/Checklist";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonIcon from "@mui/icons-material/Person";

// -------------------------------------------
// Stats Card Component
// -------------------------------------------
const StatsCard = ({ title, value, icon: Icon, color }) => (
  <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
    <Box display="flex" alignItems="center" gap={2}>
      <Box
        sx={{
          backgroundColor: `${color}.light`,
          padding: 1.5,
          borderRadius: 2,
          display: "flex",
        }}
      >
        <Icon color={color} />
      </Box>
      <Box>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="h6" fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Box>
  </Card>
);

// -------------------------------------------
// Status Badge
// -------------------------------------------
const StatusBadge = ({ status }) => {
  const colors = {
    high: "error",
    medium: "warning",
    low: "success",
  };
  return <Chip label={status} color={colors[status] || "default"} size="small" />;
};

// -------------------------------------------
// MAIN COMPONENT (SEMI-DYNAMIC + MOCK DATA)
// -------------------------------------------
const EmployeeDashboard = () => {
  // -------------------------------------------
  // MOCK USER (Replace with API later)
  // -------------------------------------------
  const user = {
    id: "3",
    name: "Rahul Sharma",
  };

  // -------------------------------------------
  // MOCK TASKS (Replace with API later)
  // -------------------------------------------
  const tasks = [
    { id: 1, title: "Complete profile update", assignedTo: "3", status: "pending", priority: "high", progress: 60 },
    { id: 2, title: "Submit monthly report", assignedTo: "3", status: "completed", priority: "medium", progress: 100 },
    { id: 3, title: "Attend team meeting", assignedTo: "3", status: "pending", priority: "low", progress: 30 },
    { id: 4, title: "Code review", assignedTo: "3", status: "pending", priority: "medium", progress: 50 },
  ];

  // -------------------------------------------
  // MOCK ANNOUNCEMENTS
  // -------------------------------------------
  const announcements = [
    { id: 1, title: "Holiday Notice", content: "Office will remain closed for Republic Day." },
    { id: 2, title: "New Policy Update", content: "A new remote work policy has been updated." },
    { id: 3, title: "Training Session", content: "A training session for React will be held on Monday." },
  ];

  // -------------------------------------------
  // MOCK LEAVE DATA
  // -------------------------------------------
  const leaveRequests = [
    { id: 101, employeeId: "3", type: "Sick Leave", days: 2 },
  ];

  // -------------------------------------------
  // MOCK ATTENDANCE
  // -------------------------------------------
  const attendance = [
    { id: 1, employeeId: "3", status: "present" },
    { id: 2, employeeId: "3", status: "present" },
    { id: 3, employeeId: "3", status: "absent" },
    { id: 4, employeeId: "3", status: "present" },
  ];

  // -------------------------------------------
  // FILTER DATA BASED ON LOGGED-IN USER
  // -------------------------------------------
  const myTasks = tasks.filter((t) => t.assignedTo === user.id);
  const myLeaves = leaveRequests.filter((l) => l.employeeId === user.id);
  const myAttendance = attendance.filter((a) => a.employeeId === user.id);

  // -------------------------------------------
  // DYNAMIC STATS CONFIG
  // -------------------------------------------
  const statsConfig = [
    {
      title: "Pending Tasks",
      value: myTasks.filter((t) => t.status === "pending").length,
      icon: ChecklistIcon,
      color: "warning",
    },
    {
      title: "Completed Tasks",
      value: myTasks.filter((t) => t.status === "completed").length,
      icon: TrendingUpIcon,
      color: "success",
    },
    {
      title: "Leave Balance",
      value: "15 days",
      icon: CalendarMonthIcon,
      color: "primary",
    },
    {
      title: "Present Days",
      value: myAttendance.filter((a) => a.status === "present").length,
      icon: PersonIcon,
      color: "info",
    },
  ];

  return (
    <DashboardLayout title="Employee Dashboard">
        <Box p={3}>
        {/* Header */}
        <Typography variant="h5" fontWeight="bold" mb={1}>
            Hello, {user.name.split(" ")[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
            Here's your personal dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3}>
            {statsConfig.map((stat, index) => (
            <Grid key={index} item xs={12} sm={6} lg={3} size={3} >
                <StatsCard {...stat} />
            </Grid>
            ))}
        </Grid>

        <Grid container spacing={3} mt={3}>
            {/* My Tasks */}
            <Grid item xs={12} lg={6} size={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardHeader title="My Tasks" />
                <CardContent>
                {myTasks.slice(0, 4).map((task) => (
                    <Box
                    key={task.id}
                    sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "action.hover",
                    }}
                    >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <StatusBadge status={task.priority} />
                    </Box>

                    <Box display="flex" alignItems="center" mt={1} gap={2}>
                        <LinearProgress
                        variant="determinate"
                        value={task.progress}
                        sx={{ flex: 1, height: 6, borderRadius: 5 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                        {task.progress}%
                        </Typography>
                    </Box>
                    </Box>
                ))}
                </CardContent>
            </Card>
            </Grid>

            {/* Announcements */}
            <Grid item xs={12} lg={6} size={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardHeader title="Announcements" />
                <CardContent>
                {announcements.slice(0, 3).map((a) => (
                    <Box
                    key={a.id}
                    sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "action.hover",
                    }}
                    >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CampaignIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2">{a.title}</Typography>
                    </Box>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        }}
                    >
                        {a.content}
                    </Typography>
                    </Box>
                ))}
                </CardContent>
            </Card>
            </Grid>
        </Grid>
        </Box>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
