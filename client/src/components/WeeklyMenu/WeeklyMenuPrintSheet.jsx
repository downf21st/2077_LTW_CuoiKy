import { createPortal } from 'react-dom';
import { DAYS, MEALS } from '../../utils/weeklyMenuHelper';
import './WeeklyMenuPrintSheet.css';

function formatPrintAmount(quantity, unit) {
  if (!quantity && !unit) return '—';
  if (!quantity) return unit;
  return unit ? `${quantity} ${unit}` : String(quantity);
}

export default function WeeklyMenuPrintSheet({
  days,
  shoppingItems,
  totalDishes,
  rangeLabel,
}) {
  const uniqueRecipeCount = new Set(
    DAYS.flatMap((day) =>
      MEALS.flatMap((meal) => {
        const slot = days?.[day.key]?.[meal.key];
        return Array.isArray(slot)
          ? slot.map((item) => String(item.recipeId || item.title))
          : [];
      })
    )
  ).size;

  const isEmpty = totalDishes === 0;

  return createPortal(
    <div className="wm-print" aria-hidden="true">
      <table className="wm-print__shell">
        <thead className="wm-print__shell-head">
          <tr>
            <td className="wm-print__shell-spacer" />
          </tr>
        </thead>

        <tbody className="wm-print__shell-body">
          <tr>
            <td className="wm-print__shell-cell">
              <div className="wm-print__header">
                <div className="wm-print__brand-row">
                  <span className="wm-print__logo">Cooked</span>
                  <span
                    className={`wm-print__meta-count${
                      isEmpty ? ' wm-print__meta-count--empty' : ''
                    }`}
                  >
                    {totalDishes} lượt món · {shoppingItems.length} nguyên liệu
                  </span>
                </div>

                <h1 className="wm-print__doc-title">
                  Thực đơn tuần &amp; Danh sách đi chợ
                </h1>

                {!isEmpty && (
                  <p className="wm-print__doc-subtitle">
                    Tài liệu in A4 gồm lịch bữa ăn 7 ngày (3 bữa/ngày) và danh sách nguyên liệu tự động gộp theo tên và đơn vị.
                  </p>
                )}

                <div
                  className={`wm-print__divider${
                    isEmpty ? ' wm-print__divider--solid' : ''
                  }`}
                />
              </div>

              {isEmpty ? (
                <div className="wm-print__empty-body">
                  <section className="wm-print__section">
                    <div className="wm-print__section-head">
                      <div className="wm-print__section-title-wrap">
                        <span className="wm-print__badge">01</span>
                        <h2 className="wm-print__section-title">Thực đơn tuần</h2>
                      </div>
                      <span className="wm-print__section-meta">0 mục</span>
                    </div>

                    <div className="wm-print__empty-box">
                      <p className="wm-print__empty-title">
                        Chưa có món ăn nào trong thực đơn tuần
                      </p>
                      <p className="wm-print__empty-desc">
                        Cả 7 ngày (21 bữa: Sáng, Trưa, Tối) hiện đang trống. Thêm món tại /my-account/weekly-menu để xuất bản in.
                      </p>
                    </div>
                  </section>

                  <section className="wm-print__section">
                    <div className="wm-print__section-head">
                      <div className="wm-print__section-title-wrap">
                        <span className="wm-print__badge">02</span>
                        <h2 className="wm-print__section-title">Danh sách đi chợ</h2>
                      </div>
                      <span className="wm-print__section-meta">0 mục</span>
                    </div>

                    <div className="wm-print__empty-box">
                      <p className="wm-print__empty-title">Chưa có món trong thực đơn</p>
                      <p className="wm-print__empty-desc">
                        Danh sách nguyên liệu sẽ tự động tạo sau khi bạn thêm ít nhất một món vào thực đơn tuần.
                      </p>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="wm-print__content">
                  <section className="wm-print__section">
                    <div className="wm-print__section-head">
                      <div className="wm-print__section-title-wrap">
                        <span className="wm-print__badge">01</span>
                        <h2 className="wm-print__section-title">Thực đơn tuần</h2>
                      </div>
                      <span className="wm-print__section-meta">
                        7 ngày × 3 bữa ({rangeLabel})
                      </span>
                    </div>

                    <table className="wm-print__table wm-print__menu-table">
                      <thead>
                        <tr>
                          <th scope="col" className="wm-print__col-day">
                            NGÀY
                          </th>
                          <th scope="col" className="wm-print__col-meal">
                            BỮA SÁNG
                          </th>
                          <th scope="col" className="wm-print__col-meal">
                            BỮA TRƯA
                          </th>
                          <th scope="col" className="wm-print__col-meal">
                            BỮA TỐI
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day) => {
                          const dayData = days?.[day.key] || {
                            breakfast: [],
                            lunch: [],
                            dinner: [],
                          };
                          const dayCount = MEALS.reduce(
                            (sum, meal) =>
                              sum +
                              (Array.isArray(dayData[meal.key])
                                ? dayData[meal.key].length
                                : 0),
                            0
                          );

                          return (
                            <tr key={day.key} className="wm-print__row">
                              <td className="wm-print__day-cell">
                                <div className="wm-print__day-name">{day.fullLabel}</div>
                                <div className="wm-print__day-count">{dayCount} món</div>
                              </td>

                              {MEALS.map((meal) => {
                                const slotItems = Array.isArray(dayData[meal.key])
                                  ? dayData[meal.key]
                                  : [];

                                return (
                                  <td key={meal.key} className="wm-print__meal-cell">
                                    {slotItems.length > 0 ? (
                                      <div className="wm-print__meal-box">
                                        <ul className="wm-print__dish-list">
                                          {slotItems.map((item) => (
                                            <li
                                              key={item.uid}
                                              className="wm-print__dish-item"
                                            >
                                              • {item.title}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ) : (
                                      <div className="wm-print__meal-box wm-print__meal-box--empty">
                                        Trống
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>

                  <section className="wm-print__section wm-print__section--shopping">
                    <div className="wm-print__section-head">
                      <div className="wm-print__section-title-wrap">
                        <span className="wm-print__badge">02</span>
                        <h2 className="wm-print__section-title">Danh sách đi chợ</h2>
                      </div>
                      <span className="wm-print__section-meta">
                        {shoppingItems.length} nguyên liệu · {uniqueRecipeCount} món ăn
                      </span>
                    </div>

                    {shoppingItems.length === 0 ? (
                      <div className="wm-print__empty-box">
                        <p className="wm-print__empty-title">
                          Chưa có dữ liệu nguyên liệu
                        </p>
                        <p className="wm-print__empty-desc">
                          Các món ăn đã chọn trong thực đơn tuần hiện chưa khai báo danh sách nguyên liệu.
                        </p>
                      </div>
                    ) : (
                      <table className="wm-print__table wm-print__shopping-table">
                        <thead>
                          <tr>
                            <th scope="col" className="wm-print__col-check">
                              ✓
                            </th>
                            <th scope="col" className="wm-print__col-ing">
                              NGUYÊN LIỆU &amp; MÓN SỬ DỤNG
                            </th>
                            <th scope="col" className="wm-print__col-qty">
                              SỐ LƯỢNG
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {shoppingItems.map((item) => (
                            <tr key={item.key} className="wm-print__row">
                              <td className="wm-print__check-cell">
                                <span className="wm-print__checkbox" />
                              </td>
                              <td className="wm-print__ing-cell">
                                <div className="wm-print__ing-name">{item.name}</div>
                                <div className="wm-print__ing-recipes">
                                  Dùng trong: {item.recipes.join(', ')}
                                </div>
                              </td>
                              <td className="wm-print__qty-cell">
                                {formatPrintAmount(item.quantity, item.unit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    <div className="wm-print__summary-box">
                      <strong>
                        Tổng cộng: {shoppingItems.length} nguyên liệu · {totalDishes} lượt món trong tuần
                      </strong>
                      <span>Đánh dấu vào ô vuông khi đã mua</span>
                    </div>
                  </section>
                </div>
              )}
            </td>
          </tr>
        </tbody>

        <tfoot className="wm-print__shell-foot">
          <tr>
            <td className="wm-print__shell-foot-cell">
              <div className="wm-print__footer">
                <span>Cooked · Thực đơn tuần &amp; Danh sách đi chợ</span>
                <span>{rangeLabel}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>,
    document.body
  );
}