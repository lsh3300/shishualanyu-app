-- ============================================================================
-- 游戏系统 Phase 1: 基础玩家档案和评分系统
-- 创建时间: 2025-11-30
-- 说明: 建立最基础的游戏系统，让用户能看到等级、经验、货币和评分
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 玩家档案表 (player_profile)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS player_profile (
  -- 基础标识
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 染坊信息
  dye_house_name TEXT DEFAULT '无名染坊',
  
  -- 等级系统
  level INT DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  exp INT DEFAULT 0 CHECK (exp >= 0),
  
  -- 货币系统
  currency INT DEFAULT 0 CHECK (currency >= 0),
  
  -- 基础统计
  total_cloths_created INT DEFAULT 0,
  total_score INT DEFAULT 0,
  highest_score INT DEFAULT 0,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_player_profile_level ON player_profile(level DESC);
CREATE INDEX idx_player_profile_score ON player_profile(highest_score DESC);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_player_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_profile_updated_at
  BEFORE UPDATE ON player_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_player_profile_updated_at();

-- ----------------------------------------------------------------------------
-- 2. 作品评分表 (cloth_scores)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cloth_scores (
  -- 基础标识
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloth_id UUID REFERENCES cloths(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 评分维度 (0-100)
  color_score INT CHECK (color_score >= 0 AND color_score <= 100),
  pattern_score INT CHECK (pattern_score >= 0 AND pattern_score <= 100),
  creativity_score INT CHECK (creativity_score >= 0 AND creativity_score <= 100),
  technique_score INT CHECK (technique_score >= 0 AND technique_score <= 100),
  
  -- 总分和等级
  total_score INT CHECK (total_score >= 0 AND total_score <= 100),
  grade TEXT CHECK (grade IN ('SSS', 'SS', 'S', 'A', 'B', 'C')),
  
  -- 奖励信息
  exp_reward INT DEFAULT 0,
  currency_reward INT DEFAULT 0,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_cloth_scores_user ON cloth_scores(user_id);
CREATE INDEX idx_cloth_scores_cloth ON cloth_scores(cloth_id);
CREATE INDEX idx_cloth_scores_grade ON cloth_scores(grade);
CREATE INDEX idx_cloth_scores_total ON cloth_scores(total_score DESC);

-- ----------------------------------------------------------------------------
-- 3. RLS 策略
-- ----------------------------------------------------------------------------

-- player_profile 表
ALTER TABLE player_profile ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有档案（排行榜需要）
CREATE POLICY "Player profiles are viewable by everyone"
  ON player_profile FOR SELECT
  USING (true);

-- 用户只能插入自己的档案
CREATE POLICY "Users can insert their own profile"
  ON player_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的档案
CREATE POLICY "Users can update their own profile"
  ON player_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- cloth_scores 表
ALTER TABLE cloth_scores ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看评分
CREATE POLICY "Cloth scores are viewable by everyone"
  ON cloth_scores FOR SELECT
  USING (true);

-- 只有系统可以插入评分（通过RPC函数）
CREATE POLICY "Only system can insert scores"
  ON cloth_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. 辅助函数：计算升级所需经验
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_exp_for_level(target_level INT)
RETURNS INT AS $$
BEGIN
  -- 公式: base_exp * (level ^ 1.5)
  -- Level 1->2: 100 exp
  -- Level 2->3: 100 * (2^1.5) ≈ 283 exp
  -- Level 3->4: 100 * (3^1.5) ≈ 520 exp
  IF target_level <= 1 THEN
    RETURN 0;
  END IF;
  
  RETURN FLOOR(100 * POWER(target_level - 1, 1.5));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ----------------------------------------------------------------------------
-- 5. 辅助函数：根据总经验计算等级
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_level_from_exp(total_exp INT)
RETURNS TABLE(
  level INT,
  current_level_exp INT,
  exp_to_next_level INT
) AS $$
DECLARE
  calc_level INT := 1;
  exp_accumulated INT := 0;
  exp_for_next INT;
BEGIN
  -- 循环计算等级
  WHILE calc_level < 100 LOOP
    exp_for_next := calculate_exp_for_level(calc_level + 1);
    
    IF exp_accumulated + exp_for_next > total_exp THEN
      EXIT;
    END IF;
    
    exp_accumulated := exp_accumulated + exp_for_next;
    calc_level := calc_level + 1;
  END LOOP;
  
  -- 返回结果
  RETURN QUERY SELECT 
    calc_level,
    total_exp - exp_accumulated,
    calculate_exp_for_level(calc_level + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ----------------------------------------------------------------------------
-- 6. 核心函数：添加经验值
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_experience(
  p_user_id UUID,
  p_exp_gain INT
)
RETURNS TABLE(
  leveled_up BOOLEAN,
  old_level INT,
  new_level INT,
  new_exp INT,
  currency_reward INT
) AS $$
DECLARE
  v_old_exp INT;
  v_new_exp INT;
  v_old_level INT;
  v_new_level INT;
  v_level_diff INT;
  v_currency_reward INT := 0;
BEGIN
  -- 获取当前经验和等级
  SELECT exp, level INTO v_old_exp, v_old_level
  FROM player_profile
  WHERE user_id = p_user_id;
  
  -- 如果档案不存在，返回错误
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player profile not found';
  END IF;
  
  -- 计算新经验
  v_new_exp := v_old_exp + p_exp_gain;
  
  -- 计算新等级
  SELECT lv.level INTO v_new_level
  FROM calculate_level_from_exp(v_new_exp) lv;
  
  -- 计算等级差
  v_level_diff := v_new_level - v_old_level;
  
  -- 如果升级，给予货币奖励
  IF v_level_diff > 0 THEN
    v_currency_reward := v_level_diff * 50;
  END IF;
  
  -- 更新玩家档案
  UPDATE player_profile
  SET 
    exp = v_new_exp,
    level = v_new_level,
    currency = currency + v_currency_reward,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 返回结果
  RETURN QUERY SELECT
    v_level_diff > 0,
    v_old_level,
    v_new_level,
    v_new_exp,
    v_currency_reward;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 7. 核心函数：添加/扣除货币
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_currency(
  p_user_id UUID,
  p_amount INT -- 可以是负数表示扣除
)
RETURNS INT AS $$
DECLARE
  v_new_currency INT;
BEGIN
  -- 更新货币
  UPDATE player_profile
  SET 
    currency = currency + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING currency INTO v_new_currency;
  
  -- 如果档案不存在，返回错误
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player profile not found';
  END IF;
  
  -- 确保货币不为负
  IF v_new_currency < 0 THEN
    RAISE EXCEPTION 'Insufficient currency';
  END IF;
  
  RETURN v_new_currency;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 8. 核心函数：提交作品评分
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_cloth_score(
  p_cloth_id UUID,
  p_user_id UUID,
  p_color_score INT,
  p_pattern_score INT,
  p_creativity_score INT,
  p_technique_score INT
)
RETURNS TABLE(
  score_id UUID,
  total_score INT,
  grade TEXT,
  exp_reward INT,
  currency_reward INT,
  leveled_up BOOLEAN,
  old_level INT,
  new_level INT
) AS $$
DECLARE
  v_score_id UUID;
  v_total_score INT;
  v_grade TEXT;
  v_exp_reward INT;
  v_currency_reward INT;
  v_level_result RECORD;
BEGIN
  -- 计算总分（平均分）
  v_total_score := (p_color_score + p_pattern_score + p_creativity_score + p_technique_score) / 4;
  
  -- 确定等级
  v_grade := CASE
    WHEN v_total_score >= 95 THEN 'SSS'
    WHEN v_total_score >= 90 THEN 'SS'
    WHEN v_total_score >= 80 THEN 'S'
    WHEN v_total_score >= 70 THEN 'A'
    WHEN v_total_score >= 60 THEN 'B'
    ELSE 'C'
  END;
  
  -- 计算奖励
  v_exp_reward := CASE v_grade
    WHEN 'SSS' THEN 200
    WHEN 'SS' THEN 150
    WHEN 'S' THEN 100
    WHEN 'A' THEN 70
    WHEN 'B' THEN 50
    ELSE 30
  END;
  
  v_currency_reward := CASE v_grade
    WHEN 'SSS' THEN 100
    WHEN 'SS' THEN 70
    WHEN 'S' THEN 50
    WHEN 'A' THEN 30
    WHEN 'B' THEN 20
    ELSE 10
  END;
  
  -- 插入评分记录
  INSERT INTO cloth_scores (
    cloth_id, user_id,
    color_score, pattern_score, creativity_score, technique_score,
    total_score, grade,
    exp_reward, currency_reward
  ) VALUES (
    p_cloth_id, p_user_id,
    p_color_score, p_pattern_score, p_creativity_score, p_technique_score,
    v_total_score, v_grade,
    v_exp_reward, v_currency_reward
  )
  RETURNING id INTO v_score_id;
  
  -- 更新玩家统计
  UPDATE player_profile
  SET
    total_cloths_created = total_cloths_created + 1,
    total_score = total_score + v_total_score,
    highest_score = GREATEST(highest_score, v_total_score),
    currency = currency + v_currency_reward
  WHERE user_id = p_user_id;
  
  -- 添加经验（并检查是否升级）
  SELECT * INTO v_level_result
  FROM add_experience(p_user_id, v_exp_reward);
  
  -- 返回完整结果
  RETURN QUERY SELECT
    v_score_id,
    v_total_score,
    v_grade,
    v_exp_reward,
    v_currency_reward,
    v_level_result.leveled_up,
    v_level_result.old_level,
    v_level_result.new_level;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 9. 初始化函数：为新用户创建档案
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION init_player_profile(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO player_profile (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING user_id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 10. 测试数据（开发环境）
-- ----------------------------------------------------------------------------
-- 注意：生产环境请删除此部分

-- 为现有用户创建档案（如果有的话）
-- INSERT INTO player_profile (user_id)
-- SELECT id FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. 视图：排行榜
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW leaderboard_by_level AS
SELECT 
  pp.user_id,
  u.email,
  p.username,
  p.avatar_url,
  pp.dye_house_name,
  pp.level,
  pp.exp,
  pp.total_cloths_created,
  pp.highest_score,
  ROW_NUMBER() OVER (ORDER BY pp.level DESC, pp.exp DESC) as rank
FROM player_profile pp
LEFT JOIN auth.users u ON pp.user_id = u.id
LEFT JOIN profiles p ON pp.user_id = p.id
ORDER BY pp.level DESC, pp.exp DESC
LIMIT 100;

CREATE OR REPLACE VIEW leaderboard_by_score AS
SELECT 
  pp.user_id,
  u.email,
  p.username,
  p.avatar_url,
  pp.dye_house_name,
  pp.highest_score,
  pp.total_score,
  pp.total_cloths_created,
  pp.level,
  ROW_NUMBER() OVER (ORDER BY pp.highest_score DESC) as rank
FROM player_profile pp
LEFT JOIN auth.users u ON pp.user_id = u.id
LEFT JOIN profiles p ON pp.user_id = p.id
WHERE pp.highest_score > 0
ORDER BY pp.highest_score DESC
LIMIT 100;

-- ----------------------------------------------------------------------------
-- 完成
-- ----------------------------------------------------------------------------

-- 添加注释
COMMENT ON TABLE player_profile IS '玩家游戏档案表';
COMMENT ON TABLE cloth_scores IS '作品评分记录表';
COMMENT ON FUNCTION add_experience IS '添加经验值并自动处理升级';
COMMENT ON FUNCTION add_currency IS '添加或扣除货币';
COMMENT ON FUNCTION submit_cloth_score IS '提交作品评分并自动发放奖励';
COMMENT ON FUNCTION init_player_profile IS '为新用户初始化游戏档案';
