import React, { useState } from 'react';
import ManagerSidebar from '../../Components/Layout/ManagerSidebar';

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Badge
} from '@mui/material';

import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AssignmentLate as AssignmentLateIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

/* ---------------- MOCK DATA ---------------- */

const teamsData = [
  {
    id: 1,
    name: 'Frontend Development',
    department: 'Engineering',
    status: 'active',
    teamLead: { name: 'Alex Johnson', avatar: 'AJ' },
    tasks: { total: 24, completed: 18, pending: 6 }
  },
  {
    id: 2,
    name: 'Backend Services',
    department: 'Engineering',
    status: 'active',
    teamLead: { name: 'Maria Garcia', avatar: 'MG' },
    tasks: { total: 32, completed: 25, pending: 7 }
  },
  {
    id: 3,
    name: 'UI/UX Design',
    department: 'Design',
    status: 'inactive',
    teamLead: { name: 'Sam Wilson', avatar: 'SW' },
    tasks: { total: 15, completed: 10, pending: 5 }
  }
];

/* ---------------- COMPONENT ---------------- */

const Teams = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleDeleteClick = (team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting team:', selectedTeam?.name);
    setDeleteDialogOpen(false);
    setSelectedTeam(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedTeam(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff' }}>
      <ManagerSidebar />

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        {/* HEADER */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Teams
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage and oversee all teams across your organization
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar sx={{ bgcolor: 'primary.main' }}>AD</Avatar>
          </Box>
        </Box>

        {/* SEARCH & FILTER */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <TextField
            size="small"
            placeholder="Search by team name..."
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select defaultValue="all">
                <MenuItem value="all">All Teams</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select defaultValue="name">
                <MenuItem value="name">Team Name</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="tasks">Task Count</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* TEAMS GRID */}
        <Grid container spacing={3}>
          {teamsData.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { boxShadow: 4 }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {team.name}
                    </Typography>

                    <Chip
                      size="small"
                      label={team.status === 'active' ? 'Active' : 'Inactive'}
                      color={team.status === 'active' ? 'success' : 'default'}
                      icon={
                        team.status === 'active' ? (
                          <CheckCircleIcon />
                        ) : (
                          <CancelIcon />
                        )
                      }
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {team.department}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {team.teamLead.avatar}
                    </Avatar>
                    <Typography variant="body2">
                      <strong>Lead:</strong> {team.teamLead.name}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 3,
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <TaskStat icon={<AssignmentIcon />} value={team.tasks.total} label="Total" />
                    <TaskStat
                      icon={<AssignmentTurnedInIcon color="success" />}
                      value={team.tasks.completed}
                      label="Done"
                    />
                    <TaskStat
                      icon={<AssignmentLateIcon color="warning" />}
                      value={team.tasks.pending}
                      label="Pending"
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Button size="small" startIcon={<ViewIcon />}>
                    View Details
                  </Button>

                  <Box>
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(team)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* DELETE DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedTeam?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ---------------- SMALL COMPONENT ---------------- */

const TaskStat = ({ icon, value, label }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {icon}
      <Typography variant="body2">{value}</Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default Teams;
