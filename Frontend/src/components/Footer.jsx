import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Left Section */}
        <div className="footer-left">
          <h3>UNIVERSITY OF TAMPA</h3>
          <p>401 W. Kennedy Blvd</p>
          <p>Tampa, FL 33606-1490</p>
          <p>(813) 253-3333</p>
          <div className="footer-socials">
            <a href="#"><i className="fab fa-x-twitter"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
        </div>

        {/* Middle Section */}
        <div className="footer-links">
          <div>
            <h4>Academics</h4>
            <ul>
              <li><a href="#">Admissions</a></li>
              <li><a href="#">Campus Life</a></li>
              <li><a href="#">Research</a></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Emergency & Safety</a></li>
              <li><a href="#">Title IX</a></li>
              <li><a href="#">Libraries</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Accessibility</a></li>
            </ul>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2025 University of Tampa. All rights reserved.</p>
        <p>Maintained by Department of Criminology</p>
      </div>
    </footer>
  );
}

export default Footer;
