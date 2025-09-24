import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const SubContainerManagement = () => {
  const { containerName } = useParams();
  const [subContainers, setSubContainers] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [newSubContainerName, setNewSubContainerName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubContainers = async () => {
      if (!containerName) return;
      try {
        // Fetch all containers to find the parent
        const containersResponse = await api.get("/api/containers");
        const parentContainer = containersResponse.data.find(c => c.name === containerName);
        if (parentContainer) {
          if (parentContainer.parent) {
            // It's a sub-container, navigate to define-requirement
            navigate(`/admin-dashboard/define-requirement/${encodeURIComponent(containerName)}`);
            return;
          }
          // Show all sub-containers for admin management
          const subsResponse = await api.get(`/api/containers/${parentContainer._id}/subcontainers`);
          setSubContainers(subsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching sub-containers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubContainers();
  }, [containerName, navigate]);

  const handleCreateSubContainer = async () => {
    if (newSubContainerName.trim() === "") {
      alert("Sub-container name cannot be empty");
      return;
    }
    try {
      // Check if name already exists
      const containersResponse = await api.get("/api/containers");
      const existingContainer = containersResponse.data.find(c => c.name === newSubContainerName.trim());
      if (existingContainer) {
        alert("❌ Container name already exists. Please choose a different name.");
        return;
      }
      // Find the parent container ID
      const parentContainer = containersResponse.data.find(c => c.name === containerName);
      if (!parentContainer) {
        alert("Parent container not found");
        return;
      }
      const response = await api.post("/api/containers", { name: newSubContainerName.trim(), parent: parentContainer._id });
      setSubContainers([...subContainers, response.data]);
      setNewSubContainerName("");
      setShowCreatePopup(false);
      alert("✅ Sub-container created!");
    } catch (error) {
      console.error("Error creating sub-container:", error);
      const errorMessage = error.response?.data?.message || "Failed to create sub-container";
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleDeleteSubContainer = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this sub-container and all its requirements?");
    if (!confirmDelete) return;
    try {
      await api.delete(`/api/containers/${id}`);
      setSubContainers(subContainers.filter((sub) => sub._id !== id));
    } catch (error) {
      console.error("Error deleting sub-container:", error);
      alert("Failed to delete sub-container");
    }
  };

  const handleSelectSubContainer = (subContainer) => {
    // Navigate to DefineRequirement page with sub-container name
    navigate(`/admin-dashboard/define-requirement/${encodeURIComponent(subContainer.name)}`);
  };

  const handleBackToContainers = () => {
    navigate("/admin-dashboard/containers");
  };

  return (
    <>
      <Navbar />
      <div className="container-management" style={{ padding: "20px" }}>
        <h3>📁 Sub-Containers for {containerName}</h3>
        <button onClick={handleBackToContainers} style={{ marginBottom: "10px" }}>
          ← Back to Containers
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {!loading ? (
            subContainers.map((sub) => (
              <div
                key={sub._id}
                className="dashboard-container"
                onClick={() => handleSelectSubContainer(sub)}
                title={`Go to requirements for ${sub.name}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: "150px",
                  justifyContent: "space-between",
                }}
              >
                <span>{sub.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubContainer(sub._id);
                  }}
                  style={{
                    backgroundColor: "black",
                    border: "none",
                    color: "white",
                    padding: "5px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  title="Delete Sub-Container"
                >
                  🗑️
                </button>
              </div>
            ))
          ) : (
            <p>Loading sub-containers...</p>
          )}

          <button
            onClick={() => setShowCreatePopup(true)}
            style={{
              backgroundColor: "black",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              minWidth: "150px",
              fontWeight: "bold",
            }}
          >
            + Add Sub-Container
          </button>
        </div>

        {showCreatePopup && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "300px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              <h4>Create Sub-Container</h4>
              <input
                type="text"
                value={newSubContainerName}
                onChange={(e) => setNewSubContainerName(e.target.value)}
                placeholder="Sub-Container Name"
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreatePopup(false)} style={{ marginRight: "10px" }}>
                  Cancel
                </button>
                <button onClick={handleCreateSubContainer}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SubContainerManagement;
