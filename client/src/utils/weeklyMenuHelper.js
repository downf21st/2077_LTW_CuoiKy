export const DAYS = [
  { key: 'mon', shortLabel: 'T2', fullLabel: 'Thứ 2' },
  { key: 'tue', shortLabel: 'T3', fullLabel: 'Thứ 3' },
  { key: 'wed', shortLabel: 'T4', fullLabel: 'Thứ 4' },
  { key: 'thu', shortLabel: 'T5', fullLabel: 'Thứ 5' },
  { key: 'fri', shortLabel: 'T6', fullLabel: 'Thứ 6' },
  { key: 'sat', shortLabel: 'T7', fullLabel: 'Thứ 7' },
  { key: 'sun', shortLabel: 'CN', fullLabel: 'Chủ nhật' },
];

export const MEALS = [
  { key: 'breakfast', label: 'Sáng' },
  { key: 'lunch', label: 'Trưa' },
  { key: 'dinner', label: 'Tối' },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function createEmptyDays() {
  return DAYS.reduce((acc, day) => {
    acc[day.key] = { breakfast: [], lunch: [], dinner: [] };
    return acc;
  }, {});
}

export function generateUid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `uid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createSlotItem(recipe) {
  return {
    uid: generateUid(),
    recipeId: recipe?._id ?? recipe?.id ?? '',
    title: recipe?.title || recipe?.name || 'Món ăn',
    image: recipe?.image || recipe?.imageUrl || recipe?.thumbnail || '',
    cookingTime: recipe?.cookingTime ?? recipe?.duration ?? null,
    ingredients: Array.isArray(recipe?.ingredients) ? recipe.ingredients : [],
  };
}

export function resolveRecipeImage(image) {
  if (!image) return '';
  if (image.startsWith('/uploads/')) {
    try {
      const origin = new URL(API_BASE, window.location.href).origin;
      return new URL(image, origin).href;
    } catch {
      return image;
    }
  }
  return image;
}

export function formatCookingTime(raw) {
  if (raw === null || raw === undefined || raw === '') return '';
  if (typeof raw === 'number') return `${raw} phút`;
  const text = String(raw).trim();
  if (!text) return '';
  return text.includes('phút') || text.includes('giờ') ? text : `${text} phút`;
}

export function getTodayDayKey() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 'sun' : DAYS[jsDay - 1].key;
}

export function getWeekMeta(weekOffset = 0) {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offsetToMonday = (todayMidnight.getDay() + 6) % 7;

  const monday = new Date(todayMidnight);
  monday.setDate(todayMidnight.getDate() - offsetToMonday + weekOffset * 7);

  const dates = DAYS.map((day, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return {
      ...day,
      dateLabel: `${d.getDate()}/${d.getMonth() + 1}`,
      isToday: d.getTime() === todayMidnight.getTime(),
    };
  });

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const rangeLabel = `${monday.getDate()}/${monday.getMonth() + 1} – ${sunday.getDate()}/${sunday.getMonth() + 1}/${sunday.getFullYear()}`;

  return { dates, rangeLabel };
}

export function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function roundQuantity(num) {
  return Math.round(num * 100) / 100;
}

export function mergeIngredients(menuDays) {
  if (!menuDays || typeof menuDays !== 'object') return [];

  const allItems = DAYS.flatMap((day) =>
    MEALS.flatMap((meal) => {
      const slot = menuDays?.[day.key]?.[meal.key];
      return Array.isArray(slot) ? slot : [];
    })
  );

  const grouped = allItems.reduce((map, dish) => {
    const dishTitle = dish?.title || 'Món ăn';
    const ingredients = Array.isArray(dish?.ingredients) ? dish.ingredients : [];

    ingredients.forEach((rawIng) => {
      const ing = typeof rawIng === 'string'
        ? { name: rawIng, quantity: 0, unit: '' }
        : rawIng || {};

      const rawName = String(ing.name || '').trim();
      if (!rawName) return;

      const rawUnit = String(ing.unit || '').trim();
      const key = `${normalizeText(rawName)}|${normalizeText(rawUnit)}`;
      const parsedQty = Number(ing.quantity);
      const quantity = Number.isFinite(parsedQty) ? parsedQty : 0;

      if (!map[key]) {
        map[key] = {
          key,
          name: rawName,
          unit: rawUnit,
          quantity: roundQuantity(quantity),
          recipes: [dishTitle],
          mergeCount: 1,
        };
      } else {
        map[key].quantity = roundQuantity(map[key].quantity + quantity);
        map[key].mergeCount += 1;
        if (!map[key].recipes.includes(dishTitle)) {
          map[key].recipes.push(dishTitle);
        }
      }
    });

    return map;
  }, {});

  return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}

const PROTEIN_KEYWORDS = [
  'thit', 'ga', 'bo', 'heo', 'lon', 'ca', 'tom', 'muc', 'cua', 'oc',
  'trung', 'suon', 'xuong', 'cha', 'gio', 'dau phu', 'dau hu', 'ba chi', 'nam',
];

const PRODUCE_KEYWORDS = [
  'rau', 'ca chua', 'dua', 'hanh', 'toi', 'gung', 'ot', 'xa lach', 'dua leo',
  'ca rot', 'khoai', 'bi', 'bau', 'muop', 'gia', 'ngo', 'thom', 'chanh',
  'sa', 'la', 'cu', 'qua', 'bong cai', 'bap cai', 'su hao', 'dau bap',
];

export function groupShoppingItems(items) {
  const groups = [
    { id: 'protein', title: 'Thịt & hải sản', items: [] },
    { id: 'produce', title: 'Rau củ', items: [] },
    { id: 'pantry', title: 'Gia vị & khác', items: [] },
  ];

  items.forEach((item) => {
    const normalized = normalizeText(item.name);
    if (PROTEIN_KEYWORDS.some((kw) => normalized.includes(kw))) {
      groups[0].items.push(item);
    } else if (PRODUCE_KEYWORDS.some((kw) => normalized.includes(kw))) {
      groups[1].items.push(item);
    } else {
      groups[2].items.push(item);
    }
  });

  return groups.filter((group) => group.items.length > 0);
}