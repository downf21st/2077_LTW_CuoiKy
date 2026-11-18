import FormField from "../FormField/FormField";
import trashIcon from "../../assets/trash.svg";
import "./IngredientInput.css";

const UNIT_OPTIONS = ["g", "ml", "củ", "muỗng canh", "muỗng cà phê"];

export default function IngredientInput({
  rows,
  onChange,
  onAdd,
  onRemove,
  error,
}) {
  return (
    <section className="ingredient-input" aria-labelledby="ingredients-heading">
      <h2 className="ingredient-input__heading" id="ingredients-heading">
        Nguyên liệu
      </h2>
      <p className="ingredient-input__helper">
        Thêm từng nguyên liệu, có thể xóa hoặc thêm dòng bất kỳ lúc nào.
      </p>
      {rows.map((row, index) => (
        <div className="ingredient-input__row" key={row.id}>
          <FormField
            id={`ingredient-name-${row.id}`}
            label="Tên nguyên liệu"
            className="ingredient-input__name"
          >
            <input
              className="form-field__input"
              id={`ingredient-name-${row.id}`}
              type="text"
              placeholder="Tên nguyên liệu"
              value={row.name}
              onChange={(event) => onChange(row.id, "name", event.target.value)}
            />
          </FormField>
          <FormField
            id={`ingredient-quantity-${row.id}`}
            label="Số lượng"
            className="ingredient-input__quantity"
          >
            <input
              className="form-field__input"
              id={`ingredient-quantity-${row.id}`}
              type="number"
              min="0"
              step="any"
              placeholder="Số lượng"
              value={row.quantity}
              onChange={(event) =>
                onChange(row.id, "quantity", event.target.value)
              }
            />
          </FormField>
          <FormField
            id={`ingredient-unit-${row.id}`}
            label="Đơn vị"
            className="ingredient-input__unit"
          >
            <select
              className="form-field__input"
              id={`ingredient-unit-${row.id}`}
              value={row.unit}
              onChange={(event) => onChange(row.id, "unit", event.target.value)}
            >
              <option value="" disabled>
                Chọn đơn vị
              </option>
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </FormField>
          <button
            className="ingredient-input__remove"
            type="button"
            aria-label={`Xóa nguyên liệu ${row.name.trim() || `số ${index + 1}`}`}
            onClick={() => onRemove(row.id)}
          >
            <img src={trashIcon} alt="" />
          </button>
        </div>
      ))}
      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}
      <button
        id="ingredient-add"
        className="ingredient-input__add"
        type="button"
        onClick={onAdd}
      >
        + Thêm nguyên liệu
      </button>
      <p className="ingredient-input__notice">
        Dữ liệu nguyên liệu chưa được lưu ở bước này.
      </p>
    </section>
  );
}
