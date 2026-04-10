import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Typography, Avatar, ListItemButton,
  ListItemIcon, ListItemText, Divider,
} from "@mui/material";
import {
  Dashboard, GroupAdd, People, CalendarMonth,
  FactCheck, Logout, Person, Assignment,
} from "@mui/icons-material";


const NAV = [
  { label: "Dashboard",         path: "/manager/dashboard",    icon: Dashboard },
  { label: "Teams",             path: "/manager/teams",        icon: People },
  { label: "Create Team",       path: "/manager/team/create",  icon: GroupAdd },
  { label: "Tasks",             path: "/manager/tasks",        icon: Assignment },
  { label: "Team Leaves",       path: "/manager/team-leaves",  icon: CalendarMonth },
  { label: "Leave Management",  path: "/manager/apply-leaves", icon: CalendarMonth       },
  { label: "Attendance",        path: "/manager/attendance",   icon: FactCheck },
  { label: "Profile",           path: "/manager/profile",      icon: Person },
];

const ManagerSidebar = () => {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const username     = localStorage.getItem("username") || "Manager";

  const handleLogout = () => {
    ["token","jwtToken","authToken","username","role","empId","employeeId","user"]
      .forEach(k => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{
      width: 260, position: "fixed", top: 0, left: 0, height: "100vh",
      bgcolor: "#0f172a", display: "flex", flexDirection: "column",
      zIndex: 1000, overflowY: "auto",
    }}>
      {/* Brand */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#3b82f6",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, color: "white", fontSize: "1rem" }}>M</Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} color="white" lineHeight={1.2}>EMS</Typography>
          <Typography variant="caption" color="#64748b">Manager Portal</Typography>
        </Box>
      </Box>

      {/* User */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#1e293b", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#3b82f6", fontSize: "0.8rem", fontWeight: 700 }}>
            {username[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} color="white" lineHeight={1.2}>{username}</Typography>
            <Typography variant="caption" color="#64748b">Manager</Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#1e293b", mb: 1 }} />

      {/* Nav */}
      <Box sx={{ flexGrow: 1, px: 1.5 }}>
        <Typography variant="caption" color="#475569" fontWeight={700}
          sx={{ px: 1.5, mb: 1, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Navigation
        </Typography>
        {NAV.map(({ label, path, icon: Icon }) => {
          const active = pathname === path;
          return (
            <ListItemButton key={path} onClick={() => navigate(path)} sx={{
              borderRadius: 2, mb: 0.5, px: 1.5, py: 1,
              bgcolor: active ? "#3b82f6" : "transparent",
              color: active ? "white" : "#94a3b8",
              "&:hover": { bgcolor: active ? "#2563eb" : "#1e293b", color: "white" },
              transition: "0.15s",
            }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label}
                primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: "0.875rem" }} />
              {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "white" }} />}
            </ListItemButton>
          );
        })}
      </Box>

      {/* Logout */}
      <Box sx={{ p: 1.5 }}>
        <Divider sx={{ borderColor: "#1e293b", mb: 1.5 }} />
        <ListItemButton onClick={handleLogout} sx={{
          borderRadius: 2, px: 1.5, py: 1, color: "#94a3b8",
          "&:hover": { bgcolor: "#fef2f2", color: "#ef4444" },
        }}>
          <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout"
            primaryTypographyProps={{ fontWeight: 500, fontSize: "0.875rem" }} />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default ManagerSidebar;