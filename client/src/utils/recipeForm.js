export const DIFFICULTY_OPTIONS = ["Dễ", "Trung bình", "Khó"];

export const CATEGORY_OPTIONS = ["Món chính", "Món nước"];

export const FIELD_LIMITS = {
  title: { min: 3, max: 100 },
  description: { min: 10, max: 500 },
  cookingTime: { min: 1, max: 1440 },
  servings: { min: 1, max: 50 },
  equipment: { min: 1, max: 50, maxItems: 30 },
};

export function createInitialValues() {
  return {
    title: "",
    description: "",
    category: "",
    cookingTime: "",
    difficulty: "",
    servings: "",
    ingredients: [
      { id: crypto.randomUUID(), name: "", quantity: "", unit: "" },
    ],
    steps: [
      { id: crypto.randomUUID(), title: "", duration: "", instruction: "" },
    ],
    equipment: [
      { id: crypto.randomUUID(), value: "" },
      { id: crypto.randomUUID(), value: "" },
    ],
  };
}

export function createEditValues(recipe) {
  const values = createInitialValues();
  for (const field of [
    "title",
    "description",
    "category",
    "cookingTime",
    "difficulty",
    "servings",
  ]) {
    values[field] = String(recipe[field] ?? "");
  }
  values.equipment = (recipe.equipment ?? []).map((value) => ({
    id: crypto.randomUUID(),
    value,
  }));
  values.ingredients = (recipe.ingredients ?? []).map((row) => ({
    id: crypto.randomUUID(),
    name: row.name ?? "",
    quantity: String(row.quantity ?? ""),
    unit: row.unit ?? "",
  }));
  values.steps = (recipe.steps ?? []).map((row) => ({
    id: crypto.randomUUID(),
    title: row.title ?? "",
    duration: String(row.duration ?? ""),
    instruction: row.instruction ?? "",
  }));
  return values;
}

function isIntegerInRange(value, { min, max }) {
  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text)) return false;
  const number = Number(text);
  return Number.isSafeInteger(number) && number >= min && number <= max;
}

export function validateRecipeInfo(values = {}) {
  const errors = {};
  const title = (values.title ?? "").trim();
  const description = (values.description ?? "").trim();
  const category = (values.category ?? "").trim();
  const difficulty = (values.difficulty ?? "").trim();

  if (!title) {
    errors.title = "Vui lòng nhập tên món";
  } else if (
    title.length < FIELD_LIMITS.title.min ||
    title.length > FIELD_LIMITS.title.max
  ) {
    errors.title = "Tên món cần từ 3 đến 100 ký tự";
  }

  if (!description) {
    errors.description = "Vui lòng nhập mô tả";
  } else if (
    description.length < FIELD_LIMITS.description.min ||
    description.length > FIELD_LIMITS.description.max
  ) {
    errors.description = "Mô tả cần từ 10 đến 500 ký tự";
  }

  if (!category) errors.category = "Vui lòng chọn loại món";
  if (!String(values.cookingTime ?? "").trim()) {
    errors.cookingTime = "Vui lòng nhập thời gian nấu";
  } else if (!isIntegerInRange(values.cookingTime, FIELD_LIMITS.cookingTime)) {
    errors.cookingTime = "Thời gian nấu phải là số nguyên từ 1 đến 1440 phút";
  }
  if (!difficulty) {
    errors.difficulty = "Vui lòng chọn độ khó";
  } else if (!DIFFICULTY_OPTIONS.includes(difficulty)) {
    errors.difficulty = "Vui lòng chọn độ khó hợp lệ";
  }
  if (!String(values.servings ?? "").trim()) {
    errors.servings = "Vui lòng nhập khẩu phần";
  } else if (!isIntegerInRange(values.servings, FIELD_LIMITS.servings)) {
    errors.servings = "Khẩu phần phải là số nguyên từ 1 đến 50";
  }

  const equipmentErrors = {};
  let filledCount = 0;
  for (const row of values.equipment ?? []) {
    const value = row.value.trim();
    if (!value) continue;
    filledCount += 1;
    if (value.length > FIELD_LIMITS.equipment.max) {
      equipmentErrors[row.id] = "Tên dụng cụ tối đa 50 ký tự";
    } else if (filledCount > FIELD_LIMITS.equipment.maxItems) {
      equipmentErrors[row.id] = "Chỉ được thêm tối đa 30 dụng cụ";
    }
  }
  if (Object.keys(equipmentErrors).length > 0)
    errors.equipment = equipmentErrors;

  return errors;
}

export function validateRecipe(values = {}) {
  const errors = validateRecipeInfo(values);
  const positive = (value) =>
    String(value ?? "").trim() !== "" &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0;
  const units = ["g", "ml", "muỗng canh", "muỗng cà phê"];
  const ingredients = values.ingredients ?? [];
  if (!ingredients.length)
    errors.ingredients = { _form: "Vui lòng thêm ít nhất một nguyên liệu." };
  else {
    const rows = Object.fromEntries(
      ingredients.flatMap((item) => {
        const row = {};
        if (!item.name?.trim()) row.name = "Vui lòng nhập tên nguyên liệu.";
        if (!positive(item.quantity)) row.quantity = "Số lượng phải lớn hơn 0.";
        if (!units.includes(item.unit?.trim()))
          row.unit = "Vui lòng chọn đơn vị hợp lệ.";
        return Object.keys(row).length ? [[item.id, row]] : [];
      }),
    );
    if (Object.keys(rows).length) errors.ingredients = rows;
  }
  const steps = values.steps ?? [];
  if (!steps.length) {
    errors.steps = { _form: "Vui lòng thêm ít nhất một bước nấu." };
  } else {
    const stepErrors = Object.fromEntries(
      steps.flatMap((step) => {
        const rowErrors = {};
        if (!step.title?.trim()) rowErrors.title = "Vui lòng nhập tên bước.";
        if (!step.instruction?.trim())
          rowErrors.instruction = "Vui lòng nhập hướng dẫn.";
        if (
          !positive(step.duration) ||
          !Number.isInteger(Number(step.duration))
        ) {
          rowErrors.duration = "Thời gian phải là số phút nguyên dương.";
        }
        return Object.keys(rowErrors).length ? [[step.id, rowErrors]] : [];
      }),
    );
    if (Object.keys(stepErrors).length) errors.steps = stepErrors;
  }
  return errors;
}

export function buildRecipePayload(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category.trim(),
    cookingTime: Number(values.cookingTime),
    difficulty: values.difficulty.trim(),
    servings: Number(values.servings),
    equipment: values.equipment.map((row) => row.value.trim()).filter(Boolean),
  };
}

export function buildFormData(values, imageFile) {
  const formData = new FormData();
  const { equipment, ...fields } = buildRecipePayload(values);
  const numericValue = (value) => {
    const text = String(value ?? "").trim();
    const number = Number(text);
    return text !== "" && Number.isFinite(number) ? number : text;
  };

  Object.entries(fields).forEach(([name, value]) => {
    formData.append(name, String(value));
  });
  formData.append("equipment", JSON.stringify(equipment));
  formData.append(
    "ingredients",
    JSON.stringify(
      values.ingredients.map((item) => ({
        name: item.name.trim(),
        quantity: numericValue(item.quantity),
        unit: item.unit.trim(),
      })),
    ),
  );
  formData.append(
    "steps",
    JSON.stringify(
      values.steps.map((step) => ({
        title: step.title.trim(),
        duration: numericValue(step.duration),
        instruction: step.instruction.trim(),
      })),
    ),
  );
  if (imageFile) formData.append("image", imageFile);
  return formData;
}
