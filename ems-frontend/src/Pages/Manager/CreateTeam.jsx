import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  Button,
  Paper,
  Switch,
  Grid,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  GroupAdd as GroupAddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import ManagerSidebar from '../../Components/Layout/ManagerSidebar';

const departments = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Operations',
];

const teamMembers = [
  { id: 1, name: 'John Doe', role: 'Senior Developer', avatar: 'JD' },
  { id: 2, name: 'Jane Smith', role: 'UI/UX Designer', avatar: 'JS' },
  { id: 3, name: 'Robert Johnson', role: 'Project Manager', avatar: 'RJ' },
  { id: 4, name: 'Emily Davis', role: 'QA Engineer', avatar: 'ED' },
  { id: 5, name: 'Michael Brown', role: 'Frontend Developer', avatar: 'MB' },
  { id: 6, name: 'Sarah Wilson', role: 'Backend Developer', avatar: 'SW' },
  { id: 7, name: 'David Miller', role: 'DevOps Engineer', avatar: 'DM' },
  { id: 8, name: 'Lisa Anderson', role: 'Product Owner', avatar: 'LA' },
];

/* 🔥 COMMON RECTANGLE STYLE (IMPORTANT) */
const commonFieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 40,
    borderRadius: '6px',
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 14px',
  },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    height: '40px',
  },
};

const CreateTeam = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);

  const [formData, setFormData] = useState({
    teamName: '',
    department: '',
    teamType: '',
    teamLead: '',
    description: '',
    members: [],
    isActive: true,
  });

  const teamTypes = ['Development', 'Design', 'Marketing', 'Operations', 'Support'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value,
    }));
  };

  const handleMemberSelect = (e) => {
    const { value } = e.target;
    const newMembers = typeof value === 'string' ? value.split(',') : value;
    setFormData(prev => ({
      ...prev,
      members: newMembers
    }));
    
    // Set the first selected member as selectedMember if not set
    if (newMembers.length > 0 && !selectedMember) {
      const firstMember = teamMembers.find(m => m.id === newMembers[0]);
      setSelectedMember(firstMember);
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Submit logic here
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ManagerSidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f9fafb' }}>
        <Paper
          sx={{
            p: 4,
            maxWidth: 1200,
            mx: 'auto',
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06)',
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ mb: 2, textTransform: 'none' }}
            >
              Back
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon color="primary" sx={{ fontSize: 32, mr: 1.5 }} />
              <Typography variant="h4" fontWeight={600}>
                Create Team
              </Typography>
            </Box>

            <Typography color="text.secondary">
              Create and manage teams easily
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            <Box sx={{ mb: 4 }}>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Team Name"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                

                
              </Grid>
            </Box>

            {/* Step 2: Team Status */}
            <Box sx={{ mb: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  maxWidth: 400
                }}
              >
                <Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {formData.isActive ? 'Active' : 'Inactive'} team
                  </Typography>
                </Box>
                <Switch
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  color="primary"
                />
              </Paper>
            </Box>

            {/* Step 3: Team Description */}
            <Box sx={{ mb: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
             
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Describe the team's purpose and objectives"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Box>

            {/* Step 4: Team Structure */}
            <Box sx={{ mb: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
             
              <Grid container spacing={5}>
                {/* Department Card */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 6,
                      height: '30%',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Department
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                      <InputLabel>Select Department</InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        label="Select Department"
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Paper>
                </Grid>

                {/* Team Lead Card */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 6,
                      height: '30%',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Team Lead
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                      <InputLabel>Select Team Lead</InputLabel>
                      <Select
                        name="teamLead"
                        value={formData.teamLead}
                        onChange={handleChange}
                        label="Select Team Lead"
                      >
                        {teamMembers.map((member) => (
                          <MenuItem key={member.id} value={member.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                {member.avatar}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">{member.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {member.role}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Step 5: Team Members */}
            <Box sx={{ mb: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3,
                  
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Grid container spacing={2}>
                  {/* Left Side - Team Members List */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Select Team Members</Typography>
                    <Paper 
                      variant="outlined"
                      sx={{
                        p:3,
                        maxHeight: 300,
                        
                        height: '100%',
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1
                      }}
                    >
                      {teamMembers.map((member) => (
                        <Box 
                          key={member.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: formData.members.includes(member.id) ? 'action.selected' : 'transparent',
                            '&:hover': {
                              bgcolor: 'action.hover',
                              cursor: 'pointer'
                            }
                          }}
                          onClick={() => {
                            const currentIndex = formData.members.indexOf(member.id);
                            const newMembers = [...formData.members];
                            
                            if (currentIndex === -1) {
                              newMembers.push(member.id);
                            } else {
                              newMembers.splice(currentIndex, 1);
                            }
                            
                            setFormData({ ...formData, members: newMembers });
                            setSelectedMember(member);
                          }}
                        >
                          <Checkbox 
                            checked={formData.members.includes(member.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => {
                              const currentIndex = formData.members.indexOf(member.id);
                              const newMembers = [...formData.members];
                              
                              if (currentIndex === -1) {
                                newMembers.push(member.id);
                              } else {
                                newMembers.splice(currentIndex, 1);
                              }
                              
                              setFormData({ ...formData, members: newMembers });
                              setSelectedMember(member);
                            }}
                            size="small"
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1.5 }}>
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                fontSize: '0.875rem',
                                mr: 2,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText'
                              }}
                            >
                              {member.avatar}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={500}>
                                {member.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {member.role}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Paper>
                    
                    {/* Selected Members Chips */}
                    {formData.members.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Selected members: {formData.members.length}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {formData.members.map((memberId) => {
                            const member = teamMembers.find(m => m.id === memberId);
                            return member ? (
                              <Chip
                                key={memberId}
                                label={member.name}
                                size="small"
                                onDelete={() => {
                                  const newMembers = formData.members.filter(id => id !== memberId);
                                  setFormData({ ...formData, members: newMembers });
                                }}
                                sx={{ 
                                  '& .MuiChip-deleteIcon': {
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'error.main',
                                    },
                                  },
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  }
                                }}
                              />
                            ) : null;
                          })}
                        </Box>
                      </Box>
                    )}
                  </Grid>

                  {/* Right Side - Member Details */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {selectedMember ? 'Member Details' : 'Select a Team Member'}
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3,
                        height: '80%',
                        minHeight: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 2
                      }}
                    >
                      {selectedMember ? (
                        <>
                          <Avatar 
                            sx={{ 
                              width: 64, 
                              height: 64, 
                              fontSize: '1.5rem',
                              mb: 2,
                              bgcolor: 'primary.main'
                            }}
                          >
                            {selectedMember.avatar}
                          </Avatar>
                          <Typography variant="h6" gutterBottom>
                            {selectedMember.name}
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={500} gutterBottom>
                            {selectedMember.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '80%' }}>
                            {selectedMember.name} is a {selectedMember.role.toLowerCase()} with expertise in their field.
                            They have been with the company for 2 years and have contributed to multiple projects.
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => {
                                // View profile logic here
                              }}
                            >
                              View Profile
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => {
                                // Contact logic here
                              }}
                            >
                              Contact
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <>
                          <PeopleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                          <Typography variant="body1" color="text.secondary">
                            Select a team member to view details
                          </Typography>
                        </>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 3,
              mt: 4,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => {}}
                  sx={{ textTransform: 'none' }}
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  startIcon={<GroupAddIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Create Team
                </Button>
              </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateTeam;
