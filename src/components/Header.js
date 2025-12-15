import React from 'react';

const Header = ({ onLogout, onToggleSidebar, isSidebarOpen }) => {
    return (
        <>
            <div className="header">
                <button
                    className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
                    onClick={onToggleSidebar}
                    aria-label={isSidebarOpen ? "Закрыть меню" : "Открыть меню"}
                    aria-expanded={isSidebarOpen}
                >
                    <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

                <h1>
                    <i className="fas fa-archive"></i>
                    Архив файлов
                </h1>

                <div className="header-controls">
                    <button className="logout-btn" onClick={onLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Выйти
                    </button>
                </div>
            </div>

            {/* Оверлей для закрытия меню по клику на фон */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={onToggleSidebar}
                aria-hidden="true"
            />
        </>
    );
};

export default Header;