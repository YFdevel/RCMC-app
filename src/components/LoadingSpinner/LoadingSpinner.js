import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ text = 'Загрузка...', size = 'medium' }) => {
  const sizeClass = styles[size] || styles.medium;

  return (
    <div className={styles.loadingSpinner}>
      <div className={`${styles.spinner} ${sizeClass}`}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;