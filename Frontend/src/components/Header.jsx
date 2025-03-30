import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../assets/256.avif";

function Header({ userRole, setUserRole }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    setUserRole(null);
    navigate("/");
  };

  return (
    <header>
      {/* Top banner */}
      <div className="top-banner">
        <img src={logo} alt="University Logo" />
        <h2>The University of Tampa</h2>
      </div>

      {/* Middle banner */}
      <div className="main-banner">
        <h1 className="cirt-title">
          Criminology Institute for Research and Training <br />
        </h1>
      </div>

      {/* Nav */}
      <nav className="nav-banner">
        <ul>
          <li><Link to="/">Home</Link></li>

          {/* Dropdown About */}
          <li className="dropdown">
            <span>About Us ▼</span>
            <ul className="dropdown-content">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </li>

          {/* Student Dropdown */}
          {userRole === "student" && (
            <li className="dropdown">
              <span>Upload ▼</span>
              <ul className="dropdown-content">
                <li><Link to="/upload-poster">Upload Poster</Link></li>
                <li><Link to="/upload-pdf">Upload PDF</Link></li>
              </ul>
            </li>
          )}

          {/* Faculty */}
          {userRole === "faculty" && <li><Link to="/review">Review Submissions</Link></li>}

          {/* Login */}
          {!userRole && <li><Link to="/login">Login</Link></li>}

          {/* Profile */}
          {userRole && (
            <li>
              <Link to="/profile">My Profile</Link>
            </li>
          )}

          {/* Logout */}
          {userRole && (
            <li>
              <span onClick={handleLogout} className="logout-button">Logout</span>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
