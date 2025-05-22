// components/SearchBar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "./SearchBar.css"; // Make sure this is included
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available tags from the backend
    const fetchTags = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/pdf/tags`);
        const data = await res.json();
        const options = data.map((tag) => ({ value: tag, label: tag }));
        setTagOptions(options);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };

    fetchTags();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.append("query", query.trim());
    if (selectedTags.length > 0) {
      const tags = selectedTags.map((tag) => tag.value).join(",");
      params.append("tags", tags);
    }
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Search by title or tag..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <Select
        isMulti
        options={tagOptions}
        value={selectedTags}
        onChange={setSelectedTags}
        placeholder="Filter by tags..."
        styles={{
          container: (base) => ({
            ...base,
            width: "300px",
            display: "inline-block",
            marginLeft: "10px",
            color: "black",
          }),
        }}
      />
      <button onClick={handleSearch} className="search-button">
        Search
      </button>
    </div>
  );
};

export default SearchBar;
