import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar position="static" elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={700}>EMS</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button sx={{ color: "#fff" }} onClick={() => navigate("/")}>Home</Button>
          <Button sx={{ color: "#fff" }} startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;