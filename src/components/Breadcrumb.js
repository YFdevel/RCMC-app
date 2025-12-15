import React from 'react';

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
        <div className="breadcrumb">
            <div className="breadcrumb-item" onClick={onSelectHome}>
                Главная
            </div>

            {category && (
                <>
                    <div className="breadcrumb-item" onClick={() => onSelectCategory(category.id)}>
                        {category.name}
                    </div>

                    {subcategory && (
                        <div className="breadcrumb-item">
                            {subcategory.name}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Breadcrumb;