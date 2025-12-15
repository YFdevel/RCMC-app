import React, {useState, useEffect} from 'react';
import './App.css';
import {categories} from './data/categories';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Breadcrumb from './components/Breadcrumb';
import FileGrid from './components/FileGrid';
import FileModal from './components/FileModal';

function App() {
    // Состояния авторизации
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Состояния навигации
    const [currentCategory, setCurrentCategory] = useState(null);
    const [currentSubcategory, setCurrentSubcategory] = useState(null);

    // Состояния файлов и модального окна
    const [currentFiles, setCurrentFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Состояние для мобильного меню
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Определяем мобильное устройство
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Инициализация приложения
    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);

        if (loggedIn && categories.length > 0) {
            setCurrentCategory(categories[0].id);
        }

        // Обработчик изменения размера окна
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            // Закрываем меню при переходе на десктоп
            if (window.innerWidth > 768) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Обновление текущих файлов
    useEffect(() => {
        if (!currentCategory) {
            setCurrentFiles([]);
            return;
        }

        const category = categories.find(c => c.id === currentCategory);
        if (!category) {
            setCurrentFiles([]);
            return;
        }

        if (currentSubcategory) {
            const subcategory = category.subcategories.find(s => s.id === currentSubcategory);
            setCurrentFiles(subcategory ? subcategory.files : []);
        } else {
            const allFiles = category.subcategories.flatMap(sub => sub.files);
            setCurrentFiles(allFiles);
        }
    }, [currentCategory, currentSubcategory]);

    // Обработчики авторизации
    const handleLogin = () => {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);

        if (categories.length > 0) {
            setCurrentCategory(categories[0].id);
        }
    };

    const handleLogout = () => {
        localStorage.setItem('isLoggedIn', 'false');
        setIsLoggedIn(false);
        setCurrentCategory(null);
        setCurrentSubcategory(null);
        setCurrentFiles([]);
        setSelectedFile(null);
        setIsModalOpen(false);
        setIsSidebarOpen(false);
    };

    // Переключение мобильного меню
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Закрытие меню при выборе элемента (на мобильных)
    const handleSelectCategory = (categoryId) => {
        setCurrentCategory(categoryId);
        setCurrentSubcategory(null);
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const handleSelectSubcategory = (categoryId, subcategoryId) => {
        setCurrentCategory(categoryId);
        setCurrentSubcategory(subcategoryId);
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const handleSelectHome = () => {
        setCurrentCategory(null);
        setCurrentSubcategory(null);
        setCurrentFiles([]);
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    // Обработчики файлов
    const handleViewFile = (file) => {

        // Для PDF на мобильных можно показать подтверждение
        if (file.type === 'document' && window.innerWidth <= 768) {
            const confirmView = window.confirm(
                'Открыть PDF для просмотра? (Нажмите ОК для просмотра или Отмена для скачивания)'
            );

            if (confirmView) {
                setSelectedFile(file);
                setIsModalOpen(true);
            } else {
                // Если пользователь хочет скачать
                handleDownloadFile(file);
            }
        } else {
            setSelectedFile(file);
            setIsModalOpen(true);
        }
    };

    const handleDownloadFile = (file) => {
        console.log('Downloading file:', file);

        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.name + (file.type === 'document' ? '.pdf' : '.jpg');
        a.style.display = 'none';
        document.body.appendChild(a);

        try {
            a.click();
        } catch (error) {
            console.error('Download error:', error);
            alert(`Ошибка при скачивании файла: ${file.name}`);
        } finally {
            document.body.removeChild(a);
        }
    };

    // Закрытие модального окна
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
    };

    return (
        <div className="App">
            <div className="container">
                {!isLoggedIn ? (
                    <Login onLogin={handleLogin}/>
                ) : (
                    <div className="content-container">
                        <Header
                            onLogout={handleLogout}
                            onToggleSidebar={toggleSidebar}
                            isSidebarOpen={isSidebarOpen}
                        />

                        <Breadcrumb
                            categories={categories}
                            currentCategory={currentCategory}
                            currentSubcategory={currentSubcategory}
                            onSelectHome={handleSelectHome}
                            onSelectCategory={handleSelectCategory}
                        />

                        <div className="main-content">
                            <div className={`categories-sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
                                <Sidebar
                                    categories={categories}
                                    currentCategory={currentCategory}
                                    currentSubcategory={currentSubcategory}
                                    onSelectCategory={handleSelectCategory}
                                    onSelectSubcategory={handleSelectSubcategory}
                                />
                            </div>

                            <FileGrid
                                files={currentFiles}
                                onViewFile={handleViewFile}
                                onDownloadFile={handleDownloadFile}
                            />
                        </div>
                    </div>
                )}

                <FileModal
                    file={selectedFile}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />
            </div>
        </div>
    );
}

export default App;