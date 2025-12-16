import React, { useState } from 'react';
import styles from './FileGrid.module.css';

const FileGrid = ({ files, onViewFile, onDownloadFile }) => {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (fileId) => {
    setImageErrors(prev => ({
      ...prev,
      [fileId]: true
    }));
  };

  const getImagePath = (imageName) => {
    // Проверяем разные возможные пути
    const possiblePaths = [
      `/assets/images/${imageName}`,
      `/assets/images/icons/${imageName}`,
      `${process.env.PUBLIC_URL}/assets/images/${imageName}`,
      `${process.env.PUBLIC_URL}/assets/images/icons/${imageName}`
    ];

    // Возвращаем первый путь, он будет использоваться как src
    return possiblePaths[0];
  };

  if (files.length === 0) {
    return (
      <div className={styles.emptyState}>
        <i className="fas fa-folder-open"></i>
        <h3>Нет файлов для отображения</h3>
        <p>Выберите категорию или подкатегорию для просмотра файлов</p>
      </div>
    );
  }

  return (
    <div className={styles.contentArea}>
      {files.map(file => (
        <div key={file.id} className={styles.fileCard}>
          <div className={styles.fileImageContainer}>
            {file.type === 'image' && !imageErrors[file.id] ? (
              <img
                src={file.url}
                alt={file.name}
                className={styles.fileImage}
                onError={() => handleImageError(file.id)}
                loading="lazy"
                onLoad={(e) => {
                  // Проверяем, если изображение загрузилось успешно
                  if (e.target.naturalWidth === 0) {
                    handleImageError(file.id);
                  }
                }}
              />
            ) : (
              <div className={styles.fallbackIcon}>
                <i className={`fas ${file.type === 'document' ? 'fa-file-pdf' : 'fa-file-image'}`}></i>
                <span>{file.type === 'document' ? 'PDF Документ' : 'Изображение'}</span>
              </div>
            )}
          </div>

          <div className={styles.fileDetails}>
            <div>
              <div className={styles.fileName} title={file.name}>
                {file.name}
              </div>
              <div className={styles.fileType}>
                {file.type === 'image' ? 'Изображение' : 'Документ PDF'}
              </div>
            </div>

            <div className={styles.fileActions}>
              <button
                className={styles.viewBtn}
                onClick={() => onViewFile(file)}
                disabled={imageErrors[file.id] && file.type === 'image'}
                title="Просмотреть файл"
              >
                <i className="fas fa-eye"></i> Просмотр
              </button>
              <button
                className={styles.downloadBtn}
                onClick={() => onDownloadFile(file)}
                title="Скачать файл"
              >
                <i className="fas fa-download"></i> Скачать
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileGrid;