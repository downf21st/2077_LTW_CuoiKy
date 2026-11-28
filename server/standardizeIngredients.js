const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const fsConstants = require('node:fs').constants;

const dataDirectory = path.join(__dirname, 'data');
const recipesPath = path.join(dataDirectory, 'recipes.json');
const backupPath = path.join(dataDirectory, 'recipes.before-ingredient-standardize.json');
const allowedUnits = new Set(['g', 'ml', 'muỗng canh', 'muỗng cà phê']);
const expectedRecipeCount = 622;

const keyOf = (value) => String(value ?? '')
  .normalize('NFC')
  .toLocaleLowerCase('vi')
  .replace(/\s+/g, ' ')
  .trim();
const duplicateKeyOf = (value) => keyOf(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd');

const aliases = new Map();
const addAliases = (canonical, variants) => {
  aliases.set(keyOf(canonical), canonical);
  for (const variant of variants) aliases.set(keyOf(variant), canonical);
};

addAliases('Đường', ['Ường trắng', 'Đường cát trắng', 'Đường cát', 'Đường trắng', 'Đường cát nhuyễn', 'Đường kính']);
addAliases('Đường phèn', []);
addAliases('Đường nâu', ['Đường vàng']);
addAliases('Đường thốt nốt', []);
addAliases('Thịt heo', ['Thịt lợn']);
addAliases('Thịt ba chỉ', ['Thịt ba rọi', 'Thịt ba rọi heo', 'Thịt ba chỉ heo', 'Thịt heo ba rọi']);
addAliases('Thịt thăn heo', ['Thịt thăn lợn']);
addAliases('Tai heo', ['Tai lợn']);
addAliases('Mỡ heo', ['Mỡ lợn']);
addAliases('Xương ống heo', ['Xương ống']);
addAliases('Nước tương', ['Xì dầu']);
addAliases('Hạt nêm', ['Bột nêm', 'Hột nêm']);
addAliases('Mè', ['Vừng']);
addAliases('Mè rang', ['Vừng rang']);
addAliases('Mè trắng', ['Vừng trắng']);
addAliases('Dứa', ['Thơm', 'Trái thơm']);
addAliases('Tắc', ['Quất']);
addAliases('Đậu hũ', ['Đậu phụ', 'Tàu hũ']);
addAliases('Ngò rí', ['Rau mùi', 'Ngò']);
addAliases('Hành tím', ['Hành khô']);
addAliases('Đậu phộng', ['Lạc']);
addAliases('Củ đậu', ['Củ sắn']);
addAliases('Tỏi', ['Tép tỏi', 'Tỏi củ', 'Tỏi khô', 'Tỏi to', 'Tỏi lớn', 'Tỏi băm', 'Tỏi băm nhuyễn']);
addAliases('Hành tím', ['Hành tím băm', 'Hành tím băm nhỏ', 'Hành tím củ', 'Hành tím lớn']);
addAliases('Hành lá', ['Hành lá cắt nhỏ', 'Hành hoa', 'Hành tươi']);
addAliases('Gừng', ['Gừng băm', 'Gừng thái sợi', 'Gừng băm nhỏ']);
addAliases('Sả', ['Xả', 'Sả băm', 'Sả cây']);
addAliases('Ớt', ['Ớt băm', 'Ớt tươi']);
addAliases('Nước mắm', ['Nước mắm ngon', 'Nước mắm truyền thống', 'Nước mắm']);
addAliases('Trứng gà', ['Trứng gà lớn', 'Trứng gà nguyên quả', 'Trứng gà ta']);
addAliases('Tiêu', ['Tiêu đen xay', 'Tiêu xay', 'Tiêu bột', 'Bột tiêu']);
addAliases('Muối', ['Muối tinh', 'Muối iốt', 'Muối iot', 'Muối bọt']);
addAliases('Tôm', ['Tôm tươi', 'Tôm to', 'Tôm nhỏ']);
addAliases('Tỏi phi', ['Tỏi phi giòn']);
addAliases('Thịt heo xay', ['Thịt băm', 'Thịt bằm', 'Thịt heo băm', 'Thịt heo xay', 'Thịt xay', 'Thị băm']);
addAliases('Tinh chất vani', ['Va ni', 'Vani', 'Vanila', 'Tinh chất vanila', 'Tinh chất Vani', 'Hương vani']);
addAliases('Trứng cút', ['Trứn cút']);
addAliases('Dầu mè', ['Vài iọt dầu mè']);
addAliases('Giấm', ['Dấm']);
addAliases('Nước màu', ['Nước màu đường', 'Nước hàng']);
addAliases('Nước cốt dừa', ['Nước cốt dừa nguyên chất']);
addAliases('Sữa tươi không đường', ['Sữa tươi nguyên kem không đường']);
addAliases('Sữa tươi', ['Sữa tươi ấm']);
addAliases('Ngò gai', ['Rau mùi tàu', 'Mùi tàu']);
addAliases('Ngò rí', ['Rau ngò']);
addAliases('Chà bông', ['Ruốc bông', 'Chà bông (ruốc)']);
addAliases('Nước đá', ['Đá viên', 'Đá bào', 'Nước đá lạnh', 'Nước đá viên']);
addAliases('Mì chính', ['Bột ngọt']);
addAliases('Bột bắp', ['Tinh bột bắp']);
addAliases('Bột khoai tây', ['Tinh bột khoai tây']);
addAliases('Bột nghệ', ['Tinh bột nghệ']);
addAliases('Lá nguyệt quế', ['Lá Nuyệt quế']);
addAliases('Rượu trắng', ['Rượu']);
addAliases('Chanh dây', ['Chanh dây tươi']);
addAliases('Me', ['Me chín']);
addAliases('Cà phê', ['Hạt cà phê', 'Cà phê xay']);
addAliases('Nước dùng', ['Nước linh xương', 'Nước hầm xương']);
addAliases('Nước lọc', ['Nước lạnh']);
addAliases('Nước chấm', ['Nguyên liệu nước chấm', 'Cho nước chấm']);
addAliases('Bột mì đa dụng', ['Bột mì số 8 hoặc đa dụng']);
addAliases('Rau ăn kèm', ['Rau ăn kèm tùy chọn', 'Rau nhúng lẩu tùy thích']);

const removePrepWords = (name) => name
  .replace(/\b(?:đã\s+)?(?:băm(?:\s+nhuyễn|\s+nhỏ)?|thái\s+(?:sợi|lát|nhỏ)|cắt\s+nhỏ|giã\s+nhỏ|xay\s+nhuyễn|nguyên\s+quả)\b/giu, '')
  .replace(/\s+/g, ' ')
  .trim();

const properWords = new Set(['hàn', 'quốc', 'tây', 'ninh', 'nhật', 'mỹ', 'ý', 'đà', 'lạt', 'rich\'s', 'hoisin', 'lipton', 'red', 'label', 'knorr']);
const titleCaseVietnamese = (value) => value
  .split(' ')
  .filter(Boolean)
  .map((word, index) => {
    const lower = word.toLocaleLowerCase('vi');
    return properWords.has(lower) || index === 0
      ? lower[0].toLocaleUpperCase('vi') + lower.slice(1)
      : lower;
  })
  .join(' ');

const cleanName = (value) => {
  let name = String(value ?? '').normalize('NFC').trim();
  name = name.replace(/^\d+(?:[.,]\d+)?\s*(?:muỗng\s+(?:canh|cà\s+phê)|g|ml)\s+/iu, '');
  name = name.replace(/\s*\((?:tùy chọn|tùy thích)\)?$/iu, '').trim();
  name = name.replace(/^gia vị thông dụng\s*\(/iu, '');
  name = name.replace(/[.。…]+$/u, '').replace(/[():;]+$/u, '').trim();
  name = name.replace(/\s+/g, ' ');
  if (!name) return '';

  const exact = aliases.get(keyOf(name));
  if (exact) return exact;

  name = removePrepWords(name);
  const cleanedExact = aliases.get(keyOf(name));
  if (cleanedExact) return cleanedExact;

  if (/^tinh chất vani(?:la)?$/iu.test(name) || /^va\s*ni$/iu.test(name)) return 'Tinh chất vani';
  if (/^xả(?:\s+cây)?$/iu.test(name)) return 'Sả';
  if (/^thịt\s+(?:heo\s+)?băm$/iu.test(name) || /^thịt\s+xay$/iu.test(name)) return 'Thịt heo xay';
  if (/^hành\s+tím\s+(?:băm|củ|lớn)$/iu.test(name)) return 'Hành tím';
  if (/^tỏi\s+(?:củ|khô|to|lớn|băm)$/iu.test(name)) return 'Tỏi';
  if (/^trứng\s+gà\s+(?:lớn|ta|nguyên quả)$/iu.test(name)) return 'Trứng gà';
  if (/^nước\s+mắm\s+(?:ngon|truyền thống)$/iu.test(name)) return 'Nước mắm';
  if (/^nước\s+tương\s*\/\s*xì\s*dầu$/iu.test(name)) return 'Nước tương';
  return titleCaseVietnamese(name);
};

const splitNames = (rawName) => {
  let value = String(rawName ?? '').normalize('NFC').trim();
  const exact = aliases.get(keyOf(value));
  if (exact) return [exact];
  if (/^hỗn hợp trứng\s*\+\s*nước:?$/iu.test(value)) return ['Trứng', 'Nước lọc'];
  if (/^mì chính\s+rượu trắng$/iu.test(value.replace(/[.…]+$/u, '').trim())) return ['Mì chính', 'Rượu trắng'];
  value = value.replace(/^gia vị thông dụng\s*\(/iu, '');
  value = value.replace(/\(ruốc\)/giu, '');
  value = value.replace(/\s+hoặc\s+/giu, '/').replace(/\s+và\s+/giu, '/');
  value = value.replace(/[,，]/gu, '/');
  const parts = value.split('/').map(cleanName).filter(Boolean);
  return parts.length ? parts : [cleanName(rawName) || 'Nguyên liệu khác'];
};

const getUnitGroup = (name) => {
  const key = keyOf(name);
  if (/^(?:đường(?:\s|$)|đường phèn$|đường nâu$|đường thốt nốt$)/u.test(key)) return 'sugar';
  if (/^(?:sữa tươi(?: không đường| có đường)?|sữa chua uống|whipping cream|kem tươi|kem béo|nước đá)$/u.test(key)
      || /^(?:dầu ăn|dầu ăn dặm|dầu tỏi phi|giấm|rượu trắng|rượu nấu ăn|rượu mai quế lộ|rượu vang|nước cốt lá dứa|sinh tố|hỗn hợp sữa béo|topping base|cốt gà|trà pha sẵn|cà phê pha sẵn|soda|nước ngọt)$/u.test(key)
      || /^nước (?:lọc|dùng(?:\s|$)|hầm|dừa|cốt dừa|dảo dừa|lạnh|trà|lá|ép|riềng|dưa chua|linh xương)/u.test(key)) return 'liquid';
  if (/^(?:nước mắm|nước tương|dầu hào|dầu mè|dầu màu điều|tương|mắm|sa tế|sốt|xốt|mayonnaise|sữa đặc|mật ong|siro|sirô|nước cốt chanh|nước cốt tắc|nước cốt me|nước màu|nước chấm|chao|tương trụ hầu)/u.test(key)) return 'sauce';
  if (/^(?:muối|hạt nêm|hột nêm|bột nêm|bột canh|mì chính|bột ngọt|tiêu|hoa tiêu|ngũ vị hương|ớt bột|bột ớt|bột nghệ|bột tỏi|bột hành|bột cà ri|bột quế|baking soda|bột nở|bột nổi|men nở|tinh chất vani|(?:lá\s+)?(?:hương thảo|oregano|rosemary)(?:\s|$)|lá nguyệt quế|bột sa cương|bột bò kho|bột gà|bột thịt gà|hạt mắc khén|hạt thì là|đinh hương|hạt ngò khô|quế thanh|quế cây|gia vị)/u.test(key)) return 'spice';
  if (/^(?:nguyên liệu nước chấm|cho nước chấm)$/u.test(key)) return 'sauce';
  if (/^rau ăn kèm$|^đồ ăn kèm$|^món ăn kèm$|^topping tùy chọn$|^nguyên liệu sơ chế$|^nguyên liệu nhúng kèm$|^các loại rau ăn kèm$|^rau nhúng lẩu tùy thích$/u.test(key)) return 'solid';
  return 'solid';
};

const getTargetUnit = (name) => ({
  solid: 'g', liquid: 'ml', sauce: 'muỗng canh', spice: 'muỗng cà phê', sugar: 'g'
})[getUnitGroup(name)];

const getGramsPerTeaspoon = (name) => {
  const key = keyOf(name);
  if (/^đường/u.test(key)) return 4;
  if (/^(?:muối|hạt nêm|mì chính|bột ngọt)/u.test(key)) return 5;
  if (/^(?:tiêu|ngũ vị hương|ớt bột|bột ớt|bột nghệ|bột cà ri|bột quế|gia vị|bột bò kho)/u.test(key)) return 2.5;
  if (/^(?:bột năng|bột mì|bột gạo|bột bắp|tỏi|hành tím|đậu phộng|mè)/u.test(key)) return 3.5;
  return 5;
};

const getGramsPerTablespoon = (name) => {
  const key = keyOf(name);
  if (/^(?:đường)/u.test(key)) return 12;
  if (/^(?:muối|hạt nêm|mì chính|bột ngọt)/u.test(key)) return 15;
  if (/^(?:tiêu|ngũ vị hương|ớt bột|bột ớt|bột nghệ|bột cà ri|bột quế|gia vị)/u.test(key)) return 7.5;
  if (/^(?:bột năng|bột mì|bột gạo|bột bắp|tỏi|hành tím|đậu phộng|mè)/u.test(key)) return 10;
  if (/^(?:sữa đặc|mật ong|dầu hào|tương ớt|tương cà)/u.test(key)) return 18;
  return 15;
};

const normalizeQuantity = (quantity, unit) => {
  const value = unit === 'g' || unit === 'ml'
    ? (quantity >= 10 ? Math.round(quantity) : Math.round(quantity * 10) / 10)
    : Math.max(1, quantity) >= 2
      ? Math.round(quantity * 2) / 2
      : Math.round(quantity * 4) / 4;
  return Math.max(unit === 'g' || unit === 'ml' ? 1 : 0.25, value);
};

const convertQuantity = (quantity, sourceUnit, targetUnit, name) => {
  const q = Number(quantity);
  if (!Number.isFinite(q) || q <= 0) return 1;
  if (sourceUnit === targetUnit) return normalizeQuantity(q, targetUnit);

  const group = getUnitGroup(name);
  const ml = sourceUnit === 'ml' ? q
    : sourceUnit === 'muỗng canh' ? q * 15
      : sourceUnit === 'muỗng cà phê' ? q * 5
        : null;
  const spoonTeaspoons = sourceUnit === 'muỗng canh' ? q * 3
    : sourceUnit === 'muỗng cà phê' ? q
      : sourceUnit === 'ml' ? q / 5
        : null;

  let converted;
  if (targetUnit === 'ml') {
    if (ml !== null) converted = ml;
    else converted = q * (/^dầu ăn$/u.test(keyOf(name)) ? 1.1 : 1);
  } else if (targetUnit === 'g') {
    if (sourceUnit === 'g') converted = q;
    else if (group === 'sugar' || group === 'spice' || group === 'solid') {
      if (sourceUnit === 'muỗng canh') converted = q * getGramsPerTablespoon(name);
      else converted = (spoonTeaspoons ?? q / 5) * getGramsPerTeaspoon(name);
    } else {
      converted = ml ?? q;
    }
  } else if (targetUnit === 'muỗng canh') {
    if (sourceUnit === 'g') converted = q / getGramsPerTablespoon(name);
    else converted = (ml ?? q * 5) / 15;
  } else {
    if (sourceUnit === 'g') converted = q / getGramsPerTeaspoon(name);
    else converted = (ml ?? q * 15) / 5;
  }
  return normalizeQuantity(converted, targetUnit);
};

const normalizeRecipeIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) throw new Error('Có công thức không có mảng ingredients hợp lệ.');
  const merged = new Map();
  for (const item of ingredients) {
    if (!item || typeof item !== 'object') throw new Error('Phát hiện dòng nguyên liệu không phải object.');
    const names = splitNames(item.name);
    const quantity = Number(item.quantity);
    const sourceUnit = typeof item.unit === 'string' ? item.unit.trim() : '';
    const share = Number.isFinite(quantity) && quantity > 0 ? quantity / names.length : 1;
    for (const name of names) {
      const unit = getTargetUnit(name);
      const converted = convertQuantity(share, sourceUnit, unit, name);
      const key = duplicateKeyOf(name);
      const previous = merged.get(key);
      if (previous) previous.quantity = normalizeQuantity(previous.quantity + converted, unit);
      else merged.set(key, { name, quantity: converted, unit });
    }
  }
  return [...merged.values()];
};

const withoutIngredients = (recipe) => {
  const { ingredients, ...otherFields } = recipe;
  return otherFields;
};

const collectStats = (recipes) => {
  const names = new Map();
  const nameUnits = new Map();
  const unitRows = Object.fromEntries([...allowedUnits].map((unit) => [unit, 0]));
  let rows = 0;
  let invalidRows = 0;
  let nfdNames = 0;
  let forbiddenNames = 0;
  let compoundNames = 0;
  let badRoundedQuantities = 0;
  let duplicateRows = 0;
  let multiUnitNames = 0;
  for (const recipe of recipes) {
    const localNames = new Set();
    for (const item of recipe.ingredients) {
      rows += 1;
      if (!item?.name?.trim() || !Number.isFinite(item.quantity) || item.quantity <= 0 || !allowedUnits.has(item.unit)) invalidRows += 1;
      if (item.name.normalize('NFC') !== item.name) nfdNames += 1;
      if (/[\/…]|\.\.\./u.test(item.name)) forbiddenNames += 1;
      if (/,|\s+(?:và|hoặc)\s+/iu.test(item.name)) compoundNames += 1;
      if (item.unit === 'g' || item.unit === 'ml') {
        if (item.quantity < 1 || (item.quantity >= 10 && !Number.isInteger(item.quantity))
          || (item.quantity < 10 && Math.abs(item.quantity * 10 - Math.round(item.quantity * 10)) > 1e-8)) badRoundedQuantities += 1;
      } else if (item.quantity < 0.25
        || (item.quantity < 2 && Math.abs(item.quantity * 4 - Math.round(item.quantity * 4)) > 1e-8)
        || (item.quantity >= 2 && Math.abs(item.quantity * 2 - Math.round(item.quantity * 2)) > 1e-8)) badRoundedQuantities += 1;
      unitRows[item.unit] = (unitRows[item.unit] || 0) + 1;
      const key = duplicateKeyOf(item.name);
      if (localNames.has(key)) duplicateRows += 1;
      localNames.add(key);
      names.set(item.name, (names.get(item.name) || 0) + 1);
      if (!nameUnits.has(key)) nameUnits.set(key, new Set());
      nameUnits.get(key).add(item.unit);
    }
  }
  for (const units of nameUnits.values()) if (units.size > 1) multiUnitNames += 1;
  return { recipes: recipes.length, rows, uniqueNames: names.size, invalidRows, nfdNames, forbiddenNames, compoundNames, badRoundedQuantities, duplicateRows, multiUnitNames, unitRows, names };
};

const ambiguityPattern = /tùy chọn|tùy thích|topping|gia vị|nguyên liệu|ăn kèm|hỗn hợp|món ăn|đồ ăn|dây buộc|tăm tre|hoặc|\bcho nước chấm\b/iu;
const makeAmbiguityReport = (recipes) => {
  const result = new Map();
  for (const recipe of recipes) for (const item of recipe.ingredients) {
    if (!ambiguityPattern.test(item.name)) continue;
    const mapped = splitNames(item.name);
    result.set(item.name, mapped.map((name) => `${name} (${getTargetUnit(name)})`).join(', '));
  }
  return [...result].sort(([a], [b]) => a.localeCompare(b, 'vi')).map(([source, handling]) => ({ source, handling }));
};

const roundTripCheck = async (expectedCount, expectedOtherFields) => {
  const written = JSON.parse((await fs.readFile(recipesPath, 'utf8')).replace(/^\uFEFF/, ''));
  const sameOtherFields = written.length === expectedCount && written.every((recipe, index) =>
    JSON.stringify(withoutIngredients(recipe)) === JSON.stringify(expectedOtherFields[index]));
  return { written, sameOtherFields };
};

const main = async () => {
  const raw = await fs.readFile(recipesPath, 'utf8');
  const recipes = JSON.parse(raw.replace(/^\uFEFF/, ''));
  if (!Array.isArray(recipes)) throw new Error('recipes.json phải chứa một mảng JSON.');
  if (recipes.length !== expectedRecipeCount) throw new Error(`Số công thức hiện tại là ${recipes.length}, cần rà lại trước khi sửa (kỳ vọng ${expectedRecipeCount}).`);
  if (recipes.some((recipe) => !recipe || typeof recipe !== 'object' || !Array.isArray(recipe.ingredients))) {
    throw new Error('Có công thức không có mảng ingredients; dừng để tránh làm sai dữ liệu.');
  }

  const before = collectStats(recipes);
  const originalOtherFields = recipes.map(withoutIngredients);
  try {
    await fs.access(backupPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.copyFile(recipesPath, backupPath, fsConstants.COPYFILE_EXCL);
  }
  let reportSource = recipes;
  try {
    reportSource = JSON.parse((await fs.readFile(backupPath, 'utf8')).replace(/^\uFEFF/, ''));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const ambiguityReport = makeAmbiguityReport(reportSource);

  const standardized = recipes.map((recipe) => ({ ...recipe, ingredients: normalizeRecipeIngredients(recipe.ingredients) }));
  const after = collectStats(standardized);
  const otherFieldsUnchanged = standardized.every((recipe, index) =>
    JSON.stringify(withoutIngredients(recipe)) === JSON.stringify(originalOtherFields[index]));
  const noErrors = after.recipes === expectedRecipeCount
    && otherFieldsUnchanged
    && after.invalidRows === 0
    && after.multiUnitNames === 0
    && after.nfdNames === 0
    && after.forbiddenNames === 0
    && after.compoundNames === 0
    && after.badRoundedQuantities === 0
    && after.duplicateRows === 0;
  if (!noErrors) {
    throw new Error(`Xác minh trước khi ghi thất bại: ${JSON.stringify({ after: { ...after, names: undefined }, otherFieldsUnchanged })}`);
  }

  const tempPath = path.join(dataDirectory, `.recipes-${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(tempPath, `${JSON.stringify(standardized, null, 2)}\n`, 'utf8');
    await fs.rename(tempPath, recipesPath);
  } catch (error) {
    await fs.unlink(tempPath).catch(() => {});
    throw error;
  }

  const persisted = await roundTripCheck(standardized.length, originalOtherFields);
  const persistedStats = collectStats(persisted.written);
  const persistedErrors = {
    recipeCountChanged: persisted.written.length !== expectedRecipeCount,
    otherFieldsChanged: !persisted.sameOtherFields,
    invalidRows: persistedStats.invalidRows,
    multiUnitNames: persistedStats.multiUnitNames,
    nfdNames: persistedStats.nfdNames,
    slashOrEllipsisNames: persistedStats.forbiddenNames,
    compoundNames: persistedStats.compoundNames,
    badRoundedQuantities: persistedStats.badRoundedQuantities,
    duplicateNamesInRecipe: persistedStats.duplicateRows
  };
  if (Object.values(persistedErrors).some((value) => value !== 0 && value !== false)) {
    throw new Error(`Xác minh sau khi ghi thất bại: ${JSON.stringify(persistedErrors)}`);
  }

  const top20 = [...persistedStats.names]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi'))
    .slice(0, 20)
    .map(([name, count]) => ({ name, count, unit: getTargetUnit(name) }));
  console.log(JSON.stringify({
    verification: {
      recipeCount: `${before.recipes} -> ${persistedStats.recipes}`,
      ingredients: `${before.rows} -> ${persistedStats.rows}`,
      nonIngredientFieldsUnchanged: persisted.sameOtherFields,
      invalidIngredientRows: persistedStats.invalidRows,
      namesWithMultipleUnits: persistedStats.multiUnitNames,
      nfdNames: persistedStats.nfdNames,
      namesWithSlashOrEllipsis: persistedStats.forbiddenNames,
      remainingCompoundNames: persistedStats.compoundNames,
      badRoundedQuantities: persistedStats.badRoundedQuantities,
      duplicateNamesWithinRecipe: persistedStats.duplicateRows
    },
    uniqueIngredientNames: `${before.uniqueNames} -> ${persistedStats.uniqueNames}`,
    rowsByUnit: persistedStats.unitRows,
    top20,
    ambiguousNamesAndHandling: ambiguityReport,
    backup: path.basename(backupPath),
    result: 'OK'
  }, null, 2));
};

main().catch((error) => {
  console.error('Ingredient standardization failed:', error.message);
  process.exitCode = 1;
});
