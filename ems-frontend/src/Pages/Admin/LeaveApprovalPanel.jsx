import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Snackbar,
  Paper,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  EventNote as EventNoteIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const LeaveApprovalPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Mock data for demonstration
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'HR',
      department: 'Human Resources',
      avatar: 'SJ',
      leaveType: 'Sick Leave',
      fromDate: '2024-03-25',
      toDate: '2024-03-27',
      days: 3,
      reason: 'Experiencing high fever and doctor advised complete rest for 3 days. Have attached medical certificate.',
      status: 'pending',
      appliedDate: '2024-03-20',
      attachments: ['medical_certificate.pdf']
    },
    {
      id: 2,
      name: 'Mike Wilson',
      role: 'Manager',
      department: 'Sales',
      avatar: 'MW',
      leaveType: 'Casual Leave',
      fromDate: '2024-03-28',
      toDate: '2024-03-29',
      days: 2,
      reason: 'Personal family function out of town. Need to attend wedding ceremony.',
      status: 'pending',
      appliedDate: '2024-03-21',
      attachments: []
    },
    {
      id: 3,
      name: 'Lisa Anderson',
      role: 'HR',
      department: 'Human Resources',
      avatar: 'LA',
      leaveType: 'Paid Leave',
      fromDate: '2024-03-22',
      toDate: '2024-03-24',
      days: 3,
      reason: 'Annual vacation with family. Planned trip to beach resort.',
      status: 'approved',
      appliedDate: '2024-03-15',
      attachments: []
    },
    {
      id: 4,
      name: 'David Miller',
      role: 'HR',
      department: 'Human Resources',
      avatar: 'DM',
      leaveType: 'Sick Leave',
      fromDate: '2024-03-21',
      toDate: '2024-03-21',
      days: 1,
      reason: 'Dental appointment for root canal treatment.',
      status: 'rejected',
      appliedDate: '2024-03-20',
      attachments: []
    },
    {
      id: 5,
      name: 'Emily Brown',
      role: 'Manager',
      department: 'Marketing',
      avatar: 'EB',
      leaveType: 'Casual Leave',
      fromDate: '2024-03-30',
      toDate: '2024-04-02',
      days: 4,
      reason: 'Moving to new apartment. Need to handle packing and shifting.',
      status: 'pending',
      appliedDate: '2024-03-22',
      attachments: []
    }
  ]);

  // Calculate summary statistics
  const summaryStats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(req => req.status === 'pending').length,
    approved: leaveRequests.filter(req => req.status === 'approved').length,
    rejected: leaveRequests.filter(req => req.status === 'rejected').length
  };

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toString().includes(searchTerm);
    const matchesRole = roleFilter === 'all' || request.role.toLowerCase() === roleFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleApprove = (requestId) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      )
    );
    setSuccessMessage('Leave request approved successfully!');
    setShowSnackbar(true);
  };

  const handleReject = (requestId) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
    setSuccessMessage('Leave request rejected!');
    setShowSnackbar(true);
  };

  const handleBulkApprove = () => {
    const pendingSelected = selectedRequests.filter(id => 
      leaveRequests.find(req => req.id === id && req.status === 'pending')
    );
    
    setLeaveRequests(prev => 
      prev.map(req => 
        pendingSelected.includes(req.id) ? { ...req, status: 'approved' } : req
      )
    );
    setSelectedRequests([]);
    setSuccessMessage(`${pendingSelected.length} leave requests approved!`);
    setShowSnackbar(true);
  };

  const handleBulkReject = () => {
    const pendingSelected = selectedRequests.filter(id => 
      leaveRequests.find(req => req.id === id && req.status === 'pending')
    );
    
    setLeaveRequests(prev => 
      prev.map(req => 
        pendingSelected.includes(req.id) ? { ...req, status: 'rejected' } : req
      )
    );
    setSelectedRequests([]);
    setSuccessMessage(`${pendingSelected.length} leave requests rejected!`);
    setShowSnackbar(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
    setAdminComment('');
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedRequest(null);
    setAdminComment('');
  };

  const handleApproveFromModal = () => {
    if (selectedRequest) {
      handleApprove(selectedRequest.id);
      handleCloseModal();
    }
  };

  const handleRejectFromModal = () => {
    if (selectedRequest) {
      handleReject(selectedRequest.id);
      handleCloseModal();
    }
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'pending': return '#fef3c7';
      case 'approved': return '#d1fae5';
      case 'rejected': return '#fee2e2';
      default: return '#f1f5f9';
    }
  };

  const getRoleColor = (role) => {
    return role === 'HR' ? '#2563EB' : '#7c3aed';
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          px: 2
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e293b">
            Leave Approval Panel
          </Typography>
          <Typography variant="subtitle1" color="#64748b" sx={{ mt: 0.5 }}>
            Admin can review and approve/reject leave requests from HR and Managers
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <Badge badgeContent={5} color="error">
              <NotificationsIcon sx={{ color: '#64748b' }} />
            </Badge>
          </IconButton>
          <Avatar sx={{ bgcolor: '#2563EB', width: 40, height: 40 }}>
            AD
          </Avatar>
        </Box>
      </Box>

      {/* Summary Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#2563EB', width: 48, height: 48 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#1e293b">
                    {summaryStats.total}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Total Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b', width: 48, height: 48 }}>
                  <AccessTimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#1e293b">
                    {summaryStats.pending}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#1e293b">
                    {summaryStats.approved}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Approved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#ef4444', width: 48, height: 48 }}>
                  <CancelIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#1e293b">
                    {summaryStats.rejected}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Rejected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Search Section */}
      <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by Name / ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#2563EB' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Date</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  label="Date"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ 
                  borderColor: '#cbd5e1',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: '#f8fafc'
                  }
                }}
              >
                More Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1, mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="#64748b">
                {selectedRequests.length} selected
              </Typography>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleBulkApprove}
                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
              >
                Approve Selected
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleBulkReject}
                sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
              >
                Reject Selected
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => setSelectedRequests([])}
                sx={{ color: '#64748b' }}
              >
                Clear Selection
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Leave Requests List */}
      <Card sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 0 }}>
          {filteredRequests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="#64748b" mb={1}>
                No leave requests found
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Try adjusting your filters or search criteria
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      sx={{
                        '&:hover': { bgcolor: '#f8fafc' },
                        transition: 'bgcolor 0.2s ease'
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRequests.includes(request.id)}
                          onChange={() => handleSelectRequest(request.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563EB' }}>
                            {request.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium" color="#1e293b">
                              {request.name}
                            </Typography>
                            <Typography variant="caption" color="#64748b">
                              ID: EMP{request.id.toString().padStart(4, '0')}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.role}
                          size="small"
                          sx={{
                            bgcolor: getRoleColor(request.role) + '20',
                            color: getRoleColor(request.role),
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#64748b">
                          {request.department}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#1e293b">
                          {request.leaveType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="body2" color="#64748b">
                            {request.fromDate} → {request.toDate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium" color="#1e293b">
                          {request.days} days
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: getStatusBgColor(request.status),
                            color: getStatusColor(request.status),
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(request)}
                            sx={{ color: '#64748b' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleApprove(request.id)}
                                sx={{
                                  bgcolor: '#10b981',
                                  color: 'white',
                                  minWidth: 'auto',
                                  px: 1,
                                  '&:hover': { bgcolor: '#059669' }
                                }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleReject(request.id)}
                                sx={{
                                  bgcolor: '#ef4444',
                                  color: 'white',
                                  minWidth: 'auto',
                                  px: 1,
                                  '&:hover': { bgcolor: '#dc2626' }
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </Button>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {selectedRequest && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold" color="#1e293b">
                Leave Request Details
              </Typography>
              <IconButton onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: '#2563EB' }}>
                      {selectedRequest.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="medium" color="#1e293b">
                        {selectedRequest.name}
                      </Typography>
                      <Typography variant="body2" color="#64748b">
                        ID: EMP{selectedRequest.id.toString().padStart(4, '0')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      label={selectedRequest.role}
                      sx={{
                        bgcolor: getRoleColor(selectedRequest.role) + '20',
                        color: getRoleColor(selectedRequest.role),
                        fontWeight: 'medium',
                        mb: 1
                      }}
                    />
                    <br />
                    <Chip
                      label={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      sx={{
                        bgcolor: getStatusBgColor(selectedRequest.status),
                        color: getStatusColor(selectedRequest.status),
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="#64748b" gutterBottom>
                    Department
                  </Typography>
                  <Typography variant="body1" color="#1e293b">
                    {selectedRequest.department}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="#64748b" gutterBottom>
                    Leave Type
                  </Typography>
                  <Typography variant="body1" color="#1e293b">
                    {selectedRequest.leaveType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="#64748b" gutterBottom>
                    Duration
                  </Typography>
                  <Typography variant="body1" color="#1e293b">
                    {selectedRequest.fromDate} → {selectedRequest.toDate}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    {selectedRequest.days} days
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="#64748b" gutterBottom>
                    Applied Date
                  </Typography>
                  <Typography variant="body1" color="#1e293b">
                    {selectedRequest.appliedDate}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="#64748b" gutterBottom>
                    Reason
                  </Typography>
                  <Typography variant="body1" color="#1e293b">
                    {selectedRequest.reason}
                  </Typography>
                </Grid>
                {selectedRequest.attachments.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="#64748b" gutterBottom>
                      Attachments
                    </Typography>
                    {selectedRequest.attachments.map((attachment, index) => (
                      <Chip
                        key={index}
                        label={attachment}
                        icon={<DescriptionIcon />}
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Grid>
                )}
                {selectedRequest.status === 'pending' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Admin Comment (Optional)"
                      multiline
                      rows={3}
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Add any comments or remarks..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#2563EB' },
                          '&.Mui-focused fieldset': { borderColor: '#2563EB' }
                        }
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseModal} sx={{ color: '#64748b' }}>
                Close
              </Button>
              {selectedRequest.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleRejectFromModal}
                    sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleApproveFromModal}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveApprovalPanel;