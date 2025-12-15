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
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [showPageIndicator, setShowPageIndicator] = useState(false);
    const [showZoomIndicator, setShowZoomIndicator] = useState(false);
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);
    const [pinchStartDistance, setPinchStartDistance] = useState(null);
    const [pinchStartScale, setPinchStartScale] = useState(1.0);
    const containerRef = useRef(null);
    const viewportRef = useRef(null);
    const pageIndicatorTimeoutRef = useRef(null);
    const zoomIndicatorTimeoutRef = useRef(null);

    // Проверяем мобильное устройство
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            if (mobile) {
                const isLandscape = window.innerWidth > window.innerHeight;
                setScale(isLandscape ? 1.0 : 0.9);
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

    // Проверяем существование файла
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
            } catch (error) {
                console.error('File check failed:', error);
                setError('Не удалось проверить наличие файла');
                setFileExists(false);
                setIsLoading(false);
            }
        };

        checkFileExists();
    }, [fileUrl]);

    // Рассчитываем размеры контейнера
    useEffect(() => {
        const updateContainerSize = () => {
            if (viewportRef.current) {
                const rect = viewportRef.current.getBoundingClientRect();
                setContainerWidth(rect.width);
                setContainerHeight(rect.height);
            }
        };

        updateContainerSize();

        const resizeObserver = new ResizeObserver(updateContainerSize);
        if (viewportRef.current) {
            resizeObserver.observe(viewportRef.current);
        }

        window.addEventListener('resize', updateContainerSize);
        window.addEventListener('orientationchange', updateContainerSize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateContainerSize);
            window.removeEventListener('orientationchange', updateContainerSize);
        };
    }, []);

    // Обработка успешной загрузки PDF
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
    };

    // Обработка ошибки загрузки PDF
    const onDocumentLoadError = (error) => {
        console.error('PDF load error:', error);
        setError('Не удалось загрузить PDF файл');
        setIsLoading(false);
    };

    // Получаем правильный URL для PDF
    const getPdfUrl = useCallback(() => {
        if (!fileUrl) return '';
        return fileUrl.startsWith('/')
            ? `${process.env.PUBLIC_URL}${fileUrl}`
            : fileUrl;
    }, [fileUrl]);

    // Навигация по страницам
    const goToPrevPage = useCallback(() => {
        setPageNumber(prev => {
            const newPage = Math.max(prev - 1, 1);
            showPageIndicatorTemporarily();
            return newPage;
        });
    }, []);

    const goToNextPage = useCallback(() => {
        setPageNumber(prev => {
            const newPage = Math.min(prev + 1, numPages || 1);
            showPageIndicatorTemporarily();
            return newPage;
        });
    }, [numPages]);

    // Масштабирование
    const zoomIn = useCallback(() => {
        setScale(prev => {
            const newScale = Math.min(prev + 0.2, 3.0);
            showZoomIndicatorTemporarily();
            return newScale;
        });
    }, []);

    const zoomOut = useCallback(() => {
        setScale(prev => {
            const newScale = Math.max(prev - 0.2, 0.5);
            showZoomIndicatorTemporarily();
            return newScale;
        });
    }, []);

    const resetZoom = useCallback(() => {
        setScale(1.0);
        showZoomIndicatorTemporarily();
    }, []);

    // Показываем индикатор страницы временно
    const showPageIndicatorTemporarily = () => {
        if (!isMobile) return;

        setShowPageIndicator(true);

        if (pageIndicatorTimeoutRef.current) {
            clearTimeout(pageIndicatorTimeoutRef.current);
        }

        pageIndicatorTimeoutRef.current = setTimeout(() => {
            setShowPageIndicator(false);
        }, 1500);
    };

    // Показываем индикатор масштаба временно
    const showZoomIndicatorTemporarily = () => {
        if (!isMobile) return;

        setShowZoomIndicator(true);

        if (zoomIndicatorTimeoutRef.current) {
            clearTimeout(zoomIndicatorTimeoutRef.current);
        }

        zoomIndicatorTimeoutRef.current = setTimeout(() => {
            setShowZoomIndicator(false);
        }, 1500);
    };

    // Обработка свайпа для навигации по страницам
    const handleTouchStart = (e) => {
        if (!isMobile || e.touches.length > 1) return;

        setTouchStartX(e.touches[0].clientX);
        setTouchEndX(null);
    };

    const handleTouchMove = (e) => {
        if (!isMobile || e.touches.length > 1) return;

        if (touchStartX !== null) {
            setTouchEndX(e.touches[0].clientX);
        }
    };

    const handleTouchEnd = () => {
        if (!isMobile || !touchStartX || !touchEndX) return;

        const swipeDistance = touchStartX - touchEndX;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Свайп влево - следующая страница
                goToNextPage();
            } else {
                // Свайп вправо - предыдущая страница
                goToPrevPage();
            }
        }

        setTouchStartX(null);
        setTouchEndX(null);
    };

    // Обработка pinch-to-zoom для масштабирования
    const handlePinchStart = (e) => {
        if (!isMobile || e.touches.length !== 2) return;

        const distance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );

        setPinchStartDistance(distance);
        setPinchStartScale(scale);
    };

    const handlePinchMove = (e) => {
        if (!isMobile || e.touches.length !== 2 || pinchStartDistance === null) return;

        e.preventDefault();

        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );

        const scaleChange = currentDistance / pinchStartDistance;
        const newScale = Math.max(0.5, Math.min(3.0, pinchStartScale * scaleChange));

        setScale(newScale);
        setShowZoomIndicator(true);
    };

    const handlePinchEnd = () => {
        if (!isMobile) return;

        setPinchStartDistance(null);
        setPinchStartScale(1.0);

        // Скрываем индикатор масштаба через 1.5 секунды
        if (zoomIndicatorTimeoutRef.current) {
            clearTimeout(zoomIndicatorTimeoutRef.current);
        }

        zoomIndicatorTimeoutRef.current = setTimeout(() => {
            setShowZoomIndicator(false);
        }, 1500);
    };

    // Обработка двойного тапа для сброса масштаба
    const handleDoubleTap = useCallback((e) => {
        if (!isMobile) return;

        e.preventDefault();
        resetZoom();
    }, [resetZoom]);

    // Обработка клавиатурных сокращений (только для десктопа)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Только для десктопа
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

    // Очистка таймеров
    useEffect(() => {
        return () => {
            if (pageIndicatorTimeoutRef.current) {
                clearTimeout(pageIndicatorTimeoutRef.current);
            }
            if (zoomIndicatorTimeoutRef.current) {
                clearTimeout(zoomIndicatorTimeoutRef.current);
            }
        };
    }, []);

    // Добавляем обработчики для pinch-to-zoom
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport || !isMobile) return;

        const handleTouchStartWrapper = (e) => {
            if (e.touches.length === 1) {
                handleTouchStart(e);
            } else if (e.touches.length === 2) {
                handlePinchStart(e);
            }
        };

        const handleTouchMoveWrapper = (e) => {
            if (e.touches.length === 1) {
                handleTouchMove(e);
            } else if (e.touches.length === 2) {
                handlePinchMove(e);
            }
        };

        const handleTouchEndWrapper = (e) => {
            handleTouchEnd();
            handlePinchEnd();
        };

        // Предотвращаем стандартное масштабирование браузера
        const preventDefault = (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };

        viewport.addEventListener('touchstart', handleTouchStartWrapper, { passive: false });
        viewport.addEventListener('touchmove', handleTouchMoveWrapper, { passive: false });
        viewport.addEventListener('touchend', handleTouchEndWrapper);
        viewport.addEventListener('gesturestart', preventDefault);
        viewport.addEventListener('gesturechange', preventDefault);
        viewport.addEventListener('gestureend', preventDefault);

        // Обработка двойного тапа
        let lastTap = 0;
        const handleTap = (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 300 && tapLength > 0) {
                handleDoubleTap(e);
                e.preventDefault();
            }

            lastTap = currentTime;
        };

        viewport.addEventListener('touchend', handleTap);

        return () => {
            viewport.removeEventListener('touchstart', handleTouchStartWrapper);
            viewport.removeEventListener('touchmove', handleTouchMoveWrapper);
            viewport.removeEventListener('touchend', handleTouchEndWrapper);
            viewport.removeEventListener('gesturestart', preventDefault);
            viewport.removeEventListener('gesturechange', preventDefault);
            viewport.removeEventListener('gestureend', preventDefault);
            viewport.removeEventListener('touchend', handleTap);
        };
    }, [isMobile, handleDoubleTap]);

    // Если файл не существует
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
        <div
            className="pdf-presentation-viewer"
            ref={containerRef}
        >
            {/* Панель управления (только для десктопа) */}
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

                    <div className="pdf-action-controls">
                        <button
                            onClick={() => window.open(getPdfUrl(), '_blank')}
                            className="pdf-control-btn"
                            title="Открыть в новой вкладке"
                        >
                            <i className="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Область просмотра PDF */}
            <div
                className="pdf-viewport"
                ref={viewportRef}
            >
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
                        <button
                            onClick={() => window.open(getPdfUrl(), '_blank')}
                            className="pdf-error-link"
                        >
                            <i className="fas fa-external-link-alt"></i>
                            Открыть в новой вкладке
                        </button>
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
                                width={Math.min(containerWidth - (isMobile ? 0 : 40), 1200)}
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
                    <div className={`zoom-indicator ${showZoomIndicator ? 'show' : ''}`}>
                        {Math.round(scale * 100)}%
                    </div>
                )}
            </div>

            {/* Подсказка для свайпа (показывается только в начале) */}
            {isMobile && pageNumber === 1 && numPages > 1 && !showPageIndicator && (
                <div className="pdf-swipe-hint">
                    <div className="pdf-swipe-hint-content">
                        <i className="fas fa-arrow-left"></i>
                        <span>Свайп для перелистывания</span>
                        <i className="fas fa-arrow-right"></i>
                    </div>
                </div>
            )}

            {/* Подсказка для масштабирования */}
            {isMobile && scale === 1.0 && !showZoomIndicator && (
                <div className="pdf-swipe-hint" style={{ bottom: '70px', animationDelay: '1s' }}>
                    <div className="pdf-swipe-hint-content">
                        <i className="fas fa-search-plus"></i>
                        <span>Pinch для масштабирования</span>
                        <i className="fas fa-search-minus"></i>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfViewer;