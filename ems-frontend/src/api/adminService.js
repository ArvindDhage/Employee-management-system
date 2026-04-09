import axiosInstance from "../util/Axiosconfig";


export const adminService = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  getStats: () => axiosInstance.get("/api/admin/stats"),
  getEmployees: () => axiosInstance.get("/api/admin/employees"),
  getPendingLeaves: () => axiosInstance.get("/api/admin/leaves/pending"),
  getAnnouncements: () => axiosInstance.get("/api/admin/announcements"),

  // ── Employee actions ───────────────────────────────────────────────────────
  promoteEmployee: (id, roleName, salary) =>
    axiosInstance.post(`/api/admin/employees/${id}/promote`, { roleName, salary }),

  updateSalary: (id, salary) =>
    axiosInstance.patch(`/api/admin/employees/${id}/salary`, { salary }),

  deactivateEmployee: (id) =>
    axiosInstance.patch(`/api/admin/employees/${id}/deactivate`),

  activateEmployee: (id) =>
    axiosInstance.patch(`/api/admin/employees/${id}/activate`),

  // ── Leave actions ──────────────────────────────────────────────────────────
  approveLeave: (id) => axiosInstance.patch(`/api/admin/leaves/${id}/approve`),
  rejectLeave:  (id) => axiosInstance.patch(`/api/admin/leaves/${id}/reject`),

  // ── Departments ────────────────────────────────────────────────────────────
  getDepartments: () => axiosInstance.get("/api/admin/departments"),
  createDepartment: (data) => axiosInstance.post("/api/admin/departments", data),
  updateDepartment: (id, data) => axiosInstance.put(`/api/admin/departments/${id}`, data),
  deleteDepartment: (id) => axiosInstance.delete(`/api/admin/departments/${id}`),

  // ── Roles ──────────────────────────────────────────────────────────────────
  getRoles: () => axiosInstance.get("/api/admin/roles"),
  createRole: (data) => axiosInstance.post("/api/admin/roles", data),
  updateRole: (id, data) => axiosInstance.put(`/api/admin/roles/${id}`, data),
  deleteRole: (id) => axiosInstance.delete(`/api/admin/roles/${id}`),

  // ── Attendance ─────────────────────────────────────────────────────────────
  getAllAttendance: () => axiosInstance.get("/api/admin/attendance"),
};