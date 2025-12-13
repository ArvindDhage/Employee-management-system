import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = () => {

  return (
    <AppBar position="static" elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        px: 2,
      }}
    >
  <Toolbar
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography variant="h6" fontWeight={600}>
      EMS
    </Typography>

    <Box sx={{ display: "flex", gap: 2 }}>
      <Button sx={{ color: "#fff" }}>Home</Button>
      <Button sx={{ color: "#fff" }} startIcon={<LogoutIcon />}>
        Logout
      </Button>
    </Box>
  </Toolbar>
</AppBar>

  )
}

export default Navbar