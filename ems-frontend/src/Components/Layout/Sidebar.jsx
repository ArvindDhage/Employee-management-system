import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Divider, Typography, Avatar,
} from "@mui/material";
import {
  Home, PersonAdd, CalendarMonth, FactCheck,
  Person, Logout, People, Dashboard,
} from "@mui/icons-material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const NAV = {
  HR: [
    { to: "/hr/dashboard",     icon: Home,              label: "Dashboard" },
    { to: "/hr/add-employee",  icon: PersonAdd,          label: "Add Employee" },
    { to: "/hr/view-employee", icon: People,             label: "View Employees" },
    { to: "/hr/payroll",       icon: CurrencyRupeeIcon,  label: "Payroll" },
    { to: "/hr/apply-leaves",  icon: CalendarMonth,      label: "Leave Management" },
    { to: "/hr/attendance",    icon: FactCheck,          label: "Attendance" },
    { to: "/hr/profile",       icon: Person,             label: "Profile" },
  ],
  EMPLOYEE: [
    { to: "/employee/dashboard",    icon: Dashboard,     label: "Dashboard" },
    { to: "/employee/apply-leaves", icon: CalendarMonth, label: "Apply Leave" },
    { to: "/employee/attendance",   icon: FactCheck,     label: "Attendance" },
    { to: "/employee/profile",      icon: Person,        label: "Profile" },
  ],
};

// Per-role accent color and label
const THEME = {
  HR:       { accent: "#3b82f6", label: "HR Portal",       initial: "HR" },
  EMPLOYEE: { accent: "#10b981", label: "Employee Portal",  initial: "E" },
};

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const role     = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "User";
  const items    = NAV[role]   || [];
  const theme    = THEME[role] || { accent: "#3b82f6", label: "Portal", initial: "?" };

  const handleLogout = () => { localStorage.clear(); navigate("/login", { replace: true }); };

  // Guard: unknown role — nothing to show
  if (!items.length) {
    return (
      <Box sx={{ width: 220, height: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", bgcolor: "#f1f5f9" }}>
        <Typography variant="body2" color="text.secondary">No menu</Typography>
      </Box>
    );
  }

  return (
    <Box component="aside" sx={{
      position: "fixed", left: 0, top: 0, height: "100vh", width: 220,
      bgcolor: "#0f172a", display: "flex", flexDirection: "column",
      zIndex: 1000, overflowY: "auto",
    }}>
      {/* Brand */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: theme.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, color: "white", fontSize: "0.8rem" }}>
          {theme.initial}
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} color="white" lineHeight={1.2}>EMS</Typography>
          <Typography variant="caption" color="#64748b">{theme.label}</Typography>
        </Box>
      </Box>

      {/* User chip */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#1e293b",
          display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: theme.accent, fontSize: "0.75rem", fontWeight: 700 }}>
            {username[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} color="white" lineHeight={1.2}>{username}</Typography>
            <Typography variant="caption" color="#64748b">{role}</Typography>
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
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <ListItem key={to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={() => navigate(to)} sx={{
                borderRadius: 2, px: 1.5, py: 1,
                bgcolor: active ? theme.accent : "transparent",
                color: active ? "white" : "#94a3b8",
                "&:hover": { bgcolor: active ? theme.accent : "#1e293b", color: "white" },
                transition: "0.15s",
              }}>
                <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={label}
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
        <ListItemButton onClick={handleLogout} sx={{
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

export default Sidebar;