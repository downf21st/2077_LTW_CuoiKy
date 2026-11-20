import { useState, useMemo, useEffect } from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import './RecipeList.css';

const PAGE_SIZE = 9;
const SKELETON_COUNT = 6;

export default function RecipeList({
  recipes = [],
  status = 'done',
  errorMessage = '',
  onRetry,
  isFiltering = false,
  onResetFilters,
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [recipes]);

  const visibleRecipes = useMemo(
    () => recipes.slice(0, visibleCount),
    [recipes, visibleCount]
  );

  const hasMore = visibleCount < recipes.length;

  return (
    <section
      className="recipe-list"
      aria-labelledby="daily-recipes-heading"
      aria-busy={status === 'loading'}
    >
      <div className="recipe-list__header">
        <h2 id="daily-recipes-heading" className="recipe-list__title">
          Món ăn trong ngày
        </h2>
        {status === 'done' && recipes.length > 0 && (
          <p className="recipe-list__count">
            Đang hiển thị {visibleRecipes.length} / {recipes.length} món
          </p>
        )}
      </div>

      {status === 'loading' && (
        <div role="status" aria-live="polite">
          <ul className="recipe-list__grid" aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <li key={`skeleton-${index}`} className="recipe-list__skeleton-card">
                <div className="recipe-list__skeleton-thumb" />
                <div className="recipe-list__skeleton-line recipe-list__skeleton-line--title" />
                <div className="recipe-list__skeleton-line recipe-list__skeleton-line--meta" />
              </li>
            ))}
          </ul>
          <p className="recipe-list__loading-text">Đang tải danh sách món ăn...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="recipe-list__state recipe-list__state--error" role="alert">
          <p className="recipe-list__state-title">Không thể tải danh sách món ăn</p>
          <p className="recipe-list__state-desc">
            {errorMessage || 'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại.'}
          </p>
          {typeof onRetry === 'function' && (
            <button
              type="button"
              className="recipe-list__action-btn"
              onClick={onRetry}
            >
              Thử lại
            </button>
          )}
        </div>
      )}

      {status === 'done' && visibleRecipes.length === 0 && (
        <div className="recipe-list__state recipe-list__state--empty" role="status">
          <p className="recipe-list__state-title">Không tìm thấy món ăn nào</p>
          <p className="recipe-list__state-desc">
            {isFiltering
              ? 'Không có công thức nào khớp với từ khóa hoặc bộ lọc hiện tại.'
              : 'Chưa có công thức nào trong hệ thống.'}
          </p>
          {isFiltering && typeof onResetFilters === 'function' && (
            <button
              type="button"
              className="recipe-list__action-btn recipe-list__action-btn--secondary"
              onClick={onResetFilters}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {status === 'done' && visibleRecipes.length > 0 && (
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
      )}
    </section>
  );
}