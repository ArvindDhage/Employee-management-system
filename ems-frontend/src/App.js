/*import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './Components/LoginEMS/login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Login />
    </ThemeProvider>
  );
}

export default App;


*/
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ManagerDashboard from "./Pages/Manager/ManagerDashboard";
import CreateTeam from "./Pages/Manager/CreateTeam";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/team/create" element={<CreateTeam />} />
        
      </Routes>
    </Router>
  );
}

export default App;