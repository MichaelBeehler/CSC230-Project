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
    <header className="unified-header">
    <div className="header-left">
      <a href="https://www.ut.edu" target="_blank" rel="noopener noreferrer">
        <img src={logo} alt="University Logo" />
      </a>
      <Link to="/" className="cirt-title">
        Criminology Institute for Research and Training
      </Link>
    </div>

    <nav className="header-right">
      <ul>
        <li className="dropdown">
          <span>About Us ▾</span>
          <ul className="dropdown-content">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </li>

        <li className="dropdown">
          <span>Resources ▾</span>
          <ul className="dropdown-content">
            <li>
              <a
                href="https://www.ut.edu/about-utampa/university-services/information-technology-and-security/myutampa"
                target="_blank"
                rel="noopener noreferrer"
              >
                MyUTampa
              </a>
            </li>
            <li>
              <a
                href="https://www.ut.edu/academics/college-of-social-sciences-mathematics-and-education/criminology-and-criminal-justice-degrees/faculty-directory"
                target="_blank"
                rel="noopener noreferrer"
              >
                Faculty Directory
              </a>
            </li>
          </ul>
        </li>

        {userRole === "student" && (
          <li className="dropdown">
            <span>Upload ▾</span>
            <ul className="dropdown-content">
              <li><Link to="/upload-poster">Upload Poster</Link></li>
              <li><Link to="/upload-pdf">Upload Article</Link></li>
            </ul>
          </li>
        )}

        {userRole === "faculty" && (
          <li className="dropdown">
            <span>Research ▾</span>
            <ul className="dropdown-content">
              <li><Link to="/review">Review Submissions</Link></li>
            </ul>
          </li>
        )}

        {userRole === "editor" && (
          <li className="dropdown">
            <span>Assign & Review ▾</span>
            <ul className="dropdown-content">
              <li><Link to="/editor">Review Submissions</Link></li>
              <li><Link to="/manage">Manage Users</Link></li>
            </ul>
          </li>
        )}

        {!userRole && <li><Link to="/login">Login</Link></li>}

        {userRole && (
          <li className="dropdown">
            <span>My Profile ▾</span>
            <ul className="dropdown-content">
              <li><Link to="/profile">My Profile</Link></li>
              <li>
                  <span onClick={handleLogout} className="logout-button">Logout</span>
              </li>

            </ul>
          </li>
        )}
      </ul>
    </nav>
  </header>
  );
}

export default Header;
