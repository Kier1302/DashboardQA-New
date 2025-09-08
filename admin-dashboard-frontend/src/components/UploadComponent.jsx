import { useState } from "react";
import axios from "axios";

const UploadComponent = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store selected file
  };

  const handleUpload = async () => {
    if (!file) {
      alert("⚠️ Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("name", file.name);
    formData.append("type", "file"); // ✅ Ensure 'type' is provided
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Upload success:", response.data);
      alert("✅ File uploaded successfully!");
      setFile(null); // Reset file input after upload
    } catch (error) {
      console.error("❌ Upload failed:", error.response?.data?.message);
      alert(`❌ Upload failed: ${error.response?.data?.message}`);
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>
  );
};

export default UploadComponent;
