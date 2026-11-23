import { useEffect, useMemo, useRef, useState } from 'react';
import { getRecipes } from '../../api';
import useDebounce from '../../hooks/useDebounce';
import {
  formatCookingTime,
  normalizeText,
  resolveRecipeImage,
} from '../../utils/weeklyMenuHelper';

export default function RecipePicker({ dayLabel, mealLabel, onSelect, onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let isCurrent = true;

    getRecipes({ page: 1, limit: 100 })
      .then((list) => {
        if (!isCurrent) return;
        setRecipes(Array.isArray(list) ? list : []);
        setStatus('done');
      })
      .catch((err) => {
        if (!isCurrent) return;
        setErrorMessage(err?.message || 'Không thể tải danh sách món ăn.');
        setStatus('error');
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  const filteredRecipes = useMemo(() => {
    const keyword = normalizeText(debouncedQuery);
    if (!keyword) return recipes;
    return recipes.filter((recipe) =>
      normalizeText(recipe?.title || recipe?.name || '').includes(keyword)
    );
  }, [recipes, debouncedQuery]);

  const handleRetry = () => {
    setStatus('loading');
    setErrorMessage('');
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div
      className="weekly-menu__modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="weekly-menu__modal weekly-menu__picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="weekly-menu__picker-header">
          <h2 id="recipe-picker-title">
            Chọn món cho {dayLabel} · {mealLabel}
          </h2>
        </header>

        <div className="weekly-menu__picker-search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm món ăn..."
            aria-label="Tìm món ăn theo tên"
          />
        </div>

        <div className="weekly-menu__picker-body">
          {status === 'loading' && (
            <p className="weekly-menu__picker-state" role="status">
              Đang tải danh sách món ăn...
            </p>
          )}

          {status === 'error' && (
            <div className="weekly-menu__picker-state weekly-menu__picker-state--error" role="alert">
              <p>{errorMessage}</p>
              <button
                type="button"
                className="weekly-menu__btn weekly-menu__btn--outline"
                onClick={handleRetry}
              >
                Thử lại
              </button>
            </div>
          )}

          {status === 'done' && filteredRecipes.length === 0 && (
            <p className="weekly-menu__picker-state" role="status">
              Không tìm thấy món ăn phù hợp.
            </p>
          )}

          {status === 'done' && filteredRecipes.length > 0 && (
            <ul className="weekly-menu__picker-list">
              {filteredRecipes.map((recipe) => {
                const id = String(recipe?._id ?? recipe?.id ?? '');
                const title = recipe?.title || recipe?.name || 'Món ăn';
                const image = resolveRecipeImage(
                  recipe?.image || recipe?.imageUrl || recipe?.thumbnail
                );
                const timeText = formatCookingTime(
                  recipe?.cookingTime ?? recipe?.duration
                );
                const difficulty = recipe?.difficulty || '';

                return (
                  <li key={id || title} className="weekly-menu__picker-item">
                    <div className="weekly-menu__picker-thumb">
                      {image && <img src={image} alt={title} />}
                    </div>

                    <div className="weekly-menu__picker-info">
                      <span className="weekly-menu__picker-name">{title}</span>
                      <div className="weekly-menu__picker-meta">
                        {timeText && (
                          <span className="weekly-menu__time-pill">
                            <span className="weekly-menu__dot" aria-hidden="true" />
                            {timeText}
                          </span>
                        )}
                        {difficulty && (
                          <span className="weekly-menu__diff-pill">
                            {difficulty}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="weekly-menu__picker-choose"
                      onClick={() => onSelect(recipe)}
                    >
                      Chọn
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="weekly-menu__picker-footer">
          <button
            type="button"
            className="weekly-menu__btn weekly-menu__btn--outline"
            onClick={onClose}
          >
            Hủy
          </button>
        </footer>
      </div>
    </div>
  );
}