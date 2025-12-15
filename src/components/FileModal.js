import React, {useEffect, useState, useCallback} from 'react';
import PdfViewer from './PdfViewer';

const FileModal = ({file, isOpen, onClose}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleEscapeKey = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) handleClose();
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
            const fullscreenElement = document.fullscreenElement ||
                                    document.webkitFullscreenElement ||
                                    document.msFullscreenElement;
            setIsFullscreen(!!fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleClose = () => {
        if (isFullscreen) exitFullscreen();
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const enterFullscreen = () => {
        const elem = document.querySelector('.modal-content');
        if (!elem) return;

        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    };

    if (!isOpen || !file) return null;

    return (
        <div
            className={`modal ${isOpen ? 'show' : ''}`}
            onClick={handleBackdropClick}
        >
            <div className="modal-content">
                {/* Заголовок и кнопки управления для десктопа */}
                <div className="modal-header desktop-only">
                    <div className="modal-title">
                        {file.type === 'image' ? '🖼️' : '📄'} {file.name}
                        {file.type === 'document' && <span className="file-format"> (PDF)</span>}
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
                        <button
                            className="close-modal desktop-only"
                            onClick={handleClose}
                            aria-label="Закрыть окно"
                            title="Закрыть"
                        >
                            <span className="cross">×</span>
                        </button>
                    </div>
                </div>

                {/* Кнопки управления для мобильных (рендерятся отдельно) */}
                <button
                    className="close-modal mobile-only"
                    onClick={handleClose}
                    aria-label="Закрыть"
                >
                    <span className="cross">×</span>
                </button>

                <button
                    className="fullscreen-btn mobile-only"
                    onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                    aria-label="Переключить полноэкранный режим"
                >
                    <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}></i>
                </button>

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
                        <PdfViewer fileUrl={file.url} fileName={file.name}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileModal;