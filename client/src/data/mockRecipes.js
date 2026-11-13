export const MOCK_RECIPES = [
  {
    id: "recipe-001",
    title: "Phở bò tái",
    description:
      "Tô phở thơm với nước dùng ninh cùng quế, hồi và gừng nướng, ăn kèm thịt bò tái và rau thơm.",
    category: "Món nước",
    cookingTime: 90,
    servings: 4,
    difficulty: "Trung bình",
    authorId: "user-001",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Bánh phở", quantity: 400, unit: "g" },
      { name: "Thịt bò phi lê", quantity: 300, unit: "g" },
      { name: "Xương bò", quantity: 800, unit: "g" },
      { name: "Gừng", quantity: 40, unit: "g" },
      { name: "Hành tây", quantity: 1, unit: "củ" },
      { name: "Hoa hồi", quantity: 3, unit: "cánh" },
      { name: "Quế", quantity: 1, unit: "thanh" },
      { name: "Hành lá", quantity: 20, unit: "g" },
    ],
    equipment: ["Nồi", "Chảo", "Dao", "Thớt", "Tô"],
    steps: [
      {
        title: "Sơ chế xương bò",
        duration: null,
        instruction:
          "Rửa sạch xương bò, chần nhanh trong nước sôi rồi rửa lại để nước dùng trong.",
      },
      {
        title: "Nướng và rang gia vị",
        duration: null,
        instruction:
          "Nướng gừng và hành tây cho thơm. Rang hoa hồi và quế trên chảo khô khoảng một phút.",
      },
      {
        title: "Ninh nước dùng",
        duration: null,
        instruction:
          "Ninh xương với 2 lít nước, gừng, hành tây, hoa hồi và quế trong khoảng 75 phút. Nêm muối và nước mắm vừa ăn.",
      },
      {
        title: "Chuẩn bị bánh phở và thịt bò",
        duration: null,
        instruction:
          "Trụng bánh phở trong nước sôi, chia vào tô. Thái thịt bò thật mỏng rồi xếp lên trên.",
      },
      {
        title: "Hoàn thành tô phở",
        duration: null,
        instruction:
          "Chan nước dùng đang sôi vào tô để làm chín thịt. Thêm hành lá và dùng nóng.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
  {
    id: "recipe-002",
    title: "Gỏi cuốn tôm thịt",
    description:
      "Gỏi cuốn thanh nhẹ với tôm, thịt ba chỉ, bún tươi và rau sống, chấm cùng tương đậu phộng.",
    category: "Món khai vị",
    cookingTime: 35,
    servings: 4,
    difficulty: "Dễ",
    authorId: "user-002",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Tôm sú", quantity: 200, unit: "g" },
      { name: "Thịt ba chỉ", quantity: 200, unit: "g" },
      { name: "Bún tươi", quantity: 200, unit: "g" },
      { name: "Bánh tráng", quantity: 10, unit: "cái" },
      { name: "Xà lách", quantity: 100, unit: "g" },
      { name: "Hẹ", quantity: 10, unit: "nhánh" },
      { name: "Tương đậu phộng", quantity: 100, unit: "ml" },
    ],
    equipment: ["Nồi", "Dao", "Thớt", "Đĩa"],
    steps: [
      {
        title: "Luộc và thái thịt",
        duration: null,
        instruction:
          "Luộc thịt ba chỉ với chút muối trong 20 phút, vớt ra để nguội rồi thái lát mỏng.",
      },
      {
        title: "Luộc và sơ chế tôm",
        duration: null,
        instruction:
          "Luộc tôm đến khi chuyển màu hồng, để nguội, bóc vỏ và chẻ đôi theo chiều dọc.",
      },
      {
        title: "Chuẩn bị bún và rau",
        duration: null,
        instruction: "Trụng bún qua nước nóng, để ráo. Rửa sạch xà lách và hẹ.",
      },
      {
        title: "Xếp nguyên liệu",
        duration: null,
        instruction:
          "Làm mềm bánh tráng bằng một lớp nước mỏng. Xếp rau, bún, thịt và tôm lên bánh tráng.",
      },
      {
        title: "Cuốn và thưởng thức",
        duration: null,
        instruction:
          "Gấp hai mép bánh tráng vào trong, cuốn chặt tay và chừa phần hẹ ló ra một đầu. Dùng với tương đậu phộng.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
  {
    id: "recipe-003",
    title: "Cơm chiên rau củ",
    description:
      "Cơm chiên tơi hạt với trứng và rau củ nhiều màu, thích hợp cho bữa ăn nhanh gọn.",
    category: "Món chính",
    cookingTime: 25,
    servings: 3,
    difficulty: "Dễ",
    authorId: "user-001",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Cơm nguội", quantity: 500, unit: "g" },
      { name: "Trứng gà", quantity: 2, unit: "quả" },
      { name: "Cà rốt", quantity: 1, unit: "củ" },
      { name: "Đậu Hà Lan", quantity: 80, unit: "g" },
      { name: "Hành lá", quantity: 15, unit: "g" },
      { name: "Nước tương", quantity: 1, unit: "muỗng canh" },
      { name: "Dầu ăn", quantity: 2, unit: "muỗng canh" },
    ],
    equipment: ["Chảo", "Dao", "Thớt", "Tô"],
    steps: [
      {
        title: "Sơ chế nguyên liệu",
        duration: null,
        instruction:
          "Đánh tan trứng với một chút muối. Cà rốt gọt vỏ, thái hạt lựu; hành lá thái nhỏ.",
      },
      {
        title: "Chiên trứng",
        duration: null,
        instruction:
          "Làm nóng chảo với một muỗng canh dầu, cho trứng vào đảo nhanh rồi trút ra đĩa.",
      },
      {
        title: "Xào rau củ",
        duration: null,
        instruction:
          "Thêm dầu còn lại, xào cà rốt và đậu Hà Lan khoảng ba phút cho vừa chín.",
      },
      {
        title: "Chiên cơm",
        duration: null,
        instruction:
          "Cho cơm nguội vào chảo, đảo tơi trên lửa vừa. Nêm nước tương rồi cho trứng trở lại.",
      },
      {
        title: "Hoàn thành món ăn",
        duration: null,
        instruction: "Đảo thêm hai phút, rắc hành lá và dùng khi cơm còn nóng.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
  {
    id: "recipe-004",
    title: "Đậu hũ sốt cà chua",
    description:
      "Đậu hũ vàng mềm phủ sốt cà chua đậm đà, dùng cùng cơm trắng cho bữa cơm gia đình.",
    category: "Món chay",
    cookingTime: 30,
    servings: 4,
    difficulty: "Dễ",
    authorId: "user-002",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Đậu hũ trắng", quantity: 400, unit: "g" },
      { name: "Cà chua", quantity: 3, unit: "quả" },
      { name: "Hành tím", quantity: 2, unit: "củ" },
      { name: "Hành lá", quantity: 15, unit: "g" },
      { name: "Nước mắm chay", quantity: 1, unit: "muỗng canh" },
      { name: "Đường", quantity: 1, unit: "muỗng cà phê" },
      { name: "Dầu ăn", quantity: 2, unit: "muỗng canh" },
    ],
    equipment: ["Chảo", "Dao", "Thớt", "Đĩa"],
    steps: [
      {
        title: "Sơ chế nguyên liệu",
        duration: null,
        instruction:
          "Thấm khô đậu hũ, cắt miếng vuông vừa ăn. Cà chua thái hạt lựu, hành tím băm nhỏ.",
      },
      {
        title: "Chiên đậu hũ",
        duration: null,
        instruction:
          "Chiên đậu hũ với một muỗng canh dầu đến khi các mặt vàng nhẹ, gắp ra đĩa.",
      },
      {
        title: "Làm sốt cà chua",
        duration: null,
        instruction:
          "Phi thơm hành tím với phần dầu còn lại. Cho cà chua vào xào đến khi mềm và ra nước.",
      },
      {
        title: "Nêm và đun sốt",
        duration: null,
        instruction:
          "Nêm nước mắm chay, đường và khoảng 60 ml nước. Đun sốt nhỏ lửa trong năm phút.",
      },
      {
        title: "Hoàn thành món ăn",
        duration: null,
        instruction:
          "Cho đậu hũ vào chảo, đảo nhẹ để sốt phủ đều rồi đun thêm ba phút. Rắc hành lá trước khi dùng.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
  {
    id: "recipe-005",
    title: "Mì xào bò rau cải",
    description:
      "Mì xào thơm lửa với thịt bò mềm, cải ngọt và nước sốt mặn ngọt dễ ăn.",
    category: "Món xào",
    cookingTime: 30,
    servings: 3,
    difficulty: "Trung bình",
    authorId: "user-001",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Mì trứng", quantity: 300, unit: "g" },
      { name: "Thịt bò", quantity: 250, unit: "g" },
      { name: "Cải ngọt", quantity: 200, unit: "g" },
      { name: "Tỏi", quantity: 3, unit: "tép" },
      { name: "Dầu hào", quantity: 1, unit: "muỗng canh" },
      { name: "Nước tương", quantity: 1, unit: "muỗng canh" },
      { name: "Dầu ăn", quantity: 2, unit: "muỗng canh" },
    ],
    equipment: ["Nồi", "Chảo", "Dao", "Thớt"],
    steps: [
      {
        title: "Ướp thịt bò",
        duration: null,
        instruction:
          "Thái thịt bò thành lát mỏng, ướp với một nửa lượng dầu hào và nước tương trong 10 phút.",
      },
      {
        title: "Luộc mì",
        duration: null,
        instruction:
          "Luộc mì theo hướng dẫn trên bao bì, xả nhanh qua nước lạnh rồi để ráo.",
      },
      {
        title: "Sơ chế rau và tỏi",
        duration: null,
        instruction: "Rửa cải ngọt, cắt khúc. Băm nhỏ tỏi.",
      },
      {
        title: "Xào thịt bò",
        duration: null,
        instruction:
          "Làm nóng chảo với một muỗng canh dầu, xào thịt bò nhanh trên lửa lớn đến khi vừa chín tới rồi gắp ra.",
      },
      {
        title: "Xào mì và rau",
        duration: null,
        instruction:
          "Thêm dầu còn lại, phi thơm tỏi, cho cải vào xào hai phút. Thêm mì, phần dầu hào và nước tương còn lại.",
      },
      {
        title: "Hoàn thành món ăn",
        duration: null,
        instruction:
          "Cho thịt bò trở lại chảo, đảo đều thêm một phút rồi tắt bếp.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
  {
    id: "recipe-006",
    title: "Gà rán giòn",
    description:
      "Gà rán vỏ giòn rụm, thịt mềm ngọt, ướp tỏi và ớt bột, ăn kèm xốt chua ngọt.",
    category: "Món chiên",
    cookingTime: 45,
    servings: 4,
    difficulty: "Khó",
    authorId: "user-001",
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Đùi gà", quantity: 800, unit: "g" },
      { name: "Bột mì", quantity: 150, unit: "g" },
      { name: "Bột bắp", quantity: 50, unit: "g" },
      { name: "Sữa tươi", quantity: 200, unit: "ml" },
      { name: "Tỏi", quantity: 4, unit: "tép" },
      { name: "Ớt bột", quantity: 1, unit: "muỗng cà phê" },
      { name: "Dầu ăn", quantity: 500, unit: "ml" },
    ],
    equipment: ["Tô", "Chảo", "Giá để ráo"],
    steps: [
      {
        title: "Ướp gà",
        duration: null,
        instruction:
          "Ướp đùi gà với tỏi băm, ớt bột, muối và sữa tươi trong ít nhất 2 tiếng.",
      },
      {
        title: "Trộn bột",
        duration: null,
        instruction: "Trộn bột mì, bột bắp và một chút muối vào tô lớn.",
      },
      {
        title: "Tẩm bột",
        duration: null,
        instruction:
          "Lăn từng miếng gà qua hỗn hợp bột, ấn nhẹ cho bột bám chặt rồi để yên 10 phút.",
      },
      {
        title: "Chiên gà",
        duration: null,
        instruction:
          "Đun dầu đến 170 độ C, chiên gà trong 12 đến 15 phút cho vàng đều, lật nhẹ giữa chừng.",
      },
      {
        title: "Để ráo và thưởng thức",
        duration: null,
        instruction: "Vớt gà ra giá để ráo dầu, dùng nóng cùng xốt chua ngọt.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
  {
    id: "recipe-007",
    title: "Pizza chảo phô mai",
    description:
      "Đế pizza mỏng giòn phủ sốt cà chua, phô mai kéo sợi và xúc xích, nướng trên chảo gang.",
    category: "Món chính",
    cookingTime: 75,
    servings: 4,
    difficulty: "Khó",
    authorId: "user-002",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Bột mì", quantity: 300, unit: "g" },
      { name: "Men khô", quantity: 1, unit: "muỗng cà phê" },
      { name: "Sốt cà chua", quantity: 120, unit: "ml" },
      { name: "Phô mai mozzarella", quantity: 200, unit: "g" },
      { name: "Xúc xích", quantity: 100, unit: "g" },
      { name: "Dầu ô liu", quantity: 2, unit: "muỗng canh" },
    ],
    equipment: ["Tô", "Khăn ẩm", "Chảo gang", "Nắp chảo"],
    steps: [
      {
        title: "Trộn và nhào bột",
        duration: null,
        instruction:
          "Trộn bột mì, men, một chút muối và 180 ml nước ấm, nhào mịn trong 10 phút.",
      },
      {
        title: "Ủ bột",
        duration: null,
        instruction:
          "Ủ bột trong tô có phủ khăn ẩm khoảng 45 phút cho nở gấp đôi.",
      },
      {
        title: "Cán bột",
        duration: null,
        instruction:
          "Cán bột thành hình tròn mỏng vừa chảo, phết dầu ô liu lên chảo gang đã làm nóng.",
      },
      {
        title: "Thêm nhân bánh",
        duration: null,
        instruction:
          "Phết sốt cà chua, rải phô mai và xúc xích thái lát lên mặt bánh.",
      },
      {
        title: "Nướng bánh",
        duration: null,
        instruction:
          "Đậy nắp, nướng lửa nhỏ 12 đến 15 phút đến khi đế giòn và phô mai chảy. Cắt miếng và dùng ngay.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
  {
    id: "recipe-008",
    title: "Burger bò phô mai",
    description:
      "Bánh burger mềm kẹp thịt bò xay áp chảo, phô mai tan chảy, cà chua và xà lách.",
    category: "Món chính",
    cookingTime: 40,
    servings: 4,
    difficulty: "Trung bình",
    authorId: "user-001",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Thịt bò xay", quantity: 400, unit: "g" },
      { name: "Bánh burger", quantity: 4, unit: "cái" },
      { name: "Phô mai lát", quantity: 4, unit: "lát" },
      { name: "Cà chua", quantity: 1, unit: "quả" },
      { name: "Xà lách", quantity: 80, unit: "g" },
      { name: "Hành tây", quantity: 1, unit: "củ" },
    ],
    equipment: ["Chảo", "Dao", "Thớt"],
    steps: [
      {
        title: "Tạo hình thịt bò",
        duration: null,
        instruction:
          "Nêm muối và tiêu vào thịt bò xay, chia làm 4 phần và nặn thành miếng dẹt.",
      },
      {
        title: "Áp chảo thịt",
        duration: null,
        instruction:
          "Áp chảo từng miếng thịt trên lửa lớn, mỗi mặt 3 đến 4 phút.",
      },
      {
        title: "Thêm phô mai",
        duration: null,
        instruction:
          "Đặt phô mai lên thịt khi vừa lật mặt cuối cho kịp tan chảy.",
      },
      {
        title: "Xếp bánh",
        duration: null,
        instruction:
          "Nướng nhẹ bánh burger, xếp xà lách, thịt, cà chua và hành tây thái vòng.",
      },
      {
        title: "Hoàn thành burger",
        duration: null,
        instruction: "Đậy nắp bánh và dùng nóng.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
  {
    id: "recipe-009",
    title: "Pancake mật ong",
    description:
      "Bánh pancake xốp mềm, ăn cùng mật ong và trái cây tươi, hợp cho bữa sáng.",
    category: "Món tráng miệng",
    cookingTime: 20,
    servings: 4,
    difficulty: "Dễ",
    authorId: "user-002",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=85",
    ingredients: [
      { name: "Bột mì", quantity: 200, unit: "g" },
      { name: "Trứng gà", quantity: 2, unit: "quả" },
      { name: "Sữa tươi", quantity: 250, unit: "ml" },
      { name: "Bột nở", quantity: 2, unit: "muỗng cà phê" },
      { name: "Đường", quantity: 2, unit: "muỗng canh" },
      { name: "Bơ", quantity: 30, unit: "g" },
      { name: "Mật ong", quantity: 3, unit: "muỗng canh" },
    ],
    equipment: ["Tô", "Chảo chống dính", "Vá"],
    steps: [
      {
        title: "Trộn nguyên liệu khô",
        duration: null,
        instruction: "Trộn bột mì, bột nở và đường trong một tô lớn.",
      },
      {
        title: "Trộn bột bánh",
        duration: null,
        instruction:
          "Đánh trứng với sữa và bơ đã đun chảy, đổ vào tô bột rồi khuấy nhẹ cho vừa tan, không cần mịn.",
      },
      {
        title: "Chiên pancake",
        duration: null,
        instruction:
          "Làm nóng chảo chống dính, múc một vá bột cho mỗi bánh. Lật khi mặt trên nổi bọt.",
      },
      {
        title: "Hoàn thành món ăn",
        duration: null,
        instruction:
          "Chiên mặt còn lại khoảng một phút, xếp chồng bánh lên đĩa và rưới mật ong.",
      },
    ],
    reviews: [],
    averageRating: 0,
  },
];
