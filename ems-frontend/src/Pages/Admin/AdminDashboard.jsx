import React from 'react';
import { 
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  ArrowUpward as ArrowUpwardIcon,
  People as PeopleIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Grid,
  useTheme,
  Paper
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const drawerWidth = 240;

// Mock data
const statsData = [
  { 
    title: 'Total Employees', 
    value: '1,254', 
    change: 12.5,
    icon: <PeopleIcon color="primary" fontSize="large" />
  },
  { 
    title: 'Total Managers', 
    value: '84', 
    change: 8.2,
    icon: <SupervisorAccountIcon color="secondary" fontSize="large" />
  },
  { 
    title: 'Total HR', 
    value: '32', 
    change: 5.7,
    icon: <PersonIcon color="success" fontSize="large" />
  },
  { 
    title: 'Total Teams', 
    value: '18', 
    change: 3.2,
    icon: <GroupsIcon color="warning" fontSize="large" />
  }
];

// Chart Data
const employeeData = [
  { name: 'Engineering', value: 37, color: '#0088FE' },
  { name: 'Sales', value: 23, color: '#00C49F' },
  { name: 'Marketing', value: 17, color: '#FFBB28' },
  { name: 'Finance', value: 14, color: '#FF8042' },
  { name: 'HR', value: 9, color: '#8884D8' }
];

const attendanceData = [
  { name: 'Mon', present: 400, absent: 100 },
  { name: 'Tue', present: 380, absent: 120 },
  { name: 'Wed', present: 420, absent: 80 },
  { name: 'Thu', present: 400, absent: 100 },
  { name: 'Fri', present: 390, absent: 110 }
];

const taskData = [
  { name: 'Completed', value: 156, color: '#4CAF50' },
  { name: 'In Progress', value: 89, color: '#2196F3' },
  { name: 'Assigned', value: 45, color: '#FFC107' },
  { name: 'Pending', value: 23, color: '#F44336' }
];

const managerProgressData = [
  { name: 'Jan', assigned: 65, completed: 40 },
  { name: 'Feb', assigned: 59, completed: 48 },
  { name: 'Mar', assigned: 80, completed: 60 },
  { name: 'Apr', assigned: 81, completed: 65 },
  { name: 'May', assigned: 56, completed: 45 },
  { name: 'Jun', assigned: 75, completed: 60 },
];

const hrProgressData = [
  { name: 'Jan', activities: 40 },
  { name: 'Feb', activities: 30 },
  { name: 'Mar', activities: 60 },
  { name: 'Apr', activities: 50 },
  { name: 'May', activities: 35 },
  { name: 'Jun', activities: 55 },
];

const systemOverview = [
  { 
    title: 'Active Users', 
    value: '412', 
    icon: <PeopleIcon color="primary" />,
    color: 'primary.light'
  },
  { 
    title: 'Pending Leaves', 
    value: '23', 
    icon: <PendingIcon color="warning" />,
    color: 'warning.light'
  },
  { 
    title: 'Ongoing Tasks', 
    value: '89', 
    icon: <AssignmentIcon color="info" />,
    color: 'info.light'
  },
  { 
    title: 'System Health', 
    value: 'Good', 
    icon: <CheckCircleIcon color="success" />,
    color: 'success.light'
  }
];

const AdminDashboard = () => {
  const theme = useTheme();

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={employeeData[index].color} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 500 }}
      >
        {`${employeeData[index].name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box
      sx={{
        ml: { xs: 0, md: `${drawerWidth}px` },
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        minHeight: '100vh',
        pt: 3,  // top
        pr: 3,   // right
        pb: 3,   // bottom
        pl: 2,   // left (reduced from 3 to 2)
        bgcolor: '#f5f7fb'
      }}
    >
      {/* Top Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 4,
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome back, Admin! Here's your overview
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
          <TextField
            placeholder="Search employee / task / department"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }
            }}
          />
          <IconButton sx={{ bgcolor: 'background.paper' }}>
            <Box sx={{ position: 'relative' }}>
              <NotificationsIcon />
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  backgroundColor: 'error.main',
                  borderRadius: '50%'
                }} 
              />
            </Box>
          </IconButton>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            bgcolor: 'background.paper',
            px: 2,
            borderRadius: 2
          }}>
            <Avatar 
              alt="Admin User" 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              AU
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                admin@ems.com
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary" 
                      gutterBottom
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpwardIcon 
                        color="success" 
                        fontSize="small" 
                        sx={{ mr: 0.5, fontSize: 16 }} 
                      />
                      <Typography variant="caption" color="success.main" fontWeight={500}>
                        +{stat.change}% from last month
                      </Typography>
                    </Box>
                  </Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'primary.lighter',
                      color: 'primary.main'
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Progress Charts Section */}
      <Grid container spacing={30} sx={{ mb: 4 }}>
        {/* Manager Progress */}
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0}
            sx={{ 
              width: '250%',
              maxWidth: 550,
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 3
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Manager Progress
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={managerProgressData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="assigned" 
                    name="Tasks Assigned" 
                    stroke="#2196F3" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    name="Tasks Completed" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* HR Progress */}
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0}
            sx={{ 
              width: '335%',
              maxWidth: 600,
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 3
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              HR Progress
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hrProgressData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="activities" 
                    name="HR Activities" 
                    fill="#9C27B0" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Employee Distribution */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 3
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Employee Distribution
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {employeeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} employees`, '']}
                    contentStyle={{ 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Legend 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Monthly Attendance */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 3
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Monthly Attendance
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Legend />
                  <Bar dataKey="present" name="Present" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#F44336" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row of Charts */}
      <Grid container spacing={3}>
        {/* Task Assignment Overview */}
        <Grid item xs={12} md={7}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 3
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Task Assignment Overview
            </Typography>
            <Box sx={{ height: 300, mt: 2, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} tasks`, '']}
                    contentStyle={{ 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Legend 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 20 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* System Overview */}
        <Grid item xs={12} md={5}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 3
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              System Overview
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {systemOverview.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: item.color + '20', // Add opacity to the color
                      border: '1px solid',
                      borderColor: item.color + '40'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: item.color + '30',
                        mr: 2,
                        color: item.color
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.title}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;