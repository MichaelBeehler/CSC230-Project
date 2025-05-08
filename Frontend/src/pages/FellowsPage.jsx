import React, { useEffect, useState } from "react";
import "./Fellows.css";

function FellowsPage() {
  const [fellows, setFellows] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/fellows")
      .then((res) => res.json())
      .then((data) => setFellows(data))
      .catch((err) => console.error("Error fetching fellows:", err));
  }, []);

  return (
    <div className="fellows-page">
      <h2>Meet Our Fellows</h2>
      <div className="fellows-list">
        {fellows.map((fellow) => (
          <div key={fellow._id} className="fellow-card-vertical">
            <img
              src={`http://localhost:4000/uploads/fellows/${fellow.photo}`}
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
              <p><strong>Research Focus:</strong> {fellow.topic}</p>
              <p><strong>Worked with:</strong> {fellow.faculty}</p>
              {fellow.links?.length > 0 && (
                <div className="fellow-links">
                  <strong>Work:</strong>
                  <ul>
                    {fellow.links.map((link, index) => (
                      <li key={index}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FellowsPage;
