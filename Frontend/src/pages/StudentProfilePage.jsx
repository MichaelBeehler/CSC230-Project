import React, { useState, useEffect } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch the user's profile data and uploaded PDFs
  useEffect(() => {
    fetchUserData();
    fetchUploads();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:4000/profile", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);  // Assuming the user data is returned in 'data.user'
      } else {
        setMessage("Error loading user data.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setMessage("Error fetching user data.");
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/pdf/my-pdfs", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setUploads(data || []);
    } catch (err) {
      console.error("Error fetching uploads:", err);
      setMessage("Error fetching uploads.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", color: "black" }}>
      <h2>Your Profile</h2>
      {message && <p>{message}</p>}

      {user ? (
        <>
          <p>Welcome, {user.firstName} {user.lastName}!</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </>
      ) : (
        <p>Loading user data...</p>
      )}

      {/* Display uploaded PDFs */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h3>My Uploaded PDFs</h3>
        {uploads.length === 0 ? (
          <p>No PDFs uploaded yet.</p>
        ) : (
          <ul>
            {uploads.map((item) => (
              <li key={item._id}>
                <a
                  href={`http://localhost:4000/api/pdf/view/${item._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.filename}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
