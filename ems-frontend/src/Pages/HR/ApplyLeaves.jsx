import { useState } from 'react';
import DashboardLayout from '../../Components/Layout/MainLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import {
  CalendarMonth,
  Send,
  AccessTime,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const ApplyLeave = () => {
  // Semi-dynamic local state
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: '1',
      leaveType: 'Vacation',
      startDate: '2025-12-15',
      endDate: '2025-12-20',
      reason: 'Family trip',
      status: 'approved',
    },
    {
      id: '2',
      leaveType: 'Sick Leave',
      startDate: '2025-12-01',
      endDate: '2025-12-03',
      reason: 'Flu recovery',
      status: 'pending',
    },
    {
      id: '3',
      leaveType: 'Personal',
      startDate: '2025-12-10',
      endDate: '2025-12-11',
      reason: 'Personal work',
      status: 'rejected',
    },
  ]);

  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const leaveTypes = ['Vacation', 'Sick Leave', 'Personal'];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRequest = {
      id: `leave-${Date.now()}`,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);

    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
     case 'approved':
        return (
            <Chip
            icon={<CheckCircle />}
            label="Approved"
            size="small"
            sx={(theme) => ({
                bgcolor: alpha(theme.palette.success.light, 0.15), 
                color: theme.palette.success.dark,                 
                '& .MuiChip-icon': { color: theme.palette.success.main }, 
            })}
            />
        );
      case 'rejected':
        return (
            <Chip
            icon={<Cancel />}
            label="Rejected"
            size="small"
            sx={{
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                color: 'error.dark',
                '& .MuiChip-icon': { color: 'error.main' },
            }}
            />
        );
      default:
        return (
            <Chip
            icon={<AccessTime />}
            label="Pending"
            size="small"
            sx={{
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.15),
                color: 'warning.dark',
                '& .MuiChip-icon': { color: 'warning.main' },
            }}
            />
        );
    }
  };

  return (
    <DashboardLayout title="Apply Leave">
      <Grid container spacing={4}>
        {/* Leave Application Form */}
        <Grid item xs={12} lg={6} size={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.15,
                  }}
                >
                  <CalendarMonth />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Apply for Leave
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submit your leave request
                  </Typography>
                </Box>
              </Box>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    select
                    label="Leave Type"
                    value={formData.leaveType}
                    onChange={(e) => handleChange('leaveType', e.target.value)}
                    required
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Reason"
                    placeholder="Please provide a reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    multiline
                    rows={4}
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Send />}
                    fullWidth
                  >
                    Submit Leave Request
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave History */}
        <Grid item xs={12} lg={6} size={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                Leave History
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {leaveRequests.map((request) => (
                  <Box
                    key={request.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                          {request.leaveType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(request.startDate).toLocaleDateString()} -{' '}
                          {new Date(request.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {getStatusChip(request.status)}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {request.reason}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Leave Balance Summary */}
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
                Leave Balance
              </Typography>
              <Grid container spacing={2} justifyContent={'center'}>
                <Grid item xs={4} size={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      15
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Vacation</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} size={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      10
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Sick Leave</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4} size={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      5
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Personal</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ApplyLeave;
