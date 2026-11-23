const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const { getReviewStats } = require('./utils/reviewStats');

const scrypt = promisify(crypto.scrypt);
const dataDirectory = path.join(__dirname, 'data');

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });

  return [
    'scrypt',
    '16384',
    '8',
    '1',
    salt.toString('hex'),
    key.toString('hex')
  ].join('$');
};

const createIfMissing = async (fileName, getData) => {
  const filePath = path.join(dataDirectory, fileName);

  try {
    await fs.access(filePath);
    console.log(fileName + ' đã tồn tại, giữ nguyên dữ liệu.');
    return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const content = JSON.stringify(await getData(), null, 2) + '\n';
  try {
    await fs.writeFile(filePath, content, { encoding: 'utf8', flag: 'wx' });
    console.log('Đã tạo ' + fileName + '.');
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.log(fileName + ' vừa được tạo bởi tiến trình khác, giữ nguyên dữ liệu.');
      return;
    }
    throw error;
  }
};

const recipes = [
  {
    id: 'recipe-001',
    title: 'Gà kho gừng',
    description: 'Gà kho mềm với gừng thơm, nước màu và nước mắm.',
    image: 'https://cdn-i.vtcnews.vn/resize/UyS5Ytevv363eGE5da_V9zKATy3gvZK00/upload/2021/01/05/gakhogung-22460430.jpg',
    category: 'Món chính',
    cookingTime: 55,
    servings: 4,
    equipment: ['Dao', 'Thớt', 'Chảo'],
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Thịt gà', quantity: 700, unit: 'g' },
      { name: 'Gừng', quantity: 50, unit: 'g' },
      { name: 'Hành tím', quantity: 30, unit: 'g' }
    ],
    steps: [
      { title: 'Sơ chế', duration: 8, instruction: 'Rửa sạch, chặt gà vừa ăn; thái gừng và băm hành tím.' },
      { title: 'Kho gà', duration: 35, instruction: 'Ướp gà với gia vị, sau đó kho nhỏ lửa cùng gừng đến khi mềm.' }
    ],
    authorId: 'user-001',
    status: 'approved',
    reviews: [],
    averageRating: 0,
    createdAt: '2026-11-14T10:00:00.000Z'
  },
  {
    id: 'recipe-002',
    title: 'Phở bò',
    description: 'Phở bò với nước dùng thơm từ xương và gia vị.',
    image: 'https://afamilycdn.com/150157425591193600/2025/12/22/mon-an-1-17663287951681909016544-1766389491171-17663894920951576086442.jpg',
    category: 'Món nước',
    cookingTime: 120,
    servings: 4,
    equipment: ['Dao', 'Thớt', 'Nồi lớn', 'Rây'],
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Xương bò', quantity: 1000, unit: 'g' },
      { name: 'Thịt bò', quantity: 300, unit: 'g' },
      { name: 'Bánh phở', quantity: 500, unit: 'g' },
      { name: 'Hành tây', quantity: 150, unit: 'g' }
    ],
    steps: [
      { title: 'Sơ chế', duration: 10, instruction: 'Chần sạch xương bò, nướng thơm gừng và hành.' },
      { title: 'Ninh nước dùng', duration: 90, instruction: 'Ninh xương với gia vị ở lửa nhỏ, thường xuyên vớt bọt.' },
      { title: 'Hoàn thành', duration: 10, instruction: 'Trụng bánh phở, xếp thịt vào tô và chan nước dùng nóng.' }
    ],
    authorId: 'user-001',
    status: 'approved',
    reviews: [],
    averageRating: 0,
    createdAt: '2026-11-15T10:00:00.000Z'
  },
  {
    id: 'recipe-003',
    title: 'Trứng chiên hành',
    description: 'Trứng chiên mềm thơm với hành lá, dùng nóng với cơm.',
    image: 'https://cookwithchung.com/wp-content/uploads/2023/08/Vietnamese-Egg-Omelette--500x500.jpg',
    category: 'Món chính',
    cookingTime: 15,
    servings: 2,
    equipment: ['Bát', 'Đũa', 'Chảo'],
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Trứng gà', quantity: 200, unit: 'g' },
      { name: 'Hành lá', quantity: 15, unit: 'g' },
      { name: 'Nước mắm', quantity: 1, unit: 'muỗng cà phê' }
    ],
    steps: [
      { title: 'Đánh trứng', duration: 3, instruction: 'Đập trứng, nêm nước mắm và trộn hành lá thái nhỏ.' },
      { title: 'Chiên trứng', duration: 7, instruction: 'Chiên trứng với lửa vừa đến khi chín vàng hai mặt.' }
    ],
    authorId: 'user-002',
    status: 'approved',
    reviews: [],
    averageRating: 0,
    createdAt: '2026-11-16T10:00:00.000Z'
  }
];

