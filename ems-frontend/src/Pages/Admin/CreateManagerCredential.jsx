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
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Paper,
  Chip,
  Badge
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as CloudUploadIcon,
  Notifications as NotificationsIcon,
  AssignmentInd as AssignmentIndIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';

const CreateManagerCredential = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    managerId: 'MGR' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    teamSize: '',
    joiningDate: '',
    permissions: {
      assignTasks: false,
      approveLeaves: false,
      viewTeamReports: false,
      editTeamDetails: false
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleInputChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handlePermissionChange = (permission) => (e) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: e.target.checked
      }
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0: return 'grey';
      case 1: return 'red';
      case 2: return 'orange';
      case 3: return 'yellow';
      case 4: return 'green';
      default: return 'grey';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.teamSize) newErrors.teamSize = 'Team size is required';
    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setSuccessMessage(true);
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          managerId: 'MGR' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          username: '',
          password: '',
          confirmPassword: '',
          role: '',
          department: '',
          teamSize: '',
          joiningDate: '',
          permissions: {
            assignTasks: false,
            approveLeaves: false,
            viewTeamReports: false,
            editTeamDetails: false
          }
        });
        setUploadedFile(null);
      }, 2000);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      managerId: 'MGR' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
      teamSize: '',
      joiningDate: '',
      permissions: {
        assignTasks: false,
        approveLeaves: false,
        viewTeamReports: false,
        editTeamDetails: false
      }
    });
    setErrors({});
    setUploadedFile(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
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
            Create Manager Credential
          </Typography>
          <Typography variant="subtitle1" color="#64748b" sx={{ mt: 0.5 }}>
            Admin can create login credentials for Managers
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon sx={{ color: '#64748b' }} />
            </Badge>
          </IconButton>
          <Avatar sx={{ bgcolor: '#2563EB', width: 40, height: 40 }}>
            AD
          </Avatar>
        </Box>
      </Box>

      {/* Centered Main Card */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card
          sx={{
            maxWidth: 800,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            bgcolor: 'white'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              {/* 1️⃣ Manager Basic Info */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Manager Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange('fullName')}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#64748b' }} />
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#64748b' }} />
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange('phoneNumber')}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#64748b' }} />
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Manager ID"
                      value={formData.managerId}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .Mui-disabled': {
                          bgcolor: '#f1f5f9',
                          borderRadius: 1
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* 2️⃣ Login Credentials */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Login Credentials
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={formData.username}
                      onChange={handleInputChange('username')}
                      error={!!errors.username}
                      helperText={errors.username}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AssignmentIndIcon sx={{ color: '#64748b' }} />
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      error={!!errors.password}
                      helperText={errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
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
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          {[1, 2, 3, 4].map((level) => (
                            <Box
                              key={level}
                              sx={{
                                flex: 1,
                                height: 4,
                                bgcolor: level <= getPasswordStrength(formData.password) 
                                  ? getStrengthColor(getPasswordStrength(formData.password)) 
                                  : '#e2e8f0',
                                borderRadius: 1,
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </Box>
                        <Typography variant="caption" color="#64748b">
                          Password strength: {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][getPasswordStrength(formData.password)]}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
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
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* 3️⃣ Role & Department */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Role & Department
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={formData.role}
                        onChange={handleInputChange('role')}
                        label="Role"
                      >
                        <MenuItem value="team-manager">Team Manager</MenuItem>
                        <MenuItem value="project-manager">Project Manager</MenuItem>
                        <MenuItem value="operations-manager">Operations Manager</MenuItem>
                      </Select>
                      {errors.role && <Typography variant="caption" color="error">{errors.role}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.department}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={formData.department}
                        onChange={handleInputChange('department')}
                        label="Department"
                      >
                        <MenuItem value="engineering">Engineering</MenuItem>
                        <MenuItem value="sales">Sales</MenuItem>
                        <MenuItem value="marketing">Marketing</MenuItem>
                        <MenuItem value="operations">Operations</MenuItem>
                        <MenuItem value="finance">Finance</MenuItem>
                        <MenuItem value="human-resources">Human Resources</MenuItem>
                      </Select>
                      {errors.department && <Typography variant="caption" color="error">{errors.department}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Team Size"
                      value={formData.teamSize}
                      onChange={handleInputChange('teamSize')}
                      error={!!errors.teamSize}
                      helperText={errors.teamSize}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GroupsIcon sx={{ color: '#64748b' }} />
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Joining Date"
                      value={formData.joiningDate}
                      onChange={handleInputChange('joiningDate')}
                      error={!!errors.joiningDate}
                      helperText={errors.joiningDate}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#2563EB' },
                          '&.Mui-focused fieldset': { borderColor: '#2563EB' }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* 4️⃣ Permissions */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Permissions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.permissions.assignTasks}
                          onChange={handlePermissionChange('assignTasks')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#2563EB',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#2563EB',
                            },
                          }}
                        />
                      }
                      label="Assign Tasks"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.permissions.approveLeaves}
                          onChange={handlePermissionChange('approveLeaves')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#2563EB',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#2563EB',
                            },
                          }}
                        />
                      }
                      label="Approve Leaves"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.permissions.viewTeamReports}
                          onChange={handlePermissionChange('viewTeamReports')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#2563EB',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#2563EB',
                            },
                          }}
                        />
                      }
                      label="View Team Reports"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.permissions.editTeamDetails}
                          onChange={handlePermissionChange('editTeamDetails')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#2563EB',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#2563EB',
                            },
                          }}
                        />
                      }
                      label="Edit Team Details"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* 5️⃣ Upload Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Upload Documents
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      sx={{
                        p: 3,
                        border: '2px dashed #cbd5e1',
                        borderRadius: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#2563EB',
                          bgcolor: '#f8fafc'
                        }
                      }}
                      onClick={() => document.getElementById('profile-upload').click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
                      <Typography variant="body1" color="#1e293b" mb={1}>
                        Profile Photo
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        Drag & drop or click to upload
                      </Typography>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </Paper>
                    {uploadedFile && (
                      <Chip
                        label={uploadedFile.name}
                        onDelete={() => setUploadedFile(null)}
                        sx={{ mt: 2 }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      sx={{
                        p: 3,
                        border: '2px dashed #cbd5e1',
                        borderRadius: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#2563EB',
                          bgcolor: '#f8fafc'
                        }
                      }}
                      onClick={() => document.getElementById('document-upload').click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
                      <Typography variant="body1" color="#1e293b" mb={1}>
                        Optional Documents
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        Upload additional documents (PDF, DOC)
                      </Typography>
                      <input
                        id="document-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* 🎯 Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="text"
                  onClick={() => console.log('Cancel clicked')}
                  sx={{ color: '#64748b' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  sx={{ 
                    borderColor: '#cbd5e1',
                    color: '#64748b',
                    '&:hover': {
                      borderColor: '#94a3b8',
                      bgcolor: '#f8fafc'
                    }
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: '#2563EB',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#1d4ed8'
                    }
                  }}
                >
                  Create Manager Account
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Manager account created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateManagerCredential;