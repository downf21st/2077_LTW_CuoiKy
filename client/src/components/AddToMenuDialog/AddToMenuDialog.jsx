import { useEffect, useId, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addRecipeToSlot,
  DAY_KEYS,
  DAY_LABELS,
  MEAL_KEYS,
  MEAL_LABELS,
} from "../../redux/menuSlice";
import "./AddToMenuDialog.css";

export default function AddToMenuDialog({
  open,
  onClose,
  onAdded,
  recipe,
  triggerRef,
}) {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);
  const titleId = useId();
  const dayId = useId();
  const mealId = useId();
  const [day, setDay] = useState(DAY_KEYS[0]);
  const [meal, setMeal] = useState(MEAL_KEYS[0]);
  const dispatch = useDispatch();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      previousFocus.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    onClose();
    (triggerRef?.current || previousFocus.current)?.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(addRecipeToSlot({ day, meal, recipe }));
    onAdded?.({ day: DAY_LABELS[day], meal: MEAL_LABELS[meal] });
    dialogRef.current.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className="add-to-menu-dialog"
      aria-labelledby={titleId}
      onClose={handleClose}
    >
      <form className="add-to-menu-dialog__form" onSubmit={handleSubmit}>
        <h2 id={titleId}>Thêm vào thực đơn tuần</h2>
        <label htmlFor={dayId}>Ngày</label>
        <select
          id={dayId}
          value={day}
          onChange={(event) => setDay(event.target.value)}
        >
          {DAY_KEYS.map((key) => (
            <option key={key} value={key}>
              {DAY_LABELS[key]}
            </option>
          ))}
        </select>
        <label htmlFor={mealId}>Bữa</label>
        <select
          id={mealId}
          value={meal}
          onChange={(event) => setMeal(event.target.value)}
        >
          {MEAL_KEYS.map((key) => (
            <option key={key} value={key}>
              {MEAL_LABELS[key]}
            </option>
          ))}
        </select>
        <div className="add-to-menu-dialog__actions">
          <button type="button" onClick={() => dialogRef.current.close()}>
            Hủy
          </button>
          <button type="submit">Xác nhận</button>
        </div>
      </form>
    </dialog>
  );
}
