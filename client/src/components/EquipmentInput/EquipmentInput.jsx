import { FIELD_LIMITS } from "../../utils/recipeForm";
import "../FormField/FormField.css";
import trashIcon from "./trash.svg";
import "./EquipmentInput.css";

export default function EquipmentInput({ rows, errors = {}, onChange, onBlur, disabled = false }) {
  return (
    <fieldset className="equipment-input" disabled={disabled}>
      <legend className="equipment-input__legend">Các dụng cụ cần thiết</legend>
      <div className="equipment-input__rows">
        {rows.map((row, index) => {
          const inputId = `equipment-${row.id}`;
          const error = errors[row.id];
          return (
            <div className="equipment-input__row" key={row.id}>
              <div className="equipment-input__field">
                <input
                  id={inputId}
                  className={`form-field__input${error ? " form-field__input--error" : ""}`}
                  type="text"
                  placeholder="Ví dụ: Chảo sâu lòng"
                  aria-label={`Dụng cụ số ${index + 1}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  value={row.value}
                  onChange={(event) => onChange(rows.map((item) => (
                    item.id === row.id ? { ...item, value: event.target.value } : item
                  )))}
                  onBlur={() => onBlur?.(row.id)}
                />
                {error && <p id={`${inputId}-error`} role="alert" className="form-field__error">{error}</p>}
              </div>
              {rows.length > 1 && (
                <button
                  className="equipment-input__remove"
                  type="button"
                  aria-label="Xóa dụng cụ"
                  onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
                >
                  <img src={trashIcon} alt="" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        className="equipment-input__add"
        type="button"
        disabled={disabled || rows.length >= FIELD_LIMITS.equipment.maxItems}
        onClick={() => onChange([...rows, { id: crypto.randomUUID(), value: "" }])}
      >
        + Thêm dụng cụ
      </button>
    </fieldset>
  );
}
