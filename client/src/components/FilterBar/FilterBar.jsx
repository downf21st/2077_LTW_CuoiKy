import { useState } from "react";
import "./FilterBar.css";

const CATEGORY_OPTIONS = [
  { value: "Món chính", label: "Món chính" },
  { value: "Món nước", label: "Món nước" },
];

const TIME_OPTIONS = [
  { value: "15", label: "Dưới 15 phút" },
  { value: "30", label: "Dưới 30 phút" },
  { value: "60", label: "Dưới 1 giờ" },
  { value: "120", label: "Dưới 2 giờ" },
];

const DIFFICULTY_OPTIONS = [
  { value: "Dễ", label: "Dễ" },
  { value: "Trung bình", label: "Trung bình" },
  { value: "Khó", label: "Khó" },
];

export default function FilterBar({
  searchTags = [],
  onRemoveSearchTag,
  resultCount = 0,
  onChange
}) {
  const [filters, setFilters] = useState({
    category: "",
    cookingTime: "",
    difficulty: "",
  });

  const hasActiveFilters = filters.category || filters.cookingTime || filters.difficulty;
  const showChipsRow = hasActiveFilters || searchTags.length > 0;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const finalValue = value === "all" ? "" : value;
    const nextFilters = { ...filters, [name]: finalValue };
    setFilters(nextFilters);
    if (onChange) onChange(nextFilters);
  };

  const handleClearAll = () => {
    const resetFilters = { category: "", cookingTime: "", difficulty: "" };
    setFilters(resetFilters);
    if (onChange) onChange(resetFilters);
  };

  const removeDropdownFilter = (name) => {
    const nextFilters = { ...filters, [name]: "" };
    setFilters(nextFilters);
    if (onChange) onChange(nextFilters);
  };

  return (
    <div className="home-filter-section">
      <div className="home-filter-bar-container">
        <div className="home-filter-bar" role="region" aria-label="Bộ lọc món ăn">
          <div className="home-filter-bar__item">
            <select name="category" value={filters.category || "all"} onChange={handleFilterChange} className="home-filter-bar__select">
              <option value="all">Loại món</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {filters.category === opt.value ? `Loại món: ${opt.label}` : opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="home-filter-bar__item">
            <select name="cookingTime" value={filters.cookingTime || "all"} onChange={handleFilterChange} className="home-filter-bar__select">
              <option value="all">Thời gian</option>
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {filters.cookingTime === opt.value ? `Thời gian: ${opt.label}` : opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="home-filter-bar__item">
            <select name="difficulty" value={filters.difficulty || "all"} onChange={handleFilterChange} className="home-filter-bar__select">
              <option value="all">Độ khó</option>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {filters.difficulty === opt.value ? `Độ khó: ${opt.label}` : opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button type="button" className="home-filter-bar__clear" onClick={handleClearAll}>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {showChipsRow && (
        <div className="home-filter-chips">
          <div className="home-filter-chips__list">
            {searchTags.map((tag, index) => (
              <button key={`tag-${index}`} className="home-filter-chip" onClick={() => onRemoveSearchTag && onRemoveSearchTag(tag)}>
                {tag.value} <span aria-hidden="true">×</span>
              </button>
            ))}
            {filters.category && (
              <button className="home-filter-chip" onClick={() => removeDropdownFilter('category')}>
                {filters.category} <span aria-hidden="true">×</span>
              </button>
            )}
            {filters.cookingTime && (
              <button className="home-filter-chip" onClick={() => removeDropdownFilter('cookingTime')}>
                {TIME_OPTIONS.find(o => o.value === filters.cookingTime)?.label} <span aria-hidden="true">×</span>
              </button>
            )}
            {filters.difficulty && (
              <button className="home-filter-chip" onClick={() => removeDropdownFilter('difficulty')}>
                {filters.difficulty} <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
          <span className="home-filter-chips__count">
            Tìm thấy {resultCount} món
          </span>
        </div>
      )}
    </div>
  );
}