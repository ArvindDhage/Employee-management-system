
// Admin dashboard src/App.js
// In your App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminSidebar from './Components/Layout/AdminSidebar';
import AdminDashboard from './Pages/Admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Add other admin routes here */}
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;