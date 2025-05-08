import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./App.css";
import Chatbot from './components/chatbot';
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage"; 
import ReviewPage from "./pages/ReviewPage";
import AnnotatePdfPage from "./pages/AnnotatePdfPage";
import Register from "./pages/Register";
import StudentProfilePage from "./pages/StudentProfilePage";
import SearchResultsPage from "./pages/SearchResultsPage"; 
import ForgotPassword from "./pages/Forgot-Password";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import EditorDashboard from "./pages/EditorDashboard";
import ResetPassword from "./pages/ResetPassword";
import ManageUsers from "./pages/ManageUsers";
import FellowsPage from "./pages/FellowsPage";
import FellowsAdmin from "./pages/FellowsAdmin";


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
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/reset-password/:token" element={<ResetPassword/>} />

          {/* Public search route */}
          <Route path="/search" element={<SearchResultsPage />} />

            {/* ✅ Public Fellows page */}
          <Route path="/fellows" element={<FellowsPage />} />

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

          <Route element={<ProtectedRoute allowedRoles={["editor"]} />}>
            <Route path="/editor" element={< EditorDashboard/>} />
            <Route path="/profile" element={<StudentProfilePage />} />
            <Route path="/manage" element={<ManageUsers/>} />
            <Route path="/fellows-admin" element={<FellowsAdmin />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["faculty", "editor"]} />}>
            <Route path="/annotate/:id" element={<AnnotatePdfPage />} />
          </Route>
          
        </Routes>
      </main>
      {/* Add the Chatbot component here, outside of Routes so it appears on all pages */}
      <Chatbot />
      <Footer />
    </Router>
  );
}

export default App;
