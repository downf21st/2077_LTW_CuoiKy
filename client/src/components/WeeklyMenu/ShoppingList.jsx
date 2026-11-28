import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recipeEmptyIcon from '../../assets/recipe-empty.svg';
import { groupShoppingItems, normalizeText } from '../../utils/weeklyMenuHelper';

function formatAmount(quantity, unit) {
  if (!quantity && !unit) return '';
  if (!quantity) return unit;
  return unit ? `${quantity} ${unit}` : `${quantity}`;
}

const STORAGE_KEY = 'cooked_shopping_checked_v1';

export default function ShoppingList({
  items,
  totalDishes,
  highlightedKeys = [],
  onNotify,
}) {
  const [checkedKeys, setCheckedKeys] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [hideChecked, setHideChecked] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    protein: true,
    produce: true,
    dry: true,
    pantry: false,
  });
  const [expandedRecipeKeys, setExpandedRecipeKeys] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedKeys));
    } catch {
      // Ignored
    }
  }, [checkedKeys]);

  const validCheckedCount = useMemo(() => {
    const keySet = new Set(items.map((item) => item.key));
    return checkedKeys.filter((key) => keySet.has(key)).length;
  }, [items, checkedKeys]);

  const progressPercent =
    items.length > 0 ? Math.round((validCheckedCount / items.length) * 100) : 0;

  const normalizedSearch = useMemo(() => normalizeText(searchTerm), [searchTerm]);

  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return items;
    return items.filter((item) => normalizeText(item.name).includes(normalizedSearch));
  }, [items, normalizedSearch]);

  const groupedItems = useMemo(() => groupShoppingItems(filteredItems), [filteredItems]);

  const toggleItem = (key) => {
    setCheckedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleClearChecked = () => {
    setCheckedKeys([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  };

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleRecipeExpand = (key) => {
    setExpandedRecipeKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isGroupOpen = (groupId) => {
    if (normalizedSearch) return true;
    return !!openGroups[groupId];
  };

  const allGroupsOpen = useMemo(() => {
    const visibleGroupIds = groupedItems.map((g) => g.id);
    if (visibleGroupIds.length === 0) return false;
    return visibleGroupIds.every((id) => isGroupOpen(id));
  }, [groupedItems, openGroups, normalizedSearch]);

  const toggleAllGroups = () => {
    const targetOpen = !allGroupsOpen;
    setOpenGroups((prev) => {
      const next = { ...prev };
      groupedItems.forEach((g) => {
        next[g.id] = targetOpen;
      });
      return next;
    });
  };

  const handleCopyList = async () => {
    if (items.length === 0) return;

    const lines = [
      `Danh sách đi chợ (${items.length} nguyên liệu · ${totalDishes} món):`,
      ...items.map((item) => {
        const mark = checkedKeys.includes(item.key) ? '[x]' : '[ ]';
        const amount = formatAmount(item.quantity, item.unit);
        const amountPart = amount ? ` - ${amount}` : '';
        return `${mark} ${item.name}${amountPart} (Dùng trong: ${item.recipes.join(', ')})`;
      }),
    ];

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Trình duyệt không hỗ trợ sao chép tự động.');
      }
      await navigator.clipboard.writeText(lines.join('\n'));
      onNotify?.('Đã sao chép danh sách đi chợ');
    } catch {
      onNotify?.('Không thể sao chép danh sách. Vui lòng thử lại.', 'error');
    }
  };

  if (totalDishes === 0) {
    return (
      <section className="weekly-menu__shopping" aria-labelledby="shopping-list-title">
        <h2 id="shopping-list-title">Danh sách đi chợ</h2>
        <div className="weekly-menu__empty-state">
          <img src={recipeEmptyIcon} alt="" aria-hidden="true" />
          <p>Chưa có món trong thực đơn. Hãy thêm món để tạo danh sách đi chợ.</p>
          <Link to="/?pickForMenu=1">Thêm món đầu tiên</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="weekly-menu__shopping" aria-labelledby="shopping-list-title">
      <h2 id="shopping-list-title" className="weekly-menu__shopping-heading">
        Danh sách đi chợ
      </h2>

      <div className="weekly-menu__shopping-card">
        {/* 1. Thanh tổng quan ngang gọn */}
        <div className="weekly-menu__shopping-summary">
          <div className="weekly-menu__summary-left">
            <div className="weekly-menu__summary-info">
              <span className="weekly-menu__shopping-stats">
                {items.length} nguyên liệu · {totalDishes} món
              </span>
              <span className="weekly-menu__shopping-progress-text">
                {validCheckedCount}/{items.length} đã mua
              </span>
            </div>
            <div
              className="weekly-menu__progress-track"
              role="progressbar"
              aria-valuenow={validCheckedCount}
              aria-valuemin={0}
              aria-valuemax={items.length}
            >
              <div
                className="weekly-menu__progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="weekly-menu__shopping-actions">
            <button
              type="button"
              className="weekly-menu__btn weekly-menu__btn--outline"
              onClick={handleCopyList}
            >
              Sao chép danh sách
            </button>
            <button
              type="button"
              className="weekly-menu__text-action"
              onClick={handleClearChecked}
              disabled={validCheckedCount === 0}
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>

        {/* 2. Thanh công cụ lọc nhanh 1 hàng gọn */}
        <div className="weekly-menu__shopping-toolbar">
          <div className="weekly-menu__shopping-search">
            <svg
              className="weekly-menu__search-icon"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 19l-4-4m0-7A7 7 0 111 8a7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm nhanh nguyên liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Tìm nhanh nguyên liệu"
            />
            {searchTerm && (
              <button
                type="button"
                className="weekly-menu__search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Xóa từ khóa"
              >
                ×
              </button>
            )}
          </div>

          <div className="weekly-menu__toolbar-controls">
            <button
              type="button"
              className={`weekly-menu__filter-btn${hideChecked ? ' weekly-menu__filter-btn--active' : ''}`}
              role="switch"
              aria-pressed={hideChecked}
              onClick={() => setHideChecked((prev) => !prev)}
            >
              Ẩn đã mua {validCheckedCount > 0 ? `(${validCheckedCount})` : ''}
            </button>

            <button
              type="button"
              className="weekly-menu__text-action"
              onClick={toggleAllGroups}
            >
              {allGroupsOpen ? 'Thu gọn tất cả' : 'Mở tất cả'}
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="weekly-menu__shopping-no-ing">
            Các món trong thực đơn hiện chưa có thông tin nguyên liệu.
          </p>
        ) : groupedItems.length === 0 ? (
          <div className="weekly-menu__shopping-no-results">
            <p>Không tìm thấy nguyên liệu phù hợp với &quot;{searchTerm}&quot;.</p>
            <button
              type="button"
              className="weekly-menu__btn weekly-menu__btn--outline"
              onClick={() => setSearchTerm('')}
            >
              Xóa từ khóa
            </button>
          </div>
        ) : (
          <div className="weekly-menu__shopping-groups">
            {groupedItems.map((group) => {
              const isOpen = isGroupOpen(group.id);

              const groupCheckedKeys = group.items.filter((item) =>
                checkedKeys.includes(item.key)
              );
              const checkedCountInGroup = groupCheckedKeys.length;
              const totalInGroup = group.items.length;

              const uncheckedItems = group.items
                .filter((item) => !checkedKeys.includes(item.key))
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

              const checkedItemsInGroup = group.items
                .filter((item) => checkedKeys.includes(item.key))
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

              const displayItems = hideChecked
                ? uncheckedItems
                : [...uncheckedItems, ...checkedItemsInGroup];

              const isAllCheckedInGroup =
                hideChecked && totalInGroup > 0 && uncheckedItems.length === 0;

              return (
                <div key={group.id} className="weekly-menu__shopping-group">
                  <button
                    type="button"
                    className="weekly-menu__shopping-group-header"
                    aria-expanded={isOpen}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="weekly-menu__shopping-group-title">
                      <span>{group.title}</span>
                      <span className="weekly-menu__shopping-group-count">
                        {checkedCountInGroup > 0
                          ? `${checkedCountInGroup}/${totalInGroup}`
                          : totalInGroup}
                      </span>
                    </div>
                    <svg
                      className={`weekly-menu__group-arrow${isOpen ? ' weekly-menu__group-arrow--open' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="weekly-menu__shopping-group-body">
                      {isAllCheckedInGroup ? (
                        <p className="weekly-menu__group-all-checked">
                          Đã mua đủ nhóm này
                        </p>
                      ) : (
                        <ul className="weekly-menu__shopping-list">
                          {displayItems.map((item) => {
                            const isChecked = checkedKeys.includes(item.key);
                            const isHighlighted = highlightedKeys.includes(item.key);
                            const amountText = formatAmount(item.quantity, item.unit);
                            const isRecipeExpanded = expandedRecipeKeys.includes(item.key);
                            const recipeCount = item.recipes?.length || 0;

                            return (
                              <li
                                key={item.key}
                                className={`weekly-menu__shopping-item${
                                  isChecked ? ' weekly-menu__shopping-item--checked' : ''
                                }${
                                  isHighlighted ? ' weekly-menu__shopping-item--highlight' : ''
                                }`}
                              >
                                <div className="weekly-menu__shopping-item-main">
                                  <label className="weekly-menu__shopping-label">
                                    <input
                                      type="checkbox"
                                      className="weekly-menu__checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleItem(item.key)}
                                    />
                                    <span className="weekly-menu__shopping-item-name">
                                      {item.name}
                                    </span>
                                  </label>

                                  <div className="weekly-menu__shopping-item-right">
                                    {amountText && (
                                      <strong className="weekly-menu__shopping-item-qty">
                                        {amountText}
                                      </strong>
                                    )}
                                    {recipeCount > 0 && (
                                      <button
                                        type="button"
                                        className={`weekly-menu__recipe-pill${
                                          recipeCount > 1 ? ' weekly-menu__recipe-pill--multi' : ''
                                        }`}
                                        aria-expanded={isRecipeExpanded}
                                        aria-label={`Xem các món dùng ${item.name}`}
                                        onClick={() => toggleRecipeExpand(item.key)}
                                      >
                                        ×{recipeCount} món
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {isRecipeExpanded && item.recipes && (
                                  <div className="weekly-menu__shopping-item-recipes">
                                    Dùng trong: {item.recipes.join(', ')}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}