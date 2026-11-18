const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const fileConstants = require('node:fs').constants;
const os = require('node:os');
const path = require('node:path');

const inputName = 'cooked-recipes-with-steps.json';
const dataDirectory = path.join(__dirname, 'data');
const outputFile = path.join(dataDirectory, 'recipes.json');
const backupFile = path.join(dataDirectory, 'recipes.pre-crawl.backup.json');

const fallbackImages = [
  'https://images.pexels.com/photos/6646034/pexels-photo-6646034.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/11043968/pexels-photo-11043968.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/12027631/pexels-photo-12027631.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/6426068/pexels-photo-6426068.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/28712897/pexels-photo-28712897.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/27420467/pexels-photo-27420467.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/16547243/pexels-photo-16547243.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/4985525/pexels-photo-4985525.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/8472648/pexels-photo-8472648.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/32961648/pexels-photo-32961648.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/9106517/pexels-photo-9106517.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/35749934/pexels-photo-35749934.jpeg?auto=compress&cs=tinysrgb&w=1200'
];

const normalizeText = (value) => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase();

const cleanText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;

  const cleaned = String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned || fallback;
};

const hashNumber = (value) => {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededInteger = (seed, min, max) => (
  min + (hashNumber(seed) % (max - min + 1))
);

const toFiniteNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;

  const number = Number(value.trim());
  return Number.isFinite(number) ? number : null;
};

const normalizeCookingTime = (value, seed) => {
  const number = toFiniteNumber(value);
  return number !== null && number > 0
    ? Math.round(number)
    : seededInteger(seed, 15, 60);
};

const normalizeDuration = (value, instruction, seed) => {
  const number = toFiniteNumber(value);
  if (number !== null && number > 0) return Math.round(number);

  const text = String(instruction || '');
  const range = text.match(
    /(\d+(?:[.,]\d+)?)\s*(?:-|–|đến)\s*(\d+(?:[.,]\d+)?)\s*(phút|giờ|tiếng)/i
  );
  const single = text.match(/(\d+(?:[.,]\d+)?)\s*(phút|giờ|tiếng)/i);
  const match = range || single;

  if (match) {
    const first = Number(match[1].replace(',', '.'));
    const second = range ? Number(match[2].replace(',', '.')) : first;
    const unit = range ? match[3] : match[2];
    const multiplier = /giờ|tiếng/i.test(unit) ? 60 : 1;
    return Math.max(1, Math.round(((first + second) / 2) * multiplier));
  }

  return seededInteger(seed, 5, 15);
};

const inferCategory = (title) => {
  const text = normalizeText(title);

  if (/\b(canh|soup|sup)\b/.test(text)) return 'Món canh';
  if (/\b(goi|nom)\b/.test(text)) return 'Món khai vị';
  if (/\b(che|banh|chuoi)\b/.test(text)) return 'Tráng miệng';
  if (/\b(pho|bun|mi|mien|hu tieu|chao)\b/.test(text)) return 'Món nước';
  if (/\b(chien|xao|kho|nuong|luoc)\b/.test(text)) return 'Món chính';

  return 'Món chính';
};

const normalizeDifficulty = (value) => {
  const difficulty = normalizeText(cleanText(value)).trim();

  if (['de', 'easy'].includes(difficulty)) return 'Dễ';
  if (['trung binh', 'medium', 'moderate'].includes(difficulty)) return 'Trung bình';
  if (['kho', 'hard', 'difficult'].includes(difficulty)) return 'Khó';

  return 'Dễ';
};

const normalizeEquipment = (value) => {
  if (!Array.isArray(value)) return ['Nồi', 'Dao', 'Thớt'];

  const equipment = value
    .filter((item) => item !== null && item !== undefined)
    .map((item) => cleanText(
      typeof item === 'string' ? item : item.name,
      ''
    ))
    .filter(Boolean);

  return equipment.length ? [...new Set(equipment)] : ['Nồi', 'Dao', 'Thớt'];
};

const normalizeIngredients = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item !== null && item !== undefined)
    .map((item) => {
      const ingredient = typeof item === 'string' ? { name: item } : item;
      const quantity = ingredient.quantity === null || ingredient.quantity === undefined
        ? 1
        : toFiniteNumber(ingredient.quantity);

      return {
        name: cleanText(
          ingredient.name ?? ingredient.ingredient,
          'Nguyên liệu chưa rõ'
        ),
        quantity: quantity === null ? 1 : quantity,
        unit: cleanText(ingredient.unit, 'phần')
      };
    });
};

const normalizeSteps = (value, seed) => {
  const steps = Array.isArray(value)
    ? value
        .filter((item) => item !== null && item !== undefined)
        .map((item, index) => {
          const step = typeof item === 'string'
            ? { instruction: item }
            : item;
          const instruction = cleanText(
            step.instruction ?? step.description,
            'Thực hiện bước này theo hướng dẫn.'
          );

          return {
            title: cleanText(step.title, 'Bước ' + (index + 1)),
            duration: normalizeDuration(
              step.duration,
              instruction,
              seed + '-step-' + index
            ),
            instruction
          };
        })
    : [];

  return steps.length
    ? steps
    : [{
        title: 'Chuẩn bị nguyên liệu',
        duration: 5,
        instruction: 'Chuẩn bị nguyên liệu trước khi bắt đầu nấu.'
      }];
};

