import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormField from "../components/FormField/FormField";
import EquipmentInput from "../components/EquipmentInput/EquipmentInput";
import IngredientInput from "../components/IngredientInput/IngredientInput";
import DifficultyTags from "../components/DifficultyTags/DifficultyTags";
import {
  CATEGORY_OPTIONS,
  FIELD_LIMITS,
  createInitialValues,
  validateRecipeInfo,
  buildRecipePayload,
} from "../utils/recipeForm";
import "./RecipeForm.css";

const fields = [
  {
    name: "title",
    label: "Tên món",
    type: "text",
    placeholder: "Nhập tên món ăn",
  },
  {
    name: "description",
    label: "Mô tả ngắn",
    type: "textarea",
    placeholder: "Nhập mô tả",
  },
  {
    name: "category",
    label: "Loại món",
    type: "select",
    placeholder: "Chọn loại món",
    options: CATEGORY_OPTIONS,
  },
  { name: "cookingTime", label: "Thời gian nấu", type: "number", placeholder: "Nhập thời gian (phút)" },
  {
    name: "servings",
    label: "Khẩu phần",
    type: "number",
    placeholder: "Ví dụ: 4",
    hint: "Số người ăn",
  },
  { name: "difficulty", label: "Độ khó", type: "difficulty" },
];

export default function RecipeForm({
  onSubmit = () => {},
  isSubmitting = false,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(createInitialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const refs = useRef({});

  // TODO: Tải công thức hiện có khi chỉnh sửa ở bước kết nối API.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
    setErrors((previous) => ({
      ...previous,
      [name]: validateRecipeInfo(values)[name],
    }));
  };

  const handleEquipmentChange = (nextRows) => {
    const changedIds = new Set(
      values.equipment
        .filter((row) => !nextRows.some((next) => next.id === row.id && next.value === row.value))
        .map((row) => row.id),
    );
    setValues((previous) => ({ ...previous, equipment: nextRows }));
    setErrors((previous) => ({
      ...previous,
      equipment: Object.fromEntries(
        Object.entries(previous.equipment ?? {}).filter(([id]) => !changedIds.has(id)),
      ),
    }));
    setTouched((previous) => ({
      ...previous,
      equipment: Object.fromEntries(
        Object.entries(previous.equipment ?? {}).filter(([id]) => nextRows.some((row) => row.id === id)),
      ),
    }));
  };

  const handleEquipmentBlur = (rowId) => {
    const error = validateRecipeInfo(values).equipment?.[rowId];
    setTouched((previous) => ({
      ...previous,
      equipment: { ...previous.equipment, [rowId]: true },
    }));
    setErrors((previous) => ({
      ...previous,
      equipment: { ...previous.equipment, [rowId]: error },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateRecipeInfo(values);
    setTouched({
      ...Object.fromEntries(fields.map(({ name }) => [name, true])),
      equipment: Object.fromEntries(values.equipment.map(({ id }) => [id, true])),
    });
    setErrors(nextErrors);
    const firstInvalid = fields.find(({ name }) => nextErrors[name]);
    if (firstInvalid) {
      refs.current[firstInvalid.name]?.focus();
      return;
    }
    if (nextErrors.equipment) {
      const firstRow = values.equipment.find((row) => nextErrors.equipment[row.id]);
      document.getElementById(`equipment-${firstRow.id}`)?.focus();
      return;
    }
    onSubmit(buildRecipePayload(values));
  };

  const renderField = ({ name, label, type, placeholder, options, hint }) => {
    const error = touched[name] ? errors[name] : undefined;
    const fieldHint = hint;
    const describedBy =
      [error && `${name}-error`, fieldHint && `${name}-hint`]
        .filter(Boolean)
        .join(" ") || undefined;
    const props = {
      id: name,
      name,
      value: values[name],
      placeholder,
      required: true,
      onChange: handleChange,
      onBlur: handleBlur,
      ref: (element) => {
        refs.current[name] = element;
      },
      "aria-invalid": Boolean(error),
      "aria-describedby": describedBy,
      className: `form-field__input${error ? " form-field__input--error" : ""}`,
    };
    return (
      <FormField
        key={name}
        id={name}
        label={label}
        required
        hint={fieldHint}
        error={error}
      >
        {type === "difficulty" ? (
          <DifficultyTags
            id={name}
            value={values.difficulty}
            error={error}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={(element) => { refs.current[name] = element; }}
          />
        ) : type === "select" ? (
          <select {...props}>
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea {...props} maxLength={FIELD_LIMITS.description.max} />
        ) : (
          <input
            {...props}
            type={type}
            min={FIELD_LIMITS[name]?.min}
            max={FIELD_LIMITS[name]?.max}
            maxLength={name === "title" ? FIELD_LIMITS.title.max : undefined}
            step={type === "number" ? 1 : undefined}
          />
        )}
      </FormField>
    );
  };

  return (
    <main className="recipe-form">
      <header className="recipe-form__header">
        <nav className="recipe-form__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link> / <span aria-current="page">{id ? "Sửa món ăn" : "Thêm món ăn"}</span>
        </nav>
        <h1 className="recipe-form__title">{id ? "Sửa món ăn" : "Thêm món ăn"}</h1>
        <p className="recipe-form__subtitle">Chia sẻ công thức của bạn với mọi người.</p>
      </header>
      <form className="recipe-form__form" onSubmit={handleSubmit} noValidate>
        <div className="recipe-form__basic-layout">
          <div className="recipe-form__fields">{fields.map(renderField)}</div>
        </div>
        <IngredientInput />
        <section>
          <EquipmentInput
            rows={values.equipment}
            errors={Object.fromEntries(
              Object.entries(errors.equipment ?? {}).filter(([id]) => touched.equipment?.[id]),
            )}
            onChange={handleEquipmentChange}
            onBlur={handleEquipmentBlur}
            disabled={isSubmitting}
          />
        </section>
        <div className="recipe-form__actions">
          <button
            className="recipe-form__cancel"
            type="button"
            onClick={() => navigate(-1)}
          >
            Hủy
          </button>
          <button
            className="recipe-form__submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Đang lưu..."
              : id
                ? "Lưu thay đổi"
                : "Đăng món"}
          </button>
        </div>
      </form>
    </main>
  );
}
