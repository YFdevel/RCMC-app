import React, { useState } from 'react';
import { CORRECT_PASSWORD } from '../../data/categories';
import styles from './Login.module.css';

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

  return (
    <div className={styles.loginContainer}>
      <h1>Защищенный архив РКМЦ</h1>
      <p>Введите пароль для доступа к учебным материалам</p>

      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
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
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className={styles.loginBtn}
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
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            Неверный пароль. Попробуйте снова.
          </div>
        )}

        <div className={styles.infoText}>
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