import FormField from "../FormField/FormField";
import trashIcon from "../EquipmentInput/trash.svg";
import "./IngredientInput.css";

const UNIT_OPTIONS = ["g", "ml", "củ", "muỗng canh", "muỗng cà phê"];

export default function IngredientInput() {
  return (
    <section className="ingredient-input" aria-labelledby="ingredients-heading">
      <h2 className="ingredient-input__heading" id="ingredients-heading">Nguyên liệu</h2>
      <p className="ingredient-input__helper">Thêm từng nguyên liệu, có thể xóa hoặc thêm dòng bất kỳ lúc nào.</p>
      <div className="ingredient-input__row">
        <FormField id="ingredient-name" label="Tên nguyên liệu" className="ingredient-input__name">
          <input className="form-field__input" id="ingredient-name" type="text" placeholder="Tên nguyên liệu" />
        </FormField>
        <FormField id="ingredient-quantity" label="Số lượng" className="ingredient-input__quantity">
          <input className="form-field__input" id="ingredient-quantity" type="number" min="0" step="any" placeholder="Số lượng" />
        </FormField>
        <FormField id="ingredient-unit" label="Đơn vị" className="ingredient-input__unit">
          <select className="form-field__input" id="ingredient-unit" defaultValue="">
            <option value="" disabled>Chọn đơn vị</option>
            {UNIT_OPTIONS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </FormField>
        <button className="ingredient-input__remove" type="button" aria-label="Xóa nguyên liệu" disabled>
          <img src={trashIcon} alt="" />
        </button>
      </div>
      <button className="ingredient-input__add" type="button" disabled>+ Thêm nguyên liệu</button>
      <p className="ingredient-input__notice">Dữ liệu nguyên liệu chưa được lưu ở bước này.</p>
    </section>
  );
}
