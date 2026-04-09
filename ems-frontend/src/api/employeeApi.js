import axiosInstance from "../util/Axiosconfig";


// ── Employee profile ───────────────────────────────────────────────────────
export const getMyProfile = () =>
  axiosInstance.get("/employees/me");

// ── Attendance ─────────────────────────────────────────────────────────────
export const getMyAttendance = (empId) =>
  axiosInstance.get(`/api/attendance/history/${empId}`);

export const checkIn = (empId) =>
  axiosInstance.post(`/api/attendance/check-in/${empId}`);

export const checkOut = (empId) =>
  axiosInstance.put(`/api/attendance/check-out/${empId}`);

// ── Leaves ─────────────────────────────────────────────────────────────────
export const getMyLeaves = (empId) =>
  axiosInstance.get(`/api/leaves/employee/${empId}`);

export const applyLeave = (empId, data) =>
  axiosInstance.post(`/api/leaves/apply/${empId}`, data);

// ── Announcements ──────────────────────────────────────────────────────────
export const getAnnouncements = () =>
  axiosInstance.get("/api/announcements");

// ── Tasks ──────────────────────────────────────────────────────────────────
export const getMyTasks = (empId) =>
  axiosInstance.get(`/api/tasks/employee/${empId}`);