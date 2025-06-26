"use client";

import React, { useState, useCallback } from "react";
import { PDFDocument, rgb } from "pdf-lib";

const PdfEditorAlternative = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
    } else {
      setError("Please select a valid PDF file");
    }
  };

  const createEditablePdf = async () => {
    if (!pdfFile) return;

    try {
      setIsProcessing(true);
      setError("");

      // Read the PDF file
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Create a form
      const form = pdfDoc.getForm();

      // Get all pages
      const pages = pdfDoc.getPages();

      // Add text fields to first page as an example
      if (pages.length > 0) {
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Add some sample text fields
        const nameField = form.createTextField("name");
        nameField.setText("John Doe");
        nameField.addToPage(firstPage, {
          x: 50,
          y: height - 100,
          width: 200,
          height: 20,
        });

        const emailField = form.createTextField("email");
        emailField.setText("john@example.com");
        emailField.addToPage(firstPage, {
          x: 50,
          y: height - 130,
          width: 200,
          height: 20,
        });

        const notesField = form.createTextField("notes");
        notesField.setText("Edit this text");
        notesField.addToPage(firstPage, {
          x: 50,
          y: height - 200,
          width: 300,
          height: 60,
        });
        notesField.enableMultiline();
      }

      // Save the PDF with form fields
      const pdfBytesWithForm = await pdfDoc.save();

      // Download the PDF
      const blob = new Blob([pdfBytesWithForm], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `editable-${pdfFile.name}`;
      a.click();
      URL.revokeObjectURL(url);

      setIsProcessing(false);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to process PDF. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Alternative PDF Editor</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF to make it editable</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
          </div>

          {pdfFile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Selected: {pdfFile.name}</p>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <button
            onClick={createEditablePdf}
            disabled={!pdfFile || isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Create Editable PDF"}
          </button>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This will add editable form fields to your PDF. You can then open the PDF in any
              PDF reader and edit the fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfEditorAlternative;
