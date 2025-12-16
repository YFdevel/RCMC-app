// Вспомогательные функции

/**
 * Проверка поддержки формата изображения
 */
export const isImageSupported = (filename) => {
  const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = filename.split('.').pop().toLowerCase();
  return supportedFormats.includes(extension);
};

/**
 * Получение иконки по типу файла
 */
export const getFileIcon = (type) => {
  switch (type) {
    case 'image':
      return 'fa-file-image';
    case 'document':
      return 'fa-file-pdf';
    default:
      return 'fa-file';
  }
};

/**
 * Форматирование размера файла
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Проверка мобильного устройства
 */
export const isMobileDevice = () => {
  return window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Безопасное открытие файла
 */
export const openFileSafely = (url, target = '_blank') => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = target;
    link.rel = 'noopener noreferrer';
    link.click();
  } catch (error) {
    console.error('Error opening file:', error);
    // Fallback: пробуем открыть через window.open
    window.open(url, target, 'noopener,noreferrer');
  }
};

/**
 * Проверка доступности файла
 */
export const checkFileAvailability = async (url) => {
  try {
    // Для локальных файлов всегда возвращаем true
    if (url.startsWith('./') || url.startsWith('/')) {
      return true;
    }

    // Для внешних файлов проверяем доступность
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return response.ok || response.type === 'opaque';
  } catch (error) {
    console.warn('File availability check failed for:', url, error);
    // В случае ошибки проверки, считаем файл доступным
    return true;
  }
};

/**
 * Дебаунс функции
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Троттлинг функции
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};


/**
 * Проверка доступности изображения
 */
export const checkImageAvailability = async (imagePath) => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve(true);
    };

    img.onerror = () => {
      resolve(false);
    };

    // Добавляем timestamp чтобы избежать кеширования
    img.src = imagePath + '?t=' + Date.now();
  });
};

/**
 * Получение пути к изображению с проверкой
 */
export const getImagePathWithFallback = async (imageName, fallbackIcon = 'fa-file-image') => {
  const possiblePaths = [
    `/assets/images/${imageName}`,
    `/assets/images/icons/${imageName}`,
    `${process.env.PUBLIC_URL}/assets/images/${imageName}`,
    `${process.env.PUBLIC_URL}/assets/images/icons/${imageName}`
  ];

  for (const path of possiblePaths) {
    const isAvailable = await checkImageAvailability(path);
    if (isAvailable) {
      return path;
    }
  }

  return null; // Возвращаем null, если ни одно изображение не найдено
};