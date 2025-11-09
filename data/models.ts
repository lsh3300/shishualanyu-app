// 模拟课程数据
export const coursesData = {
  "1": {
    id: "1",
    title: "传统扎染基础入门课程",
    instructor: {
      name: "李师傅",
      avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
      bio: "从事蓝染工艺30年，国家级非物质文化遗产传承人",
    },
    duration: "2小时30分",
    students: 1234,
    rating: 4.8,
    thumbnail: "/tie-dye-tutorial-hands-on.jpg",
    isFree: true,
    difficulty: "入门",
    category: "扎染",
    description: "本课程将带您深入了解传统扎染工艺的精髓，从基础理论到实际操作，让您掌握这门古老而美丽的艺术。",
    chapters: [
      { id: "1", title: "扎染历史与文化背景", duration: "15分钟", isFree: true },
      { id: "2", title: "工具与材料准备", duration: "20分钟", isFree: true },
      { id: "3", title: "基础扎染技法演示", duration: "45分钟", isFree: false },
      { id: "4", title: "图案设计与创作", duration: "35分钟", isFree: false },
      { id: "5", title: "染色过程详解", duration: "25分钟", isFree: false },
    ],
    materials: [
      {
        id: "1",
        name: "扎染入门材料包",
        price: 68,
        image: "/placeholder.svg",
        description: "包含棉布、橡皮筋、染料等全套材料",
      },
      {
        id: "2",
        name: "专业扎染工具套装",
        price: 128,
        image: "/placeholder.svg",
        description: "专业扎染夹具、刷子、手套等工具",
      },
    ],
  },
  "2": {
    id: "2",
    title: "扎染进阶技法与创作",
    instructor: {
      name: "王老师",
      avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
      bio: "扎染艺术创作专家，擅长将传统工艺与现代设计结合",
    },
    duration: "3小时15分",
    students: 987,
    rating: 4.9,
    thumbnail: "/traditional-indigo-dyeing-workshop.jpg",
    isFree: false,
    price: 168,
    difficulty: "进阶",
    category: "扎染",
    description: "深入学习扎染的高级技法，包括复杂图案设计、多色染色技术等，提升您的扎染创作水平。",
    chapters: [
      { id: "1", title: "高级扎染技法回顾", duration: "20分钟", isFree: true },
      { id: "2", title: "复杂图案设计原理", duration: "45分钟", isFree: false },
      { id: "3", title: "多色染色技术", duration: "50分钟", isFree: false },
      { id: "4", title: "扎染作品创作实践", duration: "70分钟", isFree: false },
    ],
    materials: [
      {
        id: "1",
        name: "高级扎染材料包",
        price: 128,
        image: "/placeholder.svg",
        description: "包含多种染料、高级布料、专业工具等",
      },
      {
        id: "2",
        name: "扎染设计图集",
        price: 58,
        image: "/placeholder.svg",
        description: "收录100+经典扎染图案设计",
      },
    ],
  },
  "3": {
    id: "3",
    title: "现代扎染艺术创作",
    instructor: {
      name: "张设计师",
      avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
      bio: "当代扎染艺术家，作品多次参加国际展览",
    },
    duration: "2小时45分",
    students: 756,
    rating: 4.7,
    thumbnail: "/modern-indigo-dyeing-art.jpg",
    isFree: false,
    price: 198,
    difficulty: "进阶",
    category: "扎染",
    description: "探索扎染在现代设计中的应用，学习如何将传统工艺与现代审美相结合，创作具有个人风格的扎染作品。",
    chapters: [
      { id: "1", title: "现代扎染艺术概述", duration: "25分钟", isFree: true },
      { id: "2", title: "扎染与时尚设计", duration: "40分钟", isFree: false },
      { id: "3", title: "扎染在家居中的应用", duration: "35分钟", isFree: false },
      { id: "4", title: "个人风格创作指导", duration: "65分钟", isFree: false },
    ],
    materials: [
      {
        id: "1",
        name: "现代扎染创作套装",
        price: 168,
        image: "/placeholder.svg",
        description: "适合现代扎染创作的专业材料包",
      },
      {
        id: "2",
        name: "扎染艺术案例集",
        price: 88,
        image: "/placeholder.svg",
        description: "收录国内外优秀扎染艺术作品",
      },
    ],
  },
  "4": {
    id: "4",
    title: "扎染工艺与商业应用",
    instructor: {
      name: "陈企业家",
      avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
      bio: "扎染品牌创始人，成功将传统工艺商业化",
    },
    duration: "1小时45分",
    students: 543,
    rating: 4.6,
    thumbnail: "/modern-indigo-dyed-fashion-products.jpg",
    isFree: false,
    price: 128,
    difficulty: "高级",
    category: "扎染",
    description: "了解扎染工艺的商业价值，学习如何将扎染产品推向市场，打造个人扎染品牌。",
    chapters: [
      { id: "1", title: "扎染市场分析", duration: "30分钟", isFree: true },
      { id: "2", title: "扎染产品开发", duration: "35分钟", isFree: false },
      { id: "3", title: "品牌建设与营销", duration: "40分钟", isFree: false },
    ],
    materials: [
      {
        id: "1",
        name: "扎染商业指南",
        price: 98,
        image: "/placeholder.svg",
        description: "从零开始打造扎染品牌的完整指南",
      },
    ],
  },
  "5": {
    id: "5",
    title: "蜡染工艺基础入门",
    instructor: {
      name: "王老师",
      avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
      bio: "苗族蜡染传承人，精通传统蜡染技艺",
    },
    duration: "3小时15分",
    students: 856,
    rating: 4.9,
    thumbnail: "/wax-resist-dyeing-technique.jpg",
    isFree: false,
    price: 199,
    difficulty: "入门",
    category: "蜡染",
    description: "学习苗族传统蜡染工艺，从蜡刀使用到图案设计，全面掌握这项非物质文化遗产技艺。",
    chapters: [
      { id: "1", title: "蜡染历史与文化", duration: "25分钟", isFree: true },
      { id: "2", title: "蜡刀使用技巧", duration: "40分钟", isFree: false },
      { id: "3", title: "基础图案绘制", duration: "50分钟", isFree: false },
      { id: "4", title: "蜡染染色工艺", duration: "70分钟", isFree: false },
    ],
    materials: [
      {
        id: "1",
        name: "蜡染入门套装",
        price: 158,
        image: "/placeholder.svg",
        description: "包含蜡刀、蜂蜡、布料等全套入门材料",
      },
    ],
  },
  "6": {
    id: "6",
    title: "传统苗族蜡染技法",
    instructor: {
      name: "陈老师",
      avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
      bio: "苗族蜡染大师，作品被多家博物馆收藏",
    },
    duration: "4小时",
    students: 723,
    rating: 4.8,
    thumbnail: "/traditional-wax-resist-cushion.jpg",
    isFree: false,
    price: 258,
    difficulty: "进阶",
    category: "蜡染",
    description: "深入学习苗族传统蜡染技法，学习绘制传统图案，掌握这门古老艺术的精髓。",
    chapters: [
      { id: "1", title: "苗族蜡染概述", duration: "30分钟", isFree: true },
      { id: "2", title: "传统图案解析", duration: "60分钟", isFree: false },
      { id: "3", title: "高级蜡染技法", duration: "80分钟", isFree: false },
      { id: "4", title: "作品创作指导", duration: "90分钟", isFree: false },
    ],
    materials: [
      {
        id: "1",
        name: "专业蜡染工具套装",
        price: 228,
        image: "/placeholder.svg",
        description: "包含多种规格蜡刀、优质蜂蜡等",
      },
      {
        id: "2",
        name: "苗族蜡染图案集",
        price: 128,
        image: "/placeholder.svg",
        description: "收录100+传统苗族蜡染图案",
      },
    ],
  },
  "7": {
    id: "7",
    title: "蜡染纹样设计与应用",
    instructor: {
      name: "张设计师",
      avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
      bio: "蜡染纹样设计师，擅长将传统纹样与现代设计结合",
    },
    duration: "2小时45分",
    students: 654,
    rating: 4.7,
    thumbnail: "/modern-indigo-dyeing-art.jpg",
    isFree: false,
    price: 178,
    difficulty: "进阶",
    category: "蜡染",
    description: "学习蜡染纹样设计原理，掌握传统纹样的现代应用，创作具有个人风格的蜡染作品。",
    chapters: [
      { id: "1", title: "蜡染纹样设计基础", duration: "35分钟", isFree: true },
      { id: "2", title: "传统纹样解析", duration: "45分钟", isFree: false },
      { id: "3", title: "现代纹样创作", duration: "55分钟", isFree: false },
      { id: "4", title: "纹样应用实践", duration: "50分钟", isFree: false },
    ],
    materials: [
      {
        id: "1",
        name: "蜡染纹样设计套装",
        price: 138,
        image: "/placeholder.svg",
        description: "包含纹样设计工具、参考书籍等",
      },
    ],
  },
  "8": {
    id: "8",
    title: "蜡染与扎染结合创作",
    instructor: {
      name: "李师傅",
      avatar: "/traditional-indigo-dyeing-master-craftsman.jpg",
      bio: "精通蜡染与扎染两种工艺，擅长将两者结合创作",
    },
    duration: "3小时30分",
    students: 921,
    rating: 4.9,
    thumbnail: "/modern-indigo-dyed-fashion-products.jpg",
    isFree: false,
    price: 238,
    difficulty: "高级",
    category: "蜡染",
    description: "学习如何将蜡染与扎染两种工艺相结合，创作更加丰富多样的蓝染艺术作品。",
    chapters: [
      { id: "1", title: "蜡染与扎染工艺比较", duration: "30分钟", isFree: true },
      { id: "2", title: "结合技法演示", duration: "70分钟", isFree: false },
      { id: "3", title: "综合创作实践", duration: "100分钟", isFree: false },
    ],
    materials: [
      {
        id: "1",
        name: "综合创作材料包",
        price: 198,
        image: "/placeholder.svg",
        description: "适合蜡染与扎染结合创作的材料包",
      },
    ],
  },
}

// 模拟产品数据
export const productsData = {
  "1": {
    id: "1",
    name: "手工扎染丝巾",
    price: 168,
    originalPrice: 228,
    images: ["/handmade-tie-dye-silk-scarf.jpg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    videos: [
      {
        id: "v1",
        url: "/videos/silk-scarf-making.mp4",
        thumbnail: "/videos/silk-scarf-making-thumb.jpg",
        title: "手工扎染丝巾制作过程",
        duration: "3:45"
      }
    ],
    sales: 234,
    isNew: true,
    discount: 26,
    description: "采用传统扎染工艺，每一条丝巾都是独一无二的艺术品。选用优质桑蚕丝，手感柔滑，色彩自然渐变。",
    craftsmanStory: {
      story:
        "这条丝巾的每一个图案都承载着我对传统工艺的敬畏。从选料到染色，每一步都不能马虎，因为我们传承的不仅是技艺，更是文化的精髓。",
      author: "李师傅",
      title: "匠人说",
    },
    specs: {
      colors: [
        { id: "blue", label: "靛蓝", available: true },
        { id: "navy", label: "深蓝", available: true },
        { id: "light-blue", label: "浅蓝", available: false },
      ],
      sizes: [
        { id: "90x90", label: "90×90cm", available: true },
        { id: "110x110", label: "110×110cm", available: true },
      ],
    },
    details: ["材质：100%桑蚕丝", "工艺：传统手工扎染", "产地：江南水乡", "保养：建议手洗，阴干", "包装：精美礼盒装"],
  },
  "2": {
    id: "2",
    name: "扎染帆布包",
    price: 128,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    videos: [
      {
        id: "v2",
        url: "/videos/canvas-bag-making.mp4",
        thumbnail: "/videos/canvas-bag-making-thumb.jpg",
        title: "扎染帆布包制作过程",
        duration: "4:20"
      }
    ],
    sales: 456,
    description: "实用与艺术结合的帆布包，采用环保材料，手工扎染图案，适合日常使用。",
    craftsmanStory: {
      story: "这个帆布包的设计灵感来源于山水之间的流动感，我希望通过扎染工艺，将自然之美融入日常生活。",
      author: "王设计师",
      title: "设计师说",
    },
    specs: {
      colors: [
        { id: "blue", label: "靛蓝", available: true },
        { id: "green", label: "青绿", available: true },
      ],
      sizes: [
        { id: "medium", label: "中号", available: true },
        { id: "large", label: "大号", available: true },
      ],
    },
    details: ["材质：环保帆布", "工艺：手工扎染", "尺寸：35×40cm", "内袋：1个主袋，1个内袋", "保养：可机洗，建议冷水"],
  },
  "3": {
    id: "3",
    name: "扎染T恤",
    price: 98,
    originalPrice: 138,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    videos: [
      {
        id: "v3",
        url: "/videos/tie-dye-tshirt-making.mp4",
        thumbnail: "/videos/tie-dye-tshirt-making-thumb.jpg",
        title: "扎染T恤制作过程",
        duration: "5:15"
      }
    ],
    sales: 789,
    discount: 29,
    description: "纯棉T恤，结合传统扎染工艺，每件都是独一无二的艺术品，舒适透气，适合日常穿着。",
    craftsmanStory: {
      story: "我希望将传统扎染工艺带入现代时尚，让更多人能够接触和喜爱这项非物质文化遗产。",
      author: "张设计师",
      title: "设计师说",
    },
    specs: {
      colors: [
        { id: "blue", label: "靛蓝", available: true },
        { id: "purple", label: "紫罗兰", available: true },
        { id: "pink", label: "粉红", available: true },
      ],
      sizes: [
        { id: "s", label: "S", available: true },
        { id: "m", label: "M", available: true },
        { id: "l", label: "L", available: true },
        { id: "xl", label: "XL", available: true },
      ],
    },
    details: ["材质：100%纯棉", "工艺：手工扎染", "版型：宽松版型", "保养：建议冷水手洗，避免暴晒"],
  },
  "4": {
    id: "4",
    name: "扎染抱枕",
    price: 88,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    videos: [
      {
        id: "v4",
        url: "/videos/cushion-making.mp4",
        thumbnail: "/videos/cushion-making-thumb.jpg",
        title: "扎染抱枕制作过程",
        duration: "3:30"
      }
    ],
    sales: 345,
    description: "家居装饰抱枕，采用扎染工艺制作的枕套，内芯为高弹力海绵，为您的家居增添艺术气息。",
    craftsmanStory: {
      story: "每一个抱枕的图案都是我精心设计的，希望它们能为您的家带来温暖和艺术的美感。",
      author: "陈工艺师",
      title: "工艺师说",
    },
    specs: {
      colors: [
        { id: "blue", label: "靛蓝", available: true },
        { id: "green", label: "青绿", available: true },
        { id: "brown", label: "棕色", available: true },
      ],
      sizes: [
        { id: "45x45", label: "45×45cm", available: true },
        { id: "50x50", label: "50×50cm", available: true },
      ],
    },
    details: ["材质：棉麻混纺枕套，高弹力海绵内芯", "工艺：手工扎染", "拉链：隐藏式拉链", "保养：枕套可拆洗，内芯不可水洗"],
  },
  "5": {
    id: "5",
    name: "扎染桌布",
    price: 198,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    videos: [
      {
        id: "v5",
        url: "/videos/tablecloth-making.mp4",
        thumbnail: "/videos/tablecloth-making-thumb.jpg",
        title: "扎染桌布制作过程",
        duration: "4:45"
      }
    ],
    sales: 123,
    description: "餐桌装饰桌布，采用传统扎染工艺，图案自然流畅，为您的用餐环境增添艺术氛围。",
    craftsmanStory: {
      story: "这张桌布的设计灵感来源于流动的水纹，希望它能为您家的餐桌带来宁静与和谐的氛围。",
      author: "刘工艺师",
      title: "工艺师说",
    },
    specs: {
      colors: [
        { id: "blue", label: "靛蓝", available: true },
        { id: "green", label: "青绿", available: true },
      ],
      sizes: [
        { id: "140x140", label: "140×140cm", available: true },
        { id: "160x160", label: "160×160cm", available: true },
      ],
    },
    details: ["材质：优质棉麻", "工艺：手工扎染", "边缘：精细包边", "保养：建议冷水手洗，阴干"],
  },
  "6": {
    id: "6",
    name: "扎染壁挂",
    price: 268,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    videos: [
      {
        id: "v6",
        url: "/videos/wall-hanging-making.mp4",
        thumbnail: "/videos/wall-hanging-making-thumb.jpg",
        title: "扎染壁挂制作过程",
        duration: "6:10"
      }
    ],
    sales: 67,
    description: "家居装饰壁挂，采用扎染工艺制作，图案独特，是您家居装饰的艺术亮点。",
    craftsmanStory: {
      story: "这个壁挂的设计融合了传统与现代元素，希望它能为您的生活空间带来艺术与文化的气息。",
      author: "赵艺术家",
      title: "艺术家说",
    },
    specs: {
      colors: [
        { id: "blue", label: "靛蓝", available: true },
        { id: "purple", label: "紫罗兰", available: true },
      ],
      sizes: [
        { id: "80x120", label: "80×120cm", available: true },
        { id: "100x150", label: "100×150cm", available: true },
      ],
    },
    details: ["材质：优质棉布", "工艺：手工扎染", "安装：顶部配有挂杆", "保养：避免阳光直射，定期除尘"],
  },
}

// 获取课程数据的函数
export function getCourseById(id: string) {
  return coursesData[id as keyof typeof coursesData] || null
}

// 获取产品数据的函数
export function getProductById(id: string) {
  return productsData[id as keyof typeof productsData] || null
}