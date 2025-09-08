import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const UserSubContainerView = () => {
  const { containerName } = useParams();
  const [subContainers, setSubContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubContainers = async () => {
      if (!containerName || !user || !user.email) return;
      try {
        // Fetch all containers to find the parent
        const containersResponse = await axios.get("http://localhost:5000/api/containers");
        const parentContainer = containersResponse.data.find(c => c.name === containerName);
        if (parentContainer) {
          if (parentContainer.parent) {
            // It's a sub-container, navigate to user requirements
            navigate(`/user-requirements/${encodeURIComponent(containerName)}`);
            return;
          }
        // Show all sub-containers of the authorized parent container (authorization inheritance)
        const subsResponse = await axios.get(`http://localhost:5000/api/containers/${parentContainer._id}/subcontainers`);
        // Since authorization is inherited from parent, show all sub-containers
        setSubContainers(subsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching sub-containers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubContainers();
  }, [containerName, navigate, user]);

  const handleSelectSubContainer = (subContainer) => {
    // Navigate to UserRequirementList page with sub-container name
    navigate(`/user-requirements/${encodeURIComponent(subContainer.name)}`);
  };

  const handleBackToDashboard = () => {
    navigate("/user-dashboard");
  };

  return (
    <>
      <Navbar />
      <div className="container-management" style={{ padding: "20px" }}>
        <h3>📁 Sub-Containers for {containerName}</h3>
        <button onClick={handleBackToDashboard} style={{ marginBottom: "10px" }}>
          ← Back to Dashboard
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {!loading ? (
            subContainers.length > 0 ? (
              subContainers.map((sub) => (
                <div
                  key={sub._id}
                  className="dashboard-container"
                  onClick={() => handleSelectSubContainer(sub)}
                  title={`View requirements for ${sub.name}`}
                  style={{
                    minWidth: "150px",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  {sub.name}
                </div>
              ))
            ) : (
              <p>No sub-containers available for this container.</p>
            )
          ) : (
            <p>Loading sub-containers...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserSubContainerView;
