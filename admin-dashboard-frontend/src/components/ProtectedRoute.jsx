import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, role, children }) => {
  if (!user) {
    return <Navigate to="/" />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/user-dashboard"} />;
  }

  return children;
};

export default ProtectedRoute;
