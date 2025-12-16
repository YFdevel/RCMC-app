import React, { useState, useEffect, useCallback } from 'react';
import PdfViewer from '../PdfViewer/PdfViewer';
import styles from './FileModal.module.css';

const FileModal = ({ file, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Обработка Escape клавиши
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) handleClose();
  }, [isOpen]);

  // Эффекты при открытии/закрытии
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

  const handleClose = () => {
    if (isFullscreen) exitFullscreen();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const enterFullscreen = () => {
    const elem = document.querySelector(`.${styles.modalContent}`);
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

  // Обработка полноэкранного режима
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

  if (!isOpen || !file) return null;

  return (
    <div
      className={`${styles.modal} ${isOpen ? styles.show : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={styles.modalContent}>
        {/* Кнопки управления */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            {file.type === 'image' ? '🖼️' : '📄'} {file.name}
          </div>

          <div className={styles.modalControls}>
            <button
              className={`${styles.fullscreenBtn} ${isFullscreen ? styles.active : ''}`}
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
            >
              <span className={styles.fullscreenIcon}>
                {isFullscreen ? '🗗' : '🗖'}
              </span>
            </button>

            <button
              className={styles.closeModal}
              onClick={handleClose}
              aria-label="Закрыть"
            >
              <span className={styles.closeIcon}>✕</span>
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className={styles.modalBody}>
          {file.type === 'image' ? (
            <div className={styles.imageContainer}>
              <img
                className={styles.modalImage}
                src={file.url}
                alt={file.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          ) : (
            <div className={styles.pdfWrapper}>
              <PdfViewer fileUrl={file.url} fileName={file.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileModal;