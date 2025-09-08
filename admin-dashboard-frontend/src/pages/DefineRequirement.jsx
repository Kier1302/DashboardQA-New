import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from "react-router-dom";

const DefineRequirement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerName = decodeURIComponent(location.pathname.split("/").pop()) || null;



  const [requirements, setRequirements] = useState([
    { name: "", description: "", type: "file", status: "pending" }, // Default row for requirements
  ]);
  // Removed addDisabled state to allow multiple adds freely

  const [container, setContainer] = useState(null);
  const [subContainers, setSubContainers] = useState([]);



  useEffect(() => {
    const fetchContainerAndSubs = async () => {
      if (!containerName) return;
      try {
        // Fetch all containers to find the one by name
        const containersResponse = await axios.get("http://localhost:5000/api/containers");
        const foundContainer = containersResponse.data.find(c => c.name === containerName);
        if (foundContainer) {
          setContainer(foundContainer.name);
          // Fetch sub-containers and filter by authorized users
          const userEmail = localStorage.getItem("userEmail")?.toLowerCase();
          const subsResponse = await axios.get(`http://localhost:5000/api/containers/${foundContainer._id}/subcontainers`);
          const authorizedSubs = subsResponse.data.filter(sub => sub.authorizedUsers.includes(userEmail));
          setSubContainers(authorizedSubs);
        }
      } catch (error) {
        console.error("Error fetching container or sub-containers:", error);
      }
    };

    fetchContainerAndSubs();
  }, [containerName]);

  useEffect(() => {
    const fetchRequirements = async () => {
      if (!container) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/requirements?container=${encodeURIComponent(container)}`);
        if (response.data && response.data.length > 0) {
          setRequirements(response.data);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
      }
    };

    fetchRequirements();
  }, [container]);

  const handleAddRequirement = () => {
    // Prevent adding duplicate empty requirement if last one is empty
    if (requirements.length > 0) {
      const lastReq = requirements[requirements.length - 1];
      if (lastReq.name.trim() === "" && lastReq.description.trim() === "") {
        return;
      }
    }
    setRequirements([...requirements, { name: "", description: "", type: "file", status: "pending" }]);
  };

  // Re-enable add button after any change to requirements
  useEffect(() => {
    // No addDisabled state, so no action needed here
  }, [requirements]);

  const handleChangeRequirement = (index, field, value) => {
    const updated = [...requirements];
    updated[index][field] = value;
    setRequirements(updated);
  };

  const [saveDisabled, setSaveDisabled] = useState(false);

  const handleSaveRequirements = async () => {
    if (saveDisabled) return;
    setSaveDisabled(true);
    try {
      // Delete all existing requirements for the container before saving new ones
      await axios.delete(`http://localhost:5000/api/requirements/container/${encodeURIComponent(container)}`);

      // Filter out empty requirements before saving
      const filteredRequirements = requirements.filter(
        (req) => req.name.trim() !== "" || req.description.trim() !== ""
      );
      // Remove duplicates by name+description+type
      const uniqueRequirements = [];
      const seen = new Set();
      for (const req of filteredRequirements) {
        const key = `${req.name.trim()}|${req.description.trim()}|${req.type}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRequirements.push(req);
        }
      }
      const response = await axios.post("http://localhost:5000/api/requirements", { requirements: uniqueRequirements, container });
      alert("✅ Requirements saved!");
      // Refresh requirements from backend to avoid duplicates
      const fetchResponse = await axios.get(`http://localhost:5000/api/requirements?container=${encodeURIComponent(container)}`);
      if (fetchResponse.data && fetchResponse.data.length > 0) {
        setRequirements(fetchResponse.data);
      } else {
        setRequirements([]);
      }
      // Removed setAddDisabled call since addDisabled state was removed
      setSaveDisabled(false); // Re-enable save button after save
      // Do not navigate away, stay on the page
    } catch (error) {
      console.error("Error saving requirements:", error);
      alert("❌ Failed to save requirements!");
      setSaveDisabled(false);
    }
  };

  // Auto-resize textarea handler
  const handleAutoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleBackToContainers = () => {
    navigate("/admin-dashboard/containers");
  };



  const handleSubContainerClick = (subContainer) => {
    navigate(`/admin-dashboard/define-requirement/${encodeURIComponent(subContainer.name)}`);
  };

  return (
    <>
      <Navbar />
      <div className="define-requirement" style={{ padding: "20px" }}>
        <div className="page-container">
          <h3>📝 Define Requirements {container ? `for Container: ${container}` : ""}</h3>

          <button onClick={handleBackToContainers} style={{ marginBottom: "10px" }}>
            ← Back to Containers
          </button>

          {container && (
            <div
              style={{
                backgroundColor: "white",
                padding: "10px 15px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                cursor: "default",
                minWidth: "150px",
                textAlign: "center",
                marginBottom: "15px",
                userSelect: "none",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
              title={`Container: ${container}`}
            >
              {container}
            </div>
          )}

          {container && (
            <div style={{ marginBottom: "15px" }}>
              <h4>Sub-Containers:</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                {subContainers.map((sub) => (
                  <div
                    key={sub._id}
                    onClick={() => handleSubContainerClick(sub)}
                    style={{
                      backgroundColor: "#e0f7fa",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid #00bcd4",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                    title={`Go to requirements for ${sub.name}`}
                  >
                    📁 {sub.name}
                  </div>
                ))}
              </div>
            </div>
          )}



          <table>
            <thead>
              <tr>
                <th>Requirement Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((requirement, index) => (
                <tr key={index}>
                  <td>
                    <textarea
                      value={requirement.name}
                      onChange={(e) => {
                        handleChangeRequirement(index, "name", e.target.value);
                        handleAutoResize(e);
                      }}
                      placeholder="Requirement Name"
                      style={{ resize: "none", overflow: "hidden", minHeight: "20px", width: "100%" }}
                    />
                  </td>
                  <td>
                    <textarea
                      value={requirement.description}
                      onChange={(e) => {
                        handleChangeRequirement(index, "description", e.target.value);
                        handleAutoResize(e);
                      }}
                      placeholder="Description"
                      style={{ resize: "none", overflow: "hidden", minHeight: "20px", width: "100%" }}
                    />
                  </td>
                  <td>
                    <select
                      value={requirement.type}
                      onChange={(e) => handleChangeRequirement(index, "type", e.target.value)}
                    >
                      <option value="file">File</option>
                      <option value="url">URL</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={async () => {
                        const confirmDelete = window.confirm("Are you sure you want to delete this requirement?");
                        if (!confirmDelete) return;
                        try {
                          const requirementToDelete = requirements[index];
                          await axios.delete(`http://localhost:5000/api/requirements/${requirementToDelete._id}`);
                          const updated = [...requirements];
                          updated.splice(index, 1);
                          setRequirements(updated);
                          alert("✅ Requirement deleted successfully");
                        } catch (error) {
                          console.error("Error deleting requirement:", error);
                          alert("❌ Failed to delete requirement");
                        }
                      }}
                      style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                      title="Delete Requirement"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleAddRequirement}>➕ Add Requirement</button>
          <button onClick={handleSaveRequirements} disabled={saveDisabled} style={{ marginLeft: "10px" }}>
            💾 Save All
          </button>
        </div>
      </div>
    </>
  );
};

export default DefineRequirement;
