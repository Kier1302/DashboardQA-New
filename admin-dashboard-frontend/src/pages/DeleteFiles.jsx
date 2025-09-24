import { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";


const DeleteFiles = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.get("/api/files");
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this file?")) return;

    try {
      await api.delete(`/api/files/${id}`);
      fetchFiles(); // Refresh list
    } catch (error) {
      alert("❌ Failed to delete file!");
    }
  };

  return (
    <>
      <Navbar /> {/* ✅ Navbar added here */}
      <div className="delete-section">
        <div className="page-container">
          <h3>🗑 Delete Files</h3>
          <table>
            <thead>
              <tr>
                <th>File Name / URL</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id}>
                  <td>
                    {file.type === "file" ? (
                      <a
                        href={`${api.defaults.baseURL}${file.url}`}
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
                    {file.status === "accepted" && "✅ Accepted"}
                    {file.status === "rejected" && "❌ Rejected"}
                    {!file.status && "⏳ Pending"}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteFile(file._id)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DeleteFiles;
