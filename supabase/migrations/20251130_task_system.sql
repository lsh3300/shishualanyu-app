-- ============================================================================
-- 任务系统 (Task System)
-- 创建时间: 2025-11-30
-- 说明: 创作挑战、每周限时、成就系统
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 任务模板表 (task_templates)
-- 用于定义所有可能的任务
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_templates (
  -- 基础标识
  id TEXT PRIMARY KEY,
  
  -- 任务信息
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('challenge', 'weekly', 'achievement')),
  
  -- 任务类型（新手、进阶、大师）
  tier TEXT CHECK (tier IN ('beginner', 'intermediate', 'master')),
  
  -- 任务条件（JSON格式）
  conditions JSONB NOT NULL,
  /*
  例如:
  {
    "type": "create_cloth",
    "requirements": {
      "min_patterns": 5,
      "required_pattern_ids": ["snowflake"],
      "min_score": 80,
      "must_use_symmetry": true
    }
  }
  */
  
  -- 奖励
  reward_exp INT DEFAULT 0,
  reward_currency INT DEFAULT 0,
  reward_items JSONB, -- 可能解锁图案等
  
  -- 限时信息（周挑战使用）
  is_limited BOOLEAN DEFAULT false,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  
  -- 排序和显示
  sort_order INT DEFAULT 0,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_templates_category ON task_templates(category);
CREATE INDEX idx_task_templates_tier ON task_templates(tier);
CREATE INDEX idx_task_templates_active ON task_templates(is_active);

-- ----------------------------------------------------------------------------
-- 2. 用户任务进度表 (user_task_progress)
-- 记录用户的任务完成情况
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_task_progress (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES task_templates(id) ON DELETE CASCADE,
  
  -- 进度
  progress INT DEFAULT 0, -- 当前进度
  target INT DEFAULT 1, -- 目标进度（从template.conditions解析）
  is_completed BOOLEAN DEFAULT false,
  
  -- 奖励领取状态
  reward_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  
  -- 时间戳
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 唯一约束：每个用户每个任务只能有一条记录
  UNIQUE(user_id, task_id)
);

CREATE INDEX idx_user_task_progress_user ON user_task_progress(user_id);
CREATE INDEX idx_user_task_progress_task ON user_task_progress(task_id);
CREATE INDEX idx_user_task_progress_completed ON user_task_progress(is_completed);

-- ----------------------------------------------------------------------------
-- 3. 成就表 (achievements)
-- 长期目标成就
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
  -- 基础标识
  id TEXT PRIMARY KEY,
  
  -- 成就信息
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('collection', 'creation', 'score', 'social')),
  tier INT DEFAULT 1, -- 成就等级（I, II, III）
  
  -- 条件
  conditions JSONB NOT NULL,
  
  -- 奖励
  reward_exp INT DEFAULT 0,
  reward_currency INT DEFAULT 0,
  reward_title TEXT, -- 解锁称号
  reward_badge TEXT, -- 徽章图标
  
  -- 显示
  icon TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_hidden BOOLEAN DEFAULT false, -- 隐藏成就
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_tier ON achievements(tier);

-- ----------------------------------------------------------------------------
-- 4. 用户成就表 (user_achievements)
-- 用户获得的成就
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_achievements (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 关联
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- 进度
  progress INT DEFAULT 0,
  target INT DEFAULT 1,
  is_unlocked BOOLEAN DEFAULT false,
  
  -- 时间戳
  started_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,
  
  -- 唯一约束
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(is_unlocked);

-- ----------------------------------------------------------------------------
-- 5. RLS 策略
-- ----------------------------------------------------------------------------

-- task_templates - 所有人可查看
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task templates are viewable by everyone"
  ON task_templates FOR SELECT
  USING (is_active = true);

-- user_task_progress - 用户只能看自己的
ALTER TABLE user_task_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own task progress"
  ON user_task_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task progress"
  ON user_task_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task progress"
  ON user_task_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- achievements - 所有人可查看
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (NOT is_hidden OR EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = auth.uid() 
    AND achievement_id = achievements.id 
    AND is_unlocked = true
  ));

-- user_achievements - 用户只能看自己的
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. 初始化任务模板
-- ----------------------------------------------------------------------------

-- 新手挑战系列
INSERT INTO task_templates (id, name, description, category, tier, conditions, reward_exp, reward_currency, icon, sort_order) VALUES
('challenge_first_creation', '第一次染色', '创作你的第一个作品', 'challenge', 'beginner', 
 '{"type": "create_cloth", "requirements": {"count": 1}}', 50, 20, '🎨', 1),

('challenge_symmetry', '掌握对称', '创作一个对称构图的作品', 'challenge', 'beginner',
 '{"type": "create_cloth", "requirements": {"has_symmetry": true}}', 80, 30, '🔄', 2),

