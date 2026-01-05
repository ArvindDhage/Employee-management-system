import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  HourglassBottom as InProgressIcon,
  Task as TaskIcon
} from '@mui/icons-material';

// Mock data for tasks
const mockTasks = [
  {
    id: 1,
    name: 'Complete project proposal',
    assignedTo: { name: 'John Doe', avatar: 'JD' },
    priority: 'High',
    dueDate: '2025-02-15',
    status: 'Pending'
  },
  {
    id: 2,
    name: 'Review code changes',
    assignedTo: { name: 'Jane Smith', avatar: 'JS' },
    priority: 'Medium',
    dueDate: '2025-02-10',
    status: 'In Progress'
  },
  {
    id: 3,
    name: 'Update documentation',
    assignedTo: { name: 'Robert Johnson', avatar: 'RJ' },
    priority: 'Low',
    dueDate: '2025-02-20',
    status: 'Completed'
  }
];

const Tasks = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');

  // Filter tasks based on search and filters
  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All Priority' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get priority chip color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  // Get status chip color and icon
  const getStatusProps = (status) => {
    switch (status) {
      case 'Completed':
        return { color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
      case 'In Progress':
        return { color: 'info', icon: <InProgressIcon fontSize="small" /> };
      case 'Pending':
      default:
        return { color: 'default', icon: <PendingIcon fontSize="small" /> };
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3, bgcolor: '#f5f7fb' }}>
      <Container maxWidth="xl">
        {/* Page Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/manager/dashboard')}
              sx={{ mb: 1, textTransform: 'none' }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Tasks
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Create, assign, and track tasks for your team
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => console.log('Create Task clicked')}
          >
            Create Task
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Total Tasks', value: mockTasks.length, color: 'primary.main' },
            { 
              title: 'Pending Tasks', 
              value: mockTasks.filter(t => t.status === 'Pending').length,
              color: 'warning.main'
            },
            { 
              title: 'In Progress', 
              value: mockTasks.filter(t => t.status === 'In Progress').length,
              color: 'info.main'
            },
            { 
              title: 'Completed Tasks', 
              value: mockTasks.filter(t => t.status === 'Completed').length,
              color: 'success.main'
            }
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        bgcolor: `${item.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TaskIcon sx={{ color: item.color }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {item.value}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search & Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder="Search task by name"
              variant="outlined"
              size="small"
              sx={{ flex: 1, minWidth: 250 }}
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
              sx={{ minWidth: 180 }}
            >
              {['All Status', 'Pending', 'In Progress', 'Completed'].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {['All Priority', 'High', 'Medium', 'Low'].map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Paper>

        {/* Tasks Table */}
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Assigned Employee</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => {
                  const statusProps = getStatusProps(task.status);
                  return (
                    <TableRow 
                      key={task.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight="medium">{task.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              fontSize: '0.75rem',
                              bgcolor: 'primary.main' 
                            }}
                          >
                            {task.assignedTo.avatar}
                          </Avatar>
                          {task.assignedTo.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.priority}
                          color={getPriorityColor(task.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusProps.icon}
                          label={task.status}
                          color={statusProps.color}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Tooltip title="View">
                            <IconButton size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default Tasks;