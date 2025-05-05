import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentProfilePage.css";
import pandaAvatar from "../avatars/panda.png";
import gorillaAvatar from "../avatars/gorilla.png";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [posters, setPosters] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("uploads");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const availableAvatars = [
    { id: "panda", src: pandaAvatar, alt: "Panda Avatar" },
    { id: "gorilla", src: gorillaAvatar, alt: "Gorilla Avatar" }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/profile`, {
          withCredentials: true,
        });
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchUploads = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/pdf/my-pdfs`, {
          withCredentials: true,
        });
        setUploads(data);
        const newNotifications = data.filter(item => item.metadata && (item.metadata.status === 'Approved' || item.metadata.status === 'Rejected')).map(item => ({
          id: item._id,
          message: item.metadata.status === 'Approved' ? `Your paper "${item.filename}" has been approved!` : `Your paper "${item.filename}" has been rejected.`,
          type: item.metadata.status === 'Approved' ? 'success' : 'error',
          comment: item.metadata.comment || ''
        }));
        setNotifications(newNotifications);
      } catch (error) {
        console.error("Error fetching uploaded PDFs:", error);
      }
    };

    const fetchPosters = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/pdf/my-posters`, {
          withCredentials: true,
        });
        setPosters(data);
      } catch (error) {
        console.error("Error fetching uploaded posters:", error);
      }
    };

    const fetchProfilePicture = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/profile-pic/current`, {
          withCredentials: true,
        });
        if (data.profilePicture) {
          setSelectedAvatar(data.profilePicture);
        } else {
          const savedAvatar = localStorage.getItem("selectedAvatar");
          if (savedAvatar) setSelectedAvatar(savedAvatar);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        const savedAvatar = localStorage.getItem("selectedAvatar");
        if (savedAvatar) setSelectedAvatar(savedAvatar);
      }
    };

    fetchUser();
    fetchUploads();
    fetchPosters();
    fetchProfilePicture();
  }, []);

  const getStatusBadge = (metadata) => {
    if (!metadata || !metadata.status) return <span className="status-badge pending">Pending</span>;
    switch (metadata.status) {
      case "Approved":
        return <span className="status-badge approved">Approved</span>;
      case "Rejected":
        return <span className="status-badge rejected">Rejected</span>;
      default:
        return <span className="status-badge pending">Pending</span>;
    }
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const updateProfilePicture = async () => {
    if (!selectedAvatar) return;
    try {
      await axios.post(`${backendUrl}/api/profile-pic/set-default`, {
        avatarId: selectedAvatar
      }, { withCredentials: true });
      localStorage.setItem("selectedAvatar", selectedAvatar);
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Failed to update profile picture. Please try again.");
    }
  };

  const AvatarModal = () => (
    <div className="avatar-modal-overlay">
      <div className="avatar-modal">
        <h3>Choose an Avatar</h3>
        <div className="avatar-grid">
          {availableAvatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`avatar-option ${selectedAvatar === avatar.id ? "selected" : ""}`}
              onClick={() => setSelectedAvatar(avatar.id)}
            >
              <img src={avatar.src} alt={avatar.alt} />
            </div>
          ))}
          {["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6610f2"].map((color, index) => (
            <div
              key={`default-${index}`}
              className={`avatar-option default-avatar ${selectedAvatar === `default-${index}` ? "selected" : ""}`}
              onClick={() => setSelectedAvatar(`default-${index}`)}
              style={{ backgroundColor: color }}
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
          ))}
        </div>
        <div className="avatar-modal-actions">
          <button onClick={() => setShowAvatarModal(false)}>Cancel</button>
          <button onClick={updateProfilePicture} className="primary">Save</button>
        </div>
      </div>
    </div>
  );

  const renderProfilePicture = () => {
    if (selectedAvatar?.startsWith("default-")) {
      const colorIndex = parseInt(selectedAvatar.split("-")[1]);
      const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8", "#6610f2"];
      return (
        <div className="avatar-placeholder" style={{ backgroundColor: colors[colorIndex] }}>
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
      );
    }
    const found = availableAvatars.find(a => a.id === selectedAvatar);
    if (found) {
      return <img src={found.src} alt={found.alt} className="avatar-image" />;
    }
    return (
      <div className="avatar-placeholder">
        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-page">
        <h2>Your Profile</h2>

        {user ? (
          <div className="profile-card">
            <div className="profile-info">
              <div className="user-details">
                <p><strong>Welcome:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              </div>
              <div className="profile-picture">
                {renderProfilePicture()}
                <button className="change-avatar-btn" onClick={() => setShowAvatarModal(true)}>
                  Change Avatar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}

        <div className="content-tabs">
          <div className="tab-navigation">
            <button className={`tab-button ${activeTab === "uploads" ? "active" : ""}`} onClick={() => setActiveTab("uploads")}>
              My Uploaded PDFs
            </button>
            <button className={`tab-button ${activeTab === "posters" ? "active" : ""}`} onClick={() => setActiveTab("posters")}>
              My Uploaded Posters
            </button>
            <button className={`tab-button ${activeTab === "tracker" ? "active" : ""}`} onClick={() => setActiveTab("tracker")}>
              PDF Tracker
            </button>
          </div>

          {activeTab === "uploads" && (
            <div className="uploads-section">
              {uploads.length === 0 ? (
                <p>No PDFs uploaded yet.</p>
              ) : (
                <ul className="pdf-list">
                  {uploads.map((item) => (
                    <li key={item._id} className="pdf-item">
                      <div className="pdf-info">
                        <a href={`${backendUrl}/api/pdf/view/${item._id}`} target="_blank" rel="noopener noreferrer">
                          📄 {item.filename}
                        </a>
                        {getStatusBadge(item.metadata)}
                      </div>
                      {item.metadata?.comment && (
                        <div className="pdf-comment">
                          <p><strong>Faculty Comment:</strong> {item.metadata.comment}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "posters" && (
            <div className="uploads-section">
              {posters.length === 0 ? (
                <p>No posters uploaded yet.</p>
              ) : (
                <ul className="pdf-list">
                  {posters.map((item) => (
                    <li key={item._id} className="pdf-item">
                      <div className="pdf-info">
                        <a href={`${backendUrl}/api/pdf/view/${item._id}`} target="_blank" rel="noopener noreferrer">
                          🖼️ {item.filename}
                        </a>
                        {getStatusBadge(item.metadata)}
                      </div>
                      {item.metadata?.comment && (
                        <div className="pdf-comment">
                          <p><strong>Faculty Comment:</strong> {item.metadata.comment}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "tracker" && (
            <div className="tracker-section">
              <p className="placeholder-text">PDF Tracker functionality coming soon...</p>
            </div>
          )}
        </div>
      </div>

      <div className="notification-sidebar">
        <h3>Updates</h3>
        {notifications.length === 0 ? (
          <p className="no-notifications">No updates at this time.</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li key={notification.id} className={`notification-item ${notification.type}`}>
                <div className="notification-content">
                  <p>{notification.message}</p>
                  {notification.comment && <p className="notification-comment">Comment: {notification.comment}</p>}
                </div>
                <button className="notification-close" onClick={() => removeNotification(notification.id)}>&times;</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAvatarModal && <AvatarModal />}
    </div>
  );
};

export default ProfilePage;
