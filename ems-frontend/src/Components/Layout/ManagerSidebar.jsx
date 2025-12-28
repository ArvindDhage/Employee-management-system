import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  GroupAdd as GroupAddIcon,
  People as PeopleIcon,
  EventNote as AttendanceIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const menuItems = [
  { label: 'Dashboard', path: '/manager/dashboard', icon: <DashboardIcon /> },
  { label: 'Create Team', path: '/manager/team/create', icon: <GroupAddIcon /> },
  { label: 'Team Members', path: '/manager/team/members', icon: <PeopleIcon /> },
  { label: 'Team Attendance', path: '/manager/attendance', icon: <AttendanceIcon /> },
  { label: 'Team Leaves', path: '/manager/leaves', icon: <CalendarIcon /> }
];

const ManagerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
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
      {/* Logo / Title */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>M</Avatar>
        <Typography variant="h6" fontWeight="bold">
          EMS Manager
        </Typography>
      </Box>

      {/* Menu */}
      <Box sx={{ mt: 4, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Box
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                p: 2,
                borderRadius: 2,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                bgcolor: isActive ? 'primary.light' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.primary',
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
  );
};

export default ManagerSidebar;
