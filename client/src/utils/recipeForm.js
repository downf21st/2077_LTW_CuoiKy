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
    equipment: [
      { id: crypto.randomUUID(), value: "" },
      { id: crypto.randomUUID(), value: "" },
    ],
  };
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
  } else if (title.length < FIELD_LIMITS.title.min || title.length > FIELD_LIMITS.title.max) {
    errors.title = "Tên món cần từ 3 đến 100 ký tự";
  }

  if (!description) {
    errors.description = "Vui lòng nhập mô tả";
  } else if (description.length < FIELD_LIMITS.description.min || description.length > FIELD_LIMITS.description.max) {
    errors.description = "Mô tả cần từ 10 đến 500 ký tự";
  }

  if (!category) errors.category = "Vui lòng chọn loại món";
  if (!isIntegerInRange(values.cookingTime, FIELD_LIMITS.cookingTime)) {
    errors.cookingTime = "Thời gian nấu phải là số nguyên từ 1 đến 1440 phút";
  }
  if (!DIFFICULTY_OPTIONS.includes(difficulty)) {
    errors.difficulty = "Vui lòng chọn độ khó hợp lệ";
  }
  if (!isIntegerInRange(values.servings, FIELD_LIMITS.servings)) {
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
  if (Object.keys(equipmentErrors).length > 0) errors.equipment = equipmentErrors;

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
