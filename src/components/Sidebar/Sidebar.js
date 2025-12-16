import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({
  categories,
  currentCategory,
  currentSubcategory,
  onSelectCategory,
  onSelectSubcategory
}) => {
  return (
    <div className={styles.sidebarContent}>
      {categories.map(category => {
        const isActive = currentCategory === category.id;

        return (
          <div key={category.id} className={styles.categoryWrapper}>
            <div
              className={`${styles.categoryItem} ${isActive ? styles.active : ''}`}
              onClick={() => onSelectCategory(category.id)}
            >
              <i className={`fas ${category.icon} ${styles.categoryIcon}`}></i>
              <span>{category.name}</span>
            </div>

            {isActive && (
              <div className={styles.subcategories}>
                {category.subcategories.map(subcategory => (
                  <div
                    key={subcategory.id}
                    className={`${styles.subcategoryItem} ${currentSubcategory === subcategory.id ? styles.active : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSubcategory(category.id, subcategory.id);
                    }}
                  >
                    {subcategory.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;