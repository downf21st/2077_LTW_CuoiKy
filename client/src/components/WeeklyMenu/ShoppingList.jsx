import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import recipeEmptyIcon from '../../assets/recipe-empty.svg';
import { groupShoppingItems } from '../../utils/weeklyMenuHelper';

function formatAmount(quantity, unit) {
  if (!quantity && !unit) return '';
  if (!quantity) return unit;
  return unit ? `${quantity} ${unit}` : `${quantity}`;
}

export default function ShoppingList({
  items,
  totalDishes,
  highlightedKeys = [],
  onNotify,
}) {
  const [checkedKeys, setCheckedKeys] = useState([]);

  const validCheckedCount = useMemo(() => {
    const keySet = new Set(items.map((item) => item.key));
    return checkedKeys.filter((key) => keySet.has(key)).length;
  }, [items, checkedKeys]);

  const groupedItems = useMemo(() => groupShoppingItems(items), [items]);

  const progressPercent =
    items.length > 0 ? Math.round((validCheckedCount / items.length) * 100) : 0;

  const toggleItem = (key) => {
    setCheckedKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleClearChecked = () => {
    setCheckedKeys([]);
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
        <div className="weekly-menu__shopping-summary">
          <h3 className="weekly-menu__shopping-display">Danh sách đi chợ</h3>
          <p className="weekly-menu__shopping-stats">
            {items.length} nguyên liệu · {totalDishes} món
          </p>
          <p className="weekly-menu__shopping-progress-text">
            {validCheckedCount}/{items.length} đã mua
          </p>
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
          <p className="weekly-menu__shopping-note">
            Nguyên liệu trùng tên và cùng đơn vị được gộp tự động.
          </p>

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

        {items.length === 0 ? (
          <p className="weekly-menu__shopping-no-ing">
            Các món trong thực đơn hiện chưa có thông tin nguyên liệu.
          </p>
        ) : (
          <div className="weekly-menu__shopping-groups">
            {groupedItems.map((group) => (
              <div key={group.id} className="weekly-menu__shopping-group">
                <h4 className="weekly-menu__shopping-group-title">
                  <span>{group.title}</span>
                  <span className="weekly-menu__shopping-group-count">
                    {group.items.length}
                  </span>
                </h4>

                <ul className="weekly-menu__shopping-list">
                  {group.items.map((item) => {
                    const isChecked = checkedKeys.includes(item.key);
                    const isHighlighted = highlightedKeys.includes(item.key);
                    const amountText = formatAmount(item.quantity, item.unit);

                    return (
                      <li
                        key={item.key}
                        className={`weekly-menu__shopping-item${
                          isChecked ? ' weekly-menu__shopping-item--checked' : ''
                        }${
                          isHighlighted ? ' weekly-menu__shopping-item--highlight' : ''
                        }`}
                      >
                        <label className="weekly-menu__shopping-label">
                          <input
                            type="checkbox"
                            className="weekly-menu__checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem(item.key)}
                          />
                          <div className="weekly-menu__shopping-item-body">
                            <div className="weekly-menu__shopping-item-top">
                              <span className="weekly-menu__shopping-item-name">
                                {item.name}
                              </span>
                              {amountText && (
                                <strong className="weekly-menu__shopping-item-qty">
                                  {amountText}
                                </strong>
                              )}
                            </div>
                            <span className="weekly-menu__shopping-item-recipes">
                              Dùng trong: {item.recipes.join(', ')}
                            </span>
                            {item.mergeCount > 1 && (
                              <span className="weekly-menu__shopping-merged-tag">
                                Gộp từ {item.mergeCount} món
                              </span>
                            )}
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}