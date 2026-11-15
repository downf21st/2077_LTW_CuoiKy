import { useState } from 'react';
import { Link } from 'react-router-dom';
import './RecipeCard.css';

const DIFFICULTY_MAP = {
  hard: { label: 'Khó', modifier: 'hard' },
  khó: { label: 'Khó', modifier: 'hard' },
  kho: { label: 'Khó', modifier: 'hard' },
  medium: { label: 'Trung Bình', modifier: 'medium' },
  'trung bình': { label: 'Trung Bình', modifier: 'medium' },
  'trung binh': { label: 'Trung Bình', modifier: 'medium' },
  easy: { label: 'Dễ', modifier: 'easy' },
  dễ: { label: 'Dễ', modifier: 'easy' },
  de: { label: 'Dễ', modifier: 'easy' },
};

export default function RecipeCard({ recipe }) {
  const [imgError, setImgError] = useState(false);

  const {
    _id,
    id,
    title,
    name,
    description,
    summary,
    image,
    imageUrl,
    thumbnail,
    duration,
    cookingTime,
    time,
    difficulty = 'easy',
  } = recipe || {};

  const recipeId = _id || id || 'recipe-001';
  const displayTitle = title || name || 'Món ăn';
  const displayDesc = description || summary || 'Mô tả món ăn';
  const displayImage = image || imageUrl || thumbnail || '';

  const normalizedDiffKey = String(difficulty).toLowerCase().trim();
  const diffConfig = DIFFICULTY_MAP[normalizedDiffKey] || DIFFICULTY_MAP.easy;

  const rawTime = duration ?? cookingTime ?? time;
  const displayDuration = rawTime
    ? String(rawTime).includes('phút')
      ? String(rawTime)
      : `${rawTime} phút`
    : '30 phút';

  return (
    <article className="recipe-card">
      <Link to={`/recipe/${recipeId}`} className="recipe-card__link">
        <div className="recipe-card__media">
          {displayImage && !imgError ? (
            <img
              src={displayImage}
              alt={displayTitle}
              className="recipe-card__image"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="recipe-card__placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="recipe-card__body">
          <div className="recipe-card__badges">
            <span className="recipe-card__badge recipe-card__badge--time">
              <svg
                className="recipe-card__clock-icon"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {displayDuration}
            </span>

            <span
              className={`recipe-card__badge recipe-card__badge--${diffConfig.modifier}`}
            >
              {diffConfig.label}
            </span>
          </div>

          <h3 className="recipe-card__title" title={displayTitle}>
            {displayTitle}
          </h3>
          <p className="recipe-card__description">{displayDesc}</p>
        </div>
      </Link>
    </article>
  );
}