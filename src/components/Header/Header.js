import React from 'react';
import styles from './Header.module.css';

const Header = ({ onLogout, onToggleSidebar, isSidebarOpen }) => {
  console.log('Header styles:', styles); // Для отладки

  return (
    <>
      <header className={styles.header}>
        <button
          className={`${styles.hamburgerBtn} ${isSidebarOpen ? styles.active : ''}`}
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isSidebarOpen}
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <h1 className={styles.title}>
          <i className="fas fa-archive"></i>
          Архив файлов
        </h1>

        <div className={styles.headerControls}>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Выйти
          </button>
        </div>
      </header>

      {/* Оверлей для закрытия меню по клику на фон */}
      <div
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.active : ''}`}
        onClick={onToggleSidebar}
        aria-hidden="true"
      />
    </>
  );
};

export default Header;