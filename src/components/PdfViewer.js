import React, { useState, useEffect, useRef } from 'react';
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
    const containerRef = useRef(null);
    const viewportRef = useRef(null);

    // Проверяем существование файла перед загрузкой
    useEffect(() => {
        const checkFileExists = async () => {
            setIsLoading(true);
            setError(null);
            setFileExists(false);

            try {
                console.log('Checking file:', fileUrl);

                // Для относительных путей добавляем PUBLIC_URL
                let checkUrl = fileUrl;
                if (fileUrl.startsWith('/')) {
                    checkUrl = `${process.env.PUBLIC_URL}${fileUrl}`;
                }

                const response = await fetch(checkUrl, { method: 'HEAD' });
                console.log('File check response:', response.status, response.ok);

                if (response.ok) {
                    setFileExists(true);
                    setError(null);
                } else {
                    setError(`Файл не найден (ошибка ${response.status})`);
                    setFileExists(false);
                }
            } catch (error) {
                console.error('File check failed:', error);
                setError('Не удалось проверить наличие файла');
                setFileExists(false);
            } finally {
                setIsLoading(false);
            }
        };

        if (fileUrl) {
            checkFileExists();
        }
    }, [fileUrl]);

    // Проверяем мобильное устройство
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            
            // Автоматически подбираем масштаб для мобильных устройств
            if (mobile) {
                const isLandscape = window.innerWidth > window.innerHeight;
                setScale(isLandscape ? 0.85 : 0.75);
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

    // Рассчитываем размеры контейнера
    useEffect(() => {
        const updateContainerSize = () => {
            if (containerRef.current && viewportRef.current) {
                const viewportRect = viewportRef.current.getBoundingClientRect();
                setContainerWidth(viewportRect.width);
                setContainerHeight(viewportRect.height);
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
        console.log('PDF loaded successfully:', numPages, 'pages');
    };

    // Обработка ошибки загрузки PDF
    const onDocumentLoadError = (error) => {
        console.error('PDF load error:', error);
        
        let errorMessage = 'Не удалось загрузить PDF файл';
        
        if (error.message && error.message.includes('version')) {
            errorMessage = 'Версия PDF обработчика несовместима. Обновите страницу.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
    };

    // Получаем правильный URL для PDF с учетом PUBLIC_URL
    const getPdfUrl = () => {
        if (!fileUrl) return '';
        if (fileUrl.startsWith('/')) {
            return `${process.env.PUBLIC_URL}${fileUrl}`;
        }
        return fileUrl;
    };

    // Открыть PDF в новой вкладке
    const openInNewTab = () => {
        const url = getPdfUrl();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Загрузить PDF
    const downloadPdf = () => {
        const url = getPdfUrl();
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Навигация
    const goToPrevPage = () => {
        setPageNumber(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setPageNumber(prev => Math.min(prev + 1, numPages || 1));
    };

    // Переход к конкретной странице
    const goToPage = (e) => {
        const page = parseInt(e.target.value);
        if (!isNaN(page) && page >= 1 && page <= (numPages || 1)) {
            setPageNumber(page);
        }
    };

    // Изменение масштаба
    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.1, 2.0));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.1, 0.5));
    };

    const resetZoom = () => {
        if (isMobile) {
            const isLandscape = window.innerWidth > window.innerHeight;
            setScale(isLandscape ? 0.85 : 0.75);
        } else {
            setScale(1.0);
        }
    };

    // Обработка клавиатурных сокращений
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Стрелки для навигации
            if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                goToPrevPage();
            } else if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                goToNextPage();
            }
            // Ctrl/Cmd + для масштабирования
            else if ((e.ctrlKey || e.metaKey) && e.key === '=') {
                e.preventDefault();
                zoomIn();
            }
            // Ctrl/Cmd - для уменьшения
            else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                zoomOut();
            }
            // Ctrl/Cmd 0 для сброса масштаба
            else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                resetZoom();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageNumber, numPages, scale, isMobile]);

    // Если файл не существует, показываем сообщение об ошибке
    if (!fileExists && !isLoading) {
        return (
            <div className="pdf-error-container">
                <div className="pdf-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Файл не найден</h3>
                    <p>PDF файл по пути <code>{fileUrl}</code> не существует.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pdf-presentation-viewer" ref={containerRef}>
            {/* Панель управления */}
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
                            onChange={goToPage}
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

                {!isMobile && (
                    <div className="pdf-zoom-controls">
                        <button
                            onClick={zoomOut}
                            disabled={isLoading || error}
                            className="pdf-control-btn"
                            title="Уменьшить (Ctrl -)"
                        >
                            <i className="fas fa-search-minus"></i>
                        </button>
                        
                        <button
                            onClick={resetZoom}
                            disabled={isLoading || error}
                            className="pdf-control-btn"
                            title="Сбросить масштаб (Ctrl 0)"
                        >
                            <span className="zoom-level">{Math.round(scale * 100)}%</span>
                        </button>
                        
                        <button
                            onClick={zoomIn}
                            disabled={isLoading || error}
                            className="pdf-control-btn"
                            title="Увеличить (Ctrl +)"
                        >
                            <i className="fas fa-search-plus"></i>
                        </button>
                    </div>
                )}

                <div className="pdf-action-controls">
                    {isMobile && (
                        <button
                            onClick={resetZoom}
                            disabled={isLoading || error}
                            className="pdf-control-btn"
                            title="Масштаб"
                        >
                            <span className="zoom-level">{Math.round(scale * 100)}%</span>
                        </button>
                    )}
                    
                    <button
                        onClick={openInNewTab}
                        className="pdf-control-btn"
                        title="Открыть в новой вкладке"
                    >
                        <i className="fas fa-external-link-alt"></i>
                    </button>

                    <button
                        onClick={downloadPdf}
                        className="pdf-control-btn"
                        title="Скачать PDF"
                    >
                        <i className="fas fa-download"></i>
                    </button>
                </div>
            </div>

            {/* Область просмотра PDF */}
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
                        <button
                            onClick={openInNewTab}
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
                            error={
                                <div className="pdf-error">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <h3>Ошибка загрузки PDF</h3>
                                    <p>Не удалось загрузить документ</p>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                className="pdf-page"
                                width={Math.min(containerWidth - 20, 1200)}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                loading={
                                    <div className="pdf-loading">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <p>Загрузка страницы...</p>
                                    </div>
                                }
                                error={
                                    <div className="pdf-error">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <h3>Ошибка загрузки страницы</h3>
                                    </div>
                                }
                            />
                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;
