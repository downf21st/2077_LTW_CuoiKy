const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');

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
      { name: 'Hành tím', quantity: 2, unit: 'củ' }
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
      { name: 'Hành tây', quantity: 1, unit: 'củ' }
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
      { name: 'Trứng gà', quantity: 4, unit: 'quả' },
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
};

main().catch((error) => {
  console.error('Không thể tạo dữ liệu mẫu:', error);
  process.exitCode = 1;
});