-- ============================================================================
-- 创建绕过 RLS 的 cloth 插入函数
-- ============================================================================

CREATE OR REPLACE FUNCTION create_cloth_bypass_rls(
  p_cloth_id UUID,
  p_creator_id UUID,
  p_layers JSONB,
  p_layer_count INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- 使用函数定义者的权限（绕过 RLS）
AS $$
BEGIN
  INSERT INTO cloths (id, creator_id, layers, status, layer_count, created_at)
  VALUES (p_cloth_id, p_creator_id, p_layers, 'draft', p_layer_count, now())
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION create_cloth_bypass_rls TO authenticated;
GRANT EXECUTE ON FUNCTION create_cloth_bypass_rls TO anon;
