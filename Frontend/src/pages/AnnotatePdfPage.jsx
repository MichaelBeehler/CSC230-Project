import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { detectTextColumns, findColumn, calculateHighlightSegments } from "../components/highlighter";import "./AnnotatePdfPage.css";

function AnnotatePdfPage() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [highlights, setHighlights] = useState([]);
  const iframeRef = useRef(null);
  const overlayRef = useRef(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentHighlight, setCurrentHighlight] = useState(null);
  const [textColumns, setTextColumns] = useState([]);
  const [lineHeight, setLineHeight] = useState(18);

  // Fetch PDF from the server
  useEffect(() => {
    const fetchPdf = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:4000/api/pdf/view/${id}`,
          {
            responseType: "blob",
            withCredentials: true,
          }
        );
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
      } catch (error) {
        console.error("Failed to fetch PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  // Detect text columns in the PDF
  useEffect(() => {
    if (!iframeRef.current || !pdfUrl) return;

    const analyzeDocument = async () => {
      const { columns, lineHeight: detectedLineHeight } = await detectTextColumns(iframeRef.current);
      setTextColumns(columns);
      setLineHeight(detectedLineHeight);
    };

    analyzeDocument();
  }, [pdfUrl]);

  // Handle mouse down to start highlighting
  const handleMouseDown = (e) => {
    if (!overlayRef.current || textColumns.length === 0) return;
    
    const overlay = overlayRef.current;
    const rect = overlay.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Snap to the nearest line
    const lineY = Math.floor(y / lineHeight) * lineHeight;
    
    // Find which column we're in
    const column = findColumn(x, textColumns);
    
    setIsHighlighting(true);
    setStartPoint({ x, y: lineY, column });
    setCurrentHighlight({
      x,
      y: lineY,
      width: 0,
      height: lineHeight,
      column
    });
  };

  // Handle mouse move to update highlight
  const handleMouseMove = (e) => {
    if (!isHighlighting || !overlayRef.current || textColumns.length === 0) return;
    
    const overlay = overlayRef.current;
    const rect = overlay.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Snap to the nearest line
    const lineY = Math.floor(y / lineHeight) * lineHeight;
    
    // Find which column we're in
    const currentColumn = findColumn(x, textColumns);
    
    // If we're on the same line as the start point
    if (lineY === startPoint.y && currentColumn === startPoint.column) {
      // Just adjust the width of the highlight
      const width = x - startPoint.x;
      setCurrentHighlight({
        x: width >= 0 ? startPoint.x : x,
        y: startPoint.y,
        width: Math.abs(width),
        height: lineHeight,
        column: startPoint.column
      });
    } else {
      // We're highlighting across multiple lines or columns
      const segments = calculateHighlightSegments(
        startPoint, 
        x, 
        lineY, 
        lineHeight, 
        currentColumn
      );
      
      setCurrentHighlight({
        multiSegment: true,
        segments
      });
    }
  };

  // Handle mouse up to finish highlighting
  const handleMouseUp = () => {
    if (!isHighlighting) return;
    
    setIsHighlighting(false);
    
    // Check if we have a valid highlight
    if (currentHighlight) {
      let isValidHighlight = false;
      
      if (currentHighlight.multiSegment) {
        isValidHighlight = currentHighlight.segments.length > 0 && 
          currentHighlight.segments.some(seg => seg.width > 5);
      } else {
        isValidHighlight = currentHighlight.width > 5;
      }
      
      if (isValidHighlight) {
        const comment = prompt('Add a comment to this highlight:') || 'No comment';
        
        // Get the current scroll position of the iframe
        const scrollTop = iframeRef.current?.contentWindow?.document?.documentElement?.scrollTop || 0;
        
        setHighlights(prev => [...prev, {
          ...currentHighlight,
          id: Date.now().toString(),
          comment,
          scrollTop
        }]);
      }
    }
    
    setCurrentHighlight(null);
  };

  return (
    <div className="pdf-viewer-container">
      <h2 className="pdf-page-title">Editing Student's Paper</h2>
      
      <div className="pdf-frame-wrapper">
        {pdfUrl && !isLoading ? (
          <div className="pdf-iframe-container">
            <iframe 
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=0`} 
              className="pdf-iframe"
              title="PDF Viewer"
            />
            <div 
              ref={overlayRef}
              className="pdf-overlay"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Render existing highlights */}
              {highlights.map(highlight => (
                <React.Fragment key={highlight.id}>
                  {highlight.multiSegment ? (
                    highlight.segments.map((segment, index) => (
                      <div
                        key={`${highlight.id}-segment-${index}`}
                        className="highlight-segment"
                        style={{
                          left: `${segment.x}px`,
                          top: `${segment.y}px`,
                          width: `${segment.width}px`,
                          height: `${segment.height}px`
                        }}
                        title={highlight.comment}
                        data-highlight-id={highlight.id}
                      />
                    ))
                  ) : (
                    <div
                      className="highlight-segment"
                      style={{
                        left: `${highlight.x}px`,
                        top: `${highlight.y}px`,
                        width: `${highlight.width}px`,
                        height: `${highlight.height}px`
                      }}
                      title={highlight.comment}
                      data-highlight-id={highlight.id}
                    />
                  )}
                </React.Fragment>
              ))}
              
              {/* Render current highlight being drawn */}
              {currentHighlight && (
                <React.Fragment>
                  {currentHighlight.multiSegment ? (
                    currentHighlight.segments.map((segment, index) => (
                      <div
                        key={`current-segment-${index}`}
                        className="highlight-segment current"
                        style={{
                          left: `${segment.x}px`,
                          top: `${segment.y}px`,
                          width: `${segment.width}px`,
                          height: `${segment.height}px`
                        }}
                      />
                    ))
                  ) : (
                    <div
                      className="highlight-segment current"
                      style={{
                        left: `${currentHighlight.x}px`,
                        top: `${currentHighlight.y}px`,
                        width: `${currentHighlight.width}px`,
                        height: `${currentHighlight.height}px`
                      }}
                    />
                  )}
                </React.Fragment>
              )}
            </div>
          </div>
        ) : (
          <div className="pdf-loading">
            {isLoading ? "Loading PDF..." : "PDF not available"}
          </div>
        )}
      </div>
      
      <div className="pdf-highlights-panel">
        <h3>Highlights & Comments</h3>
        <ul>
          {highlights.map(highlight => (
            <li key={highlight.id}>
              <div className="highlight-comment">{highlight.comment}</div>
              <button 
                className="highlight-goto-btn"
                onClick={() => {
                  // Scroll to the highlight position
                  if (iframeRef.current) {
                    iframeRef.current.contentWindow.scrollTo(0, highlight.scrollTop);
                    
                    // Flash the highlight to make it more visible
                    const highlightElements = document.querySelectorAll(`[data-highlight-id="${highlight.id}"]`);
                    highlightElements.forEach(el => {
                      el.classList.add('highlight-flash');
                      setTimeout(() => el.classList.remove('highlight-flash'), 1000);
                    });
                  }
                }}
              >
                Go to highlight
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AnnotatePdfPage;
