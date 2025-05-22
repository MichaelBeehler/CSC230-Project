import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FiUploadCloud } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import "./UploadPage.css";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

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

  const title = type === "pdf" ? "Article" : "Poster";
  const uploadUrl = type === "pdf"
    ? `${backendUrl}/api/pdf/upload-pdf`
    : `${backendUrl}/api/pdf/upload-poster`;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
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
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warn("Please select a file.");
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
        toast.success(`Upload successful: ${data.filename}`);
        setFile(null);
        setDescription("");
        setCustomFilename("");
        setSelectedTags([]);
      } else {
        toast.error(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      toast.error("Upload error, check console.");
      console.error("Upload Error:", error);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload {title}</h2>

      <div
        className={`upload-box ${dragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FiUploadCloud size={40} className="upload-icon" />
        {file ? (
          <p>📄 {file.name}</p>
        ) : (
          <p>
            Drag & Drop or <label className="file-label">Click to Select</label>
          </p>
        )}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      <input
        type="text"
        placeholder="Enter a custom filename (optional)"
        value={customFilename}
        onChange={(e) => setCustomFilename(e.target.value)}
        className="upload-input"
      />

      <div className="tag-container">
        <p>Select Research Categories:</p>
        <div className="tags-grid">
          {TAG_OPTIONS.map((tag) => (
            <label key={tag} className="tag-option">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <textarea
        placeholder="Enter a description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="upload-textarea"
      ></textarea>

      <button onClick={handleUpload} disabled={!file}>Upload</button>

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </div>
  );
}

export default UploadPage;
