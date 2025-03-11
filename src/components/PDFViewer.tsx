import { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

// Ensure we're using a specific version matching our installed pdfjs-dist package
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfPath: string;
}

export const PDFViewer = ({ pdfPath }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setLoadError(`Error loading PDF: ${error.message}`);
  }

  const nextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Log the PDF path to help with debugging
  useEffect(() => {
    console.log('Attempting to load PDF from:', pdfPath);
  }, [pdfPath]);

  // Memoize the options to prevent unnecessary reloads
  const pdfOptions = useMemo(() => ({ 
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true 
  }), []);

  return (
    <Card className={`pdf-viewer-container ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm">
            {numPages ? `Page ${pageNumber} of ${numPages}` : 'Loading PDF...'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={pageNumber <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={!numPages || pageNumber >= numPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className={`flex justify-center ${isFullscreen ? 'h-[calc(100vh-120px)]' : ''}`}>
          <Document
            file={pdfPath}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="text-center p-4">Loading PDF...</div>}
            error={
              <div className="text-center p-4 text-red-500">
                {loadError || "Failed to load PDF. Please check the file path."}
              </div>
            }
            options={pdfOptions}
          >
            {numPages && (
              <Page 
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
                scale={isFullscreen ? 1.5 : 1}
              />
            )}
          </Document>
        </div>
      </CardContent>
    </Card>
  );
};