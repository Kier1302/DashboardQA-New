import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate(); // Initialize navigate
  const { user } = useAuth();

  const handleContainerClick = (section) => {
    if (section === "upload") {
      navigate("/admin-dashboard/upload");
    } else if (section === "files") {
      navigate("/admin-dashboard/files");
    } else if (section === "approval") {
      navigate("/admin-dashboard/approval");
    } else if (section === "define-requirement") {
      navigate("/admin-dashboard/define-requirement");
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-wrapper">
        <div className="admin-dashboard">
          {/* Clickable Containers */}
          <div className="dashboard-sections">
            <div
              className="dashboard-container"
              onClick={() => handleContainerClick("upload")}
            >
              <h3>📤 Uploaded Requirements</h3>
            </div>
            <div
              className="dashboard-container"
              onClick={() => handleContainerClick("files")}
            >
              <h3>📄 View All Uploaded Files</h3>
            </div>
            <div
              className="dashboard-container"
              onClick={() => handleContainerClick("approval")}
            >
              <h3>✅ Approve / ❌ Reject Files</h3>
            </div>
            {user && user.role === "admin" && (
              <div
                className="dashboard-container"
                onClick={() => handleContainerClick("define-requirement")}
              >
                <h3>📝 Define Requirements</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
