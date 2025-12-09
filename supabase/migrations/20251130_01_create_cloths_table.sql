-- ============================================================================
-- 创建 cloths 表（如果不存在）
-- 这是游戏系统的核心表，用于存储布料作品
-- ============================================================================

-- 创建 cloths 表
CREATE TABLE IF NOT EXISTS cloths (
  -- 基础信息
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 状态管理
  status TEXT NOT NULL DEFAULT 'drifting',
  -- 'drifting' (漂流中) | 'completed' (已完成) | 'archived' (已归档)
  
  -- 图层数据（JSON格式存储所有操作历史）
  layers JSONB NOT NULL DEFAULT '[]',
  
  -- 完成度
  layer_count INT DEFAULT 0,
  required_layers INT DEFAULT 3,
  
  -- AI生成内容（完成后才有）
  ai_name TEXT,
  ai_biography TEXT,
  
  -- 最终图片
  final_image_url TEXT,
  
  -- 社交数据
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  
  -- 创建者
  creator_id UUID REFERENCES auth.users(id),
  
  -- 约束
  CONSTRAINT valid_status CHECK (status IN ('drifting', 'completed', 'archived')),
  CONSTRAINT valid_layer_count CHECK (layer_count >= 0 AND layer_count <= 10)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cloths_status ON cloths(status);
CREATE INDEX IF NOT EXISTS idx_cloths_creator ON cloths(creator_id);
CREATE INDEX IF NOT EXISTS idx_cloths_created_at ON cloths(created_at DESC);

-- RLS 策略
ALTER TABLE cloths ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看布料
CREATE POLICY "Cloths are viewable by everyone"
  ON cloths FOR SELECT
  USING (true);

-- 用户可以创建布料
CREATE POLICY "Users can insert cloths"
  ON cloths FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- 用户可以更新自己的漂流中的布料
CREATE POLICY "Users can update their own drifting cloths"
  ON cloths FOR UPDATE
  USING (auth.uid() = creator_id AND status = 'drifting');

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_cloths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cloths_updated_at
  BEFORE UPDATE ON cloths
  FOR EACH ROW
  EXECUTE FUNCTION update_cloths_updated_at();

-- 添加注释
COMMENT ON TABLE cloths IS '布料作品表';
COMMENT ON COLUMN cloths.layers IS 'JSON格式的图层数据';
COMMENT ON COLUMN cloths.status IS '布料状态：drifting/completed/archived';
