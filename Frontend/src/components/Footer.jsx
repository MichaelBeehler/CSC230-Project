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
            <li><a href="https://www.ut.edu/admissions" target="_blank" rel="noopener noreferrer">Admissions</a></li>
            <li><a href="https://www.ut.edu/campus-life" target="_blank" rel="noopener noreferrer">Campus Life</a></li>
            <li><a href="https://www.ut.edu/academics/office-of-the-provost/undergraduate-research-and-inquiry" target="_blank" rel="noopener noreferrer">Research</a></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
            <li><a href="https://www.ut.edu/about-utampa/university-services/emergency#:~:text=If%20you%20have%20an%20emergency,(813)%20257%2D7777." target="_blank" rel="noopener noreferrer">Emergency & Safety</a></li>
            <li><a href="https://www.ut.edu/about-utampa/university-services/human-resources/title-ix-" target="_blank" rel="noopener noreferrer">Title IX</a></li>
            <li><a href="https://utopia.ut.edu" target="_blank" rel="noopener noreferrer">Libraries</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
            <li><a href="https://www.ut.edu/graduate-degrees/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
            <li><a href="https://www.ut.edu/uploadedFiles/Student_Services/Health_and_Wellness_Center/Health-Center-Privacy-Policy.pdf" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            <li><a href="https://www.ut.edu/academics/academic-support/academic-success-center/student-accessibility-and-academic-support-/student-accessibility-services" target="_blank" rel="noopener noreferrer">Accessibility</a></li>
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