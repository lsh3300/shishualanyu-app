-- 世说蓝语 - 数据库性能优化索引
-- 在 Supabase SQL Editor 中执行

-- ============================================
-- 1. 课程表索引（加速 resolveCourse 和课程列表查询）
-- ============================================

-- slug 查询（最常用的课程查找方式）
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug)
WHERE slug IS NOT NULL;

-- 分类筛选（课程列表/推荐课程）
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category)
WHERE category IS NOT NULL;

-- 课程创建时间排序（课程列表页）
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON public.courses(created_at DESC);

-- ============================================
-- 2. 产品表索引（加速产品详情和列表）
-- ============================================

-- slug 查询（产品详情页）
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug)
WHERE slug IS NOT NULL;

-- 分类筛选（产品分类页）
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category)
WHERE category IS NOT NULL;

-- 创建时间排序（最新产品）
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ============================================
-- 3. 用户收藏索引（加速收藏检查）
-- ============================================

-- 按用户和类型查询收藏
CREATE INDEX IF NOT EXISTS idx_favorites_user_type ON public.favorites(user_id, item_type);

-- ============================================
-- 4. 购物车索引（加速购物车查询）
-- ============================================

-- 按用户查询购物车
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);

-- ============================================
-- 5. 课程点赞表（加速点赞统计）
-- ============================================

-- 按课程统计点赞数
CREATE INDEX IF NOT EXISTS idx_course_likes_course ON public.course_likes(course_id);

-- 按用户查点赞状态
CREATE INDEX IF NOT EXISTS idx_course_likes_user_course ON public.course_likes(user_id, course_id);

-- ============================================
-- 6. 课程评论表（加速评论查询）
-- ============================================

-- 按课程查评论
CREATE INDEX IF NOT EXISTS idx_course_comments_course ON public.course_comments(course_id, created_at DESC);

-- ============================================
-- 7. 游戏系统表索引
-- ============================================

-- 商店上架状态
CREATE INDEX IF NOT EXISTS idx_shop_listings_status ON public.shop_listings(status, listed_at DESC);

-- 玩家等级排行
CREATE INDEX IF NOT EXISTS idx_player_profile_level ON public.player_profile(level DESC);
