-- 为 user_items 表添加 is_active 字段
-- Add is_active column to user_items table

-- 添加 is_active 字段，默认为 true（激活状态）
ALTER TABLE user_items 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 添加注释
COMMENT ON COLUMN user_items.is_active IS '道具是否激活使用中，仅对永久道具有效';
