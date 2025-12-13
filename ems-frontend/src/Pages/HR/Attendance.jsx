import React from "react";
import DashboardLayout from "../../Components/Layout/MainLayout";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
} from "@mui/material";

import {
  CheckCircle,
  Cancel,
  CalendarMonth,
  AccessTime,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

// -------------------------------------------------------
// NO HOOKS – STATIC PLACEHOLDERS (replace with API later)
// -------------------------------------------------------

const currentDate = new Date();
const today = new Date();

// EMPTY attendance array (you will fill using API)
const attendanceData = [];

// Empty summary (replace with API data)
const summary = {
  present: 15,
  absent: 2,
  leave: 5,
  holiday: 8,
};

// Calendar constants
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Calendar generator (no useMemo)
function generateCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push({ date: 0, status: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ date: day, status: null }); // All empty until API fills
  }

  return days;
}

const calendarDays = generateCalendar(currentDate);

// Get color for each box
function getStatusColor(status) {
  switch (status) {
    case "present":
      return { bgcolor: "success.light", color: "success.dark", borderColor: "success.main" };
    case "absent":
      return { bgcolor: "error.light", color: "error.dark", borderColor: "error.main" };
    case "leave":
      return { bgcolor: "warning.light", color: "warning.dark", borderColor: "warning.main" };
    case "holiday":
      return { bgcolor: "grey.200", color: "text.secondary", borderColor: "grey.400" };
    default:
      return { bgcolor: "background.paper", color: "text.primary", borderColor: "divider" };
  }
}

const isToday = (day) => {
  return (
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear()
  );
};

// -------------------------------------------------------
// FINAL COMPONENT
// -------------------------------------------------------

const Attendance = () => {
  return (
    <DashboardLayout title="Attendance Management">
      <Grid container spacing={3}>
        
        {/* Calendar Section */}
        <Grid item xs={12} lg={8} size={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              
              {/* Month Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Typography>
                <Box>
                  <IconButton size="small"><ChevronLeft /></IconButton>
                  <IconButton size="small"><ChevronRight /></IconButton>
                </Box>
              </Box>

              {/* Week Days */}
              <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    mb: 2,
                }}
                >
                {daysOfWeek.map((day) => (
                    <Typography
                    key={day}
                    textAlign="center"
                    fontWeight={600}
                    sx={{ py: 1 }}
                    >
                    {day}
                    </Typography>
                ))}
                </Box>


              {/* Calendar Grid */}
              <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 1,
                }}
                >
                {calendarDays.map((day, index) => {
                    const statusColors = getStatusColor(day.status);

                    return (
                    <Box
                        key={index}
                        sx={{
                        aspectRatio: "1",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 2,
                        border: 1,
                        fontWeight: 500,
                        fontSize: "1rem",
                        ...statusColors,
                        visibility: day.date === 0 ? "hidden" : "visible",
                        ...(isToday(day.date) && {
                            boxShadow: "0 0 0 3px #3b82f6",
                            color: "primary.main",
                        }),
                        }}
                    >
                        {day.date > 0 && day.date}
                    </Box>
                    );
                })}
                </Box>

              {/* Legend */}
              <Box sx={{ display: "flex", gap: 3, mt: 3, pt: 3, borderTop: 1 }}>
                {[
                  { label: "Present", color: "success" },
                  { label: "Absent", color: "error" },
                  { label: "Leave", color: "warning" },
                  { label: "Holiday", color: "grey" },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: "flex", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        bgcolor: `${item.color}.light`,
                        border: 1,
                        borderColor: `${item.color}.main`,
                        opacity: 0.15,
                      }}
                    />
                    <Typography variant="body2">{item.label}</Typography>
                  </Box>
                ))}
              </Box>

            </CardContent>
          </Card>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} lg={4} size={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* Today's Attendance */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "primary.light", opacity: 0.15 }}>
                    <AccessTime />
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>Today's Attendance</Typography>
                    <Typography variant="body2">{today.toLocaleDateString()}</Typography>
                  </Box>
                </Box>

                {/* Buttons removed (no hook/state) */}
                <Typography variant="body2" color="text.secondary">
                  Connect API to mark attendance.
                </Typography>
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "primary.light", opacity: 0.15 }}>
                    <CalendarMonth />
                  </Box>
                  <Typography fontWeight={600}>Monthly Summary</Typography>
                </Box>

                {["present", "absent", "leave", "holiday"].map((type) => (
                  <Box
                    key={type}
                    sx={{
                      p: 1.5,
                      bgcolor: "grey.100",
                      borderRadius: 2,
                      opacity: 0.15,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>{type}</Typography>
                    <Typography fontWeight={700}>{summary[type]}</Typography>
                  </Box>
                ))}

              </CardContent>
            </Card>

          </Box>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default Attendance;
