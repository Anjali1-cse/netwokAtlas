import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate(); 

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("File uploaded successfully!");
        
        // Notify the MapComponent that new data is available
        if (onFileUpload) {
          onFileUpload();
        }

        // Redirect to the map page
        navigate("/map");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    }
  };

  return (
    <div>
      <h2>Upload Excel File</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>
    </div>
  );
};

export default FileUpload;
