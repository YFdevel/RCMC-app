import React, {useEffect, useState, useCallback, useRef} from 'react';
import PdfViewer from './PdfViewer';

const FileModal = ({file, isOpen, onClose}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [imageScale, setImageScale] = useState(1);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isPinchingImage, setIsPinchingImage] = useState(false);
    const [isDraggingImage, setIsDraggingImage] = useState(false);

    const imageRef = useRef(null);
    const modalBodyRef = useRef(null);

    // Для pinch-to-zoom изображений
    const initialPinchDistanceRef = useRef(0);
    const initialScaleRef = useRef(1);
    const lastTouchDistanceRef = useRef(0);

    // Для drag изображений
    const dragStartRef = useRef({ x: 0, y: 0 });
    const positionStartRef = useRef({ x: 0, y: 0 });

    const handleEscapeKey = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) handleClose();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscapeKey);

            // Сбрасываем состояние масштабирования при открытии
            setImageScale(1);
            setImagePosition({ x: 0, y: 0 });
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

            // При выходе из полноэкранного режима сбрасываем масштаб
            if (!fullscreenElement && file?.type === 'image') {
                setImageScale(1);
                setImagePosition({ x: 0, y: 0 });
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, [file]);

    const handleClose = () => {
        if (isFullscreen) exitFullscreen();
        onClose();
    };

    const handleBackdropClick = (e) => {
        // Закрываем только при клике на фон, не на изображение
        if (e.target === e.currentTarget) {
            // Сбрасываем масштаб перед закрытием
            if (file?.type === 'image') {
                setImageScale(1);
                setImagePosition({ x: 0, y: 0 });
            }
            handleClose();
        }
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

    // Обработка pinch-to-zoom для изображений
    const handleImageTouchStart = useCallback((e) => {
        if (file?.type !== 'image' || e.touches.length === 0) return;

        if (e.touches.length === 1) {
            // Начало перетаскивания
            setIsDraggingImage(true);
            dragStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            positionStartRef.current = { ...imagePosition };
            e.preventDefault();
        } else if (e.touches.length === 2) {
            // Начало pinch-to-zoom
            setIsPinchingImage(true);
            setIsDraggingImage(false);

            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            initialPinchDistanceRef.current = distance;
            initialScaleRef.current = imageScale;
            lastTouchDistanceRef.current = distance;
            e.preventDefault();
        }
    }, [file, imageScale, imagePosition]);

    const handleImageTouchMove = useCallback((e) => {
        if (file?.type !== 'image' || e.touches.length === 0) return;

        if (isPinchingImage && e.touches.length === 2) {
            // Обработка pinch-to-zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (initialPinchDistanceRef.current > 0) {
                const scaleChange = currentDistance / initialPinchDistanceRef.current;
                const newScale = Math.max(0.5, Math.min(5.0, initialScaleRef.current * scaleChange));
                setImageScale(newScale);

                // Центрируем масштабирование
                if (imageRef.current && modalBodyRef.current) {
                    const imgRect = imageRef.current.getBoundingClientRect();
                    const containerRect = modalBodyRef.current.getBoundingClientRect();

                    const centerX = containerRect.width / 2;
                    const centerY = containerRect.height / 2;

                    setImagePosition({
                        x: centerX - imgRect.width / 2,
                        y: centerY - imgRect.height / 2
                    });
                }
            }
            e.preventDefault();
        } else if (isDraggingImage && e.touches.length === 1 && imageScale > 1) {
            // Обработка перетаскивания (только если изображение увеличено)
            const deltaX = e.touches[0].clientX - dragStartRef.current.x;
            const deltaY = e.touches[0].clientY - dragStartRef.current.y;

            setImagePosition({
                x: positionStartRef.current.x + deltaX,
                y: positionStartRef.current.y + deltaY
            });
            e.preventDefault();
        }
    }, [file, isPinchingImage, isDraggingImage, imageScale]);

    const handleImageTouchEnd = useCallback((e) => {
        if (file?.type !== 'image') return;

        setIsPinchingImage(false);
        setIsDraggingImage(false);

        // Ограничиваем позицию, чтобы изображение не уходило за пределы
        if (imageRef.current && modalBodyRef.current) {
            const imgRect = imageRef.current.getBoundingClientRect();
            const containerRect = modalBodyRef.current.getBoundingClientRect();

            if (imageScale > 1) {
                const maxX = Math.max(0, (imgRect.width - containerRect.width) / 2);
                const maxY = Math.max(0, (imgRect.height - containerRect.height) / 2);

                setImagePosition(prev => ({
                    x: Math.max(-maxX, Math.min(maxX, prev.x)),
                    y: Math.max(-maxY, Math.min(maxY, prev.y))
                }));
            } else {
                // Если масштаб 1:1 или меньше, центрируем изображение
                setImagePosition({ x: 0, y: 0 });
            }
        }
    }, [file, imageScale]);

    const handleImageDoubleTap = useCallback((e) => {
        if (file?.type !== 'image') return;

        e.preventDefault();

        // Двойной тап сбрасывает масштаб и позицию
        if (imageScale !== 1) {
            setImageScale(1);
            setImagePosition({ x: 0, y: 0 });
        } else {
            // Двойной тап на масштабе 1: увеличивает до 2x
            setImageScale(2);

            if (imageRef.current && modalBodyRef.current) {
                const imgRect = imageRef.current.getBoundingClientRect();
                const containerRect = modalBodyRef.current.getBoundingClientRect();

                // Центрируем увеличенное изображение
                setImagePosition({
                    x: containerRect.width / 2 - imgRect.width,
                    y: containerRect.height / 2 - imgRect.height / 2
                });
            }
        }
    }, [file, imageScale]);

    // Добавляем обработчики для изображений
    useEffect(() => {
        if (!isOpen || file?.type !== 'image') return;

        const imageElement = imageRef.current;
        const modalBodyElement = modalBodyRef.current;

        if (!imageElement || !modalBodyElement) return;

        let lastTapTime = 0;

        const handleTap = (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;

            if (tapLength < 300 && tapLength > 0) {
                handleImageDoubleTap(e);
                lastTapTime = 0;
            } else {
                lastTapTime = currentTime;
            }
        };

        const handleTouchStartWrapper = (e) => {
            handleImageTouchStart(e);
            handleTap(e);
        };

        // Применяем обработчики к изображению
        imageElement.addEventListener('touchstart', handleTouchStartWrapper, { passive: false });
        imageElement.addEventListener('touchmove', handleImageTouchMove, { passive: false });
        imageElement.addEventListener('touchend', handleImageTouchEnd);
        imageElement.addEventListener('touchcancel', handleImageTouchEnd);

        // Также обрабатываем события на теле модального окна для лучшего UX
        modalBodyElement.addEventListener('touchstart', handleTouchStartWrapper, { passive: false });
        modalBodyElement.addEventListener('touchmove', handleImageTouchMove, { passive: false });
        modalBodyElement.addEventListener('touchend', handleImageTouchEnd);
        modalBodyElement.addEventListener('touchcancel', handleImageTouchEnd);

        return () => {
            imageElement.removeEventListener('touchstart', handleTouchStartWrapper);
            imageElement.removeEventListener('touchmove', handleImageTouchMove);
            imageElement.removeEventListener('touchend', handleImageTouchEnd);
            imageElement.removeEventListener('touchcancel', handleImageTouchEnd);

            modalBodyElement.removeEventListener('touchstart', handleTouchStartWrapper);
            modalBodyElement.removeEventListener('touchmove', handleImageTouchMove);
            modalBodyElement.removeEventListener('touchend', handleImageTouchEnd);
            modalBodyElement.removeEventListener('touchcancel', handleImageTouchEnd);
        };
    }, [isOpen, file, handleImageTouchStart, handleImageTouchMove, handleImageTouchEnd, handleImageDoubleTap]);

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
                        {file.type === 'image' && imageScale !== 1 && (
                            <span className="image-zoom-indicator">
                                {Math.round(imageScale * 100)}%
                            </span>
                        )}
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

                {/* Кнопки управления для мобильных */}
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

                {/* Индикатор масштаба для мобильных (только для изображений) */}
                {file.type === 'image' && imageScale !== 1 && (
                    <div className="mobile-zoom-indicator">
                        {Math.round(imageScale * 100)}%
                    </div>
                )}

                <div
                    className="modal-body"
                    ref={modalBodyRef}
                    style={{
                        cursor: imageScale > 1 ? 'grab' : 'default',
                        userSelect: 'none'
                    }}
                >
                    {file.type === 'image' ? (
                        <div className="image-container">
                            <img
                                ref={imageRef}
                                className="modal-image"
                                src={file.url}
                                alt={file.name}
                                style={{
                                    transform: `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                                    transformOrigin: 'center center',
                                    transition: isPinchingImage || isDraggingImage ? 'none' : 'transform 0.1s ease',
                                    touchAction: 'none',
                                    maxWidth: imageScale > 1 ? 'none' : '100%',
                                    maxHeight: imageScale > 1 ? 'none' : '100%',
                                    cursor: imageScale > 1 ? 'grab' : 'default'
                                }}
                                onError={(e) => {
                                    e.target.src = '/assets/images/icons/default-image.png';
                                }}
                                draggable="false"
                            />
                        </div>
                    ) : (
                        <PdfViewer fileUrl={file.url} fileName={file.name}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileModal;