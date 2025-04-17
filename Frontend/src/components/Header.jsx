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
      {/* Middle banner */}
      <div className="main-banner">
        <div className="main-banner img">
        <a href="https://www.ut.edu" target="_blank" rel="noopener noreferrer">
          <img src={logo} alt="University Logo" />
          </a>

        </div>
        <div className="cirt-wrapper">
          <Link to="/" className="cirt-title">
            Criminology Institute for Research and Training
            </Link>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav-banner">
        <ul>
          {/* Dropdown About */}
          <li className="dropdown">
            <span>About Us ▾</span>
            <ul className="dropdown-content">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </li>

          {/* Links to Various Useful Resources (MyUTampa, faculty, etc.) */}
          <li className="dropdown">
            <span> Resources ▾</span>
            <ul className="dropdown-content">
              <a
                href="https://www.ut.edu/about-utampa/university-services/information-technology-and-security/myutampa"
                className="myutampa-button"
                target="_blank"
                rel="noopener noreferrer"
              >
              MyUTampa
              </a>
              <a
                href="https://www.ut.edu/academics/college-of-social-sciences-mathematics-and-education/criminology-and-criminal-justice-degrees/faculty-directory"
                className="myutampa-button"
                target="_blank"
                rel="noopener noreferrer"
              >
              Faculty Directory
              </a>
            </ul>
          </li>

          {/* Student Dropdown */}
          {userRole === "student" && (
            <li className="dropdown">
              <span>Upload ▾</span>
              <ul className="dropdown-content">
                <li><Link to="/upload-poster">Upload Poster</Link></li>
                <li><Link to="/upload-pdf">Upload Article</Link></li>
              </ul>
            </li>
          )}

          {/* Faculty Research Dropdown */}
          {userRole === "faculty" && (
            <li className="dropdown">
              <span>RESEARCH ▾</span>
              <ul className="dropdown-content">
                <li><Link to="/review">Review Submissions</Link></li>
              </ul>
            </li>
          )}

          {/* Login */}
          {!userRole && <li><Link to="/login">Login</Link></li>}

          {/* My Profile Dropdown */}
          {userRole && (
            <li className="dropdown">
              <span>MY PROFILE ▾</span>
              <ul className="dropdown-content">
                <li><Link to="/profile">My Profile</Link></li>
                <li><span onClick={handleLogout} className="logout-button">Logout</span></li>
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
