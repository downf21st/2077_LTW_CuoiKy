import { DIFFICULTY_OPTIONS } from "../../utils/recipeForm";
import "./DifficultyTags.css";

export default function DifficultyTags({ value, onChange, onBlur, error, id, inputRef }) {
  return (
    <div
      className="difficulty-tags"
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur(event);
      }}
    >
      {DIFFICULTY_OPTIONS.map((option, index) => (
        <label className={`difficulty-tags__option difficulty-tags__option--${index}`} key={option}>
          <input
            id={index === 0 ? id : `${id}-${index}`}
            className="difficulty-tags__input"
            type="radio"
            name={id}
            value={option}
            checked={value === option}
            onChange={onChange}
            ref={index === 0 ? inputRef : undefined}
            required
          />
          <span className="difficulty-tags__pill">{option}</span>
        </label>
      ))}
    </div>
  );
}
