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
    "Search for recidivism rates...",
    "Search for criminal psychology...",
    "Search for forensic evidence...",
    "Search for cybercrime trends...",
    "Search for domestic violence...",
    "Search for police reform...",
    "Search for prison rehabilitation...",
    "Search for drug policy...",
    "Search for criminal profiling...",
    "Search for gang violence...",
    "Search for restorative justice...",
    "Search for criminal law theory...",
    "Search for victimology studies...",
    "Search for crime prevention strategies...",
    "Search for social control theory...",
    "Search for criminal justice ethics...",
    "Search for hate crimes...",
    "Search for terrorism studies...",
    "Search for human trafficking...",
    "Search for organized crime networks...",
    "Search for criminal deterrence...",
    "Search for prison overcrowding...",
    "Search for racial bias in policing...",
    "Search for sex offender rehabilitation...",
    "Search for crime mapping techniques...",
    "Search for criminal justice reform...",
    "Search for youth violence prevention...",
    "Search for corporate crime...",
    "Search for environmental criminology...",
    "Search for digital forensics...",
    "Search for criminal sentencing disparities...",
    "Search for mental health and crime...",
    "Search for substance abuse treatment...",
    "Search for criminal sociology...",
    "Search for police brutality...",
    "Search for crime scene investigation...",
    "Search for wrongful convictions...",
    "Search for criminal interrogation techniques...",
    "Search for prison culture...",
    "Search for bail reform...",
    "Search for gun violence prevention...",
    "Search for identity theft...",
    "Search for money laundering...",
    "Search for criminal networks...",
    "Search for child abuse prevention...",
    "Search for elder abuse...",
    "Search for stalking behavior...",
    "Search for serial killer psychology...",
    "Search for mass shooting prevention...",
    "Search for border crime...",
    "Search for wildlife trafficking...",
    "Search for art theft...",
    "Search for corruption studies...",
    "Search for police training methods...",
    "Search for jury decision making...",
    "Search for eyewitness reliability...",
    "Search for false confessions...",
    "Search for criminal rehabilitation programs...",
    "Search for community policing...",
    "Search for crime hot spots...",
    "Search for criminal career patterns...",
    "Search for family violence...",
    "Search for school violence prevention...",
    "Search for criminal trauma...",
    "Search for offender reentry programs...",
    "Search for risk assessment tools...",
    "Search for criminal behavior genetics...",
    "Search for crime and media influence...",
    "Search for criminal justice technology..."
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
      if (!isFocused.current && inputRef.current && !inputRef.current.value) {
        setPlaceholder(getNextPlaceholder());
      }
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    console.log("Searching for:", query);
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const handleBlur = () => {
    isFocused.current = false;
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
              onChange={(e) => setQuery(e.target.value)}
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
