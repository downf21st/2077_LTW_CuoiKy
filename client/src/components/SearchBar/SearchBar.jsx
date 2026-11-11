import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({
  initialMode = 'name',
  initialValue = '',
  initialIngredients = ['Gà', 'Tỏi', 'Kem tươi'],
}) {
  const [mode, setMode] = useState(initialMode);
  const [value, setValue] = useState(initialValue);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [isFocused, setIsFocused] = useState(false);

  const isIngredientMode = mode === 'ingredient';
  const isFilled = value.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleKeyDown = (e) => {
    if (isIngredientMode && e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      setIngredients((prev) => [...prev, value.trim()]);
      setValue('');
    }
  };

  const handleRemoveIngredient = (target) => {
    setIngredients((prev) => prev.filter((item) => item !== target));
  };

  return (
    <form
      role="search"
      className={[
        'search-bar',
        isFocused ? 'search-bar--focused' : '',
        isFilled ? 'search-bar--filled' : '',
        isIngredientMode ? 'search-bar--ingredient' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onSubmit={handleSubmit}
    >
      <label htmlFor="recipe-search-input" className="search-bar__sr-only">
        Tìm kiếm món ăn hoặc nguyên liệu
      </label>

      <span className="search-bar__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.2" y2="16.2" />
        </svg>
      </span>

      <div className="search-bar__field">
        {isIngredientMode &&
          ingredients.map((item) => (
            <span key={item} className="search-bar__chip">
              <span>{item}</span>
              <button
                type="button"
                className="search-bar__chip-remove"
                aria-label={`Xóa ${item}`}
                onClick={() => handleRemoveIngredient(item)}
              >
                ×
              </button>
            </span>
          ))}

        <input
          id="recipe-search-input"
          type="text"
          className="search-bar__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={
            isIngredientMode
              ? 'Nhập nguyên liệu, nhấn Enter để thêm'
              : 'Tìm món ăn hoặc nguyên liệu...'
          }
        />

        {isFilled && !isIngredientMode && (
          <button
            type="button"
            className="search-bar__clear"
            aria-label="Xóa chữ đã gõ"
            onClick={() => setValue('')}
          >
            ×
          </button>
        )}
      </div>

      <div
        className="search-bar__mode-switch"
        role="radiogroup"
        aria-label="Chế độ tìm kiếm"
      >
        <label
          className={`search-bar__mode-option ${
            !isIngredientMode ? 'search-bar__mode-option--active' : ''
          }`}
        >
          <input
            type="radio"
            name="searchMode"
            value="name"
            checked={!isIngredientMode}
            onChange={() => setMode('name')}
          />
          <span>Tên món</span>
        </label>

        <label
          className={`search-bar__mode-option ${
            isIngredientMode ? 'search-bar__mode-option--active' : ''
          }`}
        >
          <input
            type="radio"
            name="searchMode"
            value="ingredient"
            checked={isIngredientMode}
            onChange={() => setMode('ingredient')}
          />
          <span>Nguyên liệu</span>
        </label>
      </div>

      <button type="submit" className="search-bar__submit">
        Tìm
      </button>
    </form>
  );
}