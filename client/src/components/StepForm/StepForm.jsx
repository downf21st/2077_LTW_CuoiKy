import FormField from "../FormField/FormField";
import trashIcon from "../../assets/trash.svg";
import "./StepForm.css";

export default function StepForm({ rows, onChange, onAdd, onRemove, onMove, errors = {} }) {
  return (
    <section className="step-form" aria-labelledby="step-form-heading">
      <h2 className="step-form__heading" id="step-form-heading">
        Các bước thực hiện
      </h2>
      {rows.map((row, index) => (
        <div className="step-form__row" key={row.id}>
          <span className="step-form__number" aria-label={`Bước ${index + 1}`}>
            {index + 1}
          </span>
          <div className="step-form__fields">
            <FormField id={`step-title-${row.id}`} label="Tên bước">
              <input
                className="form-field__input"
                id={`step-title-${row.id}`}
                placeholder="Ví dụ: Sơ chế nguyên liệu"
                value={row.title}
                onChange={(event) =>
                  onChange(row.id, "title", event.target.value)
                }
              />
            </FormField>
            <FormField id={`step-duration-${row.id}`} label="Thời gian (phút)" error={errors[row.id]?.duration}>
              <input
                className={`form-field__input${errors[row.id]?.duration ? " form-field__input--error" : ""}`}
                id={`step-duration-${row.id}`}
                aria-invalid={Boolean(errors[row.id]?.duration)}
                aria-describedby={errors[row.id]?.duration ? `step-duration-${row.id}-error` : undefined}
                type="number"
                min="0"
                placeholder="Ví dụ: 5"
                value={row.duration}
                onChange={(event) =>
                  onChange(row.id, "duration", event.target.value)
                }
              />
            </FormField>
            <FormField id={`step-instruction-${row.id}`} label="Hướng dẫn">
              <textarea
                className="form-field__input"
                id={`step-instruction-${row.id}`}
                placeholder="Mô tả bước"
                value={row.instruction}
                onChange={(event) =>
                  onChange(row.id, "instruction", event.target.value)
                }
              />
            </FormField>
          </div>
          <div className="step-form__controls">
            <button
              className="step-form__icon"
              type="button"
              aria-label={`Di chuyển bước ${index + 1} lên`}
              disabled={index === 0}
              onClick={() => onMove(row.id, -1)}
            >
              ↑
            </button>
            <button
              className="step-form__icon"
              type="button"
              aria-label={`Di chuyển bước ${index + 1} xuống`}
              disabled={index === rows.length - 1}
              onClick={() => onMove(row.id, 1)}
            >
              ↓
            </button>
            <button
              className="step-form__icon"
              type="button"
              aria-label={`Xóa bước ${index + 1}`}
              onClick={() => onRemove(row.id)}
            >
              <img src={trashIcon} alt="" />
            </button>
          </div>
        </div>
      ))}
      {errors._form && <p className="form-field__error" role="alert">{errors._form}</p>}
      <button id="step-add" className="step-form__add" type="button" onClick={onAdd}>
        + Thêm bước
      </button>
      <p className="step-form__notice">
        Thông tin bước nấu chưa được lưu ở bước này.
      </p>
    </section>
  );
}
