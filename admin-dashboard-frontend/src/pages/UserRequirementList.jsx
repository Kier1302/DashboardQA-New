import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";

const UserRequirementList = () => {
  const { containerName } = useParams();
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState([]);
  const [uploads, setUploads] = useState({});
  const [files, setFiles] = useState([]);
  const [subContainers, setSubContainers] = useState([]);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await api.get(`/api/requirements?container=${encodeURIComponent(containerName)}`);
        setRequirements(response.data);
      } catch (error) {
        console.error("Error fetching requirements:", error);
      }
    };

    const fetchFiles = async () => {
      try {
        const response = await api.get("/api/files");
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    const fetchSubContainers = async () => {
      try {
        // Fetch all containers to find the current one
        const containersResponse = await api.get("/api/containers");
        const currentContainer = containersResponse.data.find(c => c.name === containerName);
        if (currentContainer) {
          // Fetch sub-containers and filter by authorized users
          const userEmail = localStorage.getItem("userEmail")?.toLowerCase();
          const subsResponse = await api.get(`/api/containers/${currentContainer._id}/subcontainers`);
          const authorizedSubs = subsResponse.data.filter(sub => sub.authorizedUsers.includes(userEmail));
          setSubContainers(authorizedSubs);
        }
      } catch (error) {
        console.error("Error fetching sub-containers:", error);
      }
    };

    fetchRequirements();
    fetchFiles();
    fetchSubContainers();
  }, [containerName]);

  const handleFileUpload = async (requirementId, fileOrUrl) => {
    try {
      const requirement = requirements.find(r => r._id === requirementId);

      if (!requirement) {
        alert("⚠️ Requirement not found.");
        return;
      }

      const requirementName = requirement.name;

      if (fileOrUrl instanceof File) {
        const formData = new FormData();
        formData.append("file", fileOrUrl);
        formData.append("name", requirementName);
        formData.append("type", "file");

        await api.post("/api/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setUploads(prev => ({ ...prev, [requirementId]: "" }));
      } else if (typeof fileOrUrl === "string" && fileOrUrl.trim() !== "") {
        await api.post("/api/files/upload", {
          name: requirementName,
          type: "link",
          url: fileOrUrl,
        });

        setUploads(prev => ({ ...prev, [requirementId]: "" }));
      } else {
        alert("⚠️ Please provide a valid file or URL.");
        return;
      }

      alert("✅ File uploaded successfully");
      // Refresh files list
      const response = await api.get("/api/files");
      setFiles(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload file";
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleBackToContainers = () => {
    navigate("/user-dashboard");
  };

  const handleSubContainerClick = (subContainer) => {
    navigate(`/user-requirements/${encodeURIComponent(subContainer.name)}`);
  };

  return (
    <>
      <Navbar />
      <div className="user-requirement-list" style={{ padding: "20px" }}>
        <div className="page-container">
          <h3>📋 Requirements for Container: {containerName}</h3>
          <button onClick={handleBackToContainers} style={{ marginBottom: "10px" }}>
            ← Back to Containers
          </button>

          {subContainers.length > 0 && (
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
          {requirements.length > 0 ? (
            <table className="requirements-table">
              <thead>
                <tr>
                  <th>Requirement Name</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Upload</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((requirement) => {
                  const file = files.find(f => f.name === requirement.name);
                  return (
                    <tr key={requirement._id}>
                      <td>{requirement.name}</td>
                      <td>{requirement.description}</td>
                      <td>{requirement.type}</td>
                      <td>
                        {file ? (
                          requirement.type === "file" ? (
                            <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer">
                              Download File
                            </a>
                          ) : (
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              {file.url}
                            </a>
                          )
                        ) : (
                          requirement.type === "file" ? (
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(requirement._id, e.target.files[0])}
                            />
                          ) : (
                            <>
                              <input
                                type="url"
                                placeholder="Enter URL"
                                value={uploads[requirement._id] || ""}
                                onChange={(e) => setUploads({ ...uploads, [requirement._id]: e.target.value })}
                                style={{ marginRight: "8px", padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "70%" }}
                              />
                              <button
                                onClick={() => handleFileUpload(requirement._id, uploads[requirement._id])}
                                style={{ padding: "6px 12px", borderRadius: "4px", border: "none", backgroundColor: "black", color: "white", cursor: "pointer" }}
                              >
                                Upload URL
                              </button>
                            </>
                          )
                        )}
                      </td>
                      <td>
                        {file?.status === "accepted" && <span style={{ color: "green" }}>✅ Accepted</span>}
                        {file?.status === "rejected" && <span style={{ color: "red" }}>❌ Rejected</span>}
                        {!file?.status && file && <span style={{ color: "orange" }}>⏳ Pending</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>❌ No requirements defined yet for this container.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserRequirementList;
