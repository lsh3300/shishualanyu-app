-- 用户道具表
-- User Items Table
-- 存储用户购买的道具

-- 创建用户道具表
CREATE TABLE IF NOT EXISTS user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_items_user_id ON user_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_items_item_id ON user_items(item_id);

-- 启用 RLS
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看自己的道具
CREATE POLICY "Users can view own items" ON user_items
  FOR SELECT USING (auth.uid() = user_id);

-- RLS 策略：用户只能插入自己的道具
CREATE POLICY "Users can insert own items" ON user_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS 策略：用户只能更新自己的道具
CREATE POLICY "Users can update own items" ON user_items
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS 策略：用户只能删除自己的道具
CREATE POLICY "Users can delete own items" ON user_items
  FOR DELETE USING (auth.uid() = user_id);

-- Service Role 完全访问
CREATE POLICY "Service role has full access to user_items" ON user_items
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_user_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_items_updated_at
  BEFORE UPDATE ON user_items
  FOR EACH ROW
  EXECUTE FUNCTION update_user_items_updated_at();

-- 添加注释
COMMENT ON TABLE user_items IS '用户道具表，存储用户购买的道具';
COMMENT ON COLUMN user_items.item_id IS '道具ID，对应配置中的道具定义';
COMMENT ON COLUMN user_items.quantity IS '道具数量，消耗品可叠加';
