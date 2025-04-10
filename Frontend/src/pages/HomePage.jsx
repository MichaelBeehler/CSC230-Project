import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecentSubmissions from "../components/RecentSubmissions";

const HomePage = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome to the Academic Journal</h1>
      <p>Search for approved publications below:</p>

      <input
        type="text"
        placeholder="Search by title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", width: "300px", borderRadius: "5px", marginRight: "10px" }}
      />
      <button
        onClick={handleSearch}
        style={{ padding: "10px 20px", borderRadius: "5px", backgroundColor: "black", color: "white", border: "none" }}
      >
        Search
      </button>

      {/* You can remove the in-page results since they'll now show on /search */}
      {/* <div>
        {results.length > 0 ? (
          <ul>
            {results.map((pdf) => (
              <li key={pdf._id}>
                <a href={`http://localhost:4000/api/pdf/view/${pdf._id}`} target="_blank" rel="noopener noreferrer">
                  {pdf.filename}
                </a>
                <p><strong>Faculty Comment:</strong> {pdf.comment || "No comments"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found.</p>
        )}
      </div> */}

      {/* Recent Submissions stays on the homepage */}
      <RecentSubmissions />
    </div>
  );
};

export default HomePage;