('challenge_color_depth', '色彩层次', '在一个作品中使用3种以上深度', 'challenge', 'beginner',
 '{"type": "create_cloth", "requirements": {"min_color_depths": 3}}', 100, 40, '🎨', 3),

('challenge_many_patterns', '复杂图案', '使用5个以上图案创作', 'challenge', 'beginner',
 '{"type": "create_cloth", "requirements": {"min_patterns": 5}}', 120, 50, '🖼️', 4),

('challenge_grade_a', '大师之作', '获得A级以上评分', 'challenge', 'beginner',
 '{"type": "achieve_score", "requirements": {"min_grade": "A"}}', 150, 60, '⭐', 5),

-- 进阶挑战
('challenge_winter_theme', '冬日主题', '使用雪花图案创作作品', 'challenge', 'intermediate',
 '{"type": "create_cloth", "requirements": {"required_patterns": ["snowflake"]}}', 200, 80, '❄️', 10),

('challenge_star_theme', '星空主题', '使用星形和螺旋组合创作', 'challenge', 'intermediate',
 '{"type": "create_cloth", "requirements": {"required_patterns": ["star", "spiral"]}}', 250, 100, '✨', 11),

('challenge_geometric', '几何美学', '仅使用几何图案创作', 'challenge', 'intermediate',
 '{"type": "create_cloth", "requirements": {"pattern_categories": ["geometric"]}}', 300, 120, '⬡', 12);

-- 成就系统初始化
INSERT INTO achievements (id, name, description, category, tier, conditions, reward_exp, reward_currency, reward_badge, icon, rarity) VALUES
-- 收藏成就
('collection_patterns_5', '图案收藏家 I', '解锁5种图案', 'collection', 1,
 '{"type": "unlock_patterns", "requirements": {"count": 5}}', 100, 50, '🎨_bronze', '🎨', 'common'),

('collection_patterns_10', '图案收藏家 II', '解锁10种图案', 'collection', 2,
 '{"type": "unlock_patterns", "requirements": {"count": 10}}', 200, 100, '🎨_silver', '🎨', 'rare'),

('collection_patterns_all', '图案收藏家 III', '解锁全部图案', 'collection', 3,
 '{"type": "unlock_patterns", "requirements": {"count": 20}}', 500, 300, '🎨_gold', '🎨', 'epic'),

-- 创作成就
('creation_count_10', '初出茅庐', '创作10个作品', 'creation', 1,
 '{"type": "create_cloths", "requirements": {"count": 10}}', 100, 50, '✏️_bronze', '✏️', 'common'),

('creation_count_50', '熟能生巧', '创作50个作品', 'creation', 2,
 '{"type": "create_cloths", "requirements": {"count": 50}}', 300, 150, '✏️_silver', '✏️', 'rare'),

('creation_count_100', '大师之路', '创作100个作品', 'creation', 3,
 '{"type": "create_cloths", "requirements": {"count": 100}}', 500, 300, '✏️_gold', '✏️', 'epic'),

-- 评分成就
('score_first_sss', '完美开局', '首次获得SSS评分', 'score', 1,
 '{"type": "achieve_grade", "requirements": {"grade": "SSS", "count": 1}}', 300, 150, '⭐_rainbow', '⭐', 'epic'),

('score_a_count_10', '稳定发挥', '获得10次A级以上评分', 'score', 1,
 '{"type": "achieve_grade", "requirements": {"min_grade": "A", "count": 10}}', 200, 100, '⭐_bronze', '⭐', 'common'),

('score_s_count_50', '大师级别', '获得50次S级以上评分', 'score', 2,
 '{"type": "achieve_grade", "requirements": {"min_grade": "S", "count": 50}}', 500, 300, '⭐_gold', '⭐', 'legendary');

-- ----------------------------------------------------------------------------
-- 7. 辅助函数：检查任务完成
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_task_completion(
  p_user_id UUID,
  p_task_id TEXT,
  p_progress INT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_target INT;
  v_completed BOOLEAN;
BEGIN
  -- 获取目标进度
  SELECT 
    COALESCE((conditions->>'count')::INT, 1)
  INTO v_target
  FROM task_templates
  WHERE id = p_task_id;
  
  -- 检查是否完成
  v_completed := p_progress >= v_target;
  
  -- 更新进度
  INSERT INTO user_task_progress (user_id, task_id, progress, target, is_completed, completed_at)
  VALUES (p_user_id, p_task_id, p_progress, v_target, v_completed, 
          CASE WHEN v_completed THEN NOW() ELSE NULL END)
  ON CONFLICT (user_id, task_id) 
  DO UPDATE SET
    progress = GREATEST(user_task_progress.progress, p_progress),
    is_completed = v_completed,
    completed_at = CASE WHEN v_completed AND user_task_progress.completed_at IS NULL 
                   THEN NOW() ELSE user_task_progress.completed_at END,
    updated_at = NOW();
  
  RETURN v_completed;
END;
$$ LANGUAGE plpgsql;
