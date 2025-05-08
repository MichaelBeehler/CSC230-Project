import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const SearchResultsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query") || "";

  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState("all"); // New: default is 'all'

  useEffect(() => {
    const fetchResults = async () => {
      try {
        let url = `${backendUrl}/api/pdf/search?query=${query}`;
        if (filter !== "all") {
          url += `&type=${filter}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
      }
    };

    if (query.trim()) fetchResults();
  }, [query, filter]); // New: depend on both query and filter

  return (
    
    <div style={{ padding: "40px 60px", fontFamily: "Georgia, serif" }}>
      <div style={{ marginBottom: "30px" }}>
        <SearchBar />
      </div>

      {/* New: Filter Radio Buttons */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
        <label>
          <input
            type="radio"
            name="filter"
            value="all"
            checked={filter === "all"}
            onChange={(e) => setFilter(e.target.value)}
          />
          All
        </label>

        <label>
          <input
            type="radio"
            name="filter"
            value="poster"
            checked={filter === "poster"}
            onChange={(e) => setFilter(e.target.value)}
          />
          Posters
        </label>

        <label>
          <input
            type="radio"
            name="filter"
            value="article"
            checked={filter === "article"}
            onChange={(e) => setFilter(e.target.value)}
          />
          Journal Articles
        </label>
      </div>

      <h2 style={{ textAlign: "left" }}>
        Search Results for: <em>{query}</em>
      </h2>

      {results.length > 0 ? (
        results.map((pdf) => (
          <div
            key={pdf._id}
            style={{
              borderBottom: "1px solid #ccc",
              padding: "20px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px"
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>
                {pdf.type === "poster" ? "POSTER" : "JOURNAL ARTICLE"}
              </p>

              <a
                href={`${backendUrl}/api/pdf/view/${pdf._id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "18px",
                  color: "#1a0dab",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                {pdf.filename}
              </a>
              

              <p style={{ fontStyle: "italic", margin: "5px 0" }}>
              {new Date(pdf.approvedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              </p>

              <p>
                <strong>Faculty Comment:</strong>{" "}
                {pdf.comment?.trim() ? pdf.comment : "No comments"}
              </p>
            </div>

            <div style={{ textAlign: "right", minWidth: "120px" }}>
              <a
                href={`${backendUrl}/api/pdf/view/${pdf._id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  backgroundColor: "rgb(200, 16, 46)",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  marginBottom: "8px"
                }}
              >
                ⬇️ Download
              </a>
            </div>
          </div>
        ))
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchResultsPage;
