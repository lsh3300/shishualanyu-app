-- ============================================================================
-- 修复 cloths 表的约束和 RLS 策略
-- ============================================================================

-- 1. 删除旧的 layer_count 约束
ALTER TABLE cloths DROP CONSTRAINT IF EXISTS cloths_layer_count_check;

-- 2. 添加新的 layer_count 约束（允许最多 50 层）
ALTER TABLE cloths ADD CONSTRAINT cloths_layer_count_check 
  CHECK (layer_count >= 0 AND layer_count <= 50);

-- 3. 删除旧的 INSERT RLS 策略
DROP POLICY IF EXISTS "Users can insert own cloths" ON cloths;

-- 4. 创建新的 INSERT RLS 策略（允许 Service Role 插入）
CREATE POLICY "Users can insert own cloths"
  ON cloths FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id  -- 普通用户可以插入自己的作品
    OR 
    auth.jwt() IS NULL  -- Service Role Key 可以插入（绕过 RLS）
  );

-- 5. 确保 UPDATE 策略也正确
DROP POLICY IF EXISTS "Users can update own cloths" ON cloths;
CREATE POLICY "Users can update own cloths"
  ON cloths FOR UPDATE
  USING (
    auth.uid() = creator_id 
    OR 
    auth.jwt() IS NULL
  );

-- 完成
COMMENT ON CONSTRAINT cloths_layer_count_check ON cloths IS '允许 0-50 层图案';
