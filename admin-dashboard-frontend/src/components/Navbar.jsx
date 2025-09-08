import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const onLogout = () => {
    handleLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">Dashboard</div>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        {user && user.role === "admin" && (
          <>
            <Link to="/admin-dashboard">Dashboard</Link>
            <Link to="/admin-dashboard/upload">Requirements</Link>
            <Link to="/admin-dashboard/files">Uploaded Files</Link>
            <Link to="/admin-dashboard/approval">Approval</Link>
            <Link to="/admin-dashboard/define-requirement">Define Requirement</Link>
          </>
        )}
        {user && user.role !== "admin" && (
          <>
            <Link to="/user-dashboard">Dashboard</Link>
          </>
        )}
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div
        className={`nav-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar;
