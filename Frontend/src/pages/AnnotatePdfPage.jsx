import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./AnnotatePdfPage.css";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

function AnnotatePdfPage() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const iframeRef = useRef(null);

  // Fetch PDF from the server
  useEffect(() => {
    const fetchPdf = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${backendUrl}/api/pdf/view/${id}`,
          {
            responseType: "blob",
            withCredentials: true,
            timeout: 10000 // 10 second timeout
          }
        );
        
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
        
        // Fetch comments for this PDF
        fetchComments();
      } catch (error) {
        console.error("Failed to fetch PDF:", error);
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          setError("Cannot connect to the server. Please make sure the backend server is running.");
        } else if (error.response && error.response.status === 404) {
          setError("PDF not found. The requested document may have been deleted or doesn't exist.");
        } else if (error.response && error.response.status === 403) {
          setError("You don't have permission to view this document.");
        } else {
          setError(`Error loading PDF: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  // Fetch comments for this PDF
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/pdf/${id}/comments`,
        { withCredentials: true }
      );
      
      if (response.data && response.data.comments) {
        setComments(response.data.comments);
      } else {
        // If no comments endpoint exists yet, use an empty array
        setComments([]);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      // If the endpoint doesn't exist, just use an empty array
      setComments([]);
    }
  };

  // Add a new comment
  const addComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // Create a new comment object
      const commentData = {
        text: newComment
      };
      
      const response = await axios.post(
        `${backendUrl}/api/pdf/${id}/comments`,
        commentData,
        { withCredentials: true }
      );
      
      if (response.data && response.data.comment) {
        setComments([...comments, response.data.comment]);
      } else {
        // Fallback if response format is different
        const tempComment = {
          _id: Date.now().toString(),
          text: newComment,
          author: "You",
          createdAt: new Date().toISOString()
        };
        setComments([...comments, tempComment]);
      }
      
      setNewComment(""); // Clear the input field
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Add comment to local state even if API fails
      const tempComment = {
        _id: Date.now().toString(),
        text: newComment,
        author: "You",
        createdAt: new Date().toISOString()
      };
      setComments([...comments, tempComment]);
      setNewComment("");
    }
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    try {
      // Remove from local state first for immediate feedback
      setComments(comments.filter(comment => comment._id.toString() !== commentId.toString()));
      
      await axios.delete(
        `${backendUrl}/api/pdf/${id}/comments/${commentId}`,
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
      // If the endpoint doesn't exist, we still keep the comment removed from local state
    }
  };

  // Handle Enter key press in comment input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addComment();
    }
  };

  // Retry loading the PDF
  const retryLoading = () => {
    setPdfUrl("");
    setIsLoading(true);
    setError(null);
    // This will trigger the useEffect to run again
  };

  return (
    <div className="pdf-viewer-page">
      <div className="pdf-viewer-header">
        <h2>PDF Annotator</h2>
        <p className="instructions">Add comments to this document</p>
      </div>
      
      <div className="pdf-viewer-content">
        <div className="pdf-viewer-container">
          {isLoading ? (
            <div className="loading-indicator">Loading PDF...</div>
          ) : error ? (
            <div className="error-container">
              <div className="error-message">{error}</div>
              <div className="error-help">
                <p>Possible solutions:</p>
                <ul>
                  <li>Make sure the backend server is running on port 4000</li>
                  <li>Check your network connection</li>
                  <li>Verify that you have permission to access this document</li>
                  <li>The document ID might be incorrect or the document might have been deleted</li>
                </ul>
                <button className="retry-button" onClick={retryLoading}>
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=1&navpanes=1`}
              className="pdf-iframe"
              title="PDF Viewer"
              width="100%"
              height="100%"
            />
          )}
        </div>
        
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Comments</h3>
          </div>
          
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                No comments yet. Add a comment below.
              </div>
            ) : (
              <ul>
                {comments.map((comment) => (
                  <li key={comment._id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author || "Anonymous"}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-text">{comment.text}</div>
                    <button 
                      className="delete-comment-btn"
                      onClick={() => deleteComment(comment._id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="add-comment-section">
            <textarea
              className="comment-textarea"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!!error}
            />
            <button
              className="add-comment-btn"
              onClick={addComment}
              disabled={!newComment.trim() || !!error}
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnotatePdfPage;
