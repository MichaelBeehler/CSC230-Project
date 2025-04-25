import React, { useEffect, useState } from "react";
import "./RecentSubmissions.css";

function RecentSubmissions() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    // Assuming this is your approved PDFs endpoint (adjust if needed)
    fetch("http://localhost:4000/api/pdf/search?query=", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        setSubmissions(sorted.slice(0, 3)); // Get the latest 3
      })
      .catch((err) => console.error("Error fetching submissions:", err));
  }, []);

  return (
    <section className="recent-submissions">
      <h3>Featured Articles</h3>
      <div className="submission-grid">
        {submissions.map((item) => (
          <div key={item._id} className="submission-card">
            <a 
              href={`http://localhost:4000/api/pdf/view/${item._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="article-link"
            >
              <h3>{item.filename}</h3>
            </a>
            {item.comment && <p className="faculty-comment">Faculty Comment: {item.comment}</p>}
          </div>        ))}
      </div>
    </section>
  );
}

export default RecentSubmissions;