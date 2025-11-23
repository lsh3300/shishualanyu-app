-- ============================================
-- 性能优化：添加数据库索引
-- ============================================
-- 
-- 目标：大幅提升 API 查询速度（预期提升 60-80%）
-- 
-- 涉及表：
-- - likes (点赞表)
-- - comments (评论表)
-- - comment_likes (评论点赞表)
-- - favorites (收藏表)
-- - cart_items (购物车表)
-- ============================================

BEGIN;

-- ====== 1. likes 表索引 ======

-- 为常见查询模式添加复合索引
CREATE INDEX IF NOT EXISTS idx_likes_item_lookup 
  ON public.likes(item_type, item_id);

-- 为用户查询添加索引
CREATE INDEX IF NOT EXISTS idx_likes_user_item 
  ON public.likes(user_id, item_type, item_id);

-- 为时间排序添加索引
CREATE INDEX IF NOT EXISTS idx_likes_created_at 
  ON public.likes(created_at DESC);

-- ====== 2. comments 表索引 ======

-- 为最常见的查询添加复合索引（item + status）
CREATE INDEX IF NOT EXISTS idx_comments_item_status 
  ON public.comments(item_type, item_id, status);

-- 为时间排序添加索引
CREATE INDEX IF NOT EXISTS idx_comments_created_at 
  ON public.comments(created_at DESC);

-- 为热度排序添加索引
CREATE INDEX IF NOT EXISTS idx_comments_likes_count 
  ON public.comments(likes_count DESC);

-- 为回复查询添加索引
CREATE INDEX IF NOT EXISTS idx_comments_parent 
  ON public.comments(parent_id) WHERE parent_id IS NOT NULL;

-- 为用户评论查询添加索引
CREATE INDEX IF NOT EXISTS idx_comments_user 
  ON public.comments(user_id);

-- ====== 3. comment_likes 表索引 ======

-- 为评论点赞查询添加复合索引
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_user 
  ON public.comment_likes(comment_id, user_id);

-- 为用户查询添加索引
CREATE INDEX IF NOT EXISTS idx_comment_likes_user 
  ON public.comment_likes(user_id);

-- ====== 4. favorites 表索引 ======

-- 为用户收藏查询添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_favorites_user 
  ON public.favorites(user_id);

-- 为产品收藏统计添加索引
CREATE INDEX IF NOT EXISTS idx_favorites_product 
  ON public.favorites(product_id);

-- 为时间排序添加索引
CREATE INDEX IF NOT EXISTS idx_favorites_created 
  ON public.favorites(created_at DESC);

-- ====== 5. cart_items 表索引 ======

-- 为用户购物车查询添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_cart_user 
  ON public.cart_items(user_id);

-- 为产品统计添加索引
CREATE INDEX IF NOT EXISTS idx_cart_product 
  ON public.cart_items(product_id);

-- 为时间排序添加索引
CREATE INDEX IF NOT EXISTS idx_cart_updated 
  ON public.cart_items(updated_at DESC);

-- ====== 6. profiles 表索引（如果需要） ======

-- 为用户名查找添加索引
CREATE INDEX IF NOT EXISTS idx_profiles_username 
  ON public.profiles(username) WHERE username IS NOT NULL;

COMMIT;

-- ====== 验证索引创建 ======
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('likes', 'comments', 'comment_likes', 'favorites', 'cart_items', 'profiles')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ====== 使用说明 ======
-- 
-- 执行此脚本后，以下查询将显著加速：
-- 
-- 1. 查询某个商品/课程的点赞列表和数量
-- 2. 查询某个商品/课程的评论（按时间/热度排序）
-- 3. 检查用户是否已点赞/评论
-- 4. 获取用户的收藏列表
-- 5. 获取用户的购物车
-- 
-- 预期性能提升：60-80%
-- ============================================
