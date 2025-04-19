import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Viewer,
  Worker
} from "@react-pdf-viewer/core";
import { highlightPlugin } from "@react-pdf-viewer/highlight";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";
import "./AnnotatePdfPage.css";

function AnnotatePdfPage() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState("");
  const highlightPluginInstance = highlightPlugin();

  useEffect(() => {
    console.log(`Setting PDF URL for id: ${id}`);
    setPdfUrl(`http://localhost:4000/api/pdf/view/${id}`);
  }, [id]);

  return (
    <div className="pdf-view-container">
      <h2>Geek bob tweakin fasho</h2>
      <p>
        If the PDF doesn't load,{" "}
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
          click here to view it in a new tab.
        </a>
      </p>
      <div className="pdf-frame-wrapper" style={{ height: "800px" }}>
        {pdfUrl && (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfUrl}
              plugins={[highlightPluginInstance]}
            />
          </Worker>
        )}
      </div>
    </div>
  );
}

export default AnnotatePdfPage;
