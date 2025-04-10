import React from "react";
import RecentSubmissions from "../components/RecentSubmissions";
import SearchBar from "../components/SearchBar";

const HomePage = () => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome to the Academic Journal</h1>
      <p>Search for approved publications below:</p>

      <SearchBar />

      <RecentSubmissions />
    </div>
  );
};

export default HomePage;
