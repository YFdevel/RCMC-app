import React, { useEffect, useState, useCallback } from 'react';

const FileModal = ({ file, isOpen, onClose }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

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
                        <iframe
                            className="modal-document"
                            src={`${file.url}#view=FitH`}
                            title={file.name}
                            frameBorder="0"
                        ></iframe>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileModal;