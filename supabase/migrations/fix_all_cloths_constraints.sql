-- ============================================================================
-- 完整修复 cloths 表的所有约束和 RLS 策略
-- ============================================================================

-- 1. 删除所有可能存在的旧约束
ALTER TABLE cloths DROP CONSTRAINT IF EXISTS cloths_layer_count_check;
ALTER TABLE cloths DROP CONSTRAINT IF EXISTS valid_layer_count;
ALTER TABLE cloths DROP CONSTRAINT IF EXISTS cloths_status_check;
ALTER TABLE cloths DROP CONSTRAINT IF EXISTS valid_status;

-- 2. 添加新的约束（使用明确的名称）
ALTER TABLE cloths ADD CONSTRAINT valid_layer_count 
  CHECK (layer_count >= 0 AND layer_count <= 50);

ALTER TABLE cloths ADD CONSTRAINT valid_status
  CHECK (status IN ('draft', 'in_inventory', 'listed', 'sold'));

-- 3. 删除旧的 RLS 策略
DROP POLICY IF EXISTS "Users can insert own cloths" ON cloths;
DROP POLICY IF EXISTS "Users can update own cloths" ON cloths;
DROP POLICY IF EXISTS "Anyone can view cloths" ON cloths;

-- 4. 创建新的 RLS 策略（允许 Service Role 操作）
CREATE POLICY "Anyone can view cloths"
  ON cloths FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own cloths"
  ON cloths FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    OR 
    auth.jwt() IS NULL
  );

CREATE POLICY "Users can update own cloths"
  ON cloths FOR UPDATE
  USING (
    auth.uid() = creator_id 
    OR 
    auth.jwt() IS NULL
  );

-- 5. 验证约束
DO $$
BEGIN
  RAISE NOTICE '✅ Cloths 表约束和 RLS 策略已更新';
  RAISE NOTICE '   - layer_count: 0-50';
  RAISE NOTICE '   - status: draft, in_inventory, listed, sold';
  RAISE NOTICE '   - RLS: 允许 Service Role 操作';
END $$;
