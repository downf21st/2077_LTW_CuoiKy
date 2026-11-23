import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import emptyBreadIcon from '../../assets/add.svg';
import { getFavorites, addFavorite, removeFavorite } from '../../api';
import useAuth from '../../hooks/useAuth';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import './Favorites.css';

const SKELETON_COUNT = 6;
const TOAST_DURATION_MS = 4500;

function getRecipeId(recipe) {
  return String(recipe?._id || recipe?.id || '');
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
  const userId = user?.id || user?._id || '';

  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingIds, setPendingIds] = useState([]);
  const [isUndoing, setIsUndoing] = useState(false);
  const [toast, setToast] = useState(null);

  const isMountedRef = useRef(true);
  const toastTimerRef = useRef(null);
  const busyIdsRef = useRef(new Set());
  const undoBusyRef = useRef(false);

  const clearToastTimer = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  const showToast = (nextToast) => {
    clearToastTimer();
    setToast(nextToast);
    toastTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setToast(null);
      }
      toastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearToastTimer();
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getFavorites(userId)
      .then((list) => {
        if (!isCurrent) return;
        if (!Array.isArray(list)) {
          throw new Error('Dữ liệu món yêu thích không hợp lệ.');
        }
        setFavoriteRecipes(list);
        setStatus('done');
      })
      .catch((err) => {
        if (!isCurrent) return;
        setErrorMessage(
          err?.message || 'Không thể tải danh sách món yêu thích. Vui lòng thử lại.'
        );
        setStatus('error');
      });

    return () => {
      isCurrent = false;
    };
  }, [userId, reloadKey]);

  const handleRetry = () => {
    setStatus('loading');
    setErrorMessage('');
    setReloadKey((prev) => prev + 1);
  };

  const handleRemoveFavorite = async (recipe, removedIndex) => {
    const targetId = getRecipeId(recipe);
    if (!userId || !targetId || busyIdsRef.current.has(targetId)) return;

    busyIdsRef.current.add(targetId);
    setPendingIds((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));

    try {
      await removeFavorite(userId, targetId);
      if (!isMountedRef.current) return;

      setFavoriteRecipes((prev) =>
        prev.filter((item) => getRecipeId(item) !== targetId)
      );
      showToast({ type: 'undo', recipe, index: removedIndex });
    } catch (err) {
      if (!isMountedRef.current) return;
      showToast({
        type: 'error',
        message: err?.message || 'Không thể bỏ yêu thích. Vui lòng thử lại.',
      });
    } finally {
      busyIdsRef.current.delete(targetId);
      if (isMountedRef.current) {
        setPendingIds((prev) => prev.filter((id) => id !== targetId));
      }
    }
  };

  const handleUndoRemove = async () => {
    if (!userId || toast?.type !== 'undo' || undoBusyRef.current) return;

    const { recipe, index } = toast;
    const targetId = getRecipeId(recipe);
    if (!targetId) return;

    clearToastTimer();
    undoBusyRef.current = true;
    setIsUndoing(true);

    try {
      await addFavorite(userId, targetId);
      if (!isMountedRef.current) return;

      setFavoriteRecipes((prev) => {
        if (prev.some((item) => getRecipeId(item) === targetId)) return prev;
        const next = [...prev];
        const insertAt = Math.min(Math.max(index, 0), next.length);
        next.splice(insertAt, 0, recipe);
        return next;
      });
      setToast(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      showToast({
        type: 'error',
        message: err?.message || 'Không thể hoàn tác. Vui lòng thử lại.',
      });
    } finally {
      undoBusyRef.current = false;
      if (isMountedRef.current) {
        setIsUndoing(false);
      }
    }
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
            onClick={handleRetry}
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
            const isRemoving = pendingIds.includes(recipeId);

            return (
              <li key={recipeId} className="favorites-page__item">
                <RecipeCard
                  recipe={recipe}
                  showAuthor
                  overlayAction={
                    <button
                      type="button"
                      className="favorites-page__heart-btn"
                      disabled={isRemoving}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleRemoveFavorite(recipe, index);
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

      {toast && (
        <div
          className="favorites-page__toast"
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <span className="favorites-page__toast-text">
            {toast.type === 'error' ? toast.message : 'Đã bỏ khỏi yêu thích'}
          </span>
          {toast.type === 'undo' && (
            <button
              type="button"
              className="favorites-page__toast-undo"
              disabled={isUndoing}
              onClick={handleUndoRemove}
            >
              {isUndoing ? 'Đang hoàn tác...' : 'Hoàn tác'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}