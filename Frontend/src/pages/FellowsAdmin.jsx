import React, { useEffect, useState } from "react";
import "./Fellows.css";

const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

function FellowsAdmin() {
  const [fellows, setFellows] = useState([]);
  const [newFellow, setNewFellow] = useState({
    name: "",
    year: "",
    bio: "",
    topic: "",
    faculty: "",
    links: [{ title: "", url: "" }],
    photo: null,
  });

  useEffect(() => {
    fetchFellows();
  }, []);

  const fetchFellows = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/fellows`);
      const data = await res.json();
      setFellows(data);
    } catch (error) {
      console.error("Error fetching fellows:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFellow({ ...newFellow, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewFellow({ ...newFellow, photo: e.target.files[0] });
  };

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...newFellow.links];
    updatedLinks[index][field] = value;
    setNewFellow({ ...newFellow, links: updatedLinks });
  };

  const addLinkField = () => {
    setNewFellow({ ...newFellow, links: [...newFellow.links, { title: "", url: "" }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in newFellow) {
      if (key === "links") {
        formData.append("links", JSON.stringify(newFellow.links));
      } else if (key === "photo") {
        if (newFellow.photo) formData.append("photo", newFellow.photo);
      } else {
        formData.append(key, newFellow[key]);
      }
    }

    try {
      const res = await fetch(`${backendUrl}/api/fellows`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        await fetchFellows();
        setNewFellow({
          name: "",
          year: "",
          bio: "",
          topic: "",
          faculty: "",
          links: [{ title: "", url: "" }],
          photo: null,
        });
      } else {
        console.error("Failed to upload fellow");
      }
    } catch (error) {
      console.error("Error uploading fellow:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fellow?")) return;
    try {
      await fetch(`${backendUrl}/api/fellows/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchFellows();
    } catch (error) {
      console.error("Error deleting fellow:", error);
    }
  };

  return (
    <div className="fellows-admin-page">
      <h2>Manage Fellows</h2>

      <form className="fellow-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={newFellow.name}
          onChange={handleInputChange}
          placeholder="Fellow's Name"
          required
        />
        <input
          type="text"
          name="year"
          value={newFellow.year}
          onChange={handleInputChange}
          placeholder="Fellowship Year"
          required
        />
        <textarea
          name="bio"
          value={newFellow.bio}
          onChange={handleInputChange}
          placeholder="Short Bio"
          required
        />
        <input
          type="text"
          name="topic"
          value={newFellow.topic}
          onChange={handleInputChange}
          placeholder="Research Topic"
          required
        />
        <input
          type="text"
          name="faculty"
          value={newFellow.faculty}
          onChange={handleInputChange}
          placeholder="Faculty Mentor"
          required
        />
        <label>Upload Photo:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <label>Links to Work:</label>
        {newFellow.links.map((link, index) => (
          <div key={index} className="link-fields">
            <input
              type="text"
              placeholder="Link Title"
              value={link.title}
              onChange={(e) => handleLinkChange(index, "title", e.target.value)}
            />
            <input
              type="url"
              placeholder="Link URL"
              value={link.url}
              onChange={(e) => handleLinkChange(index, "url", e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addLinkField}>
          + Add Another Link
        </button>

        <button type="submit" className="primary-submit-btn">Add Fellow</button>
      </form>

      <div className="fellows-list">
        {fellows.map((fellow) => (
          <div key={fellow._id} className="fellow-card-vertical">
            <img
              src={`${backendUrl}/api/fellows/photo/${fellow.photoId}`}
              alt={fellow.name}
              className="fellow-photo-large"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.png";
              }}
            />
            <div className="fellow-details">
              <h3>{fellow.name} ({fellow.year})</h3>
              <p className="fellow-bio">{fellow.bio}</p>
            </div>
            <button
              onClick={() => handleDelete(fellow._id)}
              className="delete-btn"
            >
              Delete Fellow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FellowsAdmin;
