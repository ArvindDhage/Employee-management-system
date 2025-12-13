import React from 'react';
import DashboardLayout from '../../Components/Layout/MainLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Avatar,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Business,
  CalendarMonth,
} from '@mui/icons-material';

const Profile = ({ profile }) => {
  // Fallback profile data if prop is not provided yet
  const defaultProfile = {
    name: 'Pankaj Pandey',
    email: 'pan.dey@example.com',
    phone: '+91 1234567890',
    department: 'Engineering',
    role: 'Software Engineer',
    joiningDate: new Date(),
  };

  const user = profile || defaultProfile;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  // Personal info fields
  const personalFields = [
    { label: 'Full Name', value: user.name, icon: <Person /> },
    { label: 'Email Address', value: user.email, icon: <Email /> },
    { label: 'Phone Number', value: user.phone, icon: <Phone /> },
    { label: 'Department', value: user.department, icon: <Business /> },
    { label: 'Role', value: user.role, icon: <Person /> },
    { 
      label: 'Joining Date', 
      value: new Date(user.joiningDate).toLocaleDateString(), 
      icon: <CalendarMonth /> 
    },
  ];

  // Account statistics (static for now, can be dynamic later)
  const stats = [
    { value: '3.5', label: 'Years at Company' },
    { value: '125', label: 'Employees Managed' },
    { value: '15', label: 'Leave Days Left' },
    { value: '98%', label: 'Attendance Rate' },
  ];

  return (
    <DashboardLayout title="My Profile">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Profile Header */}
        <Card sx={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  border: 4,
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {user.name}
                </Typography>
                <Typography sx={{ opacity: 0.9 }}>{user.role}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                  {user.department}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3} justifyContent={"center"}>
              {personalFields.map((field) => (
                <Grid item xs={12} md={6} size={6} key={field.label}>
                  <TextField
                    fullWidth
                    label={field.label}
                    value={field.value}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {field.icon}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Account Statistics */}
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Account Statistics
            </Typography>
            <Grid container spacing={2}>
              {stats.map((stat) => (
                <Grid item xs={6} md={3} size={3} key={stat.label}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default Profile;
