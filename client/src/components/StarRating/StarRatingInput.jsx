import { useId } from "react";
import "./StarRating.css";

export default function StarRatingInput({ value = 0, onChange, name }) {
  const generatedName = useId();

  return (
    <fieldset className="star-input">
      <legend className="star-input__legend">Điểm của bạn</legend>
      <div className="star-input__options">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label className="star-input__option" key={rating}>
            <input
              className="star-input__radio"
              type="radio"
              name={name || generatedName}
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
              aria-label={`${rating} sao`}
            />
            <svg
              className="star-input__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55-4.76-4.64 6.58-.96L12 2.5z" />
            </svg>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
