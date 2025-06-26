"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb, StandardFonts, PDFTextField } from "pdf-lib";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker - using CDN with dynamic version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EditableField {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const PdfEditor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<string>("");
  const [scale, setScale] = useState<number>(1.0);
  const [editableFields, setEditableFields] = useState<EditableField[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    console.log("PDF.js version:", pdfjs.version);
    console.log("Worker source:", pdfjs.GlobalWorkerOptions.workerSrc);
  }, []);

  // Add timeout for loading
  useEffect(() => {
    if (isLoading && selectedFile) {
      const timeout = setTimeout(() => {
        console.warn("PDF loading timeout");
        setIsLoading(false);
        setHasError("PDF loading timed out. Please try again or choose a different file.");
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading, selectedFile]);

  const extractTextFromPdf = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Clone the ArrayBuffer to prevent detachment issues
      const clonedBuffer = arrayBuffer.slice();

      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const fields: EditableField[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        textContent.items.forEach((item: any, index: number) => {
          if (item.str && item.str.trim()) {
            // Calculate proper positioning
            const transform = item.transform;
            const fontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);

            fields.push({
              id: `field-${i}-${index}`,
              text: item.str,
              x: transform[4],
              y: transform[5], // Use original Y position from PDF
              width: item.width || 100,
              height: fontSize * 1.2, // Better height calculation
              page: i,
            });
          }
        });
      }

      setEditableFields(fields);
      // Use the cloned buffer for pdf-lib
      setPdfBytes(new Uint8Array(clonedBuffer));
      console.log(`Extracted ${fields.length} text fields from PDF`);
    } catch (error) {
      console.error("Error extracting text:", error);
      setHasError("Failed to extract text from PDF");
    }
  };

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log("PDF loaded successfully, pages:", numPages);
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
    setHasError("");
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("PDF load error:", error);
    setHasError(`Failed to load PDF: ${error.message}`);
    setIsLoading(false);
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);

    if (file.type !== "application/pdf") {
      setHasError("Please select a valid PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setHasError("File size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);
    setHasError("");
    setEditableFields([]);
    setIsEditMode(false);

    // Extract text for editable fields
    await extractTextFromPdf(file);

    console.log("Starting PDF load...");
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  }, [numPages]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const updateFieldText = (fieldId: string, newText: string) => {
    setEditableFields(prev => prev.map(field => (field.id === fieldId ? { ...field, text: newText } : field)));
  };

  const downloadEditedPdf = async () => {
    if (!pdfBytes) {
      console.error("No PDF bytes available");
      setHasError("No PDF loaded. Please upload a PDF first.");
      return;
    }

    try {
      console.log("Starting PDF download process...");
      setIsLoading(true);
      setHasError("");

      // Load the existing PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      console.log(`Processing ${editableFields.length} fields across ${pages.length} pages`);

      // Helper function to clean text for WinAnsi encoding
      const cleanTextForFont = (text: string) => {
        // Replace common non-ASCII characters with ASCII equivalents
        return (
          text
            .replace(/[àáâãäå]/g, "a")
            .replace(/[èéêë]/g, "e")
            .replace(/[ìíîï]/g, "i")
            .replace(/[òóôõö]/g, "o")
            .replace(/[ùúûü]/g, "u")
            .replace(/[ýÿ]/g, "y")
            .replace(/[ñ]/g, "n")
            .replace(/[ç]/g, "c")
            .replace(/[ß]/g, "ss")
            .replace(/[ÀÁÂÃÄÅ]/g, "A")
            .replace(/[ÈÉÊË]/g, "E")
            .replace(/[ÌÍÎÏ]/g, "I")
            .replace(/[ÒÓÔÕÖ]/g, "O")
            .replace(/[ÙÚÛÜ]/g, "U")
            .replace(/[Ý]/g, "Y")
            .replace(/[Ñ]/g, "N")
            .replace(/[Ç]/g, "C")
            // Polish characters
            .replace(/[ąĄ]/g, "a")
            .replace(/[ćĆ]/g, "c")
            .replace(/[ęĘ]/g, "e")
            .replace(/[łŁ]/g, "l")
            .replace(/[ńŃ]/g, "n")
            .replace(/[óÓ]/g, "o")
            .replace(/[śŚ]/g, "s")
            .replace(/[źŹżŻ]/g, "z")
            // Remove any remaining non-ASCII characters
            .replace(/[^\x00-\x7F]/g, "?")
        );
      };

      // Process each page
      editableFields.forEach((field, index) => {
        if (field.page <= pages.length) {
          const page = pages[field.page - 1];
          const { width, height } = page.getSize();

          // PDF coordinate system: origin at bottom-left
          // field.y comes from pdfjs which already has origin at bottom-left
          const pdfY = field.y;

          // Get the original font size from the field height
          const fontSize = field.height / 1.2; // Reverse the calculation from extraction

          // Draw white rectangle to cover old text
          page.drawRectangle({
            x: field.x - 2,
            y: pdfY - fontSize * 0.2,
            width: field.width + 10,
            height: fontSize * 1.4,
            color: rgb(1, 1, 1),
          });

          // Clean the text to remove unsupported characters
          const cleanedText = cleanTextForFont(field.text);

          // Draw new text
          try {
            page.drawText(cleanedText, {
              x: field.x,
              y: pdfY,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
          } catch (textError) {
            console.warn(`Failed to draw text "${field.text}", skipping field ${field.id}:`, textError);
            // Draw a placeholder if text fails
            page.drawText("[TEXT ERROR]", {
              x: field.x,
              y: pdfY,
              size: fontSize,
              font,
              color: rgb(1, 0, 0),
            });
          }
        }
      });

      // Save the PDF
      console.log("Saving PDF...");
      const modifiedPdfBytes = await pdfDoc.save();

      // Create blob and download
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-${selectedFile?.name || "document.pdf"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);

      console.log("PDF downloaded successfully");
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setHasError(`Failed to generate edited PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PDF Editor</h1>
          <p className="text-gray-600">Upload, edit text, and download your PDF documents</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />

            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-indigo-500 transition-colors">
                <div className="flex flex-col items-center space-y-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload PDF Document</h3>
                    <p className="text-gray-500 mb-4">Choose a PDF file to edit (max 10MB)</p>
                    <button
                      onClick={handleUploadClick}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Select PDF File
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`${
                      isEditMode ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white font-medium py-2 px-4 rounded-lg transition-colors`}
                  >
                    {isEditMode ? "View Mode" : "Edit Mode"}
                  </button>
                  {isEditMode && (
                    <button
                      onClick={downloadEditedPdf}
                      disabled={isLoading || !pdfBytes}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Download Edited PDF</span>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleUploadClick}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Change File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700">{hasError}</p>
            </div>
          </div>
        )}

        {/* PDF Viewer/Editor */}
        {selectedFile && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Controls */}
            <div className="bg-gray-50 border-b p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Navigation */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium px-3">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2 px-3 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    Zoom Out
                  </button>
                  <button
                    onClick={resetZoom}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    Zoom In
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Display */}
            <div className="flex justify-center p-6 bg-gray-100 min-h-96 relative">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              ) : (
                <div className="relative">
                  <Document
                    file={selectedFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="text-gray-600">Loading PDF...</p>
                      </div>
                    }
                    className={`shadow-lg transition-opacity duration-300 ${isEditMode ? "opacity-60" : "opacity-100"}`}
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={!isEditMode}
                      renderAnnotationLayer={!isEditMode}
                      className="border border-gray-200"
                    />
                  </Document>

                  {/* Editable Fields Overlay */}
                  {isEditMode && (
                    <div
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{
                        width: "100%",
                        height: "100%",
                        transformOrigin: "top left",
                      }}
                    >
                      {editableFields
                        .filter(field => field.page === pageNumber)
                        .map(field => {
                          // Calculate relative position based on scale
                          const pageElement = document.querySelector(".react-pdf__Page");
                          if (!pageElement) return null;

                          // Get page dimensions for coordinate conversion
                          const pageEl = document.querySelector(".react-pdf__Page__canvas") as HTMLCanvasElement;
                          if (!pageEl) return null;
                          const pageHeight = pageEl.height / scale;

                          return (
                            <textarea
                              key={field.id}
                              value={field.text}
                              onChange={e => updateFieldText(field.id, e.target.value)}
                              onFocus={() => setSelectedFieldId(field.id)}
                              onBlur={() => setSelectedFieldId(null)}
                              className={`absolute resize-none overflow-hidden border-2 ${
                                selectedFieldId === field.id
                                  ? "border-blue-500 bg-white"
                                  : "border-transparent hover:border-gray-300 bg-white bg-opacity-80 hover:bg-opacity-90"
                              } px-1 py-0 text-xs text-black pointer-events-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200`}
                              style={{
                                left: `${field.x * scale}px`,
                                top: `${(pageHeight - field.y - field.height) * scale}px`,
                                width: `${Math.max(field.width * scale, 80)}px`,
                                height: `${field.height * scale * 1.5}px`,
                                fontFamily: "Helvetica, Arial, sans-serif",
                                fontSize: `${12 * scale}px`,
                                lineHeight: "1.2",
                                color: "#000000",
                              }}
                              rows={1}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Edit Mode Instructions */}
            {isEditMode && (
              <div className="bg-blue-50 border-t border-blue-200 p-4">
                <div className="max-w-3xl mx-auto">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Edit Mode Active:</strong> You can now edit the text in your PDF.
                  </p>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Click on any text to edit it directly</li>
                    <li>• Hover over text areas to see editable regions</li>
                    <li>• Use Tab to navigate between fields</li>
                    <li>• Click "Download Edited PDF" when you're done making changes</li>
                  </ul>
                  <p className="text-xs text-blue-500 mt-2">
                    Note: Some complex PDFs may not display all text fields correctly. For best results, use PDFs with
                    simple text layouts.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfEditor;
