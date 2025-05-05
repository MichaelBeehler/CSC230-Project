import React, { useEffect, useState } from "react";
import "./EditorDashboard.css";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

function EditorDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState({});
  const [recommendations, setRecommendations] = useState({});


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

  const pendingSubmissions = submissions.filter((sub) => sub.status === "Pending");

  return (
    <div className="review-container">
      <h2>Review Submissions</h2>

      {pendingSubmissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <div className="card-grid">
          {pendingSubmissions.map((submission) => (
            <div key={submission.id} className="review-card">
              <h3>{submission.title}</h3>
              <p>{submission.description}</p>
              <p>
                Status:{" "}
                <span className={`status ${submission.status.toLowerCase()}`}>
                  {submission.status}
                </span>
              </p>

              {/* Reviewer Recommendations */}
              {recommendations[submission.id] && recommendations[submission.id].length > 0 && (
                <div className="recommendations">
                  <h4>Reviewer Recommendations:</h4>
                  <ul>
                    {recommendations[submission.id].map((rec) => (
                      <li key={rec._id}>
                        <strong>{rec.reviewerName || "Reviewer"}:</strong>{" "}
                        {rec.recommendation} — "{rec.comment}"
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
                <a
                  href={`${backendUrl}/api/pdf/view/${submission.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </a>

                <button
                  className="approve-btn"
                  onClick={() => {
                    if (
                      window.confirm("Are you sure you want to approve this submission?")
                    ) {
                      handleAction(submission.id, "Approved");
                    }
                  }}
                >
                  Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() => {
                    if (
                      window.confirm("Are you sure you want to reject this submission?")
                    ) {
                      handleAction(submission.id, "Rejected");
                    }
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EditorDashboard;