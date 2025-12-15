import React, { useEffect, useState, useCallback } from 'react';

const FileModal = ({ file, isOpen, onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPdfWarning, setShowPdfWarning] = useState(false);

    // Обработчик клавиши Escape
    const handleEscapeKey = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) {
            handleClose();
        }
    }, [isOpen]);

    useEffect(() => {
        // Блокируем прокрутку при открытии модалки
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscapeKey);

            // Для PDF файлов показываем предупреждение
            if (file?.type === 'document') {
                const isMobile = window.innerWidth <= 768;
                setShowPdfWarning(isMobile);
            }
        }

        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEscapeKey);
            setShowPdfWarning(false);
        };
    }, [isOpen, file, handleEscapeKey]);

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

    // Открыть PDF в новой вкладке
    const openPdfInNewTab = () => {
        window.open(file.url, '_blank', 'noopener,noreferrer');
    };

    // Получить URL для PDF с параметрами
    const getPdfUrl = () => {
        if (!file || file.type !== 'document') return '';

        let pdfUrl = file.url;

        // Добавляем параметры для лучшего отображения
        if (!pdfUrl.includes('#')) {
            pdfUrl += '#toolbar=0&navpanes=0&scrollbar=0';
        }

        return pdfUrl;
    };

    // Проверяем, поддерживает ли браузер встроенный просмотр PDF
    const supportsInlinePdf = () => {
        const ua = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const isAndroid = /android/.test(ua);

        // iOS Safari и некоторые Android браузеры не поддерживают PDF в iframe
        if (isIOS || isAndroid) {
            return false;
        }

        return true;
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
                        <div className="pdf-container">
                            {showPdfWarning && !supportsInlinePdf() ? (
                                <div className="pdf-mobile-warning">
                                    <div className="pdf-warning-icon">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <h3>Просмотр PDF на мобильном устройстве</h3>
                                    <p>Ваш браузер не поддерживает встроенный просмотр PDF файлов.</p>
                                    <p>Вы можете:</p>

                                    <div className="pdf-mobile-options">
                                        <button
                                            className="pdf-open-tab-btn"
                                            onClick={openPdfInNewTab}
                                        >
                                            <i className="fas fa-external-link-alt"></i>
                                            Открыть в новой вкладке
                                        </button>

                                        <button
                                            className="pdf-try-anyway-btn"
                                            onClick={() => setShowPdfWarning(false)}
                                        >
                                            <i className="fas fa-sync-alt"></i>
                                            Попробовать встроенный просмотр
                                        </button>

                                        <a
                                            href={file.url}
                                            download={file.name}
                                            className="pdf-download-btn"
                                        >
                                            <i className="fas fa-download"></i>
                                            Скачать PDF
                                        </a>
                                    </div>

                                    <div className="pdf-mobile-tips">
                                        <p><strong>Совет:</strong> Для просмотра PDF на мобильном устройстве:</p>
                                        <ul>
                                            <li>Используйте приложение для просмотра PDF (Adobe Acrobat Reader, Google PDF Viewer)</li>
                                            <li>Откройте файл в новой вкладке браузера</li>
                                            <li>Скачайте файл для офлайн-просмотра</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Пытаемся показать PDF через iframe */}
                                    <iframe
                                        className="pdf-iframe"
                                        src={getPdfUrl()}
                                        title={file.name}
                                        frameBorder="0"
                                        sandbox="allow-same-origin allow-scripts"
                                        allow="fullscreen"
                                        style={{ width: '100%', height: '100%' }}
                                    />

                                    {/* Сообщение если PDF не загрузился */}
                                    <div className="pdf-fallback" style={{ display: 'none' }}>
                                        <p>Не удалось загрузить PDF для просмотра.</p>
                                        <button
                                            onClick={openPdfInNewTab}
                                            className="pdf-fallback-btn"
                                        >
                                            Открыть в новой вкладке
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileModal;