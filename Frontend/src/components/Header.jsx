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
        <div className="top-left">
        <img src={logo} alt="University Logo" />
        <a
          href="https://www.ut.edu"
          className="ut-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          University of Tampa
        </a>
      </div>

      <a
        href="https://www.ut.edu/about-utampa/university-services/information-technology-and-security/myutampa"
        className="myutampa-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        MyUTampa
      </a>
    </div>



      {/* Middle banner */}
      <div className="main-banner">
        <div className="cirt-wrapper">
          <Link to="/" className="cirt-title">
            Criminology Institute for Research and Training
            </Link>
          <p className="cirt-subtitle">
            <a
              href="https://www.ut.edu/academics/college-of-social-sciences-mathematics-and-education"
              className="cirt-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              College of Social Sciences, Mathematics, and Education
            </a>
            <span className="light-symbol">&nbsp;&gt;&nbsp;</span>
            <a
              href="https://www.ut.edu/academics/college-of-social-sciences-mathematics-and-education/criminology-and-criminal-justice-degrees"
              className="cirt-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              B.S. in Criminology and Criminal Justice
            </a>
          </p>
      </div>
    </div>

      {/* Nav */}
      <nav className="nav-banner">
        <ul>
          {/* Dropdown About */}
          <li className="dropdown">
            <span>ABOUT US ▾</span>
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
