-- ============================================================================
-- 修复 submit_cloth_score 函数的变量名冲突
-- 问题：total_score 等变量名与表列名冲突
-- 解决：重命名函数内部变量，添加 v_ 前缀
-- ============================================================================

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
  
  -- 更新玩家统计（明确指定列名避免歧义）
  UPDATE player_profile pp
  SET
    total_cloths_created = pp.total_cloths_created + 1,
    total_score = pp.total_score + v_total_score,
    highest_score = GREATEST(pp.highest_score, v_total_score),
    currency = pp.currency + v_currency_reward
  WHERE pp.user_id = p_user_id;
  
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

-- 添加注释
COMMENT ON FUNCTION submit_cloth_score IS '提交作品评分并自动发放奖励（已修复变量名冲突）';
