"use client";

import React, { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

const PdfEditorFormFields = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
      setSuccess(false);
    } else {
      setError("Please select a valid PDF file");
    }
  };

  const createFormFieldPdf = async () => {
    if (!pdfFile) return;

    try {
      setIsProcessing(true);
      setError("");

      // Read the PDF file
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

      // Create a form
      const form = pdfDoc.getForm();

      // Get all pages
      const pages = pdfDoc.getPages();

      // Add form fields to each page
      pages.forEach((page, pageIndex) => {
        const { width, height } = page.getSize();

        // Add editable text fields at strategic positions
        // You can customize these positions based on your needs
        const positions = [
          { name: `title_${pageIndex}`, x: 50, y: height - 100, w: width - 100, h: 30 },
          { name: `author_${pageIndex}`, x: 50, y: height - 140, w: width - 100, h: 25 },
          { name: `content_${pageIndex}_1`, x: 50, y: height - 200, w: width - 100, h: 20 },
          { name: `content_${pageIndex}_2`, x: 50, y: height - 230, w: width - 100, h: 20 },
          { name: `content_${pageIndex}_3`, x: 50, y: height - 260, w: width - 100, h: 20 },
        ];

        positions.forEach(pos => {
          try {
            const textField = form.createTextField(pos.name);
            textField.addToPage(page, {
              x: pos.x,
              y: pos.y,
              width: pos.w,
              height: pos.h,
            });
            textField.setFontSize(12);
            textField.enableMultiline();
            textField.setText(""); // Start with empty text
          } catch (e) {
            console.warn(`Could not add field ${pos.name}:`, e);
          }
        });
      });

      // Flatten the form to preserve the original content while adding fields
      // form.flatten(); // Uncomment this if you want to make fields non-editable

      // Save the PDF with form fields
      const pdfBytesWithForm = await pdfDoc.save();

      // Download the PDF
      const blob = new Blob([pdfBytesWithForm], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-fields-${pdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      setIsProcessing(false);
      setSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to process PDF. The file might be encrypted or corrupted.");
      setIsProcessing(false);
    }
  };

  const createEditableCopy = async () => {
    if (!pdfFile) return;

    try {
      setIsProcessing(true);
      setError("");

      // Read the PDF file
      const pdfBytes = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(pdfBytes);

      // Create a new PDF document
      const newPdf = await PDFDocument.create();

      // Copy all pages from original to new
      const pages = await newPdf.copyPages(originalPdf, originalPdf.getPageIndices());

      pages.forEach(page => {
        newPdf.addPage(page);
      });

      // Create form in the new document
      const form = newPdf.getForm();

      // Get all pages in the new document
      const newPages = newPdf.getPages();

      // Add transparent text fields over the entire page
      newPages.forEach((page, pageIndex) => {
        const { width, height } = page.getSize();

        // Create a large multi-line text field covering most of the page
        const textField = form.createTextField(`page_${pageIndex}_content`);
        textField.addToPage(page, {
          x: 40,
          y: 40,
          width: width - 80,
          height: height - 80,
        });

        textField.enableMultiline();
        textField.setFontSize(11);
        // Make the field transparent so original content shows through
        textField.setText(""); // Start empty so user can type over existing content
      });

      // Save the new PDF
      const newPdfBytes = await newPdf.save();

      // Download
      const blob = new Blob([newPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `editable-copy-${pdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      setIsProcessing(false);
      setSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to create editable copy. The file might be encrypted.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">PDF Form Field Editor</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF to add form fields</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>

          {pdfFile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Selected: {pdfFile.name}</p>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
              ✓ PDF downloaded successfully! Open it in any PDF reader to edit the fields.
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={createFormFieldPdf}
              disabled={!pdfFile || isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Add Form Fields to PDF"}
            </button>

            <button
              onClick={createEditableCopy}
              disabled={!pdfFile || isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Create Fully Editable Copy"}
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-blue-700 font-semibold">Two Options:</p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>
                • <strong>Add Form Fields:</strong> Adds specific editable fields to your PDF
              </li>
              <li>
                • <strong>Editable Copy:</strong> Creates a copy with transparent text fields over the entire page
              </li>
            </ul>
            <p className="text-xs text-blue-500 mt-2">
              Note: Form fields work best in Adobe Reader, Foxit Reader, or modern browsers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfEditorFormFields;
