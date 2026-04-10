import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Avatar, useTheme, useMediaQuery,
} from "@mui/material";
import {
  Dashboard, PersonAdd, People, EventAvailable, FactCheck,
  Logout, Business, Security, Campaign,
} from "@mui/icons-material";

const DRAWER_W = 240;

const MENU = [
  { text: "Dashboard",      icon: Dashboard,       path: "/admin/dashboard" },
  { text: "Employees",      icon: People,           path: "/admin/employees" },
  { text: "Departments",    icon: Business,         path: "/admin/departments" },
  { text: "Roles",          icon: Security,         path: "/admin/roles" },
  { text: "Leave Approval", icon: EventAvailable,   path: "/admin/leave-approval" },
  { text: "Attendance",     icon: FactCheck,        path: "/admin/attendance" },
  { text: "Announcements",  icon: Campaign,         path: "/admin/announcements" },
];

const DrawerContent = ({ username, onLogout }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", position: "fixed", flexDirection: "column", height: "100%", bgcolor: "#0f172a" }}>
      {/* Brand */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#ef4444",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, color: "white", fontSize: "0.9rem" }}>A</Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} color="white" lineHeight={1.2}>EMS</Typography>
          <Typography variant="caption" color="#64748b">Admin Portal</Typography>
        </Box>
      </Box>

      {/* User chip */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#1e293b", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>
            {username[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} color="white" lineHeight={1.2}>{username}</Typography>
            <Typography variant="caption" color="#64748b">Administrator</Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#1e293b", mb: 1 }} />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5, py: 0 }}>
        <Typography variant="caption" color="#475569" fontWeight={700}
          sx={{ px: 1.5, mb: 1, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Navigation
        </Typography>
        {MENU.map(({ text, icon: Icon, path }) => {
          const active = pathname === path;
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={() => navigate(path)} sx={{
                borderRadius: 2, px: 1.5, py: 0.9,
                bgcolor: active ? "#ef4444" : "transparent",
                color: active ? "white" : "#94a3b8",
                "&:hover": { bgcolor: active ? "#dc2626" : "#1e293b", color: "white" },
                transition: "0.15s",
              }}>
                <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={text}
                  primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: active ? 700 : 500 }} />
                {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "white" }} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#1e293b" }} />

      {/* Logout */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton onClick={onLogout} sx={{
          borderRadius: 2, px: 1.5, py: 1, color: "#94a3b8",
          "&:hover": { bgcolor: "#fef2f2", color: "#ef4444" },
        }}>
          <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout"
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
};

const AdminSidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const username  = localStorage.getItem("username") || "Admin";
  const handleLogout = () => { localStorage.clear(); navigate("/login", { replace: true }); };

  const paperSx = { "& .MuiDrawer-paper": { width: DRAWER_W, border: "none", boxSizing: "border-box" } };

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_W }, flexShrink: { md: 0 } }}>
      {/* Mobile */}
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, ...paperSx }}>
        <DrawerContent username={username} onLogout={handleLogout} />
      </Drawer>
      {/* Desktop */}
      <Drawer variant="permanent" open
        sx={{ display: { xs: "none", md: "block" }, ...paperSx }}>
        <DrawerContent username={username} onLogout={handleLogout} />
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;