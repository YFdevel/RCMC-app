import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

const PdfViewer = ({ fileUrl, fileName }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileExists, setFileExists] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showPageIndicator, setShowPageIndicator] = useState(false);
    const [showZoomIndicator, setShowZoomIndicator] = useState(false);
    const [isPinching, setIsPinching] = useState(false);

    const containerRef = useRef(null);
    const viewportRef = useRef(null);
    const pageIndicatorTimeoutRef = useRef(null);
    const zoomIndicatorTimeoutRef = useRef(null);

    const touchStartXRef = useRef(0);
    const touchStartYRef = useRef(0);
    const touchStartTimeRef = useRef(0);

    const initialPinchDistanceRef = useRef(0);
    const initialScaleRef = useRef(1.0);
    const lastTouchDistanceRef = useRef(0);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                const isLandscape = window.innerWidth > window.innerHeight;
                setScale(isLandscape ? 1.2 : 1.0);
            } else {
                setScale(1.0);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('orientationchange', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('orientationchange', checkMobile);
        };
    }, []);

    useEffect(() => {
        const checkFileExists = async () => {
            if (!fileUrl) return;

            setIsLoading(true);
            setError(null);

            try {
                const checkUrl = fileUrl.startsWith('/')
                    ? `${process.env.PUBLIC_URL}${fileUrl}`
                    : fileUrl;

                const response = await fetch(checkUrl, { method: 'HEAD' });

                if (response.ok) {
                    setFileExists(true);
                    setError(null);
                } else {
                    setError(`Файл не найден (ошибка ${response.status})`);
                    setFileExists(false);
                    setIsLoading(false);
                }
            } catch (err) {
                setError('Не удалось проверить наличие файла');
                setFileExists(false);
                setIsLoading(false);
            }
        };

        checkFileExists();
    }, [fileUrl]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
        setScale(1.0);
    };

    const onDocumentLoadError = (err) => {
        setError('Не удалось загрузить PDF файл');
        setIsLoading(false);
    };

    const getPdfUrl = useCallback(() => {
        if (!fileUrl) return '';
        return fileUrl.startsWith('/')
            ? `${process.env.PUBLIC_URL}${fileUrl}`
            : fileUrl;
    }, [fileUrl]);

    const goToPrevPage = useCallback(() => {
        setPageNumber((prev) => {
            const newPage = Math.max(prev - 1, 1);
            showPageIndicatorTemporarily();
            return newPage;
        });
    }, []);

    const goToNextPage = useCallback(() => {
        setPageNumber((prev) => {
            const newPage = Math.min(prev + 1, numPages || 1);
            showPageIndicatorTemporarily();
            return newPage;
        });
    }, [numPages]);

    const zoomIn = useCallback(() => {
        setScale((prev) => {
            const newScale = Math.min(prev + 0.2, 3.0);
            showZoomIndicatorTemporarily();
            return newScale;
        });
    }, []);

    const zoomOut = useCallback(() => {
        setScale((prev) => {
            const newScale = Math.max(prev - 0.2, 0.5);
            showZoomIndicatorTemporarily();
            return newScale;
        });
    }, []);

    const resetZoom = useCallback(() => {
        setScale(1.0);
        showZoomIndicatorTemporarily();
    }, []);

    const showPageIndicatorTemporarily = () => {
        if (!isMobile) return;

        setShowPageIndicator(true);
        if (pageIndicatorTimeoutRef.current) clearTimeout(pageIndicatorTimeoutRef.current);
        pageIndicatorTimeoutRef.current = setTimeout(() => setShowPageIndicator(false), 1500);
    };

    const showZoomIndicatorTemporarily = () => {
        if (!isMobile) return;

        setShowZoomIndicator(true);
        if (zoomIndicatorTimeoutRef.current) clearTimeout(zoomIndicatorTimeoutRef.current);
        zoomIndicatorTimeoutRef.current = setTimeout(() => setShowZoomIndicator(false), 1500);
    };

    const handleTouchStart = useCallback((e) => {
        if (!isMobile || e.touches.length > 1) return;

        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
        touchStartTimeRef.current = Date.now();
    }, [isMobile]);

    const handleTouchMove = useCallback((e) => {
        if (!isMobile || isPinching || e.touches.length > 1) return;
        if (scale !== 1.0) return;

        e.preventDefault();
    }, [isMobile, isPinching, scale]);

    const handleTouchEnd = useCallback((e) => {
        if (!isMobile || isPinching || e.changedTouches.length !== 1) {
            setIsPinching(false);
            return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartXRef.current;
        const deltaY = touchEndY - touchStartYRef.current;
        const deltaTime = Date.now() - touchStartTimeRef.current;

        const distance = Math.hypot(deltaX, deltaY);
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

        if (distance > 30 && deltaTime < 300 && isHorizontalSwipe) {
            if (deltaX > 0) goToPrevPage();
            else goToNextPage();
        }

        setIsPinching(false);
    }, [isMobile, isPinching, goToPrevPage, goToNextPage]);

    const handleMultiTouchStart = useCallback((e) => {
        if (!isMobile || e.touches.length !== 2) return;

        setIsPinching(true);
        e.preventDefault();

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        initialPinchDistanceRef.current = distance;
        initialScaleRef.current = scale;
        lastTouchDistanceRef.current = distance;
    }, [isMobile, scale]);

    const handleMultiTouchMove = useCallback((e) => {
        if (!isMobile || !isPinching || e.touches.length !== 2) return;

        e.preventDefault();

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        if (initialPinchDistanceRef.current > 0) {
            const newScale = Math.max(0.5, Math.min(3.0,
                initialScaleRef.current * (currentDistance / initialPinchDistanceRef.current)));
            setScale(newScale);

            if (Math.abs(currentDistance - lastTouchDistanceRef.current) > 5) {
                setShowZoomIndicator(true);
                lastTouchDistanceRef.current = currentDistance;

                if (zoomIndicatorTimeoutRef.current) clearTimeout(zoomIndicatorTimeoutRef.current);
                zoomIndicatorTimeoutRef.current = setTimeout(() => setShowZoomIndicator(false), 1500);
            }
        }
    }, [isMobile, isPinching]);

    const handleMultiTouchEnd = useCallback(() => {
        setIsPinching(false);
        initialPinchDistanceRef.current = 0;
        initialScaleRef.current = 1.0;
    }, []);

    const handleDoubleTap = useCallback((e) => {
        if (!isMobile) return;
        e.preventDefault();
        resetZoom();
    }, [isMobile, resetZoom]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport || !isMobile) return;

        let tapCount = 0;
        let tapTimer = null;

        const handleTap = (e) => {
            if (e.touches && e.touches.length > 1) return;

            tapCount++;
            if (tapCount === 1) {
                tapTimer = setTimeout(() => { tapCount = 0; }, 300);
            } else if (tapCount === 2) {
                clearTimeout(tapTimer);
                handleDoubleTap(e);
                tapCount = 0;
            }
        };

        const handleTouchStartWrapper = (e) => {
            if (e.touches.length === 1) handleTouchStart(e);
            else if (e.touches.length === 2) handleMultiTouchStart(e);
            handleTap(e);
        };

        const handleTouchMoveWrapper = (e) => {
            if (e.touches.length === 1) handleTouchMove(e);
            else if (e.touches.length === 2) handleMultiTouchMove(e);
        };

        const handleTouchEndWrapper = (e) => {
            if (e.touches.length === 0) {
                handleTouchEnd(e);
                handleMultiTouchEnd();
            }
        };

        viewport.addEventListener('touchstart', handleTouchStartWrapper, { passive: false });
        viewport.addEventListener('touchmove', handleTouchMoveWrapper, { passive: false });
        viewport.addEventListener('touchend', handleTouchEndWrapper);
        viewport.addEventListener('touchcancel', handleTouchEndWrapper);

        return () => {
            viewport.removeEventListener('touchstart', handleTouchStartWrapper);
            viewport.removeEventListener('touchmove', handleTouchMoveWrapper);
            viewport.removeEventListener('touchend', handleTouchEndWrapper);
            viewport.removeEventListener('touchcancel', handleTouchEndWrapper);
            if (tapTimer) clearTimeout(tapTimer);
        };
    }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd, handleMultiTouchStart,
        handleMultiTouchMove, handleMultiTouchEnd, handleDoubleTap]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isMobile) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPrevPage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToNextPage();
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                zoomIn();
            } else if (e.key === '-') {
                e.preventDefault();
                zoomOut();
            } else if (e.key === '0') {
                e.preventDefault();
                resetZoom();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobile, goToPrevPage, goToNextPage, zoomIn, zoomOut, resetZoom]);

    useEffect(() => {
        return () => {
            if (pageIndicatorTimeoutRef.current) clearTimeout(pageIndicatorTimeoutRef.current);
            if (zoomIndicatorTimeoutRef.current) clearTimeout(zoomIndicatorTimeoutRef.current);
        };
    }, []);

    if (!fileExists && !isLoading) {
        return (
            <div className="pdf-error">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>Файл не найден</h3>
                <p>PDF файл не существует по указанному пути.</p>
            </div>
        );
    }

    return (
        <div className="pdf-presentation-viewer" ref={containerRef}>
            {/* Панель управления только для десктопа */}
            {!isMobile && (
                <div className="pdf-controls">
                    <div className="pdf-nav-controls">
                        <button
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1 || isLoading || error}
                            className="pdf-control-btn"
                            title="Предыдущая страница (←)"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        <div className="page-info">
                            <input
                                type="number"
                                value={pageNumber}
                                onChange={(e) => {
                                    const page = parseInt(e.target.value);
                                    if (!isNaN(page) && page >= 1 && page <= (numPages || 1)) {
                                        setPageNumber(page);
                                    }
                                }}
                                min="1"
                                max={numPages || 1}
                                className="page-input"
                                disabled={isLoading || error}
                            />
                            <span className="page-total"> / {numPages || '?'}</span>
                        </div>

                        <button
                            onClick={goToNextPage}
                            disabled={pageNumber >= (numPages || 1) || isLoading || error}
                            className="pdf-control-btn"
                            title="Следующая страница (→)"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <div className="pdf-zoom-controls">
                        <button
                            onClick={zoomOut}
                            disabled={scale <= 0.5 || isLoading || error}
                            className="pdf-control-btn"
                            title="Уменьшить масштаб (-)"
                        >
                            <i className="fas fa-search-minus"></i>
                        </button>

                        <span className="zoom-level">
                            {Math.round(scale * 100)}%
                        </span>

                        <button
                            onClick={zoomIn}
                            disabled={scale >= 3.0 || isLoading || error}
                            className="pdf-control-btn"
                            title="Увеличить масштаб (+)"
                        >
                            <i className="fas fa-search-plus"></i>
                        </button>

                        <button
                            onClick={resetZoom}
                            disabled={scale === 1.0 || isLoading || error}
                            className="pdf-control-btn"
                            title="Сбросить масштаб (0)"
                        >
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
            )}

            <div className="pdf-viewport" ref={viewportRef}>
                {isLoading && (
                    <div className="pdf-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Загрузка PDF...</p>
                    </div>
                )}

                {error && (
                    <div className="pdf-error">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>Ошибка загрузки</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!error && fileExists && (
                    <div className="pdf-document-container">
                        <Document
                            file={getPdfUrl()}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="pdf-loading">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <p>Загрузка PDF...</p>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                className="pdf-page"
                                width={isMobile ? window.innerWidth * 0.95 : null}
                                renderTextLayer={!isMobile}
                                renderAnnotationLayer={!isMobile}
                                loading={
                                    <div className="pdf-loading">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <p>Загрузка страницы...</p>
                                    </div>
                                }
                            />
                        </Document>
                    </div>
                )}

                {/* Индикатор страницы для мобильных */}
                {isMobile && (
                    <div className={`pdf-page-indicator ${showPageIndicator ? 'show' : ''}`}>
                        <div className="pdf-page-indicator-content">
                            {pageNumber} / {numPages || '?'}
                        </div>
                    </div>
                )}

                {/* Индикатор масштаба для мобильных */}
                {isMobile && (
                    <div className={`pdf-zoom-indicator ${showZoomIndicator ? 'show' : ''}`}>
                        {Math.round(scale * 100)}%
                    </div>
                )}

                {/* Подсказка для свайпа */}
                {isMobile && pageNumber === 1 && numPages > 1 && !showPageIndicator && scale === 1.0 && (
                    <div className="pdf-swipe-hint">
                        <div className="pdf-swipe-hint-content">
                            <i className="fas fa-arrow-left"></i>
                            <span>Свайп для перелистывания</span>
                            <i className="fas fa-arrow-right"></i>
                        </div>
                    </div>
                )}

                {/* Подсказка для масштабирования */}
                {isMobile && scale === 1.0 && !showZoomIndicator && !showPageIndicator && (
                    <div className="pdf-swipe-hint" style={{ bottom: '70px', animationDelay: '1s' }}>
                        <div className="pdf-swipe-hint-content">
                            <i className="fas fa-search-plus"></i>
                            <span>Pinch для масштабирования</span>
                            <i className="fas fa-search-minus"></i>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;