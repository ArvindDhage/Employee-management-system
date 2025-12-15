// src/Pages/Manager/ManagerDashboard.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Groups as TeamsIcon,
  People as PeopleIcon,
  PendingActions as PendingIcon,
  Today as TodayIcon,
  Dashboard as DashboardIcon,
  GroupAdd as GroupAddIcon,
  EventNote as AttendanceIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

// Mock data
const stats = [
  { id: 1, title: 'Total Teams', value: '12', color: 'primary', icon: <TeamsIcon /> },
  { id: 2, title: 'Team Members', value: '87', color: 'success', icon: <PeopleIcon /> },
  { id: 3, title: 'Pending Leaves', value: '8', color: 'warning', icon: <PendingIcon /> },
  { id: 4, title: "Today's Attendance", value: '92%', color: 'secondary', icon: <TodayIcon /> },
];

const leaveRequests = [
  { 
    id: 1, 
    name: 'Rohit Chafla', 
    team: 'Development', 
    date: 'May 15, 2023', 
    reason: 'Family vacation',
    avatar: 'RC'
  },
  { 
    id: 2, 
    name: 'Urmal Chida', 
    team: 'Marketing', 
    date: 'May 16, 2023', 
    reason: 'Medical appointment',
    avatar: 'UC'
  },
  { 
    id: 3, 
    name: 'Vaibhav Durga', 
    team: 'Design', 
    date: 'May 17, 2023', 
    reason: 'Personal day',
    avatar: 'VD'
  },
  { 
    id: 4, 
    name: 'Arvind Dhage', 
    team: 'Development', 
    date: 'May 15, 2023', 
    reason: 'Family Function',
    avatar: 'AD'
  },
];

const ManagerDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Define menu items with their paths and icons
  const menuItems = [
    { label: 'Dashboard', path: '/manager/dashboard', icon: <DashboardIcon /> },
    { label: 'Create Team', path: '/manager/team/create', icon: <GroupAddIcon /> },
    { label: 'Team Members', path: '/manager/team/members', icon: <PeopleIcon /> },
    { label: 'Team Attendance', path: '/manager/attendance', icon: <AttendanceIcon /> },
    { label: 'Team Leaves', path: '/manager/leaves', icon: <CalendarIcon /> }
  ];

  // Handle menu item click
  const handleMenuItemClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 280,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>M</Avatar>
          <Typography variant="h6" fontWeight="bold">EMS Manager</Typography>
        </Box>

        <Box sx={{ mt: 4, flexGrow: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Box
                key={item.label}
                onClick={() => handleMenuItemClick(item.path)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                {React.cloneElement(item.icon, {
                  color: isActive ? 'inherit' : 'action'
                })}
                {item.label}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Rest of your dashboard content */}
      <Box sx={{ flexGrow: 1, p: 4, bgcolor: 'grey.50' }}>
        {/* Top Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography variant="h4" fontWeight="bold">Manager Dashboard</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              p: 1, 
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' }
            }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>AD</Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Arvind Dhage</Typography>
                <Typography variant="caption" color="text.secondary">Manager</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
          gap: 3,
          mb: 4 
        }}>
          {stats.map((stat) => (
            <Card key={stat.id} sx={{ 
              borderRadius: 2,
              boxShadow: 3,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: `${stat.color}.light`, 
                    color: `${stat.color}.dark`,
                    width: 48,
                    height: 48
                  }}>
                    {React.cloneElement(stat.icon, { fontSize: 'medium' })}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Leave Requests Table */}
        <Card sx={{ 
          borderRadius: 2, 
          boxShadow: 3,
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">Pending Leave Requests</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: 'primary.main',
                          width: 32,
                          height: 32,
                          fontSize: '0.875rem'
                        }}>
                          {request.avatar}
                        </Avatar>
                        {request.name}
                      </Box>
                    </TableCell>
                    <TableCell>{request.team}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          bgcolor: 'warning.light',
                          color: 'warning.dark',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 4,
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Pending
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={<CheckIcon />}
                          sx={{ 
                            minWidth: 'auto',
                            p: '4px 12px',
                            textTransform: 'none'
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          startIcon={<CloseIcon />}
                          sx={{ 
                            minWidth: 'auto',
                            p: '4px 12px',
                            textTransform: 'none'
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
};

export default ManagerDashboard;