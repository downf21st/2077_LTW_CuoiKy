import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import emptyBreadIcon from './add.svg';
import { getRecipes } from '../../api';
import useAuth from '../../hooks/useAuth';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import './Favorites.css';

const SKELETON_COUNT = 6;
const INITIAL_DEMO_COUNT = 6;
const TOAST_DURATION_MS = 4500;

function getRecipeId(recipe) {
  return String(recipe?._id || recipe?.id || '');
}

function getStorageKey(userId) {
  return `cooked_favorites_${userId || 'guest'}`;
}

function readFavoriteIds(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeFavoriteIds(storageKey, ids) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
  }
}

function HeartIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function Favorites() {
  const { user } = useAuth();
  const storageKey = useMemo(
    () => getStorageKey(user?.id || user?.email),
    [user?.id, user?.email]
  );

  const [allRecipes, setAllRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [undoToast, setUndoToast] = useState(null);

  const requestIdRef = useRef(0);
  const toastTimerRef = useRef(null);

  const clearToastTimer = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearToastTimer();
  }, []);

  const loadFavorites = useCallback(async () => {
    const currentId = ++requestIdRef.current;
    setStatus('loading');
    setErrorMessage('');

    try {
      const list = await getRecipes({ page: 1, limit: 100 });
      if (currentId !== requestIdRef.current) return;

      const recipes = Array.isArray(list) ? list : [];
      setAllRecipes(recipes);

      const stored = readFavoriteIds(storageKey);
      if (stored === null) {
        const initialIds = recipes
          .slice(0, INITIAL_DEMO_COUNT)
          .map(getRecipeId)
          .filter(Boolean);
        writeFavoriteIds(storageKey, initialIds);
        setFavoriteIds(initialIds);
      } else {
        setFavoriteIds(stored);
      }

      setStatus('done');
    } catch (err) {
      if (currentId !== requestIdRef.current) return;
      setErrorMessage(
        err?.message || 'Không thể tải danh sách món yêu thích. Vui lòng thử lại.'
      );
      setStatus('error');
    }
  }, [storageKey]);

  useEffect(() => {
    loadFavorites();
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadFavorites]);

  const favoriteRecipes = useMemo(() => {
    const recipeMap = new Map(
      allRecipes.map((recipe) => [getRecipeId(recipe), recipe])
    );
    return favoriteIds
      .map((id) => recipeMap.get(id))
      .filter(Boolean);
  }, [allRecipes, favoriteIds]);

  const handleRemoveFavorite = (recipeId) => {
    const targetId = String(recipeId);
    const removedIndex = favoriteIds.indexOf(targetId);
    if (removedIndex === -1) return;

    const nextIds = favoriteIds.filter((id) => id !== targetId);
    writeFavoriteIds(storageKey, nextIds);
    setFavoriteIds(nextIds);

    clearToastTimer();
    setUndoToast({ id: targetId, index: removedIndex });
    toastTimerRef.current = setTimeout(() => {
      setUndoToast(null);
      toastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  };

  const handleUndoRemove = () => {
    if (!undoToast) return;
    clearToastTimer();

    const { id, index } = undoToast;
    setFavoriteIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev];
      const insertAt = Math.min(Math.max(index, 0), next.length);
      next.splice(insertAt, 0, id);
      writeFavoriteIds(storageKey, next);
      return next;
    });

    setUndoToast(null);
  };

  return (
    <div className="favorites-page">
      <nav className="favorites-page__breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="favorites-page__breadcrumb-link">
          Trang chủ
        </Link>
        <span className="favorites-page__breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span aria-current="page">Món yêu thích</span>
      </nav>

      <header className="favorites-page__header">
        <h1 className="favorites-page__title">Món yêu thích</h1>
        <p className="favorites-page__subtitle">Những công thức bạn đã lưu.</p>
        {status === 'done' && favoriteRecipes.length > 0 && (
          <p className="favorites-page__count">
            {favoriteRecipes.length} món đã lưu
          </p>
        )}
      </header>

      {status === 'loading' && (
        <div role="status" aria-live="polite">
          <ul className="favorites-page__grid" aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <li
                key={`fav-skeleton-${index}`}
                className="favorites-page__skeleton"
              >
                <div className="favorites-page__skeleton-thumb" />
                <div className="favorites-page__skeleton-body">
                  <div className="favorites-page__skeleton-line favorites-page__skeleton-line--badge" />
                  <div className="favorites-page__skeleton-line favorites-page__skeleton-line--title" />
                  <div className="favorites-page__skeleton-line favorites-page__skeleton-line--meta" />
                </div>
              </li>
            ))}
          </ul>
          <p className="favorites-page__loading-text">
            Đang tải danh sách món yêu thích...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div
          className="favorites-page__empty-card favorites-page__empty-card--error"
          role="alert"
        >
          <p className="favorites-page__empty-text favorites-page__empty-text--error">
            Không thể tải danh sách món yêu thích.
          </p>
          <p className="favorites-page__error-desc">{errorMessage}</p>
          <button
            type="button"
            className="favorites-page__cta-btn"
            onClick={loadFavorites}
          >
            Thử lại
          </button>
        </div>
      )}

      {status === 'done' && favoriteRecipes.length === 0 && (
        <div className="favorites-page__empty-card" role="status">
          <div className="favorites-page__empty-icon">
            <img
              src={emptyBreadIcon}
              alt=""
              className="favorites-page__empty-icon-img"
              aria-hidden="true"
            />
          </div>
          <p className="favorites-page__empty-text">Bạn chưa lưu món nào.</p>
          <Link to="/" className="favorites-page__cta-btn">
            Khám phá món ăn
          </Link>
        </div>
      )}

      {status === 'done' && favoriteRecipes.length > 0 && (
        <ul className="favorites-page__grid">
          {favoriteRecipes.map((recipe, index) => {
            const recipeId = getRecipeId(recipe) || `fav-${index}`;
            const recipeTitle = recipe?.title || recipe?.name || 'món ăn';

            return (
              <li key={recipeId} className="favorites-page__item">
                <RecipeCard
                  recipe={recipe}
                  showAuthor
                  overlayAction={
                    <button
                      type="button"
                      className="favorites-page__heart-btn"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleRemoveFavorite(recipeId);
                      }}
                      aria-label={`Bỏ yêu thích món ${recipeTitle}`}
                      title="Bỏ khỏi yêu thích"
                    >
                      <HeartIcon />
                    </button>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}

      {undoToast && (
        <div
          className="favorites-page__toast"
          role="status"
          aria-live="polite"
        >
          <span className="favorites-page__toast-text">
            Đã bỏ khỏi yêu thích
          </span>
          <button
            type="button"
            className="favorites-page__toast-undo"
            onClick={handleUndoRemove}
          >
            Hoàn tác
          </button>
        </div>
      )}
    </div>
  );
}