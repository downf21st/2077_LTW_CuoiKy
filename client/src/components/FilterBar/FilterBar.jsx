import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getCategories } from "../../api";
import "./FilterBar.css";

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

function normalizeCategoryOptions(raw) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.categories)
      ? raw.categories
      : [];
  const seen = new Set();
  const options = [];

  list.forEach((item) => {
    const name =
      typeof item === "string"
        ? item.trim()
        : String(item?.name || item?.label || "").trim();

    if (!name || seen.has(name)) return;
    seen.add(name);
    options.push({ value: name, label: name });
  });

  return options;
}

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g clipPath="url(#clip0_586_4428)">
      <path d="M5.83519 4.99992H14.1685L9.99352 10.2499L5.83519 4.99992ZM3.54352 4.67492C5.22686 6.83325 8.33519 10.8333 8.33519 10.8333V15.8333C8.33519 16.2916 8.71019 16.6666 9.16852 16.6666H10.8352C11.2935 16.6666 11.6685 16.2916 11.6685 15.8333V10.8333C11.6685 10.8333 14.7685 6.83325 16.4519 4.67492C16.8769 4.12492 16.4852 3.33325 15.7935 3.33325H4.20186C3.51019 3.33325 3.11852 4.12492 3.54352 4.67492Z" fill="currentColor"/>
      <path opacity="0.3" d="M5.83203 5H14.1654L9.99036 10.25L5.83203 5Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="clip0_586_4428"><rect width="20" height="20" fill="white"/></clipPath></defs>
  </svg>
);

const EmptyToastIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M19 11V16C19 18.2091 17.2091 20 15 20H9C6.79086 20 5 18.2091 5 16V11C5 8.23858 7.23858 6 10 6H14C16.7614 6 19 8.23858 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 11C5 9.89543 5.89543 9 7 9H17C18.1046 9 19 9.89543 19 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function FilterBar({
  value,
  searchTags = [],
  onRemoveSearchTag,
  resultCount = 0,
  onChange
}) {
  const [internalFilters, setInternalFilters] = useState({ category: "", cookingTime: "", difficulty: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState("loading");
  const [categoryError, setCategoryError] = useState("");
  const [categoryReloadKey, setCategoryReloadKey] = useState(0);

  const filters = value || internalFilters;

  useEffect(() => {
    let active = true;

    getCategories()
      .then((data) => {
        if (!active) return;
        setCategoryOptions(normalizeCategoryOptions(data));
        setCategoryStatus("done");
      })
      .catch((err) => {
        if (!active) return;
        setCategoryError(err?.message || "Không thể tải danh sách loại món.");
        setCategoryStatus("error");
      });

    return () => {
      active = false;
    };
  }, [categoryReloadKey]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleRetryCategories = () => {
    setCategoryStatus("loading");
    setCategoryError("");
    setCategoryReloadKey((prev) => prev + 1);
  };

  const hasActiveFilters = Boolean(filters.category || filters.cookingTime || filters.difficulty);
  const isActivelyFiltering = hasActiveFilters || searchTags.length > 0;

  const activeDropdownCount = (filters.category ? 1 : 0) + (filters.cookingTime ? 1 : 0) + (filters.difficulty ? 1 : 0);
  const totalSelectedTags = activeDropdownCount + searchTags.length;

  const updateFilter = (name, selectedVal) => {
    const finalValue = selectedVal === "all" ? "" : selectedVal;
    const nextFilters = { ...filters, [name]: finalValue };
    setInternalFilters(nextFilters);
    if (onChange) onChange(nextFilters);
  };

  const handleClearAll = () => {
    const resetFilters = { category: "", cookingTime: "", difficulty: "" };
    setInternalFilters(resetFilters);
    if (onChange) onChange(resetFilters);
  };

  return (
    <div className="home-filter-section">
      <div className="home-filter-bar-desktop">
        <div className="home-filter-bar" role="region" aria-label="Bộ lọc món ăn">
          <div className="home-filter-bar__item">
            <select
              name="category"
              aria-label="Lọc theo loại món"
              value={filters.category || ""}
              disabled={categoryStatus !== "done"}
              onChange={(e) => updateFilter(e.target.name, e.target.value)}
              className="home-filter-bar__select"
            >
              {categoryStatus === "loading" && (
                <option value="">Đang tải loại món...</option>
              )}
              {categoryStatus === "error" && (
                <option value="">Lỗi tải loại món</option>
              )}
              {categoryStatus === "done" && (
                <>
                  <option value="" hidden>Loại món</option>
                  <option value="all">Tất cả loại món</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="home-filter-bar__item">
            <select
              name="cookingTime"
              aria-label="Lọc theo thời gian nấu"
              value={filters.cookingTime || ""}
              onChange={(e) => updateFilter(e.target.name, e.target.value)}
              className="home-filter-bar__select"
            >
              <option value="" hidden>Thời gian</option>
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="home-filter-bar__item">
            <select
              name="difficulty"
              aria-label="Lọc theo độ khó"
              value={filters.difficulty || ""}
              onChange={(e) => updateFilter(e.target.name, e.target.value)}
              className="home-filter-bar__select"
            >
              <option value="" hidden>Độ khó</option>
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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

      {categoryStatus === "error" && (
        <div className="home-filter-bar__error" role="alert">
          <span>{categoryError}</span>
          <button
            type="button"
            className="home-filter-bar__retry"
            onClick={handleRetryCategories}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="home-filter-bar-mobile">
        <button type="button" className="home-filter-mobile-btn" onClick={() => setIsModalOpen(true)}>
          <FilterIcon />
          <span>Bộ lọc{totalSelectedTags > 0 ? ` (${totalSelectedTags})` : ""}</span>
        </button>
      </div>

      {isActivelyFiltering && (
        <div className={`home-filter-chips ${resultCount === 0 ? "hide-on-mobile" : ""}`}>
          <div className="home-filter-chips__list">
            {searchTags.map((tag, index) => (
              <button type="button" key={`tag-${index}`} className="home-filter-chip" onClick={() => onRemoveSearchTag && onRemoveSearchTag(tag)}>
                {tag.value} <span aria-hidden="true">×</span>
              </button>
            ))}
            {filters.category && <button type="button" className="home-filter-chip" onClick={() => updateFilter("category", "all")}>{filters.category} <span aria-hidden="true">×</span></button>}
            {filters.cookingTime && <button type="button" className="home-filter-chip" onClick={() => updateFilter("cookingTime", "all")}>{TIME_OPTIONS.find((o) => o.value === filters.cookingTime)?.label} <span aria-hidden="true">×</span></button>}
            {filters.difficulty && <button type="button" className="home-filter-chip" onClick={() => updateFilter("difficulty", "all")}>{filters.difficulty} <span aria-hidden="true">×</span></button>}
          </div>
          <span className="home-filter-chips__count">Tìm thấy {resultCount} món</span>
        </div>
      )}

      {isActivelyFiltering && resultCount === 0 && (
        <div className="home-filter-empty">
          <h2 className="home-filter-empty__title">Món ăn trong ngày</h2>
          <div className="home-filter-empty__box">
            <EmptyToastIcon />
            <p className="home-filter-empty__desc">Không tìm thấy món phù hợp</p>
            <p className="home-filter-empty__hint">Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm</p>
            <button type="button" className="home-filter-empty__clear-btn" onClick={handleClearAll}>Xóa bộ lọc</button>
          </div>
        </div>
      )}

      {isModalOpen && createPortal(
        <>
          <div className="filter-modal-backdrop" onClick={() => setIsModalOpen(false)} aria-hidden="true"/>
          <div className="filter-modal-sheet" role="dialog" aria-modal="true" aria-label="Bộ lọc món ăn">
            <div className="filter-modal-handle-area" onClick={() => setIsModalOpen(false)}><div className="filter-modal-handle" /></div>
            <div className="filter-modal-header"><h3>Bộ lọc</h3></div>
            <div className="filter-modal-body">
              <div className="filter-modal-group">
                <h4>Loại món</h4>
                {categoryStatus === "loading" && (
                  <p className="filter-modal-status" role="status">
                    Đang tải danh sách loại món...
                  </p>
                )}
                {categoryStatus === "error" && (
                  <div className="filter-modal-error" role="alert">
                    <span>{categoryError}</span>
                    <button
                      type="button"
                      className="home-filter-bar__retry"
                      onClick={handleRetryCategories}
                    >
                      Thử lại
                    </button>
                  </div>
                )}
                {categoryStatus === "done" && (
                  <div className="filter-modal-options">
                    <button
                      type="button"
                      className={`filter-modal-opt ${!filters.category ? "active" : ""}`}
                      onClick={() => updateFilter("category", "all")}
                    >
                      Tất cả
                    </button>
                    {categoryOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        className={`filter-modal-opt ${filters.category === opt.value ? "active" : ""}`}
                        onClick={() => updateFilter("category", opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="filter-modal-group">
                <h4>Thời gian</h4>
                <div className="filter-modal-options">
                  <button type="button" className={`filter-modal-opt ${!filters.cookingTime ? "active" : ""}`} onClick={() => updateFilter("cookingTime", "all")}>Tất cả</button>
                  {TIME_OPTIONS.map((opt) => (
                    <button type="button" key={opt.value} className={`filter-modal-opt ${filters.cookingTime === opt.value ? "active" : ""}`} onClick={() => updateFilter("cookingTime", opt.value)}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="filter-modal-group">
                <h4>Độ khó</h4>
                <div className="filter-modal-options">
                  <button type="button" className={`filter-modal-opt ${!filters.difficulty ? "active" : ""}`} onClick={() => updateFilter("difficulty", "all")}>Tất cả</button>
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button type="button" key={opt.value} className={`filter-modal-opt ${filters.difficulty === opt.value ? "active" : ""}`} onClick={() => updateFilter("difficulty", opt.value)}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="filter-modal-footer">
              <button type="button" className="filter-modal-btn-clear" onClick={() => { handleClearAll(); setIsModalOpen(false); }}>Xóa bộ lọc</button>
              <button type="button" className="filter-modal-btn-apply" onClick={() => setIsModalOpen(false)}>Xem kết quả</button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}