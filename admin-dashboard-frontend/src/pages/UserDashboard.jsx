import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const UserDashboard = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, refreshContainersTrigger } = useAuth();

  useEffect(() => {
    console.log("UserDashboard useEffect triggered. user:", user, "refreshContainersTrigger:", refreshContainersTrigger);
    const fetchContainers = async () => {
      if (!user || !user.email) {
        setContainers([]);
        setLoading(false);
        return;
      }
      try {
        const normalizedEmail = user.email.trim().toLowerCase();
        console.log("Fetching containers for user email:", normalizedEmail);
        // Fetch containers where user is directly authorized
        const response = await api.get(`/api/containers?email=${encodeURIComponent(normalizedEmail)}`);
        const authorizedContainers = response.data;

        // Filter to show only main containers (those without a parent)
        const mainContainers = authorizedContainers.filter(container => !container.parent);

        setContainers(mainContainers);
      } catch (error) {
        console.error("Error fetching containers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
  }, [user, refreshContainersTrigger]);

  useEffect(() => {
    console.log("UserDashboard useEffect for refreshContainersTrigger:", refreshContainersTrigger);
  }, [refreshContainersTrigger]);

  const handleSelectContainer = (container) => {
    if (container.parent) {
      // It's a sub-container, navigate directly to requirements
      navigate(`/user-requirements/${encodeURIComponent(container.name)}`);
    } else {
      // It's a main container, navigate to sub-container view
      navigate(`/user-dashboard/sub-containers/${encodeURIComponent(container.name)}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="user-dashboard" style={{ padding: "20px" }}>
        <div className="page-container">
          <h3>📦 User Dashboard</h3>
          {!loading ? (
            containers.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {containers.map((container) => (
                  <div
                    key={container._id}
                    className="dashboard-container"
                    onClick={() => handleSelectContainer(container)}
                    title={`View requirements for ${container.name}`}
                    style={{ minWidth: "150px", textAlign: "center" }}
                  >
                    {container.name}
                  </div>
                ))}
              </div>
            ) : (
              <p>❌ No containers available.</p>
            )
          ) : (
            <p>Loading containers...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
