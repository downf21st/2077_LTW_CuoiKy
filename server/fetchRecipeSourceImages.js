const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const fileConstants = require('node:fs').constants;
const os = require('node:os');
const path = require('node:path');

const dataDirectory = path.join(__dirname, 'data');
const recipesFile = path.join(dataDirectory, 'recipes.json');
const backupFile = path.join(dataDirectory, 'recipes.before-source-image-fetch.json');
const defaultSource = path.join(
  os.homedir(),
  'Downloads',
  'Tuan 2',
  'cooked-recipes-with-steps.json'
);
const minimumRequestInterval = 800;
let nextRequestAt = 0;
let requestQueue = Promise.resolve();

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const getRequestSlot = async () => {
  let release;
  const previous = requestQueue;
  requestQueue = new Promise((resolve) => { release = resolve; });
  await previous;
  await delay(Math.max(0, nextRequestAt - Date.now()));
  nextRequestAt = Date.now() + minimumRequestInterval;
  release();
};

const imageFromRecipeJsonLd = (html, pageUrl) => {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1].replace(/&quot;/g, '"'));
      const nodes = Array.isArray(parsed)
        ? parsed
        : [parsed, ...(Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [])];

      for (const node of nodes) {
        const types = Array.isArray(node?.['@type'])
          ? node['@type']
          : [node?.['@type']];
        if (!types.includes('Recipe')) continue;

        const images = Array.isArray(node.image) ? node.image : [node.image];
        for (const image of images) {
          const candidate = typeof image === 'string'
            ? image
            : image?.url ?? image?.contentUrl;
          if (!candidate) continue;

          const url = new URL(candidate, pageUrl);
          if (url.protocol === 'https:' && !/logo|placeholder/i.test(url.pathname)) {
            return url.href;
          }
        }
      }
    } catch {
      // Bỏ qua JSON-LD không hợp lệ, tiếp tục tìm khối Recipe khác.
    }
  }

  return null;
};

const fetchRecipeImage = async (sourceUrl) => {
  if (!/^https:\/\//i.test(sourceUrl)) return null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await getRequestSlot();
    try {
      const response = await fetch(sourceUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow'
      });

      if (response.status === 429 || response.status >= 500) {
        await response.body?.cancel();
        await delay(1500 * (attempt + 1));
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        return null;
      }

      return imageFromRecipeJsonLd(await response.text(), response.url);
    } catch (error) {
      if (attempt === 2) return null;
      await delay(1000 * (attempt + 1));
    }
  }

  return null;
};

const main = async () => {
  const sourceFile = process.argv[2] || defaultSource;
  const sourceData = JSON.parse(await fs.readFile(sourceFile, 'utf8'));
  const recipes = JSON.parse(await fs.readFile(recipesFile, 'utf8'));
  if (!Array.isArray(sourceData) || !Array.isArray(recipes)) {
    throw new Error('Cả file nguồn và recipes.json phải chứa mảng công thức.');
  }

  const requestedLimit = Number(process.argv[3]);
  const sourceRecipes = Number.isSafeInteger(requestedLimit) && requestedLimit > 0
    ? sourceData.slice(0, requestedLimit)
    : sourceData;
  const recipesById = new Map(recipes.map((recipe) => [String(recipe.id), recipe]));
  let updated = 0;
  let retained = 0;
  let completed = 0;
  const workerCount = 2;
  let cursor = 0;

  const worker = async () => {
    while (cursor < sourceRecipes.length) {
      const index = cursor++;
      const sourceRecipe = sourceRecipes[index];
      const recipe = recipesById.get(String(sourceRecipe.id));
      const image = recipe && sourceRecipe.sourceUrl
        ? await fetchRecipeImage(sourceRecipe.sourceUrl)
        : null;

      if (recipe && image) {
        recipe.image = image;
        updated += 1;
      } else {
        retained += 1;
      }

      completed += 1;
      if (completed % 50 === 0 || completed === sourceRecipes.length) {
        console.log(`Đã đọc ${completed}/${sourceRecipes.length} trang; lấy ảnh gốc ${updated}, giữ ảnh dự phòng ${retained}.`);
      }
    }
  };

  await fs.copyFile(recipesFile, backupFile, fileConstants.COPYFILE_EXCL).catch((error) => {
    if (error.code !== 'EEXIST') throw error;
  });
  await Promise.all(Array.from({ length: workerCount }, worker));

  const temporaryFile = path.join(dataDirectory, `.recipes-${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(temporaryFile, `${JSON.stringify(recipes, null, 2)}\n`, 'utf8');
    await fs.rename(temporaryFile, recipesFile);
  } catch (error) {
    await fs.unlink(temporaryFile).catch(() => {});
    throw error;
  }

  console.log(`Hoàn tất: ${updated} ảnh theo nguồn, ${retained} ảnh dự phòng; ${new Set(recipes.map((recipe) => recipe.image)).size} URL ảnh khác nhau.`);
};

main().catch((error) => {
  console.error('Không thể lấy ảnh theo nguồn công thức:', error);
  process.exitCode = 1;
});
