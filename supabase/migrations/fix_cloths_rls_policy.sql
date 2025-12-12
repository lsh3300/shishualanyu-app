-- ============================================================================
-- 修复 cloths 表的 RLS 策略
-- 允许通过 Service Role Key 插入（用于 API）
-- ============================================================================

-- 删除旧策略
DROP POLICY IF EXISTS "Users can insert own cloths" ON cloths;

-- 创建新策略：允许用户插入自己的作品，或者通过 Service Role 插入
CREATE POLICY "Users can insert own cloths"
  ON cloths FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id  -- 用户可以插入自己的作品
    OR 
    auth.jwt() IS NULL  -- Service Role Key 可以插入（jwt 为 null）
  );
