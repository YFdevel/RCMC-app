import React, { useEffect, useState, useCallback } from 'react';

const FileModal = ({ file, isOpen, onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [useGoogleViewer, setUseGoogleViewer] = useState(false);

    // Определяем мобильное устройство
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // Для мобильных используем Google Docs Viewer по умолчанию
            setUseGoogleViewer(mobile && file?.type === 'document');
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, [file]);

    // Обработчик клавиши Escape
    const handleEscapeKey = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) {
            handleClose();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, handleEscapeKey]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const handleClose = () => {
        if (isFullscreen) {
            exitFullscreen();
        }
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (!elem) return;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    };

    // Функция для переключения режима просмотра PDF
    const togglePdfView = () => {
        setUseGoogleViewer(!useGoogleViewer);
    };

    // Получаем URL для PDF
    const getPdfUrl = () => {
        if (!file || file.type !== 'document') return '';

        let pdfUrl = file.url;

        if (useGoogleViewer) {
            // Google Docs Viewer для просмотра
            return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
        } else {
            // Нативный просмотр с параметрами
            if (!pdfUrl.includes('#')) {
                pdfUrl += '#toolbar=0&navpanes=0&scrollbar=0';
            }
            return pdfUrl;
        }
    };

    if (!isOpen || !file) return null;

    return (
        <div
            className={`modal ${isOpen ? 'show' : ''}`}
            onClick={handleBackdropClick}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        {file.type === 'image' ? '🖼️' : '📄'} {file.name}
                    </div>

                    <div className="modal-controls">
                        {/* Кнопка переключения режима PDF на мобильных */}
                        {isMobile && file.type === 'document' && (
                            <button
                                className="modal-btn"
                                onClick={togglePdfView}
                                title={useGoogleViewer ? "Переключить на нативный просмотр" : "Переключить на Google просмотр"}
                                aria-label="Переключить режим просмотра PDF"
                            >
                                <i className={`fas ${useGoogleViewer ? 'fa-file-pdf' : 'fa-eye'}`}></i>
                            </button>
                        )}

                        {!isFullscreen ? (
                            <button
                                className="modal-btn"
                                onClick={enterFullscreen}
                                title="Полноэкранный режим"
                                aria-label="Полноэкранный режим"
                            >
                                <i className="fas fa-expand"></i>
                            </button>
                        ) : (
                            <button
                                className="modal-btn"
                                onClick={exitFullscreen}
                                title="Выйти из полноэкранного режима"
                                aria-label="Выйти из полноэкранного режима"
                            >
                                <i className="fas fa-compress"></i>
                            </button>
                        )}
                    </div>

                    <button
                        className="close-modal"
                        onClick={handleClose}
                        aria-label="Закрыть окно"
                        title="Закрыть"
                    >
                        <span className="cross">×</span>
                    </button>
                </div>

                <div className="modal-body">
                    {file.type === 'image' ? (
                        <img
                            className="modal-image"
                            src={file.url}
                            alt={file.name}
                            onError={(e) => {
                                e.target.src = '/assets/images/icons/default-image.png';
                            }}
                        />
                    ) : (
                        <div className="pdf-viewer-container">
                            {isMobile && (
                                <div className="mobile-pdf-info">
                                    <p>
                                        <i className="fas fa-info-circle"></i>
                                        {useGoogleViewer ? 'Google Docs Viewer' : 'Нативный просмотр'}
                                        <button
                                            onClick={togglePdfView}
                                            className="pdf-view-toggle"
                                            style={{
                                                marginLeft: '10px',
                                                background: 'transparent',
                                                border: '1px solid var(--secondary)',
                                                color: 'var(--secondary)',
                                                padding: '2px 8px',
                                                borderRadius: '3px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Переключить
                                        </button>
                                    </p>
                                </div>
                            )}

                            <iframe
                                className="modal-document"
                                src={getPdfUrl()}
                                title={file.name}
                                frameBorder="0"
                                sandbox="allow-same-origin allow-scripts"
                                allow="fullscreen"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileModal;