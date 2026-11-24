import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import cookingIcon from '../../assets/sidebar/cooking.svg';
import trashIcon from '../../assets/trash.svg';
import RecipePicker from '../../components/WeeklyMenu/RecipePicker';
import ShoppingList from '../../components/WeeklyMenu/ShoppingList';
import {
  DAYS,
  MEALS,
  createEmptyDays,
  createSlotItem,
  formatCookingTime,
  getTodayDayKey,
  getWeekMeta,
  mergeIngredients,
  normalizeText,
  resolveRecipeImage,
} from '../../utils/weeklyMenuHelper';
import './WeeklyMenu.css';

const TOAST_DURATION_MS = 3500;
const HIGHLIGHT_DURATION_MS = 2800;

function MoveIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 9l-3 3 3 3" />
      <path d="M19 9l3 3-3 3" />
      <path d="M2 12h20" />
    </svg>
  );
}

function DishCard({ item, dayKey, mealKey, onOpenMove, onRemove }) {
  const image = resolveRecipeImage(item.image);
  const timeText = formatCookingTime(item.cookingTime);

  return (
    <article className="weekly-menu__dish-card">
      <div className="weekly-menu__dish-thumb">
        {image && <img src={image} alt={item.title} />}
      </div>

      <div className="weekly-menu__dish-info">
        <Link
          to={`/recipe/${encodeURIComponent(item.recipeId)}`}
          className="weekly-menu__dish-title"
          title={item.title}
        >
          {item.title}
        </Link>
        {timeText && (
          <span className="weekly-menu__time-pill">
            <span className="weekly-menu__dot" aria-hidden="true" />
            {timeText}
          </span>
        )}
      </div>

      <div className="weekly-menu__dish-actions">
        <button
          type="button"
          className="weekly-menu__icon-btn"
          aria-label={`Chuyển món ${item.title} sang ô khác`}
          title="Chuyển sang bữa/ngày khác"
          onClick={(event) => onOpenMove(dayKey, mealKey, item, event.currentTarget)}
        >
          <MoveIcon />
        </button>
        <button
          type="button"
          className="weekly-menu__icon-btn weekly-menu__icon-btn--danger"
          aria-label={`Xóa món ${item.title}`}
          title="Xóa khỏi thực đơn"
          onClick={() => onRemove(dayKey, mealKey, item.uid)}
        >
          <img src={trashIcon} alt="" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default function WeeklyMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  const [days, setDays] = useState(() => createEmptyDays());
  const [weekOffset, setWeekOffset] = useState(0);
  const [mobileTab, setMobileTab] = useState('calendar');
  const [selectedMobileDay, setSelectedMobileDay] = useState(() => getTodayDayKey());

  const [pickerSlot, setPickerSlot] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);
  const [moveDraft, setMoveDraft] = useState({ day: 'mon', meal: 'lunch' });
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const [incomingRecipe, setIncomingRecipe] = useState(
    () => location.state?.pickedRecipe || null
  );
  const [incomingSlot, setIncomingSlot] = useState(() => ({
    day: getTodayDayKey(),
    meal: 'lunch',
  }));

  const [toast, setToast] = useState(null);
  const [highlightedKeys, setHighlightedKeys] = useState([]);

  const toastTimerRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const lastTriggerRef = useRef(null);

  useEffect(() => {
    if (location.state?.pickedRecipe) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!moveTarget && !confirmClearOpen && !incomingRecipe) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMoveTarget(null);
        setConfirmClearOpen(false);
        setIncomingRecipe(null);
        lastTriggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveTarget, confirmClearOpen, incomingRecipe]);

  const { dates, rangeLabel } = useMemo(() => getWeekMeta(weekOffset), [weekOffset]);

  const totalDishes = useMemo(
    () =>
      DAYS.reduce(
        (sum, day) =>
          sum +
          MEALS.reduce((mealSum, meal) => mealSum + days[day.key][meal.key].length, 0),
        0
      ),
    [days]
  );

  const shoppingItems = useMemo(() => mergeIngredients(days), [days]);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  const triggerHighlightForRecipe = (recipe) => {
    const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
    const keys = ingredients
      .map((rawIng) => {
        const ing = typeof rawIng === 'string' ? { name: rawIng, unit: '' } : rawIng || {};
        if (!ing.name) return '';
        return `${normalizeText(ing.name)}|${normalizeText(ing.unit)}`;
      })
      .filter(Boolean);

    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedKeys(keys);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedKeys([]);
      highlightTimerRef.current = null;
    }, HIGHLIGHT_DURATION_MS);
  };

  const getDayLabel = (dayKey) =>
    DAYS.find((d) => d.key === dayKey)?.fullLabel || dayKey;

  const getMealLabel = (mealKey) =>
    MEALS.find((m) => m.key === mealKey)?.label || mealKey;

  const handleOpenPicker = useCallback((dayKey, mealKey, triggerElement) => {
    lastTriggerRef.current = triggerElement;
    setPickerSlot({ day: dayKey, meal: mealKey });
  }, []);

  const handleClosePicker = useCallback(() => {
    setPickerSlot(null);
    lastTriggerRef.current?.focus();
  }, []);

  const handleAddRecipe = (dayKey, mealKey, recipe) => {
    const newItem = createSlotItem(recipe);
    setDays((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [mealKey]: [...prev[dayKey][mealKey], newItem],
      },
    }));

    triggerHighlightForRecipe(recipe);
    showToast(
      `Đã thêm '${newItem.title}' vào ${getDayLabel(dayKey)} · ${getMealLabel(mealKey)}`
    );
  };

  const handleSelectFromPicker = (recipe) => {
    if (!pickerSlot) return;
    handleAddRecipe(pickerSlot.day, pickerSlot.meal, recipe);
    handleClosePicker();
  };

  const handleConfirmIncomingRecipe = (event) => {
    event.preventDefault();
    if (!incomingRecipe) return;
    handleAddRecipe(incomingSlot.day, incomingSlot.meal, incomingRecipe);
    setIncomingRecipe(null);
  };

  const handleRemoveRecipe = useCallback(
    (dayKey, mealKey, uid) => {
      setDays((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          [mealKey]: prev[dayKey][mealKey].filter((item) => item.uid !== uid),
        },
      }));
      showToast('Đã xóa món khỏi thực đơn');
    },
    [showToast]
  );

  const handleOpenMove = useCallback((dayKey, mealKey, item, triggerElement) => {
    lastTriggerRef.current = triggerElement;
    setMoveTarget({ day: dayKey, meal: mealKey, item });
    setMoveDraft({ day: dayKey, meal: mealKey });
  }, []);

  const handleCloseMove = useCallback(() => {
    setMoveTarget(null);
    lastTriggerRef.current?.focus();
  }, []);

  const handleConfirmMove = (event) => {
    event.preventDefault();
    if (!moveTarget) return;

    const { day: fromDay, meal: fromMeal, item } = moveTarget;
    const { day: toDay, meal: toMeal } = moveDraft;

    if (fromDay === toDay && fromMeal === toMeal) {
      handleCloseMove();
      return;
    }

    setDays((prev) => {
      const sourceList = prev[fromDay][fromMeal].filter((x) => x.uid !== item.uid);

      if (fromDay === toDay) {
        return {
          ...prev,
          [fromDay]: {
            ...prev[fromDay],
            [fromMeal]: sourceList,
            [toMeal]: [...prev[fromDay][toMeal], item],
          },
        };
      }

      return {
        ...prev,
        [fromDay]: {
          ...prev[fromDay],
          [fromMeal]: sourceList,
        },
        [toDay]: {
          ...prev[toDay],
          [toMeal]: [...prev[toDay][toMeal], item],
        },
      };
    });

    showToast(
      `Đã chuyển '${item.title}' sang ${getDayLabel(toDay)} · ${getMealLabel(toMeal)}`
    );
    handleCloseMove();
  };

  const handleConfirmClearWeek = () => {
    setDays(createEmptyDays());
    setConfirmClearOpen(false);
    showToast('Đã xóa toàn bộ thực đơn tuần');
    lastTriggerRef.current?.focus();
  };

  const handleJumpToday = () => {
    setWeekOffset(0);
    setSelectedMobileDay(getTodayDayKey());
  };

  return (
    <main className="weekly-menu">
      <nav className="weekly-menu__breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <span>Tài khoản của tôi</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Thực đơn tuần</span>
      </nav>

      <header className="weekly-menu__header">
        <h1>Thực đơn tuần &amp; Đi chợ</h1>
        <p>Lên kế hoạch bữa ăn cho cả tuần và nhận danh sách đi chợ tự động.</p>
      </header>

      <div className="weekly-menu__mobile-tabs" role="tablist" aria-label="Chế độ xem">
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'calendar'}
          className={`weekly-menu__mobile-tab${
            mobileTab === 'calendar' ? ' weekly-menu__mobile-tab--active' : ''
          }`}
          onClick={() => setMobileTab('calendar')}
        >
          Lịch tuần
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'shopping'}
          className={`weekly-menu__mobile-tab${
            mobileTab === 'shopping' ? ' weekly-menu__mobile-tab--active' : ''
          }`}
          onClick={() => setMobileTab('shopping')}
        >
          Đi chợ
        </button>
      </div>

      <div
        className={`weekly-menu__calendar-section${
          mobileTab !== 'calendar' ? ' weekly-menu__section--mobile-hidden' : ''
        }`}
      >
        <div className="weekly-menu__toolbar" aria-label="Điều hướng tuần">
          <div className="weekly-menu__week-switcher">
            <button
              type="button"
              aria-label="Tuần trước"
              onClick={() => setWeekOffset((prev) => prev - 1)}
            >
              ‹
            </button>
            <span>{rangeLabel}</span>
            <button
              type="button"
              aria-label="Tuần sau"
              onClick={() => setWeekOffset((prev) => prev + 1)}
            >
              ›
            </button>
            <button
              type="button"
              className="weekly-menu__text-action"
              onClick={handleJumpToday}
            >
              Hôm nay
            </button>
          </div>

          <div className="weekly-menu__toolbar-actions">
            <button
              type="button"
              className="weekly-menu__btn weekly-menu__btn--outline weekly-menu__print-btn"
              onClick={() => window.print()}
            >
              In thực đơn ra PDF
            </button>
            <button
              type="button"
              className="weekly-menu__text-action"
              disabled={totalDishes === 0}
              onClick={(event) => {
                lastTriggerRef.current = event.currentTarget;
                setConfirmClearOpen(true);
              }}
            >
              Xóa cả tuần
            </button>
          </div>
        </div>

        <section className="weekly-menu__grid-card" aria-label="Lịch thực đơn tuần">
          <div className="weekly-menu__grid">
            <div className="weekly-menu__corner" aria-hidden="true" />
            {dates.map((day) => (
              <div
                className={`weekly-menu__day${
                  day.isToday ? ' weekly-menu__day--today' : ''
                }`}
                key={day.key}
              >
                <span>{day.shortLabel}</span>
                <small>{day.dateLabel}</small>
                {day.isToday && <i aria-hidden="true" />}
              </div>
            ))}

            {MEALS.flatMap((meal) => [
              <div className="weekly-menu__meal" key={`${meal.key}-label`}>
                <img src={cookingIcon} alt="" aria-hidden="true" />
                <span>{meal.label}</span>
              </div>,
              ...dates.map((day) => {
                const slotItems = days[day.key][meal.key];

                return (
                  <div
                    className={`weekly-menu__slot${
                      slotItems.length > 0 ? ' weekly-menu__slot--filled' : ''
                    }`}
                    key={`${meal.key}-${day.key}`}
                  >
                    {slotItems.length > 0 ? (
                      <>
                        <div className="weekly-menu__slot-list">
                          {slotItems.map((item) => (
                            <DishCard
                              key={item.uid}
                              item={item}
                              dayKey={day.key}
                              mealKey={meal.key}
                              onOpenMove={handleOpenMove}
                              onRemove={handleRemoveRecipe}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          className="weekly-menu__slot-add-more"
                          aria-label={`Thêm món cho ${meal.label} ${day.fullLabel}`}
                          onClick={(event) =>
                            handleOpenPicker(day.key, meal.key, event.currentTarget)
                          }
                        >
                          + Thêm
                        </button>
                      </>
                    ) : (
                      <button
                        className="weekly-menu__slot-empty-btn"
                        type="button"
                        aria-label={`Thêm món cho ${meal.label} ${day.fullLabel}`}
                        onClick={(event) =>
                          handleOpenPicker(day.key, meal.key, event.currentTarget)
                        }
                      >
                        + Thêm món
                      </button>
                    )}
                  </div>
                );
              }),
            ])}
          </div>
        </section>

        <section className="weekly-menu__mobile-days" aria-label="Thực đơn theo ngày">
          <div className="weekly-menu__day-strip" role="tablist" aria-label="Chọn ngày">
            {dates.map((day) => {
              const isSelected = selectedMobileDay === day.key;
              return (
                <button
                  key={day.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`weekly-menu__day-pill${
                    day.isToday ? ' weekly-menu__day-pill--today' : ''
                  }${isSelected ? ' weekly-menu__day-pill--selected' : ''}`}
                  onClick={() => setSelectedMobileDay(day.key)}
                >
                  <span>{day.shortLabel}</span>
                  <small>{day.dateLabel}</small>
                  {day.isToday && <i aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="weekly-menu__mobile-meal-list">
            {MEALS.map((meal) => {
              const slotItems = days[selectedMobileDay][meal.key];
              const dayFullLabel = getDayLabel(selectedMobileDay);

              return (
                <div key={meal.key} className="weekly-menu__mobile-meal-group">
                  <div className="weekly-menu__mobile-meal-heading">
                    <img src={cookingIcon} alt="" aria-hidden="true" />
                    <span>{meal.label}</span>
                  </div>

                  {slotItems.length > 0 ? (
                    <div className="weekly-menu__mobile-slot-stack">
                      {slotItems.map((item) => (
                        <DishCard
                          key={item.uid}
                          item={item}
                          dayKey={selectedMobileDay}
                          mealKey={meal.key}
                          onOpenMove={handleOpenMove}
                          onRemove={handleRemoveRecipe}
                        />
                      ))}
                      <button
                        type="button"
                        className="weekly-menu__slot-empty-btn weekly-menu__slot-empty-btn--compact"
                        aria-label={`Thêm món cho ${meal.label} ${dayFullLabel}`}
                        onClick={(event) =>
                          handleOpenPicker(
                            selectedMobileDay,
                            meal.key,
                            event.currentTarget
                          )
                        }
                      >
                        + Thêm món
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="weekly-menu__slot-empty-btn weekly-menu__slot-empty-btn--mobile"
                      aria-label={`Thêm món cho ${meal.label} ${dayFullLabel}`}
                      onClick={(event) =>
                        handleOpenPicker(
                          selectedMobileDay,
                          meal.key,
                          event.currentTarget
                        )
                      }
                    >
                      + Thêm món
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div
        className={`weekly-menu__shopping-section${
          mobileTab !== 'shopping' ? ' weekly-menu__section--mobile-hidden' : ''
        }`}
      >
        <ShoppingList
          items={shoppingItems}
          totalDishes={totalDishes}
          highlightedKeys={highlightedKeys}
          onNotify={showToast}
        />
      </div>

      {pickerSlot && (
        <RecipePicker
          dayLabel={getDayLabel(pickerSlot.day)}
          mealLabel={getMealLabel(pickerSlot.meal)}
          onSelect={handleSelectFromPicker}
          onClose={handleClosePicker}
        />
      )}

      {moveTarget && (
        <div
          className="weekly-menu__modal-backdrop"
          role="presentation"
          onClick={handleCloseMove}
        >
          <form
            className="weekly-menu__modal weekly-menu__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="move-dish-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleConfirmMove}
          >
            <h2 id="move-dish-title">Chuyển món sang ô khác</h2>
            <p className="weekly-menu__dialog-desc">
              Chọn ngày và bữa muốn chuyển món <strong>{moveTarget.item.title}</strong>.
            </p>

            <div className="weekly-menu__dialog-fields">
              <label className="weekly-menu__dialog-field">
                <span>Ngày</span>
                <select
                  value={moveDraft.day}
                  onChange={(event) =>
                    setMoveDraft((prev) => ({ ...prev, day: event.target.value }))
                  }
                >
                  {DAYS.map((day) => (
                    <option key={day.key} value={day.key}>
                      {day.fullLabel}
                    </option>
                  ))}
                </select>
              </label>

              <label className="weekly-menu__dialog-field">
                <span>Bữa</span>
                <select
                  value={moveDraft.meal}
                  onChange={(event) =>
                    setMoveDraft((prev) => ({ ...prev, meal: event.target.value }))
                  }
                >
                  {MEALS.map((meal) => (
                    <option key={meal.key} value={meal.key}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="weekly-menu__dialog-actions">
              <button
                type="button"
                className="weekly-menu__btn weekly-menu__btn--outline"
                onClick={handleCloseMove}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="weekly-menu__btn weekly-menu__btn--primary"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      )}

      {incomingRecipe && (
        <div
          className="weekly-menu__modal-backdrop"
          role="presentation"
          onClick={() => setIncomingRecipe(null)}
        >
          <form
            className="weekly-menu__modal weekly-menu__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incoming-dish-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleConfirmIncomingRecipe}
          >
            <h2 id="incoming-dish-title">Thêm vào thực đơn tuần</h2>
            <p className="weekly-menu__dialog-desc">
              Chọn ngày và bữa cho món{' '}
              <strong>{incomingRecipe.title || incomingRecipe.name}</strong>.
            </p>

            <div className="weekly-menu__dialog-fields">
              <label className="weekly-menu__dialog-field">
                <span>Ngày</span>
                <select
                  value={incomingSlot.day}
                  onChange={(event) =>
                    setIncomingSlot((prev) => ({ ...prev, day: event.target.value }))
                  }
                >
                  {DAYS.map((day) => (
                    <option key={day.key} value={day.key}>
                      {day.fullLabel}
                    </option>
                  ))}
                </select>
              </label>

              <label className="weekly-menu__dialog-field">
                <span>Bữa</span>
                <select
                  value={incomingSlot.meal}
                  onChange={(event) =>
                    setIncomingSlot((prev) => ({ ...prev, meal: event.target.value }))
                  }
                >
                  {MEALS.map((meal) => (
                    <option key={meal.key} value={meal.key}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="weekly-menu__dialog-actions">
              <button
                type="button"
                className="weekly-menu__btn weekly-menu__btn--outline"
                onClick={() => setIncomingRecipe(null)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="weekly-menu__btn weekly-menu__btn--primary"
              >
                Thêm món
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmClearOpen && (
        <div
          className="weekly-menu__modal-backdrop"
          role="presentation"
          onClick={() => setConfirmClearOpen(false)}
        >
          <div
            className="weekly-menu__modal weekly-menu__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-week-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="clear-week-title">Xóa toàn bộ thực đơn tuần?</h2>
            <p className="weekly-menu__dialog-desc">
              Toàn bộ {totalDishes} món trong cả 7 ngày sẽ bị xóa và danh sách đi chợ sẽ trống.
            </p>
            <div className="weekly-menu__dialog-actions">
              <button
                type="button"
                className="weekly-menu__btn weekly-menu__btn--outline"
                onClick={() => setConfirmClearOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="weekly-menu__btn weekly-menu__btn--danger"
                onClick={handleConfirmClearWeek}
              >
                Xóa cả tuần
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`weekly-menu__toast${
            toast.type === 'error' ? ' weekly-menu__toast--error' : ''
          }`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}