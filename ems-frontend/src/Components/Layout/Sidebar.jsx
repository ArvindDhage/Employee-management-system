import { useLocation, useNavigate } from "react-router-dom";
import { 
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import {
  Home,
  PersonAdd,
  CalendarMonth,
  FactCheck,
  Person,
  Logout,
} from "@mui/icons-material";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EMSLogo  from "./EMSLogo";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/add-employee", icon: PersonAdd, label: "Add Employee" },
  { to: "/payroll", icon: CurrencyRupeeIcon, label: "Payroll" },
  { to: "/leave", icon: CalendarMonth, label: "Apply Leave" },
  { to: "/attendance", icon: FactCheck, label: "Attendance" },
  { to: "/profile", icon: Person, label: "Profile" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      component="aside"
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: 220,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
      }}
    >
      {/* Logo */} 
        <Box sx={{ p:2 ,borderBottom: 1, borderColor: 'divider', display:'flex',bgcolor: "primary.main", justifyContent:'flex-start' }}>
        <EMSLogo size="lg" />
        </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, p: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.to)}
                sx={{
                  borderRadius: 2,
                  justifyContent: "center",
                  textAlign: "center",
                  gap: 1,

                  ...(isActive && {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }),

                  "&:hover": {
                    bgcolor: isActive ? "primary.dark" : "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, color: "text.secondary" }}>
                  <item.icon />
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => alert("Logout clicked")}
          sx={{
            borderRadius: 2,
            justifyContent: "center",
            "&:hover": {
              bgcolor: "error.light",
              "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                color: "error.main",
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, color: "text.secondary", mr: 1 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontWeight: 500, textAlign: "center" }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
