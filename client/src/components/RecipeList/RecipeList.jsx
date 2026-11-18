import { useState, useMemo, useEffect } from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import './RecipeList.css';

const PAGE_SIZE = 9;

export default function RecipeList({ recipes = [] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Khi danh sách món thay đổi (do user search/filter ở ngoài), reset lại về 9 món đầu
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [recipes]);

  const visibleRecipes = useMemo(
    () => recipes.slice(0, visibleCount),
    [recipes, visibleCount]
  );

  const hasMore = visibleCount < recipes.length;

  return (
    <section className="recipe-list" aria-labelledby="daily-recipes-heading">
      <div className="recipe-list__header">
        <h2 id="daily-recipes-heading" className="recipe-list__title">
          Món ăn trong ngày
        </h2>
      </div>

      {visibleRecipes.length > 0 ? (
        <>
          <ul className="recipe-list__grid">
            {visibleRecipes.map((recipe, index) => {
              const itemKey = recipe?._id || recipe?.id || `recipe-${index}`;
              return (
                <li
                  key={itemKey}
                  className="recipe-list__item"
                  style={{ animationDelay: `${(index % PAGE_SIZE) * 60}ms` }}
                >
                  <RecipeCard recipe={recipe} />
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="recipe-list__more-wrap">
              <button
                type="button"
                className="recipe-list__more-btn"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                Hiển thị thêm món ăn
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="recipe-list__empty">
          Không tìm thấy món ăn nào phù hợp với bộ lọc hiện tại.
        </p>
      )}
    </section>
  );
}