/**
 * 蓝染创作工坊 - 精选示例作品
 * 
 * 这些作品展示了不同的蓝染风格和技法
 * 供用户学习和参考
 */

export interface SampleArtwork {
  id: string
  name: string
  description: string
  style: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  patterns: {
    patternId: string
    x: number
    y: number
    scale: number
    rotation: number
    opacity: number
    dyeDepth: number
  }[]
  thumbnail?: string
  likes: number
  createdBy: string
}

/**
 * 精选示例作品集
 */
export const SAMPLE_ARTWORKS: SampleArtwork[] = [
  // 1. 冬日雪境 - 清雅纯净
  {
    id: 'winter-wonderland',
    name: '冬日雪境',
    description: '漫天飞雪，晶莹剔透。雪花错落有致地洒落在布面，营造出宁静祥和的冬日氛围。适合初学者学习基础构图。',
    style: '自然写意',
    difficulty: 'beginner',
    tags: ['雪花', '冬季', '清雅', '对称'],
    createdBy: '蓝染工坊',
    likes: 328,
    patterns: [
      // 中心大雪花
      {
        patternId: 'snowflake',
        x: 50,
        y: 50,
        scale: 1.5,
        rotation: 0,
        opacity: 0.8,
        dyeDepth: 0.7
      },
      // 左上角雪花
      {
        patternId: 'snowflake',
        x: 25,
        y: 25,
        scale: 0.9,
        rotation: 30,
        opacity: 0.6,
        dyeDepth: 0.5
      },
      // 右上角雪花
      {
        patternId: 'snowflake',
        x: 75,
        y: 25,
        scale: 0.8,
        rotation: 60,
        opacity: 0.7,
        dyeDepth: 0.6
      },
      // 左下角雪花
      {
        patternId: 'snowflake',
        x: 25,
        y: 75,
        scale: 1.0,
        rotation: 45,
        opacity: 0.65,
        dyeDepth: 0.55
      },
      // 右下角雪花
      {
        patternId: 'snowflake',
        x: 75,
        y: 75,
        scale: 0.85,
        rotation: 15,
        opacity: 0.75,
        dyeDepth: 0.65
      },
      // 小雪花点缀（上方）
      {
        patternId: 'snowflake',
        x: 50,
        y: 15,
        scale: 0.5,
        rotation: 90,
        opacity: 0.5,
        dyeDepth: 0.4
      },
      // 小雪花点缀（下方）
      {
        patternId: 'snowflake',
        x: 50,
        y: 85,
        scale: 0.6,
        rotation: 120,
        opacity: 0.55,
        dyeDepth: 0.45
      }
    ]
  },

  // 2. 星河璀璨 - 梦幻浪漫
  {
    id: 'starry-night',
    name: '星河璀璨',
    description: '星光点点，螺旋交织。星形图案与螺旋纹路相互呼应，呈现出璀璨星空的浪漫氛围。进阶作品，考验图案组合能力。',
    style: '梦幻浪漫',
    difficulty: 'intermediate',
    tags: ['星空', '螺旋', '浪漫', '动感'],
    createdBy: '蓝染工坊',
    likes: 567,
    patterns: [
      // 中心螺旋
      {
        patternId: 'spiral',
        x: 50,
        y: 50,
        scale: 1.8,
        rotation: 0,
        opacity: 0.4,
        dyeDepth: 0.3
      },
      // 主星（中上）
      {
        patternId: 'star',
        x: 50,
        y: 30,
        scale: 1.2,
        rotation: 0,
        opacity: 0.85,
        dyeDepth: 0.8
      },
      // 左侧星群
      {
        patternId: 'star',
        x: 20,
        y: 40,
        scale: 0.8,
        rotation: 72,
        opacity: 0.75,
        dyeDepth: 0.7
      },
      {
        patternId: 'star',
        x: 30,
        y: 60,
        scale: 0.6,
        rotation: 144,
        opacity: 0.7,
        dyeDepth: 0.6
      },
      // 右侧星群
      {
        patternId: 'star',
        x: 80,
        y: 40,
        scale: 0.9,
        rotation: 36,
        opacity: 0.8,
        dyeDepth: 0.75
      },
      {
        patternId: 'star',
        x: 70,
        y: 60,
        scale: 0.7,
        rotation: 108,
        opacity: 0.72,
        dyeDepth: 0.65
      },
      // 小螺旋点缀（左下）
      {
        patternId: 'spiral',
        x: 25,
        y: 80,
        scale: 0.6,
        rotation: 90,
        opacity: 0.5,
        dyeDepth: 0.4
      },
      // 小螺旋点缀（右下）
      {
        patternId: 'spiral',
        x: 75,
        y: 80,
        scale: 0.7,
        rotation: 180,
        opacity: 0.55,
        dyeDepth: 0.45
      },
      // 细小星星装饰
      {
        patternId: 'star',
        x: 15,
        y: 20,
        scale: 0.4,
        rotation: 0,
        opacity: 0.6,
        dyeDepth: 0.5
      },
      {
        patternId: 'star',
        x: 85,
        y: 20,
        scale: 0.45,
        rotation: 72,
        opacity: 0.65,
        dyeDepth: 0.55
      }
    ]
  },

  // 3. 花开盛夏 - 华丽繁复
  {
    id: 'summer-blossom',
    name: '花开盛夏',
    description: '曼陀罗为心，花瓣环绕。繁复华丽的图案组合展现盛夏繁花似锦的壮丽景象。高级作品，适合有经验的创作者。',
    style: '华丽繁复',
    difficulty: 'advanced',
    tags: ['曼陀罗', '花卉', '华丽', '对称'],
    createdBy: '蓝染工坊',
    likes: 892,
    patterns: [
      // 中心曼陀罗
      {
        patternId: 'mandala',
        x: 50,
        y: 50,
        scale: 1.4,
        rotation: 0,
        opacity: 0.9,
        dyeDepth: 0.85
      },
      // 四角花瓣（对称布局）
      {
        patternId: 'flower',
        x: 20,
        y: 20,
        scale: 1.0,
        rotation: 45,
        opacity: 0.75,
        dyeDepth: 0.7
      },
      {
        patternId: 'flower',
        x: 80,
        y: 20,
        scale: 1.0,
        rotation: 135,
        opacity: 0.75,
        dyeDepth: 0.7
      },
      {
        patternId: 'flower',
        x: 20,
        y: 80,
        scale: 1.0,
        rotation: 315,
        opacity: 0.75,
        dyeDepth: 0.7
      },
      {
        patternId: 'flower',
        x: 80,
        y: 80,
        scale: 1.0,
        rotation: 225,
        opacity: 0.75,
        dyeDepth: 0.7
      },
      // 中间花瓣点缀（四个方向）
      {
        patternId: 'flower',
        x: 50,
        y: 12,
        scale: 0.7,
        rotation: 0,
        opacity: 0.65,
        dyeDepth: 0.6
      },
      {
        patternId: 'flower',
        x: 88,
        y: 50,
        scale: 0.7,
        rotation: 90,
        opacity: 0.65,
        dyeDepth: 0.6
      },
      {
        patternId: 'flower',
        x: 50,
        y: 88,
        scale: 0.7,
        rotation: 180,
        opacity: 0.65,
        dyeDepth: 0.6
      },
      {
        patternId: 'flower',
        x: 12,
        y: 50,
        scale: 0.7,
        rotation: 270,
        opacity: 0.65,
        dyeDepth: 0.6
      },
      // 小花装饰
      {
        patternId: 'flower',
        x: 35,
        y: 35,
        scale: 0.5,
        rotation: 22.5,
        opacity: 0.6,
        dyeDepth: 0.5
      },
      {
        patternId: 'flower',
        x: 65,
        y: 35,
        scale: 0.5,
        rotation: 67.5,
        opacity: 0.6,
        dyeDepth: 0.5
      },
      {
        patternId: 'flower',
        x: 65,
        y: 65,
        scale: 0.5,
        rotation: 112.5,
        opacity: 0.6,
        dyeDepth: 0.5
      },
      {
        patternId: 'flower',
        x: 35,
        y: 65,
        scale: 0.5,
        rotation: 157.5,
        opacity: 0.6,
        dyeDepth: 0.5
      }
    ]
  },

  // 4. 几何之美 - 现代简约
  {
    id: 'geometric-harmony',
    name: '几何之美',
    description: '六角与菱形的完美融合，展现现代几何美学。规整的排列中蕴含韵律感，适合追求简约风格的创作者。',
    style: '现代简约',
    difficulty: 'intermediate',
    tags: ['几何', '六角', '菱形', '现代'],
    createdBy: '蓝染工坊',
    likes: 445,
    patterns: [
      // 中心六角
      {
        patternId: 'hexagon',
        x: 50,
        y: 50,
        scale: 1.3,
        rotation: 0,
        opacity: 0.8,
        dyeDepth: 0.75
      },
      // 周围六个六角（蜂巢式排列）
      {
        patternId: 'hexagon',
        x: 50,
        y: 25,
        scale: 0.9,
        rotation: 0,
        opacity: 0.7,
        dyeDepth: 0.65
      },
      {
        patternId: 'hexagon',
        x: 71.65,
        y: 37.5,
        scale: 0.9,
        rotation: 0,
        opacity: 0.7,
        dyeDepth: 0.65
      },
      {
        patternId: 'hexagon',
        x: 71.65,
        y: 62.5,
        scale: 0.9,
        rotation: 0,
        opacity: 0.7,
        dyeDepth: 0.65
      },
      {
        patternId: 'hexagon',
        x: 50,
        y: 75,
        scale: 0.9,
        rotation: 0,
        opacity: 0.7,
        dyeDepth: 0.65
      },
      {
        patternId: 'hexagon',
        x: 28.35,
        y: 62.5,
        scale: 0.9,
        rotation: 0,
        opacity: 0.7,
        dyeDepth: 0.65
      },
      {
        patternId: 'hexagon',
        x: 28.35,
        y: 37.5,
        scale: 0.9,
        rotation: 0,
        opacity: 0.7,
        dyeDepth: 0.65
      },
      // 菱形点缀（四个角）
      {
        patternId: 'diamond',
        x: 15,
        y: 15,
        scale: 0.6,
        rotation: 45,
        opacity: 0.6,
        dyeDepth: 0.55
      },
      {
        patternId: 'diamond',
        x: 85,
        y: 15,
        scale: 0.6,
        rotation: 45,
        opacity: 0.6,
        dyeDepth: 0.55
      },
      {
        patternId: 'diamond',
        x: 15,
        y: 85,
        scale: 0.6,
        rotation: 45,
        opacity: 0.6,
        dyeDepth: 0.55
      },
      {
        patternId: 'diamond',
        x: 85,
        y: 85,
        scale: 0.6,
        rotation: 45,
        opacity: 0.6,
        dyeDepth: 0.55
      }
    ]
  },

  // 5. 海浪涟漪 - 自然流动
  {
    id: 'ocean-ripples',
    name: '海浪涟漪',
    description: '波纹层叠，浪花翻涌。通过不同大小和深度的波纹营造海浪的动态美感，展现自然的韵律。适合初学者理解层次感。',
    style: '自然流动',
    difficulty: 'beginner',
    tags: ['波纹', '海洋', '自然', '流动'],
    createdBy: '蓝染工坊',
    likes: 612,
    patterns: [
      // 大波纹（背景层）
      {
        patternId: 'circle-wave',
        x: 30,
        y: 40,
        scale: 2.0,
        rotation: 0,
        opacity: 0.3,
        dyeDepth: 0.25
      },
      {
        patternId: 'circle-wave',
        x: 70,
        y: 60,
        scale: 2.2,
        rotation: 0,
        opacity: 0.35,
        dyeDepth: 0.3
      },
      // 中等波纹（中间层）
      {
        patternId: 'circle-wave',
        x: 40,
        y: 30,
        scale: 1.4,
        rotation: 0,
        opacity: 0.5,
        dyeDepth: 0.45
      },
      {
        patternId: 'circle-wave',
        x: 60,
        y: 50,
        scale: 1.3,
        rotation: 0,
        opacity: 0.55,
        dyeDepth: 0.5
      },
      {
        patternId: 'circle-wave',
        x: 35,
        y: 70,
        scale: 1.5,
        rotation: 0,
        opacity: 0.52,
        dyeDepth: 0.47
      },
      // 小波纹（前景层）
      {
        patternId: 'circle-wave',
        x: 50,
        y: 40,
        scale: 0.9,
        rotation: 0,
        opacity: 0.75,
        dyeDepth: 0.7
      },
      {
        patternId: 'circle-wave',
        x: 65,
        y: 35,
        scale: 0.8,
        rotation: 0,
        opacity: 0.7,
        dyeDepth: 0.65
      },
      {
        patternId: 'circle-wave',
        x: 45,
        y: 60,
        scale: 0.85,
        rotation: 0,
        opacity: 0.72,
        dyeDepth: 0.67
      },
      // 浪纹装饰
      {
        patternId: 'wave',
        x: 50,
        y: 20,
        scale: 1.2,
        rotation: 0,
        opacity: 0.6,
        dyeDepth: 0.55
      },
      {
        patternId: 'wave',
        x: 50,
        y: 80,
        scale: 1.3,
        rotation: 180,
        opacity: 0.65,
        dyeDepth: 0.6
      },
      // 水滴点缀
      {
        patternId: 'droplet',
        x: 20,
        y: 25,
        scale: 0.6,
        rotation: 15,
        opacity: 0.7,
        dyeDepth: 0.6
      },
      {
        patternId: 'droplet',
        x: 80,
        y: 75,
        scale: 0.65,
        rotation: -10,
        opacity: 0.72,
        dyeDepth: 0.62
      }
    ]
  }
]

/**
 * 根据ID获取示例作品
 */
export function getSampleArtworkById(id: string): SampleArtwork | undefined {
  return SAMPLE_ARTWORKS.find(a => a.id === id)
}

/**
 * 根据难度筛选作品
 */
export function getSampleArtworksByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): SampleArtwork[] {
  return SAMPLE_ARTWORKS.filter(a => a.difficulty === difficulty)
}

/**
 * 根据标签搜索作品
 */
export function searchSampleArtworksByTag(tag: string): SampleArtwork[] {
  return SAMPLE_ARTWORKS.filter(a => a.tags.includes(tag))
}
