import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Event as CalendarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Mock data for the leave requests
const mockLeaveRequests = [
  {
    id: 1,
    employee: { name: 'John Doe', avatar: 'JD' },
    leaveType: 'Casual',
    reason: 'Family function',
    startDate: '2025-02-15',
    endDate: '2025-02-17',
    status: 'Pending'
  },
  {
    id: 2,
    employee: { name: 'Jane Smith', avatar: 'JS' },
    leaveType: 'Sick',
    reason: 'Medical appointment',
    startDate: '2025-02-10',
    endDate: '2025-02-10',
    status: 'Approved'
  },
  {
    id: 3,
    employee: { name: 'Robert Johnson', avatar: 'RJ' },
    leaveType: 'Paid',
    reason: 'Vacation',
    startDate: '2025-03-01',
    endDate: '2025-03-10',
    status: 'Rejected'
  },
  {
    id: 4,
    employee: { name: 'Emily Davis', avatar: 'ED' },
    leaveType: 'Casual',
    reason: 'Personal work',
    startDate: '2025-02-20',
    endDate: '2025-02-21',
    status: 'Pending'
  }
];

const TeamLeave = () => {
  const navigate = useNavigate(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter leave requests based on search and status
  const filteredLeaves = mockLeaveRequests.filter(leave => {
    const matchesSearch = 
      leave.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle approve leave
  const handleApprove = (id) => {
    console.log(`Approved leave with id: ${id}`);
    // In a real app, you would update the status via an API call
  };

  // Handle reject leave
  const handleReject = (id) => {
    console.log(`Rejected leave with id: ${id}`);
    // In a real app, you would update the status via an API call
  };

  // Get chip color based on leave type
  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Casual': return 'primary';
      case 'Sick': return 'secondary';
      case 'Paid': return 'success';
      default: return 'default';
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box mb={4}>
         <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/manager/dashboard')}
          sx={{ mb: 1, textTransform: 'none' }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Team Leaves
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Manage and review all leave requests across your team.
        </Typography>
      </Box>

      {/* Search & Filter Section */}
      <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search by employee name or reason..."
              variant="outlined"
              size="small"
              fullWidth
              sx={{ maxWidth: 500 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell>Employee</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeaves.map((leave) => (
              <TableRow 
                key={leave.id} 
                hover 
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {leave.employee.avatar}
                    </Avatar>
                    {leave.employee.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={leave.leaveType}
                    color={getLeaveTypeColor(leave.leaveType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarIcon color="action" fontSize="small" />
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={leave.status}
                    color={getStatusColor(leave.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" gap={1} justifyContent="flex-end">
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <VisibilityIcon color="info" />
                      </IconButton>
                    </Tooltip>
                    
                    {leave.status === 'Pending' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton 
                            size="small" 
                            onClick={() => handleApprove(leave.id)}
                            sx={{ color: 'success.main' }}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton 
                            size="small" 
                            onClick={() => handleReject(leave.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TeamLeave;