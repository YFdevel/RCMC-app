import React from 'react';
import styles from './Breadcrumb.module.css';

const Breadcrumb = ({
  categories,
  currentCategory,
  currentSubcategory,
  onSelectHome,
  onSelectCategory
}) => {
  const category = categories.find(c => c.id === currentCategory);
  const subcategory = category?.subcategories.find(s => s.id === currentSubcategory);

  return (
    <nav className={styles.breadcrumb}>
      <button
        className={styles.breadcrumbItem}
        onClick={onSelectHome}
        aria-label="Главная"
      >
        Главная
      </button>

      {category && (
        <>
          <span className={styles.separator}>›</span>
          <button
            className={styles.breadcrumbItem}
            onClick={() => onSelectCategory(category.id)}
            aria-label={category.name}
          >
            {category.name}
          </button>

          {subcategory && (
            <>
              <span className={styles.separator}>›</span>
              <span className={`${styles.breadcrumbItem} ${styles.active}`}>
                {subcategory.name}
              </span>
            </>
          )}
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;