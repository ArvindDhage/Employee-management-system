import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";


const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    const role = localStorage.getItem("role");
    const routes = {
      ADMIN:    "/admin/dashboard",
      MANAGER:  "/manager/dashboard",
      HR:       "/hr/dashboard",
      EMPLOYEE: "/employee/dashboard",
    };
    navigate(routes[role] ?? "/login", { replace: true });
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      bgcolor: "#f8fafc", gap: 2,
    }}>
      <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "#fef2f2",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LockOutlinedIcon sx={{ fontSize: 40, color: "#ef4444" }} />
      </Box>
      <Typography variant="h4" fontWeight={800} color="#0f172a">403 — Forbidden</Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={400}>
        You don't have permission to access this page.
        Please contact your administrator if you think this is a mistake.
      </Typography>
      <Button variant="contained" onClick={handleBack}
        sx={{ mt: 1, borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
        Go to My Dashboard
      </Button>
    </Box>
  );
};

export default Unauthorized;