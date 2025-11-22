import type { Level } from '../types/game.types'

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "螺旋手帕",
    category: "beginner",
    difficulty: "easy",
    description: "学习最基础的螺旋扎染技法，创作一块简单的手帕",
    targetPattern: {
      id: "pattern-spiral-basic",
      name: "基础螺旋",
      type: "spiral",
      category: "traditional",
      thumbnail: "/game/patterns/spiral-basic.svg",
      difficulty: 1,
      description: "最经典的螺旋扎染图案",
      instructions: [
        "从布料中心点开始",
        "顺时针方向旋转折叠",
        "用橡皮筋固定中心",
        "浸染2-3次"
      ],
      metadata: {
        origin: "中国传统扎染",
        history: "螺旋纹是最古老的扎染图案之一",
        culturalMeaning: "象征生生不息，螺旋向上"
      }
    },
    allowedTools: ["fold-spiral", "rubber-band", "dye-blue"],
    fabricType: "cotton",
    fabricSize: {
      width: 300,
      height: 300
    },
    timeLimit: 300,
    hints: [
      "💡 从布料正中心开始旋转",
      "💡 保持均匀的旋转力度",
      "💡 橡皮筋要扎紧但不要过紧",
      "💡 第一次浸染时间不要太长"
    ],
    rewards: {
      coins: 50,
      exp: 100
    },
    starConditions: {
      oneStar: { similarity: 0.6, time: 300 },
      twoStar: { similarity: 0.8, time: 240 },
      threeStar: { similarity: 0.95, time: 180 }
    },
    isUnlocked: true,
    thumbnail: "/game/levels/level-1-thumb.svg"
  },
  {
    id: 2,
    name: "条纹围巾",
    category: "beginner",
    difficulty: "easy",
    description: "掌握平行折叠的扎染技巧，制作一条有规律条纹的围巾",
    targetPattern: {
      id: "pattern-stripe-parallel",
      name: "平行条纹",
      type: "stripe",
      category: "traditional",
      thumbnail: "/game/patterns/stripe-parallel.svg",
      difficulty: 1,
      description: "简单而经典的平行条纹图案",
      instructions: [
        "将布料进行风琴式折叠",
        "每折约5cm宽度",
        "用橡皮筋间隔捆扎",
        "浸染3-4次"
      ],
      metadata: {
        origin: "日式扎染",
        history: "条纹图案在日本被称为'縞'",
        culturalMeaning: "简约而不失优雅"
      }
    },
    allowedTools: ["fold-accordion", "rubber-band", "dye-blue"],
    fabricType: "cotton",
    fabricSize: {
      width: 400,
      height: 150
    },
    timeLimit: 360,
    hints: [
      "💡 保持每一折的宽度一致",
      "💡 橡皮筋的间距决定条纹间距",
      "💡 捆扎位置要对称",
      "💡 多次浸染可以加深颜色"
    ],
    rewards: {
      coins: 60,
      exp: 120
    },
    starConditions: {
      oneStar: { similarity: 0.65, time: 360 },
      twoStar: { similarity: 0.82, time: 300 },
      threeStar: { similarity: 0.95, time: 240 }
    },
    isUnlocked: true,
    thumbnail: "/game/levels/level-2-thumb.svg"
  },
  {
    id: 3,
    name: "圆点抱枕",
    category: "beginner",
    difficulty: "easy",
    description: "学会用捆扎创造圆点图案，装饰一个方形抱枕套",
    targetPattern: {
      id: "pattern-dot-grid",
      name: "网格圆点",
      type: "dot",
      category: "modern",
      thumbnail: "/game/patterns/dot-grid.svg",
      difficulty: 2,
      description: "规则排列的圆点图案",
      instructions: [
        "在布料上标记圆点位置",
        "提起每个点用橡皮筋捆扎",
        "确保每个点的大小一致",
        "浸染2-3次"
      ],
      metadata: {
        origin: "现代创新技法",
        culturalMeaning: "波点代表活力与青春"
      }
    },
    allowedTools: ["marker", "rubber-band", "dye-blue"],
    fabricType: "cotton",
    fabricSize: {
      width: 400,
      height: 400
    },
    timeLimit: 420,
    hints: [
      "💡 先用记号笔标记圆点位置",
      "💡 从中心向外均匀分布",
      "💡 每个凸起的高度要一致",
      "💡 捆扎要紧实，防止染料渗透"
    ],
    rewards: {
      coins: 70,
      exp: 150,
      items: ["tool-marker-advanced"]
    },
    starConditions: {
      oneStar: { similarity: 0.65, time: 420 },
      twoStar: { similarity: 0.80, time: 360 },
      threeStar: { similarity: 0.92, time: 300 }
    },
    isUnlocked: true,
    thumbnail: "/game/levels/level-3-thumb.svg"
  },
  {
    id: 4,
    name: "花卉蜡染",
    category: "intermediate",
    difficulty: "medium",
    description: "初步尝试蜡染工艺，在布料上绘制简单的花卉图案",
    targetPattern: {
      id: "pattern-flower-wax",
      name: "简约花卉",
      type: "custom",
      category: "traditional",
      thumbnail: "/game/patterns/flower-wax.svg",
      difficulty: 3,
      description: "蜡染技法的入门图案",
      instructions: [
        "用蜡笔在白布上绘制花朵轮廓",
        "涂抹蜡层要均匀",
        "浸染时蜡会防止染料渗透",
        "去蜡后显现白色图案"
      ],
      metadata: {
        origin: "中国贵州蜡染",
        history: "蜡染已有2000多年历史",
        culturalMeaning: "花卉图案代表自然美好"
      }
    },
    allowedTools: ["wax-pen", "brush", "dye-blue", "iron"],
    fabricType: "cotton",
    fabricSize: {
      width: 350,
      height: 350
    },
    timeLimit: 480,
    hints: [
      "💡 蜡层要有一定厚度才能防染",
      "💡 注意控制蜡笔的力度",
      "💡 花瓣可以用重叠笔触表现层次",
      "💡 染色后需要熨烫去蜡"
    ],
    rewards: {
      coins: 100,
      exp: 200,
      items: ["tool-wax-advanced"],
      achievement: "wax-master-beginner"
    },
    starConditions: {
      oneStar: { similarity: 0.60, time: 480 },
      twoStar: { similarity: 0.75, time: 420 },
      threeStar: { similarity: 0.90, time: 360 }
    },
    isUnlocked: true,
    thumbnail: "/game/levels/level-4-thumb.svg"
  },
  {
    id: 5,
    name: "云纹桌布",
    category: "intermediate",
    difficulty: "medium",
    description: "复刻传统云纹图案，制作一块精美的桌布",
    targetPattern: {
      id: "pattern-cloud-traditional",
      name: "传统云纹",
      type: "custom",
      category: "traditional",
      thumbnail: "/game/patterns/cloud-traditional.svg",
      difficulty: 4,
      description: "经典的中式云纹图案",
      instructions: [
        "使用多点捆扎技法",
        "创造云朵般的晕染效果",
        "把握染液的浓度",
        "多次浸染叠加层次"
      ],
      metadata: {
        origin: "中国传统纹样",
        history: "云纹在汉代就已广泛使用",
        culturalMeaning: "云朵象征吉祥如意"
      }
    },
    allowedTools: ["fold-radial", "rubber-band", "string", "dye-blue"],
    fabricType: "linen",
    fabricSize: {
      width: 500,
      height: 500
    },
    timeLimit: 540,
    hints: [
      "💡 云纹需要不规则的捆扎点",
      "💡 用手指捏起布料形成凸起",
      "💡 控制染液停留时间",
      "💡 晕染边界要自然过渡"
    ],
    rewards: {
      coins: 120,
      exp: 250
    },
    starConditions: {
      oneStar: { similarity: 0.55, time: 540 },
      twoStar: { similarity: 0.70, time: 480 },
      threeStar: { similarity: 0.85, time: 420 }
    },
    isUnlocked: false, // 需要完成前4关
    thumbnail: "/game/levels/level-5-thumb.svg"
  },
  {
    id: 6,
    name: "冰裂纹大作",
    category: "master",
    difficulty: "hard",
    description: "挑战复杂的冰裂纹技法，创作大师级作品",
    targetPattern: {
      id: "pattern-ice-crack",
      name: "冰裂纹",
      type: "custom",
      category: "traditional",
      thumbnail: "/game/patterns/ice-crack.svg",
      difficulty: 5,
      description: "最具挑战性的扎染图案之一",
      instructions: [
        "先将布料完全浸湿",
        "揉成紧实的球状",
        "用绳子紧密缠绕",
        "浸染后会产生自然裂纹效果"
      ],
      metadata: {
        origin: "日本鹿子絞り技法演变",
        history: "模仿自然界冰裂的纹理",
        culturalMeaning: "破碎中蕴含美感"
      }
    },
    allowedTools: ["fold-crumple", "string", "clamp", "dye-blue", "dye-indigo"],
    fabricType: "silk",
    fabricSize: {
      width: 600,
      height: 600
    },
    timeLimit: 600,
    hints: [
      "💡 揉搓布料要充分且均匀",
      "💡 绳子缠绕要有足够压力",
      "💡 可以尝试二次浸染加深对比",
      "💡 丝绸材质更容易出现细腻纹理"
    ],
    rewards: {
      coins: 200,
      exp: 500,
      items: ["fabric-silk-premium"],
      achievement: "master-craftsman"
    },
    starConditions: {
      oneStar: { similarity: 0.50, time: 600 },
      twoStar: { similarity: 0.65, time: 540 },
      threeStar: { similarity: 0.80, time: 480 }
    },
    isUnlocked: false, // 需要完成前5关并达到特定等级
    thumbnail: "/game/levels/level-6-thumb.svg"
  }
]

// 导出关卡查询工具函数
export const getLevelById = (id: number): Level | undefined => {
  return LEVELS.find(level => level.id === id)
}

export const getUnlockedLevels = (): Level[] => {
  return LEVELS.filter(level => level.isUnlocked)
}

export const getLevelsByCategory = (category: Level['category']): Level[] => {
  return LEVELS.filter(level => level.category === category)
}
