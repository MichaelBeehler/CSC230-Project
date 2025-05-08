import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import "./EditorDashboard.css";
import ConfettiExplosion from 'react-confetti-explosion';
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

function EditorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState({});
  const [recommendations, setRecommendations] = useState({});
  const [filter, setFilter] = useState("Pending");
  const [confettiId, setConfettiId] = useState(null);


  // Fetch all uploaded PDFs (Faculty only)
  useEffect(() => {
    fetch(`${backendUrl}/api/pdf/all`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const formattedSubmissions = data.map((pdf) => ({
          id: pdf._id,
          title: pdf.filename,
          description: "Student-submitted research paper.",
          status: pdf.metadata?.status || "Pending",
          comment: pdf.metadata?.comment || "",
          type: pdf.metadata?.type || "pdf",
          createdAt: pdf.uploadDate || pdf.uploadedAt || pdf.uploaded || pdf.createdAt || new Date().toISOString()
        }));
        setSubmissions(formattedSubmissions);
  
        // Fetch recommendations for each PDF
        data.forEach((pdf) => {
          fetch(`${backendUrl}/api/pdf/${pdf._id}/recommendations`, {
            credentials: "include",
          })
            .then((res) => res.json())
            .then((recData) => {
              setRecommendations((prev) => ({
                ...prev,
                [pdf._id]: recData.recommendations || [],
              }));
            })
            .catch((err) =>
              console.error(`Error fetching recommendations for ${pdf._id}:`, err)
            );
        });
      })
      .catch((err) => console.error("Error fetching PDFs:", err));
  }, []);

  // Handle Approve/Reject Actions (Send to Backend)
  const handleAction = async (id, newStatus) => {
    const comment = comments[id] || "";

    try {
      const response = await fetch(`${backendUrl}/api/pdf/update-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus, comment }),
      });

      if (response.ok) {
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === id ? { ...sub, status: newStatus, comment } : sub
          )
        );
      } else {
        console.error("❌ Error updating status.");
      }
    } catch (error) {
      console.error("❌ Failed to update status:", error);
    }
  };

  const filtered = submissions.filter(
    (s) => filter === "All" || s.status === filter
  );
  const grouped = {
    pdf: filtered.filter((s) => s.type !== "poster"),
    poster: filtered.filter((s) => s.type === "poster"),
  };

  return (
    <div className="review-container">
    <h2>Review Submissions</h2>

    {/* Filter Controls */}
    <div style={{ marginBottom: "20px", textAlign: "center" }}>
      <label style={{ fontWeight: "bold", marginRight: "10px" }}>
        Filter by Status:
      </label>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>

    {/* PDFs */}
    <h3>Research Papers</h3>
    {grouped.pdf.length === 0 ? (
      <p>No matching research papers.</p>
    ) : (
      <div className="card-grid">
        {grouped.pdf.map((sub) => renderCard(sub))}
      </div>
    )}

    {/* Posters */}
    <h3>Posters</h3>
    {grouped.poster.length === 0 ? (
      <p>No matching posters.</p>
    ) : (
      <div className="card-grid">
        {grouped.poster.map((sub) => renderCard(sub))}
      </div>
    )}
  </div>
);

function renderCard(submission) {
  const formattedDate = new Date(submission.createdAt).toLocaleString();

  return (
    <div key={submission.id} className="review-card">
      <h3>{submission.title}</h3>
      <p style={{ fontWeight: "bold" }}>{submission.description}</p>
      <p>
        Status:{" "}
        <span
          className={`status ${submission.status.toLowerCase()} status-animate`}
        >
          {submission.status}
        </span>
      </p>
      <p className="submission-date">Submitted: {formattedDate}</p>

      {/* Reviewer Recommendations */}
      {recommendations[submission.id] && recommendations[submission.id].length > 0 && (
        <div className="recommendations">
          <h4>Reviewer Recommendations:</h4>
          <ul>
            {recommendations[submission.id].map((rec) => (
              <li key={rec._id}>
                <strong>{rec.reviewerName || "Reviewer"}:</strong>{" "}
                {rec.recommendation}
              </li>
            ))}
          </ul>
        </div>
        )}

      <textarea
        placeholder="Enter comments..."
        value={comments[submission.id] || ""}
        onChange={(e) =>
          setComments({ ...comments, [submission.id]: e.target.value })
        }
      ></textarea>

      <div className="button-group">
        <Link
          to={`/annotate/${submission.id}`}
          className="annotate-link"
        >
          Annotate PDF
        </Link>
        <div className="button-row">
          <button
            className="approve-btn"
            onClick={() =>
              window.confirm("Approve this submission?") &&
              handleAction(submission.id, "Approved")
            }
          >
            Approve Submission
          </button>
          <button
            className="reject-btn"
            onClick={() =>
              window.confirm("Reject this submission?") &&
              handleAction(submission.id, "Rejected")
            }
          >
            Reject Submission
          </button>
        </div>
      </div>

      {confettiId === submission.id && (
        <ConfettiExplosion force={0.8} duration={2500} particleCount={120} />
      )}
    </div>
  );
}
}

export default EditorDashboard;