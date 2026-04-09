import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import ChatWidget from "./ChatWidget";   
 
const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar mobileOpen={mobileOpen} handleDrawerToggle={() => setMobileOpen(o => !o)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
        <Outlet />
      </Box>
      <ChatWidget />  
    </Box>
  );
};
export default AdminLayout;