import React, { useEffect, useState, useCallback, useRef } from 'react';

const FileModal = ({ file, isOpen, onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const iframeRef = useRef(null);

    // Определяем мобильное устройство
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Обработчик клавиши Escape
    const handleEscapeKey = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) {
            handleClose();
        }
    }, [isOpen]);

    // Обработчики для PDF на мобильных
    const handleIframeLoad = useCallback(() => {
        if (iframeRef.current && file?.type === 'document') {
            try {
                // Пытаемся установить правильный режим просмотра для PDF
                const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
                if (iframeDoc) {
                    // Добавляем мета-тег для мобильной адаптации
                    const meta = iframeDoc.createElement('meta');
                    meta.name = 'viewport';
                    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
                    iframeDoc.head.appendChild(meta);
                }
            } catch (error) {
                console.log('Cannot modify iframe document:', error);
            }
        }
    }, [file]);

    useEffect(() => {
        // Блокируем прокрутку при открытии модалки
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

    // Генерируем правильный URL для PDF
    const getPdfUrl = () => {
        if (!file || file.type !== 'document') return '';

        let pdfUrl = file.url;

        // Добавляем параметры для корректного отображения PDF
        // На мобильных устройствах используем Google Docs Viewer для просмотра
        if (isMobile) {
            // Проверяем, является ли это PDF файлом
            if (pdfUrl.toLowerCase().endsWith('.pdf')) {
                // Используем Google Docs Viewer для мобильных устройств
                return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
            }
        }

        // Для десктопов используем стандартный просмотр
        if (!pdfUrl.includes('#')) {
            pdfUrl += '#view=FitH&toolbar=0&navpanes=0';
        }

        return pdfUrl;
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
                            {/* Информация о PDF для мобильных */}
                            {isMobile && (
                                <div className="mobile-pdf-info">
                                    <p><i className="fas fa-info-circle"></i> PDF открыт в режиме просмотра</p>
                                    <p className="mobile-pdf-hint">Для скачивания нажмите кнопку "Скачать" в карточке файла</p>
                                </div>
                            )}

                            <iframe
                                ref={iframeRef}
                                className="modal-document"
                                src={getPdfUrl()}
                                title={file.name}
                                frameBorder="0"
                                onLoad={handleIframeLoad}
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                allow="fullscreen"
                                loading="lazy"
                            />

                            {/* Альтернативная ссылка для мобильных, если iframe не работает */}
                            {isMobile && (
                                <div className="mobile-pdf-fallback">
                                    <p>Если PDF не отображается:</p>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mobile-pdf-link"
                                    >
                                        <i className="fas fa-external-link-alt"></i> Открыть в новой вкладке
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileModal;