import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>

        {/* Left Side */}
        <div className="footer-left" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <h3>UNIVERSITY OF TAMPA</h3>
          <p>401 W. Kennedy Blvd</p>
          <p>Tampa, FL 33606-1490</p>
          <p>(813) 253-3333</p>
        </div>

        {/* Right Side */}
        <div className="footer-right" style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <h4 style={{ marginBottom: "5px", fontWeight: "bold", fontSize: "18px" }}>Quick Links</h4>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
          <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>Contact Us</Link>
          <Link to="/about" style={{ color: "white", textDecoration: "none" }}>About Us</Link>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>© 2025 University of Tampa. All rights reserved.</p>
        <p>Maintained by Department of Criminology</p>
      </div>
    </footer>
  );
}

export default Footer;