const pendingRecipes = [
  {
    id: 'demo-pending-001',
    title: 'Bún chả Hà Nội',
    description: 'Bún ăn cùng thịt nướng, rau sống và nước chấm chua ngọt.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85',
    category: 'Món chính',
    cookingTime: 45,
    servings: 4,
    equipment: ['Bếp nướng', 'Bát', 'Dao', 'Thớt'],
    difficulty: 'Trung bình',
    ingredients: [
      { name: 'Thịt heo', quantity: 500, unit: 'g' },
      { name: 'Nước mắm', quantity: 3, unit: 'muỗng canh' },
      { name: 'Đường', quantity: 2, unit: 'muỗng cà phê' }
    ],
    steps: [
      { title: 'Ướp thịt', duration: 15, instruction: 'Thái thịt vừa ăn, trộn với nước mắm và gia vị rồi để thấm.' },
      { title: 'Nướng thịt', duration: 20, instruction: 'Nướng thịt đến khi chín thơm, trở đều để thịt không cháy.' },
      { title: 'Pha nước chấm', duration: 5, instruction: 'Pha nước mắm với đường, nước và gia vị vừa ăn; dùng cùng bún và rau.' }
    ],
    authorId: 'user-001',
    status: 'pending',
    reviews: [],
    averageRating: 0,
    createdAt: '2026-11-23T08:00:00.000Z'
  },
  {
    id: 'demo-pending-002',
    title: 'Gỏi cuốn tôm thịt',
    description: 'Gỏi cuốn tươi với tôm, thịt, rau thơm và nước chấm.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85',
    category: 'Món khai vị',
    cookingTime: 30,
    servings: 4,
    equipment: ['Nồi', 'Dao', 'Thớt', 'Đĩa'],
    difficulty: 'Dễ',
    ingredients: [
      { name: 'Tôm', quantity: 250, unit: 'g' },
      { name: 'Thịt heo', quantity: 200, unit: 'g' },
      { name: 'Bún', quantity: 200, unit: 'g' }
    ],
    steps: [
      { title: 'Luộc nhân', duration: 15, instruction: 'Luộc tôm và thịt chín, để nguội rồi thái thịt thành lát mỏng.' },
      { title: 'Cuốn gỏi', duration: 10, instruction: 'Làm mềm bánh tráng, thêm bún, rau, thịt và tôm rồi cuốn chặt tay.' },
      { title: 'Pha nước chấm', duration: 5, instruction: 'Pha nước chấm vừa vị và dùng kèm gỏi cuốn.' }
    ],
    authorId: 'user-001',
    status: 'pending',
    reviews: [],
    averageRating: 0,
    createdAt: '2026-11-23T08:05:00.000Z'
  }
];

const sampleReviews = [
  { id: 'seed-review-001', userId: 'user-001', userName: 'Thành viên', rating: 5, comment: 'Công thức rõ ràng, món ăn rất ngon.', createdAt: '2026-11-23T08:10:00.000Z', hidden: false },
  { id: 'seed-review-002', userId: 'user-002', userName: 'Admin', rating: 4, comment: 'Dễ làm và hợp khẩu vị gia đình.', createdAt: '2026-11-23T08:12:00.000Z', hidden: false },
  { id: 'seed-review-003', userId: 'user-001', userName: 'Thành viên', rating: 5, comment: 'Mình sẽ nấu lại món này.', createdAt: '2026-11-23T08:15:00.000Z', hidden: false }
];

const writeJsonSafely = async (filePath, data) => {
  const temporaryPath = filePath + '.' + crypto.randomUUID() + '.tmp';
  try {
    await fs.writeFile(temporaryPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.unlink(temporaryPath).catch(() => {});
    throw error;
  }
};

const addDemoData = async () => {
  const recipesFile = path.join(dataDirectory, 'recipes.json');
  const recipes = JSON.parse(await fs.readFile(recipesFile, 'utf8'));
  if (!Array.isArray(recipes)) throw new Error('recipes.json phải chứa một mảng JSON.');

  let changed = false;
  for (const pendingRecipe of pendingRecipes) {
    if (!recipes.some((recipe) => String(recipe.id) === pendingRecipe.id)) {
      recipes.push(pendingRecipe);
      changed = true;
    }
  }

  const reviewTargets = recipes
    .filter((recipe) => recipe.status !== 'pending')
    .slice(0, sampleReviews.length);
  reviewTargets.forEach((recipe, index) => {
    if (!Array.isArray(recipe.reviews)) recipe.reviews = [];
    const review = sampleReviews[index];
    if (!recipe.reviews.some((item) => item.id === review.id)) {
      recipe.reviews.push(review);
      changed = true;
    }
    const averageRating = getReviewStats(recipe.reviews).averageRating;
    if (recipe.averageRating !== averageRating) {
      recipe.averageRating = averageRating;
      changed = true;
    }
  });

  if (changed) {
    await writeJsonSafely(recipesFile, recipes);
    console.log('Đã bổ sung dữ liệu review và công thức chờ duyệt.');
  } else {
    console.log('Dữ liệu mẫu đã có, giữ nguyên để tránh tạo trùng.');
  }
};

const main = async () => {
  await fs.mkdir(dataDirectory, { recursive: true });

  await createIfMissing('users.json', async () => [
    {
      id: 'user-001',
      fullName: 'Thành viên',
      username: 'member',
      email: 'member@cooked.test',
      role: 'member',
      bio: '',
      avatarUrl: null,
      passwordHash: await hashPassword('member123')
    },
    {
      id: 'user-002',
      fullName: 'Admin',
      username: 'admin',
      email: 'admin@cooked.test',
      role: 'admin',
      bio: '',
      avatarUrl: null,
      passwordHash: await hashPassword('admin123')
    }
  ]);

  await createIfMissing('recipes.json', async () => recipes);
  await createIfMissing('menus.json', async () => []);
  await addDemoData();
};

main().catch((error) => {
  console.error('Không thể tạo dữ liệu mẫu:', error);
  process.exitCode = 1;
});
