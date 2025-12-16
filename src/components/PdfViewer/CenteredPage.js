import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.js`;

const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  disableAutoFetch: true,
  disableStream: true,
};

const CenteredPDF = ({ fileUrl, isMobile, scale }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMountedRef.current) {
      setPageNumber(1);
      setIsLoading(true);
      setError(null);
    }
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    if (isMountedRef.current) {
      setNumPages(numPages);
      setIsLoading(false);
    }
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    if (isMountedRef.current) {
      setError('Не удалось загрузить PDF файл');
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#ff6b6b',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h3 style={{ marginBottom: '8px' }}>Ошибка загрузки PDF</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto'
      }}
    >
      {isLoading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p>Загрузка PDF...</p>
        </div>
      )}

      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
        options={PDF_OPTIONS}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          renderMode="canvas"
          loading={null}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        />
      </Document>

      {!isLoading && !error && numPages && numPages > 1 && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '80px' : '20px',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '25px',
            padding: '10px 20px'
          }}>
            <button
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              style={{
                padding: '8px 16px',
                background: pageNumber <= 1 ? '#666' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              ←
            </button>

            <span style={{ color: 'white', fontSize: '14px' }}>
              {pageNumber} / {numPages}
            </span>

            <button
              onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
              disabled={pageNumber >= numPages}
              style={{
                padding: '8px 16px',
                background: pageNumber >= numPages ? '#666' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CenteredPDF;