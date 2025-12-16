import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import { categories } from './data/categories';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Breadcrumb from './components/Breadcrumb/Breadcrumb';
import FileGrid from './components/FileGrid/FileGrid';
import FileModal from './components/FileModal/FileModal';

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
// В функцию handleViewFile добавим проверку изображений
const handleViewFile = async (file) => {
  console.log('Opening file:', file);

  // Для изображений проверяем доступность
  if (file.type === 'image') {
    try {
      const img = new Image();
      img.src = file.url;

      img.onload = () => {
        setSelectedFile(file);
        setIsModalOpen(true);
      };

      img.onerror = () => {
        alert(`Не удалось загрузить изображение: ${file.name}`);
      };
    } catch (error) {
      console.error('Image loading error:', error);
      alert(`Ошибка при загрузке изображения: ${file.name}`);
    }
    return;
  }

  // Для PDF на мобильных устройствах
  if (file.type === 'document' && window.innerWidth <= 768) {
    const userChoice = window.confirm(
      'PDF файлы на мобильных устройствах лучше открывать в новой вкладке.\n\n' +
      'Нажмите "OK" чтобы открыть в новой вкладке\n' +
      'Нажмите "Отмена" чтобы попробовать встроенный просмотр'
    );

    if (userChoice) {
      window.open(file.url, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  setSelectedFile(file);
  setIsModalOpen(true);
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
    <div className={styles.app}>
      <div className={styles.container}>
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <div className={styles.contentContainer}>
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

            <div className={styles.mainContent}>
              <div className={`${styles.categoriesSidebar} ${isSidebarOpen ? styles.mobileOpen : ''}`}>
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