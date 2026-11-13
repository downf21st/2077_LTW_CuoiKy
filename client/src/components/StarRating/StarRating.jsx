import "./StarRating.css";

function StarIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55-4.76-4.64 6.58-.96L12 2.5z" />
    </svg>
  );
}

export default function StarRating({ value = 0, max = 5, size = "md" }) {
  const count = Math.max(0, Math.floor(max));
  const rating = Number.isFinite(value) ? Math.min(count, Math.max(0, value)) : 0;
  const starSize = size === "sm" ? "sm" : "md";

  return (
    <span className={`star-rating star-rating--${starSize}`} role="img" aria-label={`${String(rating).replace(".", ",")} trên ${count} sao`}>
      {Array.from({ length: count }, (_, index) => {
        const fill = Math.min(1, Math.max(0, rating - index)) * 100;
        return (
          <span className="star-rating__star" key={index}>
            <StarIcon className="star-rating__empty" />
            <span className="star-rating__fill" style={{ "--star-fill": `${fill}%` }}>
              <StarIcon className="star-rating__filled" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function StarInput({ name = "rating" }) {
  return (
    <fieldset className="star-input">
      <legend className="star-input__legend">Điểm của bạn</legend>
      <div className="star-input__options">
        {[1, 2, 3, 4, 5].map((value) => (
          <label className="star-input__option" key={value}>
            <input className="star-input__radio" type="radio" name={name} value={value} aria-label={`${value} sao`} />
            <StarIcon className="star-input__icon" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
