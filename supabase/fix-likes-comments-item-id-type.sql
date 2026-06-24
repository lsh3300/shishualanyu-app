-- ============================================
-- 修复点赞和评论表的 item_id 类型
-- 问题: item_id 定义为 UUID，但课程等数据使用字符串ID
-- 解决: 将 item_id 改为 TEXT 类型，支持各种ID格式
-- ============================================

BEGIN;

-- ============================================
-- 1. 修改 likes 表的 item_id 类型
-- ============================================

-- 修改 item_id 列类型为 TEXT
ALTER TABLE public.likes 
ALTER COLUMN item_id TYPE TEXT;

-- ============================================
-- 2. 修改 comments 表的 item_id 类型
-- ============================================

-- 修改 item_id 列类型为 TEXT
ALTER TABLE public.comments 
ALTER COLUMN item_id TYPE TEXT;

COMMIT;

-- ============================================
-- 验证修改结果
-- ============================================

-- 查看列的数据类型
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('likes', 'comments')
  AND column_name = 'item_id'
ORDER BY table_name;
