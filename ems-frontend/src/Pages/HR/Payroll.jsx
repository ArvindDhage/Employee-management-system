import { useState } from "react";
import DashboardLayout from "../../Components/Layout/MainLayout";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  AttachMoney,
  Description,
  Edit,
  Search,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";


const Payroll = () => {
  // ------- (local only for now) ------
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@example.com",
      department: "HR",
      role: "HR Executive",
      salary: 480000,
    },
    {
      id: 2,
      name: "Priya Verma",
      email: "priya@example.com",
      department: "Finance",
      role: "Accountant",
      salary: 540000,
    },
    {
      id: 3,
      name: "Amit Patel",
      email: "amit@example.com",
      department: "IT",
      role: "Software Engineer",
      salary: 720000,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newSalary, setNewSalary] = useState("");

  // Filter employees
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // OPEN EDIT DIALOG
  const handleOpenDialog = (emp) => {
    setEditingEmployee(emp);
    setNewSalary(emp.salary);
    setDialogOpen(true);
  };

  // CLOSE EDIT DIALOG
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
    setNewSalary("");
  };

  // UPDATE SALARY
  const handleUpdateSalary = () => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editingEmployee.id
          ? { ...emp, salary: parseInt(newSalary) }
          : emp
      )
    );
    handleCloseDialog();
  };

  const totalMonthlyPayroll = employees.reduce(
    (sum, emp) => sum + emp.salary / 12,
    0
  );

  return (
    <DashboardLayout title="Payroll Management">

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3, justifyContent:'center'}}>

        <Grid item xs={12} md={4} size={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  }}>
                  <CurrencyRupeeIcon />
                </Box>


                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Payroll
                  </Typography>
                  <Typography variant="h5" fontWeight={700} >
                    ₹{totalMonthlyPayroll.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} size={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.success.light, 0.3),
                    color: "success.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    
                  }}
                >
                  <Description />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Employees Listed
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {employees.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} size={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.3),
                    color: "warning.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Edit />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Updates
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    0
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Employee Salary Table */}
      <Card>
        <CardContent>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Employee Salaries
            </Typography>

            <TextField
              size="small"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 256 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Annual Salary</TableCell>
                  <TableCell>Monthly Salary</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.primary.light, 0.3),
                            color: "primary.main",
                            fontWeight: 600,
                            
                          }}
                        >
                          {employee.name.split(" ").map((n) => n[0]).join("")}
                        </Avatar>

                        <Box>
                          <Typography fontWeight={500}>{employee.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.role}</TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        ₹{employee.salary.toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      ₹{(employee.salary / 12).toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleOpenDialog(employee)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Description />}
                        >
                          Payslip
                        </Button>
                      </Box>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Salary Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Salary</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Annual Salary"
            type="number"
            value={newSalary}
            sx={{ mt: 2 }}
            onChange={(e) => setNewSalary(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSalary}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

    </DashboardLayout>
  );
};

export default Payroll;
