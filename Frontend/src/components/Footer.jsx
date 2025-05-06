import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>University of Tampa</p>
          <p>401 W. Kennedy Blvd</p>
          <p>Tampa, FL 33606-1490</p>
          <p>(813) 253-3333</p>
        </div>
        <div className="footer-right">
          <p>Quick Links</p>
          <p><Link to="/">Home</Link></p>
          <p><Link to="/contact">Contact Us</Link></p>
          <p><Link to="/about">About Us</Link></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
