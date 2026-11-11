import { Link } from 'react-router-dom';
import './RecipeCard.css';

const DIFFICULTY_MAP = {
  easy: { label: 'Dễ', className: 'recipe-card__tag--easy' },
  medium: { label: 'Trung Bình', className: 'recipe-card__tag--medium' },
  hard: { label: 'Khó', className: 'recipe-card__tag--hard' },
};

export default function RecipeCard({
  id = 1,
  title,
  description,
  image,
  duration = '45 phút',
  difficulty = 'medium',
}) {
  const diffConfig = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.medium;

  return (
    <article className="recipe-card">
      <div className="recipe-card__image-wrapper">
        {image && (
          <img
            src={image}
            alt=""
            className="recipe-card__image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      <div className="recipe-card__content">
        <div className="recipe-card__meta">
          <span className="recipe-card__duration">
            <svg
              className="recipe-card__clock-icon"
              viewBox="0 0 24 24"
              width="7"
              height="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            <span>{duration}</span>
          </span>

          <span className={`recipe-card__tag ${diffConfig.className}`}>
            {diffConfig.label}
          </span>
        </div>

        <h3 className="recipe-card__title" title={title}>
          <Link to={`/recipe/${id}`} className="recipe-card__link">
            {title}
          </Link>
        </h3>

        <p className="recipe-card__description" title={description}>
          {description}
        </p>
      </div>
    </article>
  );
}