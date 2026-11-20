import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({
  tags = [],
  onTagsChange,
  inputValue: externalInputValue,
  onInputChange,
  mode: externalMode,
  onModeChange,
}) {
  const [internalInput, setInternalInput] = useState('');
  const [internalMode, setInternalMode] = useState('name');

  const inputValue = externalInputValue !== undefined ? externalInputValue : internalInput;
  const currentMode = externalMode !== undefined ? externalMode : internalMode;

  const updateInput = (val) => {
    setInternalInput(val);
    if (onInputChange) onInputChange(val);
  };

  const updateMode = (nextMode) => {
    setInternalMode(nextMode);
    if (onModeChange) onModeChange(nextMode);
  };

  const addTagsFromText = (rawText) => {
    const parts = rawText
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const nextTags = [...tags];
    parts.forEach((part) => {
      const isDuplicate = nextTags.some(
        (t) => t.type === currentMode && t.value.toLowerCase() === part.toLowerCase()
      );
      if (!isDuplicate) {
        nextTags.push({ type: currentMode, value: part });
      }
    });

    if (onTagsChange) onTagsChange(nextTags);
    updateInput('');
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.includes(',')) {
      addTagsFromText(val);
    } else {
      updateInput(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      if (inputValue.trim()) {
        e.preventDefault();
        addTagsFromText(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      if (onTagsChange) {
        onTagsChange(tags.slice(0, -1));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addTagsFromText(inputValue);
  };

  const removeTag = (indexToRemove) => {
    if (onTagsChange) {
      onTagsChange(tags.filter((_, idx) => idx !== indexToRemove));
    }
  };

  return (
    <div className="search-container">
      <form className="search-bar" role="search" onSubmit={handleSubmit}>
        <div className="search-bar__input-wrap">
          <svg
            className="search-bar__icon"
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
            type="search"
            className="search-bar__input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              currentMode === 'ingredient'
                ? 'Nhập nguyên liệu (nhấn Enter hoặc dấu phẩy để thêm thẻ)...'
                : 'Nhập tên món ăn rồi nhấn Tìm...'
            }
            aria-label="Tìm món ăn hoặc nguyên liệu"
          />
        </div>

        <div className="search-bar__actions">
          <div className="search-bar__modes" role="group" aria-label="Chế độ tìm kiếm">
            <button
              type="button"
              className={`search-bar__mode-btn ${
                currentMode === 'name' ? 'search-bar__mode-btn--active' : ''
              }`}
              aria-pressed={currentMode === 'name'}
              onClick={() => updateMode('name')}
            >
              Tên món
            </button>
            <button
              type="button"
              className={`search-bar__mode-btn ${
                currentMode === 'ingredient' ? 'search-bar__mode-btn--active' : ''
              }`}
              aria-pressed={currentMode === 'ingredient'}
              onClick={() => updateMode('ingredient')}
            >
              Nguyên liệu
            </button>
          </div>

          <button type="submit" className="search-bar__submit">
            Tìm
          </button>
        </div>
      </form>

      {tags.length > 0 && (
        <div className="search-tags" aria-label="Các từ khóa đang lọc">
          {tags.map((tag, index) => (
            <span key={`${tag.type}-${tag.value}-${index}`} className="search-tag">
              <span className="search-tag__label">
                {tag.type === 'name' ? 'Món: ' : 'Ng.liệu: '}
                <strong>{tag.value}</strong>
              </span>
              <button
                type="button"
                className="search-tag__remove"
                onClick={() => removeTag(index)}
                aria-label={`Xóa từ khóa ${tag.value}`}
              >
                ×
              </button>
            </span>
          ))}
          {tags.length > 1 && (
            <button
              type="button"
              className="search-tags__clear"
              onClick={() => onTagsChange && onTagsChange([])}
            >
              Xóa tất cả
            </button>
          )}
        </div>
      )}
    </div>
  );
}