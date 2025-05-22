import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfettiExplosion from "react-confetti-explosion";
import "./ReviewPage.css";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
function ReviewPage() {
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState({});
  const [filter, setFilter] = useState("Pending");
  const [confettiId, setConfettiId] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/pdf/all`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((pdf) => ({
          id: pdf._id,
          title: pdf.filename,
          description:
            pdf.metadata?.type === "poster"
              ? "Student-submitted poster."
              : "Student-submitted research paper.",
          status: pdf.metadata?.status || "Pending",
          comment: pdf.metadata?.comment || "",
          type: pdf.metadata?.type || "pdf",
          createdAt: pdf.uploadDate || pdf.uploadedAt || pdf.uploaded || pdf.createdAt || new Date().toISOString()
        }));
        setSubmissions(formatted);
      })
      .catch((err) => console.error("Error fetching PDFs:", err));
  }, []);

  const handleAction = async (id, recommendation) => {
    const comment = comments[id] || "";
    try {
      const res = await fetch(
        `${backendUrl}/api/pdf/${id}/recommendations`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recommendation, comment }),
        }
      );

      if (res.ok) {
        alert("✅ Recommendation submitted.");
        /*setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: newStatus } : s
          )
        );

        if (newStatus === "Approved") {
          setConfettiId(id);
          setTimeout(() => setConfettiId(null), 3000);
        }*/
      } else {
        console.error("❌ Error submitting recommendation.");
      }
    } catch (error) {
      console.error("❌ Failed to submit recommendation:", error);
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
                handleAction(submission.id, "approve")
              }
            >
              Recommend Approve
            </button>
            <button
              className="reject-btn"
              onClick={() =>
                window.confirm("Reject this submission?") &&
                handleAction(submission.id, "reject")
              }
            >
              Recommend Reject
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

export default ReviewPage;
