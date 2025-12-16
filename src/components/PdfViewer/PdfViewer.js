// import React, { useState, useEffect, useCallback } from 'react';
// import CenteredPDF from './CenteredPage';
// import styles from './PdfViewer.module.css';
//
// const PdfViewer = ({ fileUrl, fileName }) => {
//   const [isMobile, setIsMobile] = useState(false);
//   const [scale, setScale] = useState(1);
//   const [isChangingScale, setIsChangingScale] = useState(false);
//
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//
//       // Автоматически подбираем начальный масштаб
//       if (mobile) {
//         setScale(1.2); // На мобильных увеличенный масштаб
//       } else {
//         setScale(1.3); // На десктопе тоже увеличенный
//       }
//     };
//
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//
//     return () => {
//       window.removeEventListener('resize', checkMobile);
//     };
//   }, []);
//
//   const handleZoom = useCallback((operation) => {
//     setIsChangingScale(true);
//
//     setScale(prev => {
//       let newScale;
//       if (operation === 'in') {
//         newScale = Math.min(prev + 0.2, 3);
//       } else if (operation === 'out') {
//         newScale = Math.max(prev - 0.2, 0.3);
//       } else {
//         newScale = isMobile ? 1.2 : 1.3; // Сброс на оптимальный масштаб
//       }
//       return Math.round(newScale * 10) / 10;
//     });
//
//     setTimeout(() => setIsChangingScale(false), 300);
//   }, [isMobile]);
//
//   const zoomIn = useCallback(() => handleZoom('in'), [handleZoom]);
//   const zoomOut = useCallback(() => handleZoom('out'), [handleZoom]);
//   const resetZoom = useCallback(() => handleZoom('reset'), [handleZoom]);
//
//   return (
//     <div className={styles.pdfViewerContainer}>
//       {/* Контролы для десктопа */}
//       {!isMobile && (
//         <div className={styles.desktopControls}>
//           <div className={styles.controlGroup}>
//             <h3 className={styles.fileName}>{fileName}</h3>
//           </div>
//
//           <div className={styles.controlGroup}>
//             <button
//               className={styles.zoomButton}
//               onClick={zoomOut}
//               title="Уменьшить"
//               disabled={isChangingScale || scale <= 0.3}
//             >
//               <span className={styles.zoomIcon}>−</span>
//             </button>
//
//             <span className={styles.scaleDisplay}>
//               {Math.round(scale * 100)}%
//             </span>
//
//             <button
//               className={styles.zoomButton}
//               onClick={zoomIn}
//               title="Увеличить"
//               disabled={isChangingScale || scale >= 3}
//             >
//               <span className={styles.zoomIcon}>+</span>
//             </button>
//
//             <button
//               className={styles.resetButton}
//               onClick={resetZoom}
//               title="Сбросить масштаб"
//               disabled={isChangingScale}
//             >
//               Сброс
//             </button>
//           </div>
//         </div>
//       )}
//
//       {/* Контейнер PDF */}
//       <div className={`${styles.pdfContainer} ${isChangingScale ? styles.scaleChanging : ''}`}>
//         <CenteredPDF
//           fileUrl={fileUrl}
//           isMobile={isMobile}
//           scale={scale}
//         />
//       </div>
//
//       {/* Контролы для мобильных */}
//       {isMobile && (
//         <div className={styles.mobileControls}>
//           <div className={styles.mobileControlGroup}>
//             <button
//               className={styles.mobileZoomButton}
//               onClick={zoomOut}
//               disabled={scale <= 0.3}
//             >
//               <span className={styles.zoomIcon}>−</span>
//             </button>
//
//             <span className={styles.mobileScaleDisplay}>
//               {Math.round(scale * 100)}%
//             </span>
//
//             <button
//               className={styles.mobileZoomButton}
//               onClick={zoomIn}
//               disabled={scale >= 3}
//             >
//               <span className={styles.zoomIcon}>+</span>
//             </button>
//           </div>
//         </div>
//       )}
//
//       {isChangingScale && (
//         <div className={styles.scaleChangeIndicator}>
//           <div className={styles.loader}></div>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default PdfViewer;


import React, { useState, useEffect, useCallback } from 'react';
import CenteredPDF from './CenteredPage';
import styles from './PdfViewer.module.css';

const PdfViewer = ({ fileUrl, fileName }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [isChangingScale, setIsChangingScale] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Автоматически подбираем начальный масштаб
      if (mobile) {
        setScale(1.2); // На мобильных увеличенный масштаб
      } else {
        setScale(1.3); // На десктопе тоже увеличенный
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleZoom = useCallback((operation) => {
    setIsChangingScale(true);

    setScale(prev => {
      let newScale;
      if (operation === 'in') {
        newScale = Math.min(prev + 0.2, 3);
      } else if (operation === 'out') {
        newScale = Math.max(prev - 0.2, 0.3);
      } else {
        newScale = isMobile ? 1.2 : 1.3; // Сброс на оптимальный масштаб
      }
      return Math.round(newScale * 10) / 10;
    });

    setTimeout(() => setIsChangingScale(false), 300);
  }, [isMobile]);

  const zoomIn = useCallback(() => handleZoom('in'), [handleZoom]);
  const zoomOut = useCallback(() => handleZoom('out'), [handleZoom]);
  const resetZoom = useCallback(() => handleZoom('reset'), [handleZoom]);

  return (
    <div className={styles.pdfViewerContainer}>
      {/* Контролы для десктопа */}
      {!isMobile && (
        <div className={styles.desktopControls}>
          <div className={styles.controlGroup}>
            <h3 className={styles.fileName}>{fileName}</h3>
          </div>

          <div className={styles.controlGroup}>
            <button
              className={styles.zoomButton}
              onClick={zoomOut}
              title="Уменьшить"
              disabled={isChangingScale || scale <= 0.3}
            >
              <span className={styles.zoomIcon}>−</span>
            </button>

            <span className={styles.scaleDisplay}>
              {Math.round(scale * 100)}%
            </span>

            <button
              className={styles.zoomButton}
              onClick={zoomIn}
              title="Увеличить"
              disabled={isChangingScale || scale >= 3}
            >
              <span className={styles.zoomIcon}>+</span>
            </button>

            <button
              className={styles.resetButton}
              onClick={resetZoom}
              title="Сбросить масштаб"
              disabled={isChangingScale}
            >
              Сброс
            </button>
          </div>
        </div>
      )}

      {/* Контейнер PDF */}
      <div className={`${styles.pdfContainer} ${isChangingScale ? styles.scaleChanging : ''}`}>
        <CenteredPDF
          fileUrl={fileUrl}
          isMobile={isMobile}
          scale={scale}
        />
      </div>

      {/* Контролы для мобильных */}
      {isMobile && (
        <div className={styles.mobileControls}>
          <div className={styles.mobileControlGroup}>
            <button
              className={styles.mobileZoomButton}
              onClick={zoomOut}
              disabled={scale <= 0.3}
            >
              <span className={styles.zoomIcon}>−</span>
            </button>

            <span className={styles.mobileScaleDisplay}>
              {Math.round(scale * 100)}%
            </span>

            <button
              className={styles.mobileZoomButton}
              onClick={zoomIn}
              disabled={scale >= 3}
            >
              <span className={styles.zoomIcon}>+</span>
            </button>
          </div>
        </div>
      )}

      {isChangingScale && (
        <div className={styles.scaleChangeIndicator}>
          <div className={styles.loader}></div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;