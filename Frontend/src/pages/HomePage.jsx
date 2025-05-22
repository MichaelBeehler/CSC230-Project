import React from "react";
import RecentSubmissions from "../components/RecentSubmissions";
import SearchBar from "../components/SearchBar";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="background-image" />
        <div className="home-content">
          <div style={{ textAlign: "center", padding: "20px"}}>
          <h1>Welcome to the CIRT Academic Journal!</h1>
          <p>Search for approved publications below:</p>

          <SearchBar />

          <RecentSubmissions />

          </div>
      </div>
    </div>
  );
};

export default HomePage;
