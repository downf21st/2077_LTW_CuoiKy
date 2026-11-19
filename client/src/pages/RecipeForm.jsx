import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormField from "../components/FormField/FormField";
import EquipmentInput from "../components/EquipmentInput/EquipmentInput";
import IngredientInput from "../components/IngredientInput/IngredientInput";
import StepForm from "../components/StepForm/StepForm";
import DifficultyTags from "../components/DifficultyTags/DifficultyTags";
import imageIcon from "../assets/image-icon.svg";
import {
  CATEGORY_OPTIONS,
  FIELD_LIMITS,
  createInitialValues,
  validateRecipeInfo,
  validateRecipe,
  buildFormData,
} from "../utils/recipeForm";
import "./RecipeForm.css";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

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
  {
    name: "cookingTime",
    label: "Thời gian nấu",
    type: "number",
    placeholder: "Nhập thời gian (phút)",
  },
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
  const [submitted, setSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const refs = useRef({});
  const imageInputRef = useRef(null);
  const imageButtonRef = useRef(null);
  const imagePreviewRef = useRef(null);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    imagePreviewRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Vui lòng chọn ảnh JPG hoặc PNG.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Ảnh không được vượt quá 2 MB.");
      return;
    }
    setImageError("");
    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageError("");
    if (imageInputRef.current) imageInputRef.current.value = "";
    imageButtonRef.current?.focus();
  };

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
        .filter(
          (row) =>
            !nextRows.some(
              (next) => next.id === row.id && next.value === row.value,
            ),
        )
        .map((row) => row.id),
    );
    setValues((previous) => ({ ...previous, equipment: nextRows }));
    setErrors((previous) => ({
      ...previous,
      equipment: Object.fromEntries(
        Object.entries(previous.equipment ?? {}).filter(
          ([id]) => !changedIds.has(id),
        ),
      ),
    }));
    setTouched((previous) => ({
      ...previous,
      equipment: Object.fromEntries(
        Object.entries(previous.equipment ?? {}).filter(([id]) =>
          nextRows.some((row) => row.id === id),
        ),
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
    if (imageError) {
      imageButtonRef.current?.focus();
      return;
    }
    const nextErrors = validateRecipe(values);
    setSubmitted(true);
    setTouched({
      ...Object.fromEntries(fields.map(({ name }) => [name, true])),
      equipment: Object.fromEntries(
        values.equipment.map(({ id }) => [id, true]),
      ),
    });
    setErrors(nextErrors);
    const firstInvalid = fields.find(({ name }) => nextErrors[name]);
    if (firstInvalid) {
      refs.current[firstInvalid.name]?.focus();
      return;
    }
    if (nextErrors.equipment) {
      const firstRow = values.equipment.find(
        (row) => nextErrors.equipment[row.id],
      );
      document.getElementById(`equipment-${firstRow.id}`)?.focus();
      return;
    }
    if (nextErrors.ingredients) {
      document
        .getElementById(
          values.ingredients[0]
            ? `ingredient-name-${values.ingredients[0].id}`
            : "ingredient-add",
        )
        ?.focus();
      return;
    }
    if (nextErrors.steps) {
      const invalidStep = values.steps.find(
        (step) => nextErrors.steps[step.id],
      );
      document
        .getElementById(
          invalidStep ? `step-duration-${invalidStep.id}` : "step-add",
        )
        ?.focus();
      return;
    }
    onSubmit(buildFormData(values, imageFile));
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
            inputRef={(element) => {
              refs.current[name] = element;
            }}
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
          <Link to="/">Trang chủ</Link> /{" "}
          <span aria-current="page">{id ? "Sửa món ăn" : "Thêm món ăn"}</span>
        </nav>
        <h1 className="recipe-form__title">
          {id ? "Sửa món ăn" : "Thêm món ăn"}
        </h1>
        <p className="recipe-form__subtitle">
          Chia sẻ công thức của bạn với mọi người.
        </p>
      </header>
      <form className="recipe-form__form" onSubmit={handleSubmit} noValidate>
        <div className="recipe-form__basic-layout">
          <section
            className="recipe-form__image-picker"
            aria-labelledby="recipe-image-heading"
          >
            {imageFile ? (
              <img
                ref={imagePreviewRef}
                className="recipe-form__image-preview"
                alt="Ảnh xem trước của món ăn"
              />
            ) : (
              <img className="recipe-form__image-icon" src={imageIcon} alt="" />
            )}
            <h2
              className="recipe-form__image-heading"
              id="recipe-image-heading"
            >
              Ảnh món ăn
            </h2>
            <p className="recipe-form__image-text">Chọn ảnh món ăn của bạn.</p>
            <p className="recipe-form__image-hint" id="recipe-image-hint">
              JPG hoặc PNG, tối đa 2 MB.
            </p>
            <input
              ref={imageInputRef}
              className="recipe-form__image-input"
              id="recipe-image"
              type="file"
              accept="image/jpeg,image/png"
              aria-label="Ảnh món ăn"
              aria-invalid={Boolean(imageError)}
              aria-describedby={
                imageError
                  ? "recipe-image-hint recipe-image-error"
                  : "recipe-image-hint"
              }
              onChange={handleImageChange}
              tabIndex={-1}
            />
            <button
              ref={imageButtonRef}
              className="recipe-form__image-button"
              type="button"
              aria-describedby={
                imageError
                  ? "recipe-image-hint recipe-image-error"
                  : "recipe-image-hint"
              }
              onClick={() => imageInputRef.current?.click()}
            >
              Chọn ảnh
            </button>
            {imageError && (
              <p
                className="recipe-form__image-error"
                id="recipe-image-error"
                role="alert"
              >
                {imageError}
              </p>
            )}
            {(imageFile || imageError) && (
              <button
                className="recipe-form__image-remove"
                type="button"
                onClick={handleRemoveImage}
              >
                Xóa ảnh
              </button>
            )}
          </section>
          <div className="recipe-form__fields">{fields.map(renderField)}</div>
        </div>
        <IngredientInput
          error={submitted ? validateRecipe(values).ingredients : undefined}
          rows={values.ingredients}
          onAdd={() => {
            const row = {
              id: crypto.randomUUID(),
              name: "",
              quantity: "",
              unit: "",
            };
            setValues((previous) => ({
              ...previous,
              ingredients: [...previous.ingredients, row],
            }));
          }}
          onRemove={(rowId) =>
            setValues((previous) => ({
              ...previous,
              ingredients: previous.ingredients.filter(
                (row) => row.id !== rowId,
              ),
            }))
          }
          onChange={(rowId, field, value) =>
            setValues((previous) => ({
              ...previous,
              ingredients: previous.ingredients.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row,
              ),
            }))
          }
        />
        <section>
          <EquipmentInput
            rows={values.equipment}
            errors={Object.fromEntries(
              Object.entries(errors.equipment ?? {}).filter(
                ([id]) => touched.equipment?.[id],
              ),
            )}
            onChange={handleEquipmentChange}
            onBlur={handleEquipmentBlur}
            disabled={isSubmitting}
          />
        </section>
        <StepForm
          errors={submitted ? validateRecipe(values).steps : undefined}
          rows={values.steps}
          onChange={(id, field, value) =>
            setValues((previous) => ({
              ...previous,
              steps: previous.steps.map((step) =>
                step.id === id ? { ...step, [field]: value } : step,
              ),
            }))
          }
          onAdd={() => {
            const step = {
              id: crypto.randomUUID(),
              title: "",
              duration: "",
              instruction: "",
            };
            setValues((previous) => ({
              ...previous,
              steps: [...previous.steps, step],
            }));
          }}
          onRemove={(id) =>
            setValues((previous) => ({
              ...previous,
              steps: previous.steps.filter((step) => step.id !== id),
            }))
          }
          onMove={(id, direction) =>
            setValues((previous) => {
              const index = previous.steps.findIndex((step) => step.id === id);
              const target = index + direction;
              if (index < 0 || target < 0 || target >= previous.steps.length)
                return previous;
              return {
                ...previous,
                steps: previous.steps.map((step, position) =>
                  position === index
                    ? previous.steps[target]
                    : position === target
                      ? previous.steps[index]
                      : step,
                ),
              };
            })
          }
        />
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
            {isSubmitting ? "Đang lưu..." : id ? "Lưu thay đổi" : "Đăng món"}
          </button>
        </div>
      </form>
    </main>
  );
}
