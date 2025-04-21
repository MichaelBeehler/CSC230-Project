// Utility functions for PDF highlighting

/**
 * Detects text columns in a PDF document
 * @param {HTMLIFrameElement} iframeElement - The iframe containing the PDF
 * @returns {Promise<{columns: Array, lineHeight: number}>} - Detected columns and line height
 */
export const detectTextColumns = (iframeElement) => {
  return new Promise((resolve) => {
    try {
      const iframe = iframeElement;
      const doc = iframe.contentWindow.document;
      
      // Wait for the PDF to load
      setTimeout(() => {
        // Try to find text elements
        const textElements = Array.from(doc.querySelectorAll('span, div, p'));
        let columns = [];
        let lineHeight = 18; // Default line height
        
        if (textElements.length === 0) {
          console.log("No text elements found, using default column");
          // Use default single column
          const width = iframe.clientWidth;
          // Assume text is in the middle 70% of the page with margins on both sides
          const leftMargin = width * 0.15;
          const columnWidth = width * 0.7;
          columns = [{
            left: leftMargin,
            right: leftMargin + columnWidth,
            width: columnWidth
          }];
        } else {
          // Get bounding rectangles of text elements
          const rects = textElements.map(el => {
            const rect = el.getBoundingClientRect();
            return {
              left: rect.left,
              right: rect.right,
              width: rect.width
            };
          });
          
          // Find the most common left positions (column starts)
          const leftPositions = rects.map(r => Math.round(r.left / 10) * 10); // Round to nearest 10px
          const leftCounts = {};
          leftPositions.forEach(pos => {
            leftCounts[pos] = (leftCounts[pos] || 0) + 1;
          });
          
          // Find the most common right positions (column ends)
          const rightPositions = rects.map(r => Math.round(r.right / 10) * 10); // Round to nearest 10px
          const rightCounts = {};
          rightPositions.forEach(pos => {
            rightCounts[pos] = (rightCounts[pos] || 0) + 1;
          });
          
          // Get the most common left and right positions
          const sortedLefts = Object.entries(leftCounts)
            .sort((a, b) => b[1] - a[1])
            .map(entry => parseInt(entry[0]));
          
          const sortedRights = Object.entries(rightCounts)
            .sort((a, b) => b[1] - a[1])
            .map(entry => parseInt(entry[0]));
          
          // Determine if we have one or two columns
          if (sortedLefts.length >= 2 && sortedRights.length >= 2) {
            // Check if we have two distinct columns
            const leftCol = {
              left: sortedLefts[0],
              right: sortedRights.find(r => r > sortedLefts[0] && r < sortedLefts[1]) || sortedRights[0],
            };
            leftCol.width = leftCol.right - leftCol.left;
            
            const rightCol = {
              left: sortedLefts[1],
              right: sortedRights[0],
            };
            rightCol.width = rightCol.right - rightCol.left;
            
            // If the columns are distinct enough
            if (leftCol.right < rightCol.left && leftCol.width > 50 && rightCol.width > 50) {
              columns = [leftCol, rightCol];
            } else {
              // Single column
              columns = [{
                left: sortedLefts[0],
                right: sortedRights[0],
                width: sortedRights[0] - sortedLefts[0]
              }];
            }
          } else {
            // Single column
            columns = [{
              left: sortedLefts[0] || 0,
              right: sortedRights[0] || iframe.clientWidth,
              width: (sortedRights[0] || iframe.clientWidth) - (sortedLefts[0] || 0)
            }];
          }
          
          // Also try to detect line height
          const lineHeights = textElements.map(el => {
            const style = window.getComputedStyle(el);
            return parseInt(style.lineHeight) || parseInt(style.height);
          }).filter(h => !isNaN(h) && h > 0);
          
          if (lineHeights.length > 0) {
            // Use the most common line height
            const heightCounts = {};
            lineHeights.forEach(h => {
              heightCounts[h] = (heightCounts[h] || 0) + 1;
            });
            
            const mostCommonHeight = Object.entries(heightCounts)
              .sort((a, b) => b[1] - a[1])[0][0];
              
            lineHeight = parseInt(mostCommonHeight);
          }
        }
        
        resolve({ columns, lineHeight });
      }, 1000); // Give the PDF time to render
    } catch (e) {
      console.error("Error detecting text columns:", e);
      // Use default single column
      const width = iframeElement.clientWidth;
      const leftMargin = width * 0.15;
      const columnWidth = width * 0.7;
      const columns = [{
        left: leftMargin,
        right: leftMargin + columnWidth,
        width: columnWidth
      }];
      
      resolve({ columns, lineHeight: 18 });
    }
  });
};

