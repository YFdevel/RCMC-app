import React from 'react';

const Sidebar = ({
    categories,
    currentCategory,
    currentSubcategory,
    onSelectCategory,
    onSelectSubcategory
}) => {
    return (
        <div className="categories-sidebar-content">
            {categories.map(category => {
                const isActive = currentCategory === category.id;

                return (
                    <div key={category.id}>
                        <div
                            className={`category-item ${isActive ? 'active' : ''}`}
                            onClick={() => onSelectCategory(category.id)}
                        >
                            <i className={`fas ${category.icon} category-icon`}></i>
                            <span>{category.name}</span>
                        </div>

                        {isActive && (
                            <div className="subcategories">
                                {category.subcategories.map(subcategory => (
                                    <div
                                        key={subcategory.id}
                                        className={`subcategory-item ${currentSubcategory === subcategory.id ? 'active' : ''}`}
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