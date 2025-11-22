// 游戏核心类型定义

export type Difficulty = 'easy' | 'medium' | 'hard';
export type FabricType = 'cotton' | 'linen' | 'silk';
export type DyeTechnique = 'tie-dye' | 'wax-resist' | 'clamp-resist';
export type GameStage = 'prepare' | 'fold' | 'tie' | 'dye' | 'reveal' | 'complete';

export interface Point {
  x: number;
  y: number;
}

export interface Pattern {
  id: string;
  name: string;
  type: 'spiral' | 'stripe' | 'dot' | 'custom';
  category: 'traditional' | 'modern' | 'custom';
  thumbnail: string;
  difficulty: number; // 1-5
  description: string;
  instructions: string[];
  metadata: {
    origin?: string;
    history?: string;
    culturalMeaning?: string;
  };
}

export interface Tool {
  id: string;
  name: string;
  type: 'fold' | 'tie' | 'dye' | 'assist';
  icon: string;
  description: string;
  isUnlocked: boolean;
}

export interface Condition {
  similarity?: number; // 0-1, 与目标图案的相似度
  time?: number; // 秒
  steps?: number; // 操作步数
}

export interface Level {
  id: number;
  name: string;
  category: 'beginner' | 'intermediate' | 'master';
  difficulty: Difficulty;
  description: string;
  targetPattern: Pattern;
  allowedTools: string[]; // Tool IDs
  fabricType: FabricType;
  fabricSize: {
    width: number;
    height: number;
  };
  timeLimit?: number; // 秒，可选
  hints: string[];
  rewards: {
    coins: number;
    exp?: number;
    items?: string[]; // Item IDs
    achievement?: string; // Achievement ID
  };
  starConditions: {
    oneStar: Condition;
    twoStar: Condition;
    threeStar: Condition;
  };
  isUnlocked: boolean;
  thumbnail?: string;
}

export interface PlayerProgress {
  userId: string;
  level: number;
  exp: number;
  coins: number;
  achievements: string[];
  completedLevels: number[];
  levelStars: Record<number, number>; // Level ID -> Stars (0-3)
  inventory: string[]; // Item IDs
  createdAt: string;
  updatedAt: string;
}

export interface GameSession {
  levelId: number;
  startTime: number;
  currentStage: GameStage;
  actions: GameAction[];
  fabricData: FabricData;
  score?: number;
  stars?: number;
}

export interface GameAction {
  type: 'fold' | 'tie' | 'dye' | 'undo';
  timestamp: number;
  data: any;
}

export interface FabricData {
  type: FabricType;
  size: { width: number; height: number };
  foldPattern?: {
    type: 'spiral' | 'parallel' | 'radial' | 'custom';
    points: Point[];
  };
  tiePoints: Point[];
  dyeLayers: DyeLayer[];
  imageData?: ImageData;
}

export interface DyeLayer {
  color: string; // Hex color
  intensity: number; // 0-1
  timestamp: number;
  coverage: number; // 0-1, 染色覆盖率
}

export interface GameResult {
  levelId: number;
  completed: boolean;
  stars: number; // 0-3
  score: number; // 0-100
  similarity: number; // 0-1
  timeUsed: number; // 秒
  coinsEarned: number;
  expEarned: number;
  artworkImage: string; // Base64 or URL
  achievements?: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'complete_levels' | 'earn_stars' | 'perfect_score' | 'speed_run' | 'custom';
    target: number;
  };
  reward: {
    coins?: number;
    items?: string[];
  };
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface Artwork {
  id: string;
  userId: string;
  levelId: number;
  levelName: string;
  stars: number;
  score: number;
  similarity: number;
  imageUrl: string;
  createdAt: string;
  isShared: boolean;
  likes?: number;
}

// 游戏状态管理接口
export interface GameStore {
  // 玩家数据
  player: PlayerProgress | null;
  
  // 当前游戏会话
  currentSession: GameSession | null;
  
  // UI 状态
  isPaused: boolean;
  showHint: boolean;
  
  // Actions
  initPlayer: (userId: string) => void;
  updatePlayerProgress: (progress: Partial<PlayerProgress>) => void;
  startLevel: (levelId: number) => void;
  endLevel: (result: GameResult) => void;
  saveProgress: () => Promise<void>;
  loadProgress: (userId: string) => Promise<void>;
  
  // 游戏操作
  performAction: (action: GameAction) => void;
  undoAction: () => void;
  completeStage: (stage: GameStage) => void;
  
  // UI 控制
  togglePause: () => void;
  toggleHint: () => void;
}
