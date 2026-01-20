import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Typography, 
  Paper, 
  InputAdornment,
  IconButton
} from '@mui/material';
import { Person as PersonIcon, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import logo from '../Assets/image.png';

// Watermark component
const Watermark = ({ position }) => (
  <Box 
    component="img"
    src={logo}
    alt="EMS Logo"
    sx={{
      position: 'absolute',
      opacity: 0.1,
      width: 120,
      height: 'auto',
      ...position
    }}
  />
);

const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
  position: 'relative',
  overflow: 'hidden',
}));

const LeftPanel = styled(Paper)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(6),
  borderRadius: '28px 0 0 28px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    borderRadius: 0,
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(8),
  background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
  color: 'white',
  borderRadius: '0 28px 28px 0',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const LoginCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 420,
  padding: theme.spacing(5),
  borderRadius: 24,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await axios.post(
      'http://localhost:8080/auth/login',
      {
        username: formData.username,
        password: formData.password
      },
      { withCredentials: true } 
    );

    const user = response.data;
    console.log('Login success:', user);

    
    if (!user.roles) {
      setError('Login failed: no roles returned from server');
      return;
    }

    
    switch (user.roles.toLowerCase()) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'hr':
        navigate('/hr/dashboard');
        break;
      case 'manager':
        navigate('/manager/dashboard');
        break;
      default:
        setError('Unknown role');
    }

    localStorage.setItem('token', user.token);
    localStorage.setItem('username', user.username);

  } catch (err) {
    console.error('Login error full:', err);
    console.error('Login error response:', err.response);
    setError(err.response?.data?.message || 'Login failed');
  }
};



  return (
    <LoginContainer>
      {/* Watermark Logos */}
      <Watermark position={{ top: 20, left: 20 }} />
      <Watermark position={{ top: 20, right: 20 }} />
      <Watermark position={{ bottom: 20, left: 20 }} />
      <Watermark position={{ bottom: 20, right: 20 }} />

      <LeftPanel elevation={0}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box textAlign="center" mb={4}>
            <Box
              component="img"
              src={logo}
              alt="EMS Logo"
              sx={{ width: 100, height: 'auto', mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1976d2' }}>
              Login to EMS
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Enter your credentials to access your account
            </Typography>
          </Box>

          <LoginCard elevation={0}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                placeholder="Username"
                name="username"  // Fixed: must match formData key
                value={formData.username}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                  style: { borderRadius: 12, height: 50 },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                  },
                  mb: 2,
                }}
              />

              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="large"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  style: { borderRadius: 12, height: 50 },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#1976d2' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                  },
                  mb: 1,
                }}
              />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      name="rememberMe"
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Button 
                  color="primary" 
                  size="small"
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                sx={{
                  borderRadius: 12,
                  height: 50,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)' },
                }}
              >
                Sign In
              </Button>

              {error && <Typography color="error" mt={2}>{error}</Typography>}
            </form>
          </LoginCard>
        </motion.div>
      </LeftPanel>

      <RightPanel>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box textAlign="center" maxWidth={400}>
            <Box
              component="img"
              src={logo}
              alt="EMS Logo"
              sx={{ width: 180, height: 'auto', mb: 4 }}
            />
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                background: 'linear-gradient(90deg, #ffffff 0%, #e3f2fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome to EMS System
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 4, lineHeight: 1.7 }}>
              Streamline your workforce management with our comprehensive Employee Management System. 
              Access all your HR needs in one secure platform.
            </Typography>
            <Box 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(5px)',
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                For any queries, mail us at:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                ems@gmail.com
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </RightPanel>
    </LoginContainer>
  );
};

export default Login;
