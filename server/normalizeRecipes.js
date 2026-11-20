const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const fileConstants = require('node:fs').constants;
const os = require('node:os');
const path = require('node:path');

const inputName = 'cooked-recipes-with-steps.json';
const dataDirectory = path.join(__dirname, 'data');
const outputFile = path.join(dataDirectory, 'recipes.json');
const backupFile = path.join(dataDirectory, 'recipes.pre-crawl.backup.json');

const pexelsImage = (id) => (
  'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id
  + '.jpeg?auto=compress&cs=tinysrgb&w=1200'
);

const recipeImages = {
  noodles: ['6646034', '11043968', '28712897', '35749934', '9106517', '36300772'],
  rolls: ['4985525', '35246573', '36165416', '9109745', '38734632', '11015773'],
  banhMi: ['32961648', '36156594'],
  desserts: ['33212602', '33118332'],
  rice: ['33999512', '8791778', '34888273', '17692194', '2175211', '37187931'],
  seafood: ['31302693', '18509397', '9106507', '36300772'],
  soup: ['4985530', '6646034', '35839646', '36300772', '37011661'],
  grilled: ['34888273', '17692194', '37549379', '8791778'],
  chicken: ['37187931', '34073964', '31188634', '16547243'],
  stirFry: ['9106507', '28273396', '36453174', '19347048', '31188634'],
  drinks: ['39371480', '33118332'],
  salad: ['36165416', '38734632', '2134033', '36475123', '18509304', '37263739'],
  general: [
    '6646034', '11043968', '28712897', '35749934', '9106517', '36300772',
    '4985525', '35246573', '36165416', '9109745', '38734632', '11015773',
    '32961648', '36156594', '33212602', '33118332', '33999512', '8791778',
    '34888273', '17692194', '2175211', '37187931', '31302693', '18509397',
    '35839646', '4985530', '37011661', '37549379', '28273396', '36453174',
    '19347048', '39371480', '16547243', '34073964', '31188634', '2134033',
    '36475123', '18509304', '37263739', '2318966'
  ]
};

const normalizeText = (value) => String(value)
  .trim()
  .replace(/\s+/g, ' ')
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

const imagePoolFor = (title) => {
  const text = normalizeText(title);
  if (/banh mi|sandwich/.test(text)) return recipeImages.banhMi;
  if (/banh hoi/.test(text)) return recipeImages.rice;
  if (/chuoi/.test(text)) return recipeImages.desserts;
  if (/nem nuong/.test(text)) return recipeImages.grilled;
  if (/nem|cha gio|goi cuon|spring roll/.test(text)) return recipeImages.rolls;
  if (/goi|nom|salad/.test(text)) return recipeImages.salad;
  if (/che|kem|sinh to|thach|yaourt|pudding|sweet/.test(text)) return recipeImages.desserts;
  if (/ca phe|coffee|tra sua|nuoc ep|smoothie|sinh to/.test(text)) return recipeImages.drinks;
  if (/pho|bun|hu tieu|mi |mien|noodle|chao/.test(text)) return recipeImages.noodles;
  if (/canh|sup|soup|lau/.test(text)) return recipeImages.soup;
  if (/tom|cua|muc|hai san|seafood|ca kho|ca hap|ca nuong/.test(text)) return recipeImages.seafood;
  if (/\bga\b|chicken/.test(text)) return recipeImages.chicken;
  if (/com|xoi|rice/.test(text)) return recipeImages.rice;
  if (/nuong|quay|bbq|xien|banh xeo/.test(text)) return recipeImages.grilled;
  if (/xao|kho|chien|rang|om|ap chao/.test(text)) return recipeImages.stirFry;
  return recipeImages.general;
};

