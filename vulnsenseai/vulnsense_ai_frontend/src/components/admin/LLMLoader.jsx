import React from "react";
import "./Llmloader.css";

const LlmLoader = () => {
  return (
    <div className="llm-loader-overlay">
      <div className="llm-scanner-loader">
        <div className="llm-scanner"></div>
      </div>
      <p className="llm-loader-text">Generating....</p>
    </div>
  );
};

export default LlmLoader;
