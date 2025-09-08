import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import UploadComponent from "../components/UploadComponent";

const UploadFiles = () => {
  const [files, setFiles] = useState([]);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/files");
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    const fetchRequirements = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/requirements");
        setRequirements(response.data);
      } catch (error) {
        console.error("Error fetching requirements:", error);
      }
    };

    fetchFiles();
    fetchRequirements();
  }, []);

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this upload?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`);
      alert("✅ Upload deleted successfully!");
      const response = await axios.get("http://localhost:5000/api/files");
      setFiles(response.data);
    } catch (error) {
      alert("❌ Failed to delete upload!");
      console.error("Delete error:", error);
    }
  };

  const handleDeleteRequirement = async (requirementId) => {
    if (!window.confirm("Are you sure you want to delete this requirement?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/requirements/${requirementId}`);
      alert("✅ Requirement deleted successfully!");
      const response = await axios.get("http://localhost:5000/api/requirements");
      setRequirements(response.data);
    } catch (error) {
      alert("❌ Failed to delete requirement!");
      console.error("Delete requirement error:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div>
        <div className="page-container">
          <h3>🧾 Uploaded Requirements and Files</h3>
          {requirements.length === 0 && files.length === 0 ? (
            <p>❌ No uploaded requirements or files found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Requirement Name</th>
                  <th>File</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((requirement) => {
                  const relatedFiles = files.filter(f => f.name === requirement.name);
                  return (
                    <tr key={requirement._id}>
                      <td>{requirement.name}</td>
                      <td>
                        {relatedFiles.some(f => f.type === "file" && f.url) ? (
                          relatedFiles.filter(f => f.type === "file" && f.url).map(f => (
                            <div key={f._id}>
                              <a href={`http://localhost:5000${f.url}`} target="_blank" rel="noopener noreferrer">
                                Download File
                              </a>
                            </div>
                          ))
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {relatedFiles.some(f => f.type === "link" && f.url) ? (
                          relatedFiles.filter(f => f.type === "link" && f.url).map(f => (
                            <div key={f._id}>
                              <a href={f.url} target="_blank" rel="noopener noreferrer">
                                {f.url}
                              </a>
                            </div>
                          ))
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {relatedFiles.some(f => f.status === "accepted") && <span style={{ color: "green" }}>✅ Accepted</span>}
                        {relatedFiles.some(f => f.status === "rejected") && <span style={{ color: "red" }}>❌ Rejected</span>}
                        {relatedFiles.some(f => !f.status) && <span style={{ color: "orange" }}>⏳ Pending</span>}
                      </td>
                      <td>
                        <button onClick={() => handleDeleteRequirement(requirement._id)}>
                          🗑 Delete Requirement
                        </button>
                        {relatedFiles.map(f => (
                          <button key={f._id} onClick={() => handleDeleteFile(f._id)} style={{ marginLeft: "5px" }}>
                            🗑 Delete File
                          </button>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadFiles;
