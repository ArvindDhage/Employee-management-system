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
  Assignment as AssignmentIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  CloudUpload as CloudUploadIcon,
  Notifications as NotificationsIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
  Event as EventIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const AssignTasks = () => {
  const [formData, setFormData] = useState({
    taskTitle: '',
    taskDescription: '',
    priority: '',
    taskType: '',
    assignToRole: '',
    department: '',
    selectedPerson: '',
    startDate: '',
    dueDate: '',
    estimatedTime: '',
    attachments: [],
    referenceLinks: [''],
    assignMultiple: false,
    notifyEmail: false,
    reminderDate: '',
    reminderTime: '',
    comments: ''
  });

  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Mock data for demonstration
  const mockUsers = {
    manager: [
      { id: 1, name: 'John Smith', department: 'Engineering', avatar: 'JS' },
      { id: 2, name: 'Sarah Johnson', department: 'Engineering', avatar: 'SJ' },
      { id: 3, name: 'Mike Wilson', department: 'Sales', avatar: 'MW' },
      { id: 4, name: 'Emily Brown', department: 'Marketing', avatar: 'EB' }
    ],
    hr: [
      { id: 5, name: 'Lisa Anderson', department: 'Human Resources', avatar: 'LA' },
      { id: 6, name: 'David Miller', department: 'Human Resources', avatar: 'DM' },
      { id: 7, name: 'Jennifer Davis', department: 'Human Resources', avatar: 'JD' }
    ]
  };

  const departments = [
    'Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'Human Resources'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4ade80' },
    { value: 'medium', label: 'Medium', color: '#facc15' },
    { value: 'high', label: 'High', color: '#f97316' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' }
  ];

  const taskTypes = [
    'Development', 'HR Activity', 'Operations', 'Other'
  ];

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

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({
      ...formData,
      assignToRole: role,
      department: '',
      selectedPerson: '',
      selectedAssignees: []
    });
  };

  const handleDepartmentChange = (e) => {
    const dept = e.target.value;
    setFormData({
      ...formData,
      department: dept,
      selectedPerson: '',
      selectedAssignees: []
    });
  };

  const handlePersonSelect = (e) => {
    const personId = e.target.value;
    setFormData({
      ...formData,
      selectedPerson: personId
    });

    if (personId && formData.assignToRole && formData.department) {
      const users = mockUsers[formData.assignToRole];
      const selectedUser = users.find(user => 
        user.id === parseInt(personId) && 
        user.department === formData.department
      );
      
      if (selectedUser && !selectedAssignees.find(a => a.id === selectedUser.id)) {
        setSelectedAssignees([...selectedAssignees, selectedUser]);
      }
    }
  };

  const removeAssignee = (userId) => {
    setSelectedAssignees(selectedAssignees.filter(assignee => assignee.id !== userId));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.referenceLinks];
    newLinks[index] = value;
    setFormData({
      ...formData,
      referenceLinks: newLinks
    });
  };

  const addLinkField = () => {
    setFormData({
      ...formData,
      referenceLinks: [...formData.referenceLinks, '']
    });
  };

  const removeLinkField = (index) => {
    const newLinks = formData.referenceLinks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      referenceLinks: newLinks
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.taskTitle.trim()) newErrors.taskTitle = 'Task title is required';
    if (!formData.taskDescription.trim()) newErrors.taskDescription = 'Task description is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.taskType) newErrors.taskType = 'Task type is required';
    if (!formData.assignToRole) newErrors.assignToRole = 'Assign to role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (formData.startDate && formData.dueDate && new Date(formData.dueDate) <= new Date(formData.startDate)) {
      newErrors.dueDate = 'Due date must be after start date';
    }
    if (!formData.estimatedTime) newErrors.estimatedTime = 'Estimated time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Task assigned:', { ...formData, selectedAssignees, uploadedFiles });
      setSuccessMessage(true);
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          taskTitle: '',
          taskDescription: '',
          priority: '',
          taskType: '',
          assignToRole: '',
          department: '',
          selectedPerson: '',
          startDate: '',
          dueDate: '',
          estimatedTime: '',
          attachments: [],
          referenceLinks: [''],
          assignMultiple: false,
          notifyEmail: false,
          reminderDate: '',
          reminderTime: '',
          comments: ''
        });
        setSelectedAssignees([]);
        setUploadedFiles([]);
      }, 2000);
    }
  };

  const handleSaveDraft = () => {
    console.log('Draft saved:', { ...formData, selectedAssignees, uploadedFiles });
    setSuccessMessage(true);
  };

  const getFilteredUsers = () => {
    if (!formData.assignToRole || !formData.department) return [];
    return mockUsers[formData.assignToRole].filter(user => 
      user.department === formData.department
    );
  };

  const getPriorityColor = (priority) => {
    const found = priorities.find(p => p.value === priority);
    return found ? found.color : '#64748b';
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
            Assign Task
          </Typography>
          <Typography variant="subtitle1" color="#64748b" sx={{ mt: 0.5 }}>
            Admin can assign tasks to Managers and HR only
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

      {/* Main Center Card */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card
          sx={{
            maxWidth: 900,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            bgcolor: 'white'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              {/* 1️⃣ Task Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Task Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Task Title"
                      value={formData.taskTitle}
                      onChange={handleInputChange('taskTitle')}
                      error={!!errors.taskTitle}
                      helperText={errors.taskTitle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TitleIcon sx={{ color: '#64748b' }} />
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Task Description"
                      multiline
                      rows={4}
                      value={formData.taskDescription}
                      onChange={handleInputChange('taskDescription')}
                      error={!!errors.taskDescription}
                      helperText={errors.taskDescription}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                            <DescriptionIcon sx={{ color: '#64748b' }} />
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
                    <FormControl fullWidth error={!!errors.priority}>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={formData.priority}
                        onChange={handleInputChange('priority')}
                        label="Priority"
                        startAdornment={
                          formData.priority && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              <FlagIcon sx={{ color: getPriorityColor(formData.priority), fontSize: 20 }} />
                            </Box>
                          )
                        }
                      >
                        {priorities.map(priority => (
                          <MenuItem key={priority.value} value={priority.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FlagIcon sx={{ color: priority.color, fontSize: 16 }} />
                              {priority.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.priority && <Typography variant="caption" color="error">{errors.priority}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.taskType}>
                      <InputLabel>Task Type</InputLabel>
                      <Select
                        value={formData.taskType}
                        onChange={handleInputChange('taskType')}
                        label="Task Type"
                        startAdornment={
                          <InputAdornment position="start">
                            <CategoryIcon sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        }
                      >
                        {taskTypes.map(type => (
                          <MenuItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.taskType && <Typography variant="caption" color="error">{errors.taskType}</Typography>}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* 2️⃣ Assignment Control */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Assignment Control
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth error={!!errors.assignToRole}>
                      <InputLabel>Assign To Role</InputLabel>
                      <Select
                        value={formData.assignToRole}
                        onChange={handleRoleChange}
                        label="Assign To Role"
                      >
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="hr">HR</MenuItem>
                      </Select>
                      {errors.assignToRole && <Typography variant="caption" color="error">{errors.assignToRole}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth error={!!errors.department}>
                      <InputLabel>Select Department</InputLabel>
                      <Select
                        value={formData.department}
                        onChange={handleDepartmentChange}
                        label="Select Department"
                        disabled={!formData.assignToRole}
                      >
                        {departments.map(dept => (
                          <MenuItem key={dept} value={dept.toLowerCase().replace(' ', '-')}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.department && <Typography variant="caption" color="error">{errors.department}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Select Person</InputLabel>
                      <Select
                        value={formData.selectedPerson}
                        onChange={handlePersonSelect}
                        label="Select Person"
                        disabled={!formData.assignToRole || !formData.department}
                      >
                        {getFilteredUsers().map(user => (
                          <MenuItem key={user.id} value={user.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: '#2563EB' }}>
                                {user.avatar}
                              </Avatar>
                              {user.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Selected Assignees Display */}
                {selectedAssignees.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="#64748b" mb={2}>
                      Selected Assignees:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {selectedAssignees.map(assignee => (
                        <Card
                          key={assignee.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 2
                          }}
                        >
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: '#2563EB' }}>
                            {assignee.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {assignee.name}
                            </Typography>
                            <Typography variant="caption" color="#64748b">
                              {assignee.department}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => removeAssignee(assignee.id)}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* 3️⃣ Timeline */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Timeline
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      value={formData.startDate}
                      onChange={handleInputChange('startDate')}
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon sx={{ color: '#64748b' }} />
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
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Due Date"
                      value={formData.dueDate}
                      onChange={handleInputChange('dueDate')}
                      error={!!errors.dueDate}
                      helperText={errors.dueDate}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScheduleIcon sx={{ color: '#64748b' }} />
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
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Estimated Time"
                      value={formData.estimatedTime}
                      onChange={handleInputChange('estimatedTime')}
                      error={!!errors.estimatedTime}
                      helperText={errors.estimatedTime}
                      placeholder="e.g., 2 hours, 3 days"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon sx={{ color: '#64748b' }} />
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

              {/* 4️⃣ Task Attachments */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Task Attachments
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
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
                      <Typography variant="body1" color="#1e293b" mb={1}>
                        Upload Files
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        Drag & drop or click to upload
                      </Typography>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                    </Paper>
                    {uploadedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => removeFile(index)}
                        sx={{ mt: 1, mr: 1 }}
                      />
                    ))}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="#1e293b" mb={2}>
                      Reference Links
                    </Typography>
                    {formData.referenceLinks.map((link, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Add reference link"
                          value={link}
                          onChange={(e) => handleLinkChange(index, e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LinkIcon sx={{ fontSize: 16, color: '#64748b' }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        {formData.referenceLinks.length > 1 && (
                          <IconButton size="small" onClick={() => removeLinkField(index)}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addLinkField}
                      sx={{ mt: 1 }}
                    >
                      Add Link
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* 5️⃣ Advanced Options */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>
                  Advanced Options
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.assignMultiple}
                          onChange={(e) => setFormData({ ...formData, assignMultiple: e.target.checked })}
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
                      label="Assign Multiple People"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notifyEmail}
                          onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
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
                      label="Notify via Email"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Set Reminder"
                      value={formData.reminderDate && formData.reminderTime ? `${formData.reminderDate}T${formData.reminderTime}` : ''}
                      onChange={(e) => {
                        const dateTime = e.target.value;
                        if (dateTime) {
                          const [date, time] = dateTime.split('T');
                          setFormData({ ...formData, reminderDate: date, reminderTime: time });
                        } else {
                          setFormData({ ...formData, reminderDate: '', reminderTime: '' });
                        }
                      }}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#2563EB' },
                          '&.Mui-focused fieldset': { borderColor: '#2563EB' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Add Comments"
                      multiline
                      rows={3}
                      value={formData.comments}
                      onChange={handleInputChange('comments')}
                      placeholder="Additional comments or instructions..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                            <CommentIcon sx={{ color: '#64748b' }} />
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
                  onClick={handleSaveDraft}
                  sx={{ 
                    borderColor: '#cbd5e1',
                    color: '#64748b',
                    '&:hover': {
                      borderColor: '#94a3b8',
                      bgcolor: '#f8fafc'
                    }
                  }}
                >
                  Save as Draft
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
                  Assign Task
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
          Task assigned successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignTasks;