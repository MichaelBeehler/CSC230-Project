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
      <h2>Recently Approved Submissions</h2>
      <div className="submission-grid">
        {submissions.map((item) => (
          <div key={item._id} className="submission-card">
            <h3>{item.filename}</h3>
            {item.comment && <p className="faculty-comment">Faculty Comment: {item.comment}</p>}
            <a 
              href={`http://localhost:4000/api/pdf/view/${item._id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="view-link"
            >
              View File
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentSubmissions;
