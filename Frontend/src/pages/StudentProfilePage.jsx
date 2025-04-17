import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/profile", {
          withCredentials: true,
        });
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchUploads = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/pdf/my-pdfs", {
          withCredentials: true,
        });
        setUploads(data);
      } catch (error) {
        console.error("Error fetching uploaded PDFs:", error);
      }
    };

    fetchUser();
    fetchUploads();
  }, []);

  return (
    <div className="profile-page">
      <h2>Your Profile</h2>

      {user ? (
        <div className="profile-card">
          <p><strong>Welcome:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      <div className="uploads-section">
        <h3>My Uploaded PDFs</h3>
        {uploads.length === 0 ? (
          <p>No PDFs uploaded yet.</p>
        ) : (
          <ul className="pdf-list">
            {uploads.map((item) => (
              <li key={item._id}>
                <a
                  href={`http://localhost:4000/api/pdf/view/${item._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 {item.filename}
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
