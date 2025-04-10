// components/SearchBar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Search by title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          borderRadius: "5px",
          marginRight: "10px",
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          backgroundColor: "black",
          color: "white",
          border: "none",
        }}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
