-- ============================================================================
-- 临时禁用 cloths 表的 RLS（仅用于测试）
-- 警告：这会让所有用户都能操作所有作品，仅用于调试
-- ============================================================================

-- 禁用 RLS
ALTER TABLE cloths DISABLE ROW LEVEL SECURITY;

-- 或者，如果你想保留 RLS 但允许所有操作：
-- ALTER TABLE cloths ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "Allow all operations" ON cloths;
-- CREATE POLICY "Allow all operations"
--   ON cloths FOR ALL
--   USING (true)
--   WITH CHECK (true);
