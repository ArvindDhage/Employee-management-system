import { Navigate, Outlet } from "react-router-dom";


const PrivateRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token") || null;
  if (!token) return <Navigate to="/login" replace />;

  
  const role = localStorage.getItem("role");
  if (allowedRoles?.length && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
};

export default PrivateRoute;