import React from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css"; // ✅ Don't forget to import the CSS file
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

function AboutPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px", fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      
      {/* Mission Section */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>Mission Statement</h2>
        <hr style={{ border: "none", borderTop: "2px solid darkred", width: "50px", marginLeft: "0", marginBottom: "20px" }} />
        <p>
          The Department of Criminology and Criminal Justice is dedicated to providing high-quality criminological education, research, and services 
          to students, practitioners, policymakers, and the broader community. We foster an intellectually challenging environment that encourages 
          engagement with crime and criminological theory, drawing on both domestic and international perspectives.
        </p>
      </section>

      {/* Purposes and Goals Section */}
      <section>
        <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>Department Purposes and Goals</h2>
        <hr style={{ border: "none", borderTop: "2px solid darkred", width: "50px", marginLeft: "0", marginBottom: "20px" }} />
        <p>
          The Criminology Institute for Research and Training (CIRT) supports the vision of The University of Tampa by strengthening academic programs, 
          fostering student success, and creating new funding opportunities. We promote collaboration between scholars, agencies, and businesses; 
          prepare students for careers in the ever-evolving criminal justice field; and serve as a central hub for research, training, and engagement 
          within the Department of Criminology and Criminal Justice.
        </p>
      </section>

      {/* Contact Us Button */}
      <div style={{ marginTop: "40px" }}>
        <Link to="/contact" className="contact-btn">
          Contact Us
        </Link>
      </div>

    </div>
  );
}

export default AboutPage;
