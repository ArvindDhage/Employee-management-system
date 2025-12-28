
import React from 'react';
import ManagerSidebar from '../../Components/Layout/ManagerSidebar';
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
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Groups as TeamsIcon,
  People as PeopleIcon,
  PendingActions as PendingIcon,
  Today as TodayIcon
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
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <ManagerSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
      
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Manager Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1,
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>AD</Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                Arvind Dhage
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manager
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4
        }}
      >
        {stats.map((stat) => (
          <Card
            key={stat.id}
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              transition: '0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    bgcolor: `${stat.color}.light`,
                    color: `${stat.color}.dark`,
                    width: 48,
                    height: 48
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Leave Requests Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">
            Pending Leave Requests
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {leaveRequests.map((req) => (
                <TableRow key={req.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {req.avatar}
                      </Avatar>
                      {req.name}
                    </Box>
                  </TableCell>

                  <TableCell>{req.team}</TableCell>
                  <TableCell>{req.date}</TableCell>
                  <TableCell>{req.reason}</TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        bgcolor: 'warning.light',
                        color: 'warning.dark',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 4,
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
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        startIcon={<CloseIcon />}
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
