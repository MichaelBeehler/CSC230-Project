import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  // Google Maps URL for University of Tampa
  const mapsUrl = "https://maps.google.com/?q=University+of+Tampa,401+W.+Kennedy+Blvd,Tampa,FL+33606";
  
  return (
    <footer className="footer" style={{ 
      paddingTop: "10px",
      paddingBottom: "8px"
    }}>
      <div className="footer-container" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        flexWrap: "wrap",
        marginTop: "0"
      }}>
        {/* Left Side */}
        <div className="footer-left" style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: "0",
          marginTop: "0"
        }}>
          <h3 style={{ margin: "0 0 15px 0" }}>UNIVERSITY OF TAMPA</h3>
          
          {/* Clickable address that opens in Maps */}
          <a 
            href={mapsUrl}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: "white", 
              textDecoration: "none",
              margin: "0 0 7px 0"
            }}
          >
            <div style={{ lineHeight: "1.4" }}>401 W. Kennedy Blvd</div>
            <div style={{ lineHeight: "1.4", marginBottom: "7px" }}>Tampa, FL 33606-1490</div>
          </a>
          
          {/* Clickable phone number */}
          <a 
            href="tel:+18132533333" 
            style={{ 
              color: "white", 
              textDecoration: "none",
              lineHeight: "1.4" 
            }}
          >
            (813) 253-3333
          </a>
        </div>
        
        {/* Right Side */}
        <div className="footer-right" style={{ 
          textAlign: "right", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "flex-end",
          gap: "0",
          marginTop: "0"
        }}>
          <h4 style={{ 
            margin: "0 0 15px 0",
            fontWeight: "bold", 
            fontSize: "18px" 
          }}>Quick Links</h4>
          <Link to="/" style={{ 
            color: "white", 
            textDecoration: "none", 
            margin: "0 0 7px 0",
            lineHeight: "1.4"
          }}>Home</Link>
          <Link to="/contact" style={{ 
            color: "white", 
            textDecoration: "none", 
            margin: "0 0 7px 0",
            lineHeight: "1.4"
          }}>Contact Us</Link>
          <Link to="/about" style={{ 
            color: "white", 
            textDecoration: "none", 
            margin: "0",
            lineHeight: "1.4"
          }}>About Us</Link>
        </div>
      </div>
      
      {/* Bottom Section */}
      <div className="footer-bottom" style={{ 
        marginTop: "18px",

        marginBottom: "0",
        textAlign: "center",
        fontSize: "0.9em"
      }}>
        <p style={{ margin: "0 0 5px 0", lineHeight: "1.4" }}>© 2025 University of Tampa. All rights reserved.</p>
        <p style={{ margin: "0", lineHeight: "1.4" }}>Maintained by Department of Criminology</p>
      </div>
    </footer>
  );
}

export default Footer;
