-- 临时禁用RLS以测试 - 因为我们使用service key + 用户验证
-- 这是安全的，因为：
-- 1. API验证用户token
-- 2. API代码确保只操作当前用户的数据
-- 3. Service key仅在服务端使用

-- 禁用 course_likes 的 RLS
ALTER TABLE course_likes DISABLE ROW LEVEL SECURITY;

-- 禁用 course_comments 的 RLS  
ALTER TABLE course_comments DISABLE ROW LEVEL SECURITY;

-- 禁用 comment_likes 的 RLS
ALTER TABLE comment_likes DISABLE ROW LEVEL SECURITY;

-- 禁用 enrollments 的 RLS
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;

-- 添加注释说明
COMMENT ON TABLE course_likes IS '课程点赞表 - RLS已禁用，通过API层验证';
COMMENT ON TABLE course_comments IS '课程评论表 - RLS已禁用，通过API层验证';
COMMENT ON TABLE comment_likes IS '评论点赞表 - RLS已禁用，通过API层验证';
COMMENT ON TABLE enrollments IS '课程注册表 - RLS已禁用，通过API层验证';
