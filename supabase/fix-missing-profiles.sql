-- 修复缺失的用户 profiles 记录
-- 为所有在 auth.users 中存在、但在 public.profiles 中没有对应记录的用户补齐资料

BEGIN;

-- 先尝试最简单的方式：只插入 id 和 user_id
INSERT INTO public.profiles (id, user_id)
SELECT u.id, u.id
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- 可选：检查是否还有未补齐的用户
-- SELECT u.id, u.email
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON p.id = u.id
-- WHERE p.id IS NULL;
