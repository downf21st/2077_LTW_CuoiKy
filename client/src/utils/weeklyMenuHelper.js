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

// Trả về chuỗi mốc thời gian tuần (YYYY-MM-DD) cho thứ 2 đầu tuần
export function getWeekStartKey(weekOffset = 0) {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offsetToMonday = (todayMidnight.getDay() + 6) % 7;
  const monday = new Date(todayMidnight);
  monday.setDate(todayMidnight.getDate() - offsetToMonday + weekOffset * 7);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

// Helper kiểm tra khớp nguyên cụm từ theo ranh giới từ (khoảng trắng hoặc đầu/cuối chuỗi)
function matchesKeyword(normalized, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`, 'i');
  return regex.test(normalized);
}

// Kiểm tra xem normalized có bắt đầu bằng keyword không (cho các từ ghép)
function startsWithKeyword(normalized, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${escaped}(?:\\s|$)`, 'i');
  return regex.test(normalized);
}

const PANTRY_KEYWORDS = [
  'nuoc mam', 'nuoc tuong', 'xi dau', 'tuong ot', 'tuong ca', 'tuong den', 'hoisin', 'sa te',
  'mam tom', 'mam ruoc', 'nuoc cot chanh', 'nuoc mau', 'mat ong', 'siro', 'mayonnaise', 'xot', 'sot',
  'nuoc loc', 'nuoc dung', 'dau an', 'dau hao', 'dau me', 'dau mau dieu',
  'muoi', 'duong', 'hat nem', 'bot nem', 'bot ngot', 'tieu', 'ngu vi huong',
  'ot bot', 'bot ot', 'bot nghe', 'bot toi', 'bot hanh', 'bot ca ri', 'bot que',
  'baking soda', 'bot no', 'men no', 'vani', 'giam', 'ruou',
];

const DRY_KEYWORDS = [
  'hanh phi', 'toi phi', 'nuoc cot dua', 'nuoc dao dua', 'nuoc dua',
  'sua tuoi', 'sua dac', 'kem tuoi', 'whipping cream', 'kem beo', 'pho mai', 'bo',
  'tra', 'ca phe', 'nuoc da',
  'bot mi', 'bot nang', 'bot gao', 'bot bap', 'bot chien', 'bot cacao', 'bot tra xanh', 'tinh bot', 'gelatin',
  'dau phong', 'lac', 'me', 'vung', 'dau xanh', 'dau den', 'dau do', 'hat sen',
  'gao', 'nep', 'bun', 'pho', 'mi', 'mien', 'hu tieu', 'banh trang', 'banh mi', 'yen mach',
];

const PRODUCE_KEYWORDS = [
  'ca chua', 'ca rot', 'ca tim', 'rau muong', 'mong toi', 'can tay', 'xa lach', 'dua leo', 'dua chuot',
  'dau bap', 'dau que', 'gia do', 'moc nhi', 'hanh la', 'hanh tay', 'hanh tim', 'la dua', 'la chanh',
  'ngo ri', 'ngo gai', 'rau mui', 'tia to', 'hung que', 'thi la', 'dua soi', 'trai cay',
  'rau', 'cai', 'khoai', 'bi', 'bau', 'muop', 'dua', 'thom', 'chuoi', 'xoai', 'tao', 'cam', 'buoi',
  'gia', 'nam', 'toi', 'gung', 'sa', 'nghe', 'rieng', 'ot', 'chanh', 'tac', 'quat',
];

const PROTEIN_KEYWORDS = [
  'ba chi', 'ba roi', 'xuc xich', 'lap xuong', 'bach tuoc', 'dau hu', 'dau phu', 'tau hu',
  'thit', 'heo', 'lon', 'bo', 'ga', 'vit', 'ngan', 'de', 'be', 'suon', 'xuong', 'nac', 'than',
  'gio', 'cha', 'tom', 'tep', 'cua', 'ghe', 'muc', 'oc', 'ngheo', 'so', 'hau', 'luon', 'trung',
];

function classifyShoppingItem(name) {
  const normalized = normalizeText(name);

  // 1. Kiểm tra nhóm protein (thịt, cá & trứng) - ưu tiên cao nhất
  for (const kw of PROTEIN_KEYWORDS) {
    if (matchesKeyword(normalized, kw)) {
      return 'protein';
    }
  }

  // Xử lý riêng 'ca' ở protein:
  // Loại trừ: ca chua, ca rot, ca tim, ca phe, ca ri, tuong ca
  if (matchesKeyword(normalized, 'ca')) {
    const excluded = ['ca chua', 'ca rot', 'ca tim', 'ca phe', 'ca ri', 'tuong ca'];
    const isExcluded = excluded.some((ex) => startsWithKeyword(normalized, ex) || normalized === ex);
    if (!isExcluded) {
      return 'protein';
    }
  }

  // 2. Kiểm tra nhóm produce (rau củ & trái cây)
  for (const kw of PRODUCE_KEYWORDS) {
    if (matchesKeyword(normalized, kw) || startsWithKeyword(normalized, kw)) {
      return 'produce';
    }
  }

  // 3. Kiểm tra nhóm dry (đồ khô, bột & sữa)
  for (const kw of DRY_KEYWORDS) {
    if (matchesKeyword(normalized, kw) || startsWithKeyword(normalized, kw)) {
      return 'dry';
    }
  }

  // 4. Fallback cho nguyên liệu còn lại -> pantry (gia vị & nước chấm)
  return 'pantry';
}

export function groupShoppingItems(items) {
  const groupsMap = {
    protein: { id: 'protein', title: 'Thịt, cá & trứng', items: [] },
    produce: { id: 'produce', title: 'Rau củ & trái cây', items: [] },
    dry: { id: 'dry', title: 'Đồ khô, bột & sữa', items: [] },
    pantry: { id: 'pantry', title: 'Gia vị & nước chấm', items: [] },
  };

  items.forEach((item) => {
    const groupId = classifyShoppingItem(item.name);
    groupsMap[groupId].items.push(item);
  });

  const order = ['protein', 'produce', 'dry', 'pantry'];
  return order
    .map((id) => groupsMap[id])
    .filter((group) => group.items.length > 0);
}