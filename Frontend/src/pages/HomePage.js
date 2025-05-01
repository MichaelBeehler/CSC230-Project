import React, { useState, useEffect, useRef } from "react";
import RecentSubmissions from "../components/RecentSubmissions";
import "./HomePage.css";

const HomePage = () => {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const inputRef = useRef(null);
  const isFocused = useRef(false);
  
  // Reference to track our shuffled examples
  const shuffledExamplesRef = useRef([]);
  const currentIndexRef = useRef(0);
  
  // Array of criminology research topic examples
  const searchExamples = [
    "Search for juvenile delinquency...",
    "Search for white collar crime...",
    // ... other examples ...
  ];

  // Fisher-Yates shuffle algorithm to randomize array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get the next placeholder from our shuffled array
  const getNextPlaceholder = () => {
    // If we've gone through all examples, reshuffle and start over
    if (currentIndexRef.current >= shuffledExamplesRef.current.length) {
      shuffledExamplesRef.current = shuffleArray(searchExamples);
      currentIndexRef.current = 0;
    }
    
    const nextPlaceholder = shuffledExamplesRef.current[currentIndexRef.current];
    currentIndexRef.current++;
    return nextPlaceholder;
  };

  // Initialize with shuffled examples
  useEffect(() => {
    shuffledExamplesRef.current = shuffleArray(searchExamples);
    setPlaceholder(getNextPlaceholder());
  }, []);

  // Rotate through different search examples only when not focused
  useEffect(() => {
    const interval = setInterval(() => {
      // FIXED: Check query state instead of inputRef.current.value
      if (!isFocused.current && query === "") {
        setPlaceholder(getNextPlaceholder());
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [query]); // Added query as a dependency

  const handleSearch = () => {
    console.log("Searching for:", query);
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const handleBlur = () => {
    isFocused.current = false;
  };

  const handleInputChange = (e) => {
    console.log("Input changed to:", e.target.value);
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    console.log("Key pressed:", e.key);
    // This is just for debugging
  };

  return (
    <div className="homepage">
      <div className="background-image" />
      <div className="home-content">
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h1>Welcome</h1>
          <p className="main-subtitle">Your trusted source for criminology research</p>
          <p className="subtitle">Browse a selection of approved publications:</p>
          
          {/* Search Bar with smooth placeholder transitions */}
          <div className="search-bar-container">
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="search-bar-input"
            />
            <button className="search-bar-button" onClick={handleSearch}>Search</button>
          </div>
          <RecentSubmissions />
        </div>
      </div>
    </div>
  );
};

export default HomePage;