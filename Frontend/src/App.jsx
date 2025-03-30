import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage"; 
import ReviewPage from "./pages/ReviewPage";
import Register from "./pages/Register";
import StudentProfilePage from "./pages/StudentProfilePage";

import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || null);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem("userRole")); 
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Header userRole={userRole} setUserRole={setUserRole} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage setUserRole={setUserRole} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<StudentProfilePage />} />

          {/* Student protected routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/upload-pdf" element={<UploadPage type="pdf" />} />
            <Route path="/upload-poster" element={<UploadPage type="poster" />} />
            <Route path="/profile" element={<StudentProfilePage />} />
          </Route>

          {/* Faculty protected route */}
          <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/profile" element={<StudentProfilePage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
