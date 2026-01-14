import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  PeopleAlt as PeopleAltIcon,
  Assignment as AssignmentIcon,
  EventAvailable as EventAvailableIcon,
  CalendarToday as CalendarTodayIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Create HR Credential', icon: <PersonAddIcon />, path: '/admin/create-hr' },
  { text: 'Create Manager Credential', icon: <PeopleAltIcon />, path: '/admin/create-manager' },
  { text: 'Assign Tasks', icon: <AssignmentIcon />, path: '/admin/assign-tasks' },
  { text: 'Leave Approval Panel', icon: <EventAvailableIcon />, path: '/admin/leave-approval' },
  { text: 'Attendance View', icon: <CalendarTodayIcon />, path: '/admin/attendance' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' }
];

const AdminSidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    // navigate('/login');
  };

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper'
      }}
    >
      {/* Logo/App Name */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          EMS Admin
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, p: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem 
              key={item.text} 
              disablePadding
              sx={{ 
                mb: 0.5,
                borderRadius: 2,
                bgcolor: isActive ? 'primary.lighter' : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? 'primary.lighter' : 'action.hover'
                }
              }}
            >
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'transparent'
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: isActive ? 'primary.main' : 'text.secondary'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.primary'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.lighter'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              fontWeight: 500,
              fontSize: 14
            }} 
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { md: drawerWidth }, 
        flexShrink: { md: 0 } ,
         position: 'fixed',  // Add this
         height: '100vh',    // Add this
         zIndex: 1200,       // Ensure it stays above other content
         overflowY: 'auto',  // Add scroll if content is too long
         bgcolor: 'background.paper',
         borderRight: '1px solid',
         borderColor: 'divider'
      }}
      aria-label="admin sidebar"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: theme.shadows[3]
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;