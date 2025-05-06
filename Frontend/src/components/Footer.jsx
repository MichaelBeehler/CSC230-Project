import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  // Google Maps URL for University of Tampa
  const mapsUrl = "https://maps.google.com/?q=University+of+Tampa,401+W.+Kennedy+Blvd,Tampa,FL+33606";
    
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Side */}
        <div className="footer-left">
          <h3>UNIVERSITY OF TAMPA</h3>
                    
          {/* Clickable address that opens in Maps */}
          <a 
            href={mapsUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="address-link"
          >
            <div>401 W. Kennedy Blvd</div>
            <div>Tampa, FL 33606-1490</div>
          </a>
                    
          {/* Clickable phone number */}
          <a 
            href="tel:+18132533333" 
            className="phone-link"
          >
            (813) 253-3333
          </a>
        </div>
                
        {/* Right Side */}
        <div className="footer-right">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/about">About Us</Link>
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
