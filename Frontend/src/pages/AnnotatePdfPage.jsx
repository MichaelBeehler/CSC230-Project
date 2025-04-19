import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
} from "react-pdf-highlighter";
import axios from "axios"; // Make sure axios is installed
import "./AnnotatePdfPage.css";

function AnnotatePdfPage() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/pdf/view/${id}`, {
          responseType: "blob",
          withCredentials: true,
        });

        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
      } catch (error) {
        console.error("Failed to fetch PDF:", error);
      }
    };

    fetchPdf();
  }, [id]);

  const getNextId = () => String(Math.random()).slice(2); // Simple unique-ish ID

  const [highlights, setHighlights] = useState([]);

  const addHighlight = (highlight) => {
    const newHighlight = { ...highlight, id: getNextId() };
    setHighlights([...highlights, newHighlight]);
  };

  return (
    <div className="pdf-view-container">
      <h2>Editing Student's Paper</h2>

      <div className="pdf-frame-wrapper">
        {pdfUrl && (
          <PdfLoader
            url={pdfUrl}
            beforeLoad={<div>Loading PDF...</div>}
          >
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      addHighlight({
                        content,
                        position,
                        comment,
                      });
                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(highlight, index, setTip, hideTip) => (
                  <Popup
                    popupContent={<div>{highlight.comment}</div>}
                    onMouseOver={(popupContent) => setTip(popupContent)}
                    onMouseOut={hideTip}
                    key={index}
                  >
                    <Highlight
                      isScrolledTo={false}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
                  </Popup>
                )}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        )}
      </div>
    </div>
  );
}

export default AnnotatePdfPage;
