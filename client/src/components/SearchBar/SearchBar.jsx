import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ tags = [], onTagsChange }) {
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState('name'); 

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    
    const isDuplicate = tags.some(
      (t) => t.type === currentMode && t.value.toLowerCase() === trimmed.toLowerCase()
    );

    if (!isDuplicate) {
      onTagsChange([...tags, { type: currentMode, value: trimmed }]);
    }
    
    
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    onTagsChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="search-container">
      <form className="search-bar" role="search" onSubmit={handleSubmit}>
        <div className="search-bar__input-wrap">
          <svg className="search-bar__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="search"
            className="search-bar__input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              currentMode === 'ingredient'
                ? 'Nhập nguyên liệu rồi nhấn Tìm...'
                : 'Nhập tên món ăn rồi nhấn Tìm...'
            }
            aria-label="Tìm món ăn hoặc nguyên liệu"
          />
        </div>

        <div className="search-bar__actions">
          <div className="search-bar__modes" role="group" aria-label="Chế độ tìm kiếm">
            <button
              type="button"
              className={`search-bar__mode-btn ${currentMode === 'name' ? 'search-bar__mode-btn--active' : ''}`}
              aria-pressed={currentMode === 'name'}
              onClick={() => setCurrentMode('name')}
            >
              Tên món
            </button>
            <button
              type="button"
              className={`search-bar__mode-btn ${currentMode === 'ingredient' ? 'search-bar__mode-btn--active' : ''}`}
              aria-pressed={currentMode === 'ingredient'}
              onClick={() => setCurrentMode('ingredient')}
            >
              Nguyên liệu
            </button>
          </div>

          <button type="submit" className="search-bar__submit">Tìm</button>
        </div>
      </form>

      
      {tags.length > 0 && (
        <div className="search-tags" aria-label="Các từ khóa đang lọc">
          {tags.map((tag, index) => (
            <span key={index} className="search-tag">
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
            <button type="button" className="search-tags__clear" onClick={() => onTagsChange([])}>
              Xóa tất cả
            </button>
          )}
        </div>
      )}
    </div>
  );
}