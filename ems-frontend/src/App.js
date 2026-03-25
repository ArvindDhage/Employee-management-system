// Admin dashboard src/App.js
// In your App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminSidebar from './Components/Layout/AdminSidebar';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import CreateHRCredential from './Pages/Admin/CreateHRCredential';
import CreateManagerCredential from './Pages/Admin/CreateManagerCredential';
import AssignTasks from './Pages/Admin/AssignTasks';
import LeaveApprovalPanel from './Pages/Admin/LeaveApprovalPanel';
import Login from './Components/LoginEMS/login'
import ManagerSidebar from './Components/Layout/ManagerSidebar'
import ManagerDashboard from './Pages/Manager/ManagerDashboard'
import CreateTeam from './Pages/Manager/CreateTeam';
import Task from './Pages/Manager/Tasks';
import TeamLeaves from './Pages/Manager/TeamLeaves';
import Teams from './Pages/Manager/Teams';

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          // REMOVE marginLeft - let flex handle spacing
          // REMOVE width calc - let flex: 1 handle it
          overflow: 'auto' // Ensure content scrolls properly
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const ManagerLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ManagerSidebar />
      <Box 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          // REMOVE marginLeft - let flex handle spacing
          // REMOVE width calc - let flex: 1 handle it
          overflow: 'auto' // Ensure content scrolls properly
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin/dashboard" element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        } />
        <Route path="/admin/create-hr" element={
          <AdminLayout>
            <CreateHRCredential />
          </AdminLayout>
        } />
        <Route path="/admin/create-manager" element={
          <AdminLayout>
            <CreateManagerCredential />
          </AdminLayout>
        } />
        <Route path="/admin/assign-tasks" element={
          <AdminLayout>
            <AssignTasks />
          </AdminLayout>
        } />
        <Route path="/admin/leave-approval" element={
          <AdminLayout>
            <LeaveApprovalPanel />
          </AdminLayout>
        } />
        
        <Route path="/manager/dashboard" element={
          <ManagerLayout>
            <ManagerDashboard />
          </ManagerLayout>
        } />
        <Route path="/manager/team/create" element={
          <ManagerLayout>
            <CreateTeam />
          </ManagerLayout>
        } />
        <Route path="/manager/tasks" element={
          <ManagerLayout>
            <Task />
          </ManagerLayout>
        } />
        <Route path="/manager/teamleaves" element={
          <ManagerLayout>
            <TeamLeaves />
          </ManagerLayout>
        } />
        <Route path="/manager/teams" element={
          <ManagerLayout>
            <Teams />
          </ManagerLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