const removeNullValues = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== null && item !== undefined)
      .map(removeNullValues);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== null && item !== undefined)
        .map(([key, item]) => [key, removeNullValues(item)])
    );
  }

  return value;
};

const normalizeImage = (value, seed) => {
  const image = cleanText(value, '');
  if (/^(https?:\/\/|\/)/i.test(image)) return image;

  return fallbackImages[hashNumber(seed) % fallbackImages.length];
};

const normalizeRecipe = (source, index, usedIds, createdAtBase) => {
  const recipe = source && typeof source === 'object' && !Array.isArray(source)
    ? source
    : {};
  const title = cleanText(recipe.title, 'Món ăn chưa đặt tên');
  const idSeed = cleanText(recipe.id, '') || title || String(index);
  let id = cleanText(recipe.id, '') || ('dish' + String(index + 1).padStart(4, '0'));

  if (usedIds.has(id)) {
    id = 'dish' + String(index + 1).padStart(4, '0');
    let suffix = 1;
    while (usedIds.has(id)) {
      id = 'dish' + String(index + 1).padStart(4, '0') + '-' + suffix++;
    }
  }
  usedIds.add(id);

  const category = cleanText(recipe.category, '')
    || inferCategory(title);
  const createdAtDate = recipe.createdAt ? new Date(recipe.createdAt) : null;
  const createdAt = createdAtDate && Number.isFinite(createdAtDate.getTime())
    ? createdAtDate.toISOString()
    : new Date(createdAtBase - index * 60_000).toISOString();
  const rating = toFiniteNumber(recipe.averageRating);
  const reviews = Array.isArray(recipe.reviews)
    ? removeNullValues(recipe.reviews)
    : [];

  return {
    id: String(id),
    title,
    description: cleanText(
      recipe.description,
      'Công thức nấu ăn thơm ngon, dễ làm tại nhà.'
    ),
    image: normalizeImage(recipe.image, idSeed),
    category,
    cookingTime: normalizeCookingTime(recipe.cookingTime, idSeed),
    servings: Math.max(1, Math.round(toFiniteNumber(recipe.servings) || 4)),
    equipment: normalizeEquipment(recipe.equipment),
    difficulty: normalizeDifficulty(recipe.difficulty),
    ingredients: normalizeIngredients(recipe.ingredients),
    steps: normalizeSteps(recipe.steps, idSeed),
    authorId: cleanText(recipe.authorId, 'user-001'),
    status: 'approved',
    reviews,
    averageRating: rating === null ? 0 : Math.min(5, Math.max(0, rating)),
    createdAt
  };
};

const findInputFile = async () => {
  const candidates = [
    process.argv[2] ? path.resolve(process.argv[2]) : null,
    path.join(__dirname, 'data', inputName),
    path.join(__dirname, inputName),
    path.resolve(process.cwd(), inputName),
    path.join(os.homedir(), 'Downloads', 'Tuan 2', inputName),
    path.join(os.homedir(), 'Downloads', inputName)
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  throw new Error(
    'Không tìm thấy ' + inputName + '. Truyền đường dẫn file làm đối số cho script.'
  );
};

const main = async () => {
  const inputFile = await findInputFile();
  const parsed = JSON.parse(await fs.readFile(inputFile, 'utf8'));
  const recipes = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.recipes)
      ? parsed.recipes
      : Array.isArray(parsed?.data)
        ? parsed.data
        : null;

  if (!recipes) {
    throw new Error('File nguồn phải là mảng công thức hoặc có trường recipes/data dạng mảng.');
  }

  const usedIds = new Set();
  const createdAtBase = Date.now();
  const normalized = recipes.map((recipe, index) =>
    normalizeRecipe(recipe, index, usedIds, createdAtBase)
  );

  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.copyFile(outputFile, backupFile, fileConstants.COPYFILE_EXCL);
    console.log('Đã sao lưu recipes.json hiện tại.');
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'EEXIST') throw error;
  }

  const tempFile = path.join(
    dataDirectory,
    '.recipes-' + process.pid + '-' + crypto.randomUUID() + '.tmp'
  );
  try {
    await fs.writeFile(tempFile, JSON.stringify(normalized, null, 2) + '\n', {
      encoding: 'utf8',
      flag: 'wx'
    });
    await fs.rename(tempFile, outputFile);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }

  console.log('Đã chuẩn hóa thành công ' + normalized.length + ' công thức.');
  console.log('File đầu ra: ' + outputFile);
};

main().catch((error) => {
  console.error('Không thể chuẩn hóa dữ liệu:', error.message);
  process.exitCode = 1;
});