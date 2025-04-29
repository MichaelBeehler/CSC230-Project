import React, { useEffect, useState } from "react";
import "./UploadPage.css";

const TAG_OPTIONS = [
  "Corrections",
  "Courts/Sentencing",
  "White Collar Crime",
  "Mental Health",
  "Victimology",
  "Criminal Theory",
  "Statistics/Methodology",
  "Policing",
  "Crime Prevention",
  "Policy"
];

function UploadPage({ type }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [customFilename, setCustomFilename] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [uploads, setUploads] = useState([]);

  const title = type === "pdf" ? "Article" : "Poster";
  const uploadUrl = type === "pdf"
    ? "https://csc230-project.onrender.com/api/pdf/upload-pdf"
    : "https://csc230-project.onrender.com/api/pdf/upload-poster";

  const fetchUrl = type === "pdf"
    ? "https://csc230-project.onrender.com/api/pdf/my-pdfs"
    : "https://csc230-project.onrender.com/api/pdf/my-posters";

  useEffect(() => {
    fetch(fetchUrl, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUploads(data))
      .catch((err) => console.error("Error fetching uploads:", err));
  }, [fetchUrl]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setMessage("");
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
    setMessage("");
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("filename", customFilename.trim());
    formData.append("tags", JSON.stringify(selectedTags));

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Upload successful: ${data.filename}`);
        setFile(null);
        setDescription("");
        setCustomFilename("");
        setSelectedTags([]);
        setUploads([...uploads, { _id: data.filename, filename: file.name }]);
      } else {
        setMessage(`❌ Upload failed: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Upload error, check console.");
      console.error("Upload Error:", error);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload {title}</h2>

      {/* Drag & Drop Box */}
      <div
        className={`upload-box ${dragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <p>📄 {file.name}</p>
        ) : (
          <p>Drag & Drop a file here or <label className="file-label">Click to select</label></p>
        )}
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="file-input" />
      </div>

      {/* Filename Input */}
      <input
        type="text"
        placeholder="Enter a custom filename (optional)"
        value={customFilename}
        onChange={(e) => setCustomFilename(e.target.value)}
        style={{ marginBottom: "10px", width: "100%", padding: "5px" }}
      />

      {/* Tags */}
      <div style={{ textAlign: "left", marginBottom: "10px" }}>
        <p>Select Research Categories:</p>
        {TAG_OPTIONS.map((tag) => (
          <label key={tag} style={{ display: "block", marginBottom: "5px" }}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => handleTagToggle(tag)}
            />{" "}
            {tag}
          </label>
        ))}
      </div>

      {/* Description Input */}
      <textarea
        placeholder="Enter a description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      {/* Upload Button */}
      <button onClick={handleUpload} disabled={!file}>Upload</button>

      {message && <p className="upload-message">{message}</p>}

      <h3>My Uploaded {title}s</h3>
      {uploads.length === 0 ? (
        <p>No {title}s uploaded yet.</p>
      ) : (
        <ul>
          {uploads.map((item) => (
            <li key={item._id}>
              <a href={`https://csc230-project.onrender.com/api/pdf/view/${item._id}`} target="_blank" rel="noopener noreferrer">
                {item.filename}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UploadPage;