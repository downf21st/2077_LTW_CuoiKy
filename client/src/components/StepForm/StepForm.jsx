import FormField from "../FormField/FormField";
import trashIcon from "../../assets/trash.svg";
import "./StepForm.css";

export default function StepForm() {
  return (
    <section className="step-form" aria-labelledby="step-form-heading">
      <h2 className="step-form__heading" id="step-form-heading">
        Các bước thực hiện
      </h2>
      <div className="step-form__row">
        <span className="step-form__number" aria-label="Bước 1">
          1
        </span>
        <div className="step-form__fields">
          <FormField id="step-title" label="Tên bước">
            <input
              className="form-field__input"
              id="step-title"
              placeholder="Ví dụ: Sơ chế nguyên liệu"
            />
          </FormField>
          <FormField id="step-duration" label="Thời gian (phút)">
            <input
              className="form-field__input"
              id="step-duration"
              type="number"
              min="0"
              placeholder="Ví dụ: 5"
            />
          </FormField>
          <FormField id="step-instruction" label="Hướng dẫn">
            <textarea
              className="form-field__input"
              id="step-instruction"
              placeholder="Mô tả bước"
            />
          </FormField>
        </div>
        <div className="step-form__controls">
          <button
            className="step-form__icon"
            type="button"
            aria-label="Di chuyển bước 1 lên"
            disabled
          >
            ↑
          </button>
          <button
            className="step-form__icon"
            type="button"
            aria-label="Di chuyển bước 1 xuống"
            disabled
          >
            ↓
          </button>
          <button
            className="step-form__icon"
            type="button"
            aria-label="Xóa bước 1"
            disabled
          >
            <img src={trashIcon} alt="" />
          </button>
        </div>
      </div>
      <button className="step-form__add" type="button" disabled>
        + Thêm bước
      </button>
      <p className="step-form__notice">
        Thông tin bước nấu chưa được lưu ở bước này.
      </p>
    </section>
  );
}
