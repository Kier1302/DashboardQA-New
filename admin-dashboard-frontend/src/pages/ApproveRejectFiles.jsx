import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";


const ApproveRejectFiles = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/files");
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/files/${id}`, { status });
      fetchFiles();
    } catch (error) {
      console.error("Error updating file status:", error);
    }
  };

  return (
    <>
      <Navbar /> {/* ✅ Navbar added here */}
      <div className="approval-section">
        <div className="page-container">
          <h3>✅ Approve / ❌ Reject Files</h3>
          <table>
            <thead>
              <tr>
                <th>File Name / URL</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.filter((file) => file.status === "pending").length > 0 ? (
                files
                  .filter((file) => file.status === "pending")
                  .map((file) => (
                    <tr key={file._id}>
                      <td>
                        {file.type === "file" ? (
                          <a
                            href={`http://localhost:5000${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.name}
                          </a>
                        ) : (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.url}
                          </a>
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleFileStatus(file._id, "accepted")}>
                          ✅ Accept
                        </button>
                        <button onClick={() => handleFileStatus(file._id, "rejected")}>
                          ❌ Reject
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="2">⚠️ No pending files.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ApproveRejectFiles;