/**
 * Find which column a point is in
 * @param {number} x - X coordinate
 * @param {Array} columns - Array of column objects
 * @returns {Object} - The column the point is in
 */
export const findColumn = (x, columns) => {
  if (columns.length === 0) return null;
  
  for (const column of columns) {
    if (x >= column.left && x <= column.right) {
      return column;
    }
  }
  
  // If not in any column, use the closest one
  return columns.reduce((closest, column) => {
    const distance = Math.min(
      Math.abs(x - column.left),
      Math.abs(x - column.right)
    );
    
    if (!closest || distance < closest.distance) {
      return { column, distance };
    }
    return closest;
  }, null)?.column || columns[0];
};

/**
 * Calculate highlight segments based on selection
 * @param {Object} startPoint - Starting point of selection
 * @param {number} x - Current x position
 * @param {number} y - Current y position
 * @param {number} lineHeight - Line height
 * @param {Object} currentColumn - Current column
 * @returns {Array} - Array of highlight segments
 */
export const calculateHighlightSegments = (startPoint, x, y, lineHeight, currentColumn) => {
  const segments = [];
  
  // Determine the range of lines
  const startLineIndex = Math.floor(startPoint.y / lineHeight);
  const endLineIndex = Math.floor(y / lineHeight);
  const minLineIndex = Math.min(startLineIndex, endLineIndex);
  const maxLineIndex = Math.max(startLineIndex, endLineIndex);
  
  // If we're in the same column or no column change
  if (startPoint.column === currentColumn) {
    // First line
    if (startLineIndex === minLineIndex) {
      segments.push({
        x: startPoint.x,
        y: startPoint.y,
        width: startPoint.column.right - startPoint.x,
        height: lineHeight,
        column: startPoint.column
      });
    } else {
      segments.push({
        x: startPoint.column.left,
        y: minLineIndex * lineHeight,
        width: x - startPoint.column.left,
        height: lineHeight,
        column: startPoint.column
      });
    }
    
    // Middle lines
    for (let i = minLineIndex + 1; i < maxLineIndex; i++) {
      segments.push({
        x: startPoint.column.left,
        y: i * lineHeight,
        width: startPoint.column.width,
        height: lineHeight,
        column: startPoint.column
      });
    }
    
    // Last line
    if (endLineIndex === maxLineIndex && maxLineIndex !== minLineIndex) {
      if (startLineIndex === maxLineIndex) {
        segments.push({
          x: startPoint.column.left,
          y: maxLineIndex * lineHeight,
          width: startPoint.x - startPoint.column.left,
          height: lineHeight,
          column: startPoint.column
        });
      } else {
        segments.push({
          x: startPoint.column.left,
          y: maxLineIndex * lineHeight,
          width: x - startPoint.column.left,
          height: lineHeight,
          column: startPoint.column
        });
      }
    }
  } else {
    // We're highlighting across columns
    // First column
    segments.push({
      x: startPoint.x,
      y: startPoint.y,
      width: startPoint.column.right - startPoint.x,
      height: lineHeight,
      column: startPoint.column
    });
    
    // Last column
    segments.push({
      x: currentColumn.left,
      y: y - (y % lineHeight),
      width: x - currentColumn.left,
      height: lineHeight,
      column: currentColumn
    });
  }
  
  return segments;
};
