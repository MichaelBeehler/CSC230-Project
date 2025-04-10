import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query") || "";

  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/pdf/search?query=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
      }
    };

    if (query.trim()) fetchResults();
  }, [query]);

  return (
    <div style={{ padding: "40px 60px", fontFamily: "Georgia, serif" }}>
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
              alignItems: "flex-start",
              gap: "20px"
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>
                JOURNAL ARTICLE
              </p>
              <a
                href={`http://localhost:4000/api/pdf/view/${pdf._id}`}
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
                {/* Replace with actual author and source info if available */}
                John Doe — University of Tampa, 2025
              </p>
              <p>
                <strong>Faculty Comment:</strong>{" "}
                {pdf.comment?.trim() ? pdf.comment : "No comments"}
              </p>
            </div>

            <div style={{ textAlign: "right", minWidth: "120px" }}>
              <a
                href={`http://localhost:4000/api/pdf/view/${pdf._id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  backgroundColor: "#990000",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  marginBottom: "8px"
                }}
              >
                ⬇️ Download
              </a>
              <button
                style={{
                  display: "block",
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                🔖 Save
              </button>
              <button
                style={{
                  display: "block",
                  width: "100%",
                  padding: "6px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                📄 Cite
              </button>
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