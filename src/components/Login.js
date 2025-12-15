import React, { useState } from 'react';
import { CORRECT_PASSWORD } from '../data/categories';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!password.trim()) {
            setError(true);
            return;
        }

        setIsLoading(true);

        // Имитируем задержку проверки
        setTimeout(() => {
            if (password === CORRECT_PASSWORD) {
                localStorage.setItem('isLoggedIn', 'true');
                setError(false);
                onLogin();
            } else {
                setError(true);
                setPassword('');
            }
            setIsLoading(false);
        }, 500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="login-container">
            <h1>Защищенный архив РКМЦ</h1>
            <p>Введите пароль для доступа к учебным материалам</p>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="password">
                        <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                        Пароль
                    </label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Введите пароль для входа"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                        }}
                        onKeyPress={handleKeyPress}
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                </div>

                <button
                    type="submit"
                    className="login-btn"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                            Проверка...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
                            Войти в архив
                        </>
                    )}
                </button>

                {error && (
                    <div className="error-message show">
                        <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                        Неверный пароль. Попробуйте снова.
                    </div>
                )}

                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
                    <p>
                        <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
                        Для доступа обратитесь к администратору
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;