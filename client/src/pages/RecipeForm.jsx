import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormField from "../components/FormField/FormField";
import EquipmentInput from "../components/EquipmentInput/EquipmentInput";
import IngredientInput from "../components/IngredientInput/IngredientInput";
import StepForm from "../components/StepForm/StepForm";
import DifficultyTags from "../components/DifficultyTags/DifficultyTags";
import imageIcon from "../assets/image-icon.svg";
import {
  getRecipeById,
  createRecipe,
  updateRecipe,
  getCategories,
} from "../api";
import {
  FIELD_LIMITS,
  createInitialValues,
  createEditValues,
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

export default function RecipeForm(props) {
  const { id } = useParams();
  return id ? (
    <EditRecipeLoader key={id} id={id} formProps={props} />
  ) : (
    <RecipeFormEditor key="create" {...props} />
  );
}

function EditRecipeLoader({ id, formProps }) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getRecipeById(encodeURIComponent(id))
      .then((recipe) => {
        if (!recipe || String(recipe.id) !== id)
          throw new Error("Không tìm thấy công thức.");
        if (active) setResult({ recipe });
      })
      .catch((error) => {
        if (active)
          setResult({ error: error.message || "Không thể tải công thức." });
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);
  if (!result) return <p role="status">Đang tải công thức...</p>;
  if (result.error)
    return (
      <section role="alert">
        <h1>Không thể mở công thức</h1>
        <p>{result.error}</p>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setAttempt((value) => value + 1);
          }}
        >
          Thử lại
        </button>{" "}
        <Link to="/my-account/my-recipes">Về công thức của tôi</Link>
      </section>
    );
  return <RecipeFormEditor {...formProps} initialRecipe={result.recipe} />;
}

function RecipeFormEditor({ initialRecipe, onSubmit, isSubmitting = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(() =>
    initialRecipe ? createEditValues(initialRecipe) : createInitialValues(),
  );
  const [existingImage, setExistingImage] = useState(
    initialRecipe?.image ?? "",
  );
  const [, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState("loading");
  const [categoryAttempt, setCategoryAttempt] = useState(0);
  const savingRef = useRef(false);
  const refs = useRef({});
  const imageInputRef = useRef(null);
  const imageButtonRef = useRef(null);
  const imagePreviewRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function loadCategories() {
      setCategoryStatus("loading");
      try {
        const result = await getCategories();
        if (
          !Array.isArray(result) ||
          !result.every((item) => typeof item === "string" && item.trim())
        ) {
          throw new Error("Danh sách loại món không hợp lệ.");
        }
        if (active) {
          setCategories(result);
          setCategoryStatus("done");
        }
      } catch {
        if (active) setCategoryStatus("error");
      }
    }
    loadCategories();
    return () => {
      active = false;
    };
  }, [categoryAttempt]);

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
    const validExtension =
      (file.type === "image/jpeg" && /\.jpg$/i.test(file.name)) ||
      (file.type === "image/png" && /\.png$/i.test(file.name));
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || !validExtension) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (savingRef.current || isSubmitting) return;
    setSaveMessage("");
    const missingImage = !id && !imageFile;
    if (missingImage && !imageError) {
      setImageError("Vui lòng chọn ảnh JPG hoặc PNG.");
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
    if (imageError || missingImage) {
      imageButtonRef.current?.focus();
      return;
    }
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
      const row = values.ingredients.find(
        (item) => nextErrors.ingredients[item.id],
      );
      const field = row && Object.keys(nextErrors.ingredients[row.id])[0];
      document
        .getElementById(
          row ? `ingredient-${field}-${row.id}` : "ingredient-add",
        )
        ?.focus();
      return;
    }
    if (nextErrors.steps) {
      const invalidStep = values.steps.find(
        (step) => nextErrors.steps[step.id],
      );
      const field =
        invalidStep && Object.keys(nextErrors.steps[invalidStep.id])[0];
      document
        .getElementById(
          invalidStep ? `step-${field}-${invalidStep.id}` : "step-add",
        )
        ?.focus();
      return;
    }
    const formData = buildFormData(values, imageFile);
    savingRef.current = true;
    setSaving(true);
    try {
      if (!id) {
        if (onSubmit) await onSubmit(formData);
        else {
          await createRecipe(formData);
          navigate("/my-account/my-recipes", { replace: true });
        }
        return;
      }
      const updated = await updateRecipe(id, formData);
      if (updated?.image) setExistingImage(updated.image);
      setImageFile(null);
      setSaveMessage(
        updated?.status === "pending"
          ? "Đã lưu thay đổi. Công thức đang chờ duyệt."
          : "Đã lưu thay đổi.",
      );
    } catch (error) {
      setSaveMessage(
        error.message || "Không thể lưu thay đổi. Vui lòng thử lại.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const renderField = ({ name, label, type, placeholder, options, hint }) => {
    const error = touched[name] ? validateRecipeInfo(values)[name] : undefined;
    const categoryMissing =
      name === "category" &&
      categoryStatus === "done" &&
      values.category &&
      !categories.includes(values.category);
    const fieldHint = categoryMissing
      ? "Loại món hiện tại không còn trong danh sách. Bạn có thể chọn loại khác."
      : hint;
    const fieldOptions = name === "category" ? categories : options;
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
          <>
            <select
              {...props}
              disabled={name === "category" && categoryStatus !== "done"}
            >
              {values[name] && !fieldOptions.includes(values[name]) && (
                <option value={values[name]}>{values[name]}</option>
              )}
              <option value="" disabled>
                {placeholder}
              </option>
              {fieldOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {name === "category" && categoryStatus === "loading" && (
              <p className="recipe-form__category-status" role="status">
                Đang tải danh sách loại món...
              </p>
            )}
            {name === "category" && categoryStatus === "error" && (
              <div className="recipe-form__category-error" role="alert">
                <span>Không thể tải danh sách loại món.</span>
                <button
                  className="recipe-form__category-retry"
                  type="button"
                  onClick={() => setCategoryAttempt((attempt) => attempt + 1)}
                >
                  Thử lại
                </button>
              </div>
            )}
          </>
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
            ) : existingImage ? (
              <img
                className="recipe-form__image-preview"
                alt="Ảnh hiện tại của món ăn"
                src={
                  new URL(
                    existingImage,
                    (
                      import.meta.env.VITE_API_URL ||
                      "http://localhost:5000/api"
                    ).replace(/\/?$/, "/"),
                  ).href
                }
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
              Ảnh bắt buộc khi tạo món. Chọn file .jpg hoặc .png, tối đa 2 MB.
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
          errors={submitted ? validateRecipe(values).ingredients : undefined}
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
              Object.entries(validateRecipeInfo(values).equipment ?? {}).filter(
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
          {saveMessage && (
            <p role="status" aria-live="polite">
              {saveMessage}
            </p>
          )}
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
            disabled={isSubmitting || saving}
          >
            {isSubmitting || saving
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
