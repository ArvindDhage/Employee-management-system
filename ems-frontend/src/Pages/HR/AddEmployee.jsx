import React from "react";
import DashboardLayout from "../../Components/Layout/MainLayout";
import { alpha } from "@mui/material/styles";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
} from "@mui/material";

import {
  PersonAdd,
  Person,
  Email,
  Phone,
  Work,
  Business,
  CalendarMonth,
} from "@mui/icons-material";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

// Static arrays
const roles = ["HR", "Manager", "Employee", "Developer", "Designer"];
const departments = [
  "Human Resources",
  "Engineering",
  "Finance",
  "Design",
  "Marketing",
];

const AddEmployee = () => {
  return (
    <DashboardLayout title="Add Employee">
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.light, 0.3),
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  
                }}
              >
                <PersonAdd />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={600}>
                  New Employee Registration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill in the details to add a new team member
                </Typography>
              </Box>
            </Box>

            {/* Form (Static) */}
            <Grid container spacing={3} justifyContent={"center"}>
              {/* Name */}
              <Grid item xs={12} md={6} size={6} >
                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="Hari Pandy"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6} size={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  placeholder="user@ems.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Mobile */}
              <Grid item xs={12} md={6} size={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  placeholder="+91 9876543210"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Role */}
              <Grid item xs={12} md={6} size={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  defaultValue=""
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work />
                      </InputAdornment>
                    ),
                  }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Department */}
              <Grid item xs={12} md={6} size={6}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  defaultValue=""
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    ),
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Joining Date */}
              <Grid item xs={12} md={6} size={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Joining Date"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Salary */}
              <Grid item xs={12} size={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Annual Salary"
                  placeholder="50000"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Buttons (Static) */}
              <Grid item xs={12}  >
                <Box sx={{ display: "flex", gap: 2, pt: 1}}>
                  <Button
                    variant="contained" 
                    startIcon={<PersonAdd />}
                    sx={{ flex: 1 }}
                  >
                    Add Employee
                  </Button>

                  <Button variant="outlined" sx={{ flex: 1 }}>
                    Reset Form
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AddEmployee;