const imageForRecipe = (title, seed, imageUsage) => {
  const pool = [...new Set(imagePoolFor(title).map(pexelsImage))];
  const offset = hashNumber(seed) % pool.length;
  const candidates = pool.map((image, index) => ({ image, index }));
  candidates.sort((a, b) => (
    (imageUsage.get(a.image) || 0) - (imageUsage.get(b.image) || 0)
    || ((a.index - offset + pool.length) % pool.length)
      - ((b.index - offset + pool.length) % pool.length)
  ));
  const image = candidates[0].image;
  imageUsage.set(image, (imageUsage.get(image) || 0) + 1);
  return image;
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

const normalizeIngredientMeasure = (unit, name, quantity) => {
  const normalizedUnit = normalizeText(unit).replace(/[.]$/, '');
  const normalizedName = normalizeText(name);
  const liquid = /nuoc|sua|dau an|dau hao|giam|ruou|mam|sot|cot dua|kem|tra|ca phe|siro|mat ong|nuoc cot|canh|chao/.test(normalizedName);
  const seasoning = /muoi|duong|tieu|bot|hat nem|bot ngot|gia vi|nghe|ot bot|nuoc cot chanh/.test(normalizedName);
  const herbOrVegetable = /(^| )(rau|la|hanh la|ngo|mui|hung|tia to|thi la|kinh gioi|rau ram|sa)( |$)/.test(normalizedName);
  const round = (number) => Math.round(number * 10) / 10;
  const withUnit = (factor, targetUnit) => ({
    quantity: round(quantity * factor),
    unit: targetUnit
  });

  if (['g', 'gr', 'gram', 'grams'].includes(normalizedUnit)) return { quantity, unit: 'g' };
  if (['kg', 'ky'].includes(normalizedUnit)) return withUnit(1000, 'g');
  if (['ml', 'milliliter', 'milliliters'].includes(normalizedUnit)) return { quantity, unit: 'ml' };
  if (['l', 'lit', 'liter', 'liters'].includes(normalizedUnit)) return withUnit(1000, 'ml');
  if (['muong canh', 'thia canh', 'tablespoon', 'tbsp'].includes(normalizedUnit)) {
    return { quantity, unit: 'muỗng canh' };
  }
  if (['muong ca phe', 'muong cafe', 'thia ca phe', 'thia cafe', 'teaspoon', 'tsp'].includes(normalizedUnit)) {
    return { quantity, unit: 'muỗng cà phê' };
  }
  if (['muong', 'thia'].includes(normalizedUnit)) {
    return { quantity, unit: seasoning ? 'muỗng cà phê' : 'muỗng canh' };
  }
  if (normalizedUnit === 'la') {
    return withUnit(/gelatin/.test(normalizedName) ? 2 : 1, 'g');
  }
  if (normalizedUnit === 'ly' && /(^| )da( |$)|da vien/.test(normalizedName)) {
    return withUnit(150, 'g');
  }
  if (normalizedUnit === 'it') {
    if (seasoning) return { quantity, unit: 'muỗng cà phê' };
    if (liquid) return withUnit(15, 'ml');
    return withUnit(herbOrVegetable ? 15 : 10, 'g');
  }
  if (['chen', 'bat', 'to', 'ly', 'cup', 'coc'].includes(normalizedUnit)) {
    if (liquid) {
      const volume = normalizedUnit === 'to' ? 400 : normalizedUnit === 'ly' || normalizedUnit === 'coc' ? 240 : 250;
      return withUnit(volume, 'ml');
    }
    const weight = /gao|nep|com/.test(normalizedName) ? 180
      : /bot/.test(normalizedName) ? 125
        : /duong/.test(normalizedName) ? 200
          : /sa/.test(normalizedName) ? 40
          : /rau|la/.test(normalizedName) ? 30 : 150;
    return withUnit(weight, 'g');
  }
  if (['goi', 'hop'].includes(normalizedUnit)) {
    if (liquid) return withUnit(normalizedUnit === 'hop' ? 180 : 200, 'ml');
    const weight = /mi|bun|pho|hu tieu/.test(normalizedName) ? 80
      : seasoning ? 10 : normalizedUnit === 'hop' ? 150 : 100;
    return withUnit(weight, 'g');
  }

  let pieceWeight = 50;
  if (/trung/.test(normalizedName)) pieceWeight = 50;
  else if (/chuoi/.test(normalizedName)) pieceWeight = 120;
  else if (/chanh|cam|buoi/.test(normalizedName)) pieceWeight = 100;
  else if (/tac|quat/.test(normalizedName)) pieceWeight = 10;
  else if (/ca chua/.test(normalizedName)) pieceWeight = 120;
  else if (/dua leo|dua chuot/.test(normalizedName)) pieceWeight = 250;
  else if (/bau|bi/.test(normalizedName)) pieceWeight = 800;
  else if (/hanh tay/.test(normalizedName)) pieceWeight = 150;
  else if (/hanh tim/.test(normalizedName)) pieceWeight = 15;
  else if (/toi/.test(normalizedName)) pieceWeight = normalizedUnit === 'tep' ? 3 : 30;
  else if (/ca rot/.test(normalizedName)) pieceWeight = 80;
  else if (/khoai|cu cai/.test(normalizedName)) pieceWeight = 150;
  else if (/gung/.test(normalizedName)) pieceWeight = 30;
  else if (/ot/.test(normalizedName)) pieceWeight = 5;
  else if (/sa/.test(normalizedName)) pieceWeight = 40;
  else if (/tom|tep/.test(normalizedName)) pieceWeight = 10;
  else if (/\bcua\b/.test(normalizedName)) pieceWeight = 200;
  else if (/\bmuc\b/.test(normalizedName)) pieceWeight = 250;
  else if (/\bca\b/.test(normalizedName)) pieceWeight = 500;
  else if (/\bga\b/.test(normalizedName)) pieceWeight = 1500;
  else if (/\bvit\b/.test(normalizedName)) pieceWeight = 2000;
  else if (/luoi heo/.test(normalizedName)) pieceWeight = 300;
  else if (/thit|tim|gan|luoi|bao tu|long/.test(normalizedName)) pieceWeight = 150;
  else if (/banh mi|banh da/.test(normalizedName)) pieceWeight = 60;
  else if (/dau hu|pho mai/.test(normalizedName)) pieceWeight = 50;
  else if (/(^| )(rau|la|hanh la|ngo|mui|hung|tia to|thi la|kinh gioi|rau ram)( |$)/.test(normalizedName)) pieceWeight = 20;
  else if (normalizedUnit === 'la' || normalizedUnit === 'hat') pieceWeight = 1;
  else if (normalizedUnit === 'nhanh' || normalizedUnit === 'cay') pieceWeight = 30;
  else if (normalizedUnit === 'bo') pieceWeight = 100;
  else if (normalizedUnit === 'con') pieceWeight = 200;
  else if (normalizedUnit === 'lat') pieceWeight = 15;
  else if (normalizedUnit === 'mieng') pieceWeight = 50;

  if (normalizedUnit === 'ong' && /vani|vanilla/.test(normalizedName)) return withUnit(5, 'ml');
  return withUnit(pieceWeight, 'g');
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

      const name = cleanText(
          ingredient.name ?? ingredient.ingredient,
          'Nguyên liệu chưa rõ'
        );
      const measure = normalizeIngredientMeasure(
        cleanText(ingredient.unit, ''),
        name,
        quantity === null ? 1 : quantity
      );

      return { name, ...measure };
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

const normalizeImage = (value, title, seed, imageUsage) => {
  const image = cleanText(value, '');
  if (/^(https?:\/\/|\/)/i.test(image)) return image;

  // shortcut: ảnh Pexels theo nhóm là dự phòng; chạy fetchRecipeSourceImages.js để lấy ảnh riêng từ sourceUrl.
  return imageForRecipe(title, seed, imageUsage);
};

const normalizeRecipe = (source, index, usedIds, createdAtBase, imageUsage) => {
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
    image: normalizeImage(recipe.image, title, idSeed, imageUsage),
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
  const imageUsage = new Map();
  const createdAtBase = Date.now();
  const normalized = recipes.map((recipe, index) =>
    normalizeRecipe(recipe, index, usedIds, createdAtBase, imageUsage)
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
