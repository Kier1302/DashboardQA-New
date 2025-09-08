import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MultiEmailInput from "../components/MultiEmailInput";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ContainerManagement = () => {
  const [containers, setContainers] = useState([]);
  const [showContainerPopup, setShowContainerPopup] = useState(false);
  const [newContainerName, setNewContainerName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authEmails, setAuthEmails] = useState([]);

  // Helper function to add email to authEmails array if valid and not duplicate
  const addAuthEmail = async (email) => {
    const trimmedEmail = email.trim();
    console.log("Validating email existence:", trimmedEmail);
    if (
      trimmedEmail &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) &&
      !authEmails.includes(trimmedEmail)
    ) {
      try {
        // Check if email exists in user database
        const response = await axios.get(`http://localhost:5000/api/users/exists?email=${encodeURIComponent(trimmedEmail)}`);
        console.log("Email existence response:", response.data);
        if (response.data.exists) {
          setAuthEmails([...authEmails, trimmedEmail]);
          alert(`Email ${trimmedEmail} added.`);
        } else {
          alert(`Email ${trimmedEmail} not found in user database.`);
        }
      } catch (error) {
        console.error("Error checking email existence:", error);
        alert("Failed to verify email existence.");
      }
    }
  };

  // Helper function to remove email from authEmails array
  const removeAuthEmail = (email) => {
    setAuthEmails(authEmails.filter((e) => e !== email));
  };

  // Input change handler for email input field
  const handleEmailInputKeyDown = async (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      await addAuthEmail(e.target.value);
      e.target.value = "";
    }
  };
  const [selectedContainer, setSelectedContainer] = useState(null);

  const openAuthPopup = (container) => {
    setSelectedContainer(container);
    // Normalize emails to lowercase and trim whitespace before setting state
    const normalizedEmails = container.authorizedUsers
      ? container.authorizedUsers.map(email => email.trim().toLowerCase())
      : [];
    setAuthEmails(normalizedEmails);
    setShowAuthPopup(true);
  };

  const closeAuthPopup = () => {
    setShowAuthPopup(false);
    setSelectedContainer(null);
    setAuthEmails([]);
  };

  const { triggerRefreshContainers } = useAuth();

  const handleSaveAuthUsers = async () => {
    if (!selectedContainer) return;
    // Validate all emails exist in user database before saving
    for (const email of authEmails) {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/exists?email=${encodeURIComponent(email)}`);
        if (!response.data.exists) {
          alert(`Email ${email} not found in user database. Please remove it before saving.`);
          return;
        }
      } catch (error) {
        console.error("Error checking email existence:", error);
        alert("Failed to verify email existence. Please try again.");
        return;
      }
    }
    const emailsArray = Array.isArray(authEmails) ? authEmails : authEmails.split(",").map(email => email.trim()).filter(email => email.length > 0);
    try {
      const response = await axios.post(`http://localhost:5000/api/containers/${selectedContainer._id}/authorize`, { emails: emailsArray });
      setContainers(containers.map(c => c._id === selectedContainer._id ? response.data : c));
      closeAuthPopup();
      triggerRefreshContainers();
    } catch (error) {
      console.error("Error updating authorized users:", error);
      alert("Failed to update authorized users");
    }
  };

  useEffect(() => {
    // Fetch containers from backend API
    const fetchContainers = async () => {
      try {
        // Call API without email query param to get all containers for admin
        const response = await axios.get("http://localhost:5000/api/containers");
        // Filter to only top-level containers (no parent) for main container management
        const topLevelContainers = response.data.filter(c => !c.parent);
        setContainers(topLevelContainers);
      } catch (error) {
        console.error("Error fetching containers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
  }, []);

  const handleOpenContainerPopup = () => {
    setNewContainerName("");
    setShowContainerPopup(true);
  };

  const handleCloseContainerPopup = () => {
    setShowContainerPopup(false);
  };

  const handleCreateContainer = async () => {
    if (newContainerName.trim() === "") {
      alert("Container name cannot be empty");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/containers", { name: newContainerName.trim() });
      setContainers([...containers, response.data]);
      setShowContainerPopup(false);
    } catch (error) {
      console.error("Error creating container:", error);
      alert("Failed to create container");
    }
  };

  const handleDeleteContainer = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this container and all its requirements?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`http://localhost:5000/api/containers/${id}`);
      setContainers(containers.filter((container) => container._id !== id));
    } catch (error) {
      console.error("Error deleting container:", error);
      alert("Failed to delete container");
    }
  };

  const handleSelectContainer = (container) => {
    // If it's a sub-container (has parent), navigate to DefineRequirement page
    if (container.parent) {
      navigate(`/admin-dashboard/define-requirement/${encodeURIComponent(container.name)}`);
    } else {
      // If it's a top-level container, navigate to SubContainerManagement page
      navigate(`/admin-dashboard/sub-containers/${encodeURIComponent(container.name)}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container-management" style={{ padding: "20px" }}>
        <h3>📦 Container Management</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        {!loading ? (
          containers.map((container) => (
            <div
              key={container._id}
              className="dashboard-container"
              onClick={() => handleSelectContainer(container)}
              title={`Go to requirements for ${container.name}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: "150px",
                justifyContent: "space-between",
              }}
            >
              <span>{container.name}</span>
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAuthPopup(container);
                  }}
                  style={{
                    backgroundColor: "#2563eb",
                    border: "none",
                    color: "white",
                    padding: "5px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  title="Manage Authorized Users"
                >
                  👥
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteContainer(container._id);
                  }}
                  style={{
                    backgroundColor: "black",
                    border: "none",
                    color: "white",
                    padding: "5px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  title="Delete Container"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading containers...</p>
        )}

        <button
          onClick={handleOpenContainerPopup}
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
          + Add Container
        </button>
      </div>

      {showContainerPopup && (
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
            <h4>Create Container</h4>
            <input
              type="text"
              value={newContainerName}
              onChange={(e) => setNewContainerName(e.target.value)}
              placeholder="Container Name"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleCloseContainerPopup} style={{ marginRight: "10px" }}>
                Cancel
              </button>
              <button onClick={handleCreateContainer}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showAuthPopup && (
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
              width: "400px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            <h4>Manage Authorized Users for "{selectedContainer ? selectedContainer.name : ''}"</h4>
            {/* Replace textarea with multi-email input */}
            <MultiEmailInput
              emails={Array.isArray(authEmails) ? authEmails : authEmails.split(",").map(email => email.trim()).filter(email => email.length > 0)}
              onChange={(emails) => setAuthEmails(emails)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={closeAuthPopup} style={{ marginRight: "10px" }}>
                Cancel
              </button>
              <button onClick={handleSaveAuthUsers}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
);
};

export default ContainerManagement;
