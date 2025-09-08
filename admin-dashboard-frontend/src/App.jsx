import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import UploadFiles from "./pages/UploadFiles";
import ApproveRejectFiles from "./pages/ApproveRejectFiles";
import DeleteFiles from "./pages/DeleteFiles";
import DefineRequirement from "./pages/DefineRequirement";
import ContainerManagement from "./pages/ContainerManagement";
import SubContainerManagement from "./pages/SubContainerManagement";
import UserSubContainerView from "./pages/UserSubContainerView";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import UserRequirementList from "./pages/UserRequirementList";

import { useAuth } from "./context/AuthContext";

const App = () => {
  const { user, setUser, loading, triggerRefreshContainers, refreshContainersTrigger } = useAuth();

  useEffect(() => {
    console.log("App.jsx useEffect user changed:", user);
    console.log("App.jsx current refreshContainersTrigger:", refreshContainersTrigger);
    if (user) {
      console.log("App.jsx calling triggerRefreshContainers");
      triggerRefreshContainers();
    }
  }, [user]);



  if (loading) return <p>Loading...</p>; // Show loading indicator until user data is fetched

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Dashboard Routes */}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute user={user} role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-requirements/:containerName"
          element={
            <ProtectedRoute user={user} role="user">
              <UserRequirementList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard/upload"
          element={
            <ProtectedRoute user={user} role="user">
              <UploadFiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard/files"
          element={
            <ProtectedRoute user={user} role="user">
              <DeleteFiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard/sub-containers/:containerName"
          element={
            <ProtectedRoute user={user} role="user">
              <UserSubContainerView />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute user={user} role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/upload"
          element={
            <ProtectedRoute user={user} role="admin">
              <UploadFiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/files"
          element={
            <ProtectedRoute user={user} role="admin">
              <DeleteFiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/approval"
          element={
            <ProtectedRoute user={user} role="admin">
              <ApproveRejectFiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/containers"
          element={
            <ProtectedRoute user={user} role="admin">
              <ContainerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/sub-containers/:containerName"
          element={
            <ProtectedRoute user={user} role="admin">
              <SubContainerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/define-requirement"
          element={<Navigate to="/admin-dashboard/containers" />}
        />
        <Route
          path="/admin-dashboard/define-requirement/:containerName"
          element={
            <ProtectedRoute user={user} role="admin">
              <DefineRequirement />
            </ProtectedRoute>
          }
        />
        
        {/* Dashboard Redirection */}
        <Route
          path="/dashboard"
          element={
            user ? (
              user.role === "admin" ? <Navigate to="/admin-dashboard" /> : <Navigate to="/user-dashboard" />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
