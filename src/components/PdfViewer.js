import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + '/pdf.worker.min.mjs';


const PdfViewer = ({ fileUrl, fileName }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileExists, setFileExists] = useState(false);

    // Проверяем существование файла перед загрузкой
    useEffect(() => {
        const checkFileExists = async () => {
            setIsLoading(true);
            setError(null);
            setFileExists(false);

            try {
                console.log('Checking file:', fileUrl);

                // Для относительных путей добавляем PUBLIC_URL
                let checkUrl = fileUrl;
                if (fileUrl.startsWith('/')) {
                    checkUrl = `${process.env.PUBLIC_URL}${fileUrl}`;
                }

                const response = await fetch(checkUrl, { method: 'HEAD' });
                console.log('File check response:', response.status, response.ok);

                if (response.ok) {
                    setFileExists(true);
                    setError(null);
                } else {
                    setError(`Файл не найден (ошибка ${response.status})`);
                    setFileExists(false);
                }
            } catch (error) {
                console.error('File check failed:', error);
                setError('Не удалось проверить наличие файла');
                setFileExists(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkFileExists();
    }, [fileUrl]);

    // Обработка успешной загрузки PDF
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
        console.log('PDF loaded successfully:', numPages, 'pages');
    };

    // Обработка ошибки загрузки PDF
    const onDocumentLoadError = (error) => {
        console.error('PDF load error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        let errorMessage = 'Не удалось загрузить PDF файл';

        // Более конкретные сообщения об ошибках
        if (error.name === 'InvalidPDFException') {
            errorMessage = 'PDF файл поврежден или имеет неверный формат';
        } else if (error.name === 'MissingPDFException') {
            errorMessage = 'PDF файл не найден по указанному пути';
        } else if (error.message && error.message.includes('CORS')) {
            errorMessage = 'Ошибка доступа к файлу (проблема CORS)';
        }

        setError(errorMessage);
        setIsLoading(false);
    };

    // Получаем правильный URL для PDF с учетом PUBLIC_URL
    const getPdfUrl = () => {
        if (!fileUrl) return '';

        // Если путь начинается с /, добавляем PUBLIC_URL
        if (fileUrl.startsWith('/')) {
            return `${process.env.PUBLIC_URL}${fileUrl}`;
        }

        return fileUrl;
    };

    // Открыть PDF в новой вкладке
    const openInNewTab = () => {
        const url = getPdfUrl();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Загрузить PDF
    const downloadPdf = () => {
        const url = getPdfUrl();
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Навигация
    const goToPrevPage = () => {
        setPageNumber(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setPageNumber(prev => Math.min(prev + 1, numPages || 1));
    };

    // Если файл не существует, показываем сообщение об ошибке
    if (!fileExists && !isLoading) {
        return (
            <div className="pdf-error-container">
                <div className="pdf-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>Файл не найден</h3>
                    <p>PDF файл по пути <code>{fileUrl}</code> не существует или недоступен.</p>

                    <div className="pdf-error-actions">
                        <button
                            onClick={() => window.location.reload()}
                            className="pdf-retry-btn"
                        >
                            <i className="fas fa-sync-alt"></i> Обновить страницу
                        </button>

                        <p className="pdf-error-tip">
                            Проверьте:
                            <ul>
                                <li>Файл должен находиться в папке <code>public/assets/...</code></li>
                                <li>Путь в файле <code>categories.js</code> должен начинаться с <code>/</code></li>
                                <li>Имя файла должно совпадать (регистр важен!)</li>
                            </ul>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pdf-presentation-viewer">
            {/* Панель управления */}
            <div className="pdf-controls">
                <div className="pdf-nav-controls">
                    <button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1 || isLoading || error}
                        className="pdf-control-btn"
                        title="Предыдущая страница"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>

                    <div className="page-info">
                        <span className="page-current">{pageNumber}</span>
                        <span className="page-total"> / {numPages || '?'}</span>
                    </div>

                    <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= (numPages || 1) || isLoading || error}
                        className="pdf-control-btn"
                        title="Следующая страница"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div className="pdf-action-controls">
                    <button
                        onClick={openInNewTab}
                        className="pdf-control-btn"
                        title="Открыть в новой вкладке"
                    >
                        <i className="fas fa-external-link-alt"></i>
                    </button>

                    <button
                        onClick={downloadPdf}
                        className="pdf-control-btn"
                        title="Скачать PDF"
                    >
                        <i className="fas fa-download"></i>
                    </button>
                </div>
            </div>

            {/* Область просмотра PDF */}
            <div className="pdf-viewport">
                {isLoading && (
                    <div className="pdf-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Загрузка PDF...</p>
                    </div>
                )}

                {error && (
                    <div className="pdf-error">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>Ошибка загрузки</h3>
                        <p>{error}</p>

                        <div className="pdf-error-actions">
                            <button
                                onClick={openInNewTab}
                                className="pdf-open-tab-btn"
                            >
                                <i className="fas fa-external-link-alt"></i>
                                Открыть в новой вкладке
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="pdf-retry-btn"
                            >
                                <i className="fas fa-sync-alt"></i>
                                Попробовать снова
                            </button>
                        </div>

                        <div className="pdf-debug-info">
                            <p><strong>Отладочная информация:</strong></p>
                            <p>URL: <code>{getPdfUrl()}</code></p>
                            <p>Имя файла: <code>{fileName}</code></p>
                        </div>
                    </div>
                )}

                {!error && fileExists && (
                    <div className="pdf-document-container">
                        <Document
                            file={getPdfUrl()}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="pdf-loading">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <p>Загрузка PDF...</p>
                                </div>
                            }
                            error={
                                <div className="pdf-error">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <p>Ошибка загрузки PDF</p>
                                </div>
                            }
                            options={{
                                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                                cMapPacked: true,
                            }}
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="pdf-page"
                            />
                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;