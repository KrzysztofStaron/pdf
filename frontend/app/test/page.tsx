"use client";

import React, { useState } from "react";
import PdfEditor from "../page";
import PdfEditorFormFields from "../PdfEditorFormFields";

const TestPage = () => {
  const [activeEditor, setActiveEditor] = useState<"overlay" | "form">("overlay");

  return (
    <div>
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">PDF Editor Test</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveEditor("overlay")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeEditor === "overlay" ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Overlay Editor
            </button>
            <button
              onClick={() => setActiveEditor("form")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeEditor === "form" ? "bg-purple-600 text-white" : "bg-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Form Field Editor
            </button>
          </div>
        </div>
      </div>

      {activeEditor === "overlay" ? <PdfEditor /> : <PdfEditorFormFields />}
    </div>
  );
};

export default TestPage;
