import React from 'react';

const FileGrid = ({ files, onViewFile, onDownloadFile }) => {
    if (files.length === 0) {
        return (
            <div className="empty-state">
                <i className="fas fa-folder-open"></i>
                <h3>Нет файлов для отображения</h3>
                <p>Выберите категорию или подкатегорию для просмотра файлов</p>
            </div>
        );
    }

    return (
        <div className="content-area">
            {files.map(file => {
                // Используем fallback изображения если оригинальные не загружаются
                const imageUrl = file.type === 'image' ? file.url : '/assets/images/icons/pdf-icon.png';

                return (
                    <div key={file.id} className="file-card">
                        <div className="file-image-container">
                            <img
                                src={imageUrl}
                                alt={file.name}
                                className="file-image"
                                onError={(e) => {
                                    // Fallback для изображений
                                    if (file.type === 'image') {
                                        e.target.src = '/assets/images/icons/default-image.png';
                                    } else {
                                        e.target.src = '/assets/images/icons/pdf-icon.png';
                                    }
                                }}
                                loading="lazy"
                            />
                        </div>
                        <div className="file-details">
                            <div className="file-name" title={file.name}>
                                {file.name}
                            </div>
                            <div className="file-type">
                                {file.type === 'image' ? 'Изображение' : 'Документ PDF'}
                            </div>
                            <div className="file-actions">
                                <button
                                    className="view-btn"
                                    onClick={() => onViewFile(file)}
                                    title="Просмотреть файл"
                                >
                                    <i className="fas fa-eye"></i> Просмотр
                                </button>
                                <button
                                    className="download-btn"
                                    onClick={() => onDownloadFile(file)}
                                    title="Скачать файл"
                                >
                                    <i className="fas fa-download"></i> Скачать
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FileGrid;