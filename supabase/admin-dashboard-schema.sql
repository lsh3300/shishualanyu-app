-- 管理员后台系统数据库迁移脚本
-- 此脚本应在 Supabase SQL 编辑器中执行

-- ============================================
-- 1. 扩展 profiles 表，添加角色和状态字段
-- ============================================

-- 添加用户角色字段 (user: 普通用户, admin: 管理员)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- 添加用户状态字段 (active: 正常, disabled: 禁用)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 添加约束确保角色值有效
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
      CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- 添加约束确保状态值有效
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_status_check 
      CHECK (status IN ('active', 'disabled'));
  END IF;
END $$;

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- ============================================
-- 2. 创建内容审核表
-- ============================================

CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(20) NOT NULL, -- 'comment', 'work', 'report'
  content_id UUID NOT NULL,
  content_preview TEXT,
  submitter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reject_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 添加约束确保内容类型有效
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_reviews_type_check'
  ) THEN
    ALTER TABLE content_reviews ADD CONSTRAINT content_reviews_type_check 
      CHECK (content_type IN ('comment', 'work', 'report'));
  END IF;
END $$;

-- 添加约束确保审核状态有效
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_reviews_status_check'
  ) THEN
    ALTER TABLE content_reviews ADD CONSTRAINT content_reviews_status_check 
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_content_reviews_status ON content_reviews(status);
CREATE INDEX IF NOT EXISTS idx_content_reviews_type ON content_reviews(content_type);
CREATE INDEX IF NOT EXISTS idx_content_reviews_submitter ON content_reviews(submitter_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_created_at ON content_reviews(created_at DESC);

-- 启用行级安全
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查看和操作审核内容
DROP POLICY IF EXISTS "Admins can view all content reviews" ON content_reviews;
CREATE POLICY "Admins can view all content reviews"
  ON content_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert content reviews" ON content_reviews;
CREATE POLICY "Admins can insert content reviews"
  ON content_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update content reviews" ON content_reviews;
CREATE POLICY "Admins can update content reviews"
  ON content_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 3. 创建管理员操作日志表
-- ============================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);

-- 启用行级安全
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查看操作日志
DROP POLICY IF EXISTS "Admins can view admin logs" ON admin_logs;
CREATE POLICY "Admins can view admin logs"
  ON admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 只有管理员可以插入操作日志
DROP POLICY IF EXISTS "Admins can insert admin logs" ON admin_logs;
CREATE POLICY "Admins can insert admin logs"
  ON admin_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 4. 创建辅助函数
-- ============================================

-- 检查用户是否为管理员
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'admin' 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取待审核内容数量
CREATE OR REPLACE FUNCTION get_pending_review_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM content_reviews 
    WHERE status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取仪表盘统计数据
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM profiles),
    'newUsersToday', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE),
    'totalCourses', (SELECT COUNT(*) FROM courses),
    'totalProducts', (SELECT COUNT(*) FROM products),
    'totalOrders', (SELECT COUNT(*) FROM orders),
    'ordersToday', (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE),
    'pendingReviews', (SELECT COUNT(*) FROM content_reviews WHERE status = 'pending')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户注册趋势（近7天）
CREATE OR REPLACE FUNCTION get_user_registration_trend(days INTEGER DEFAULT 7)
RETURNS TABLE (date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d::DATE as date,
    COALESCE(COUNT(p.id), 0) as count
  FROM generate_series(
    CURRENT_DATE - (days - 1),
    CURRENT_DATE,
    '1 day'::INTERVAL
  ) d
  LEFT JOIN profiles p ON DATE(p.created_at) = d::DATE
  GROUP BY d::DATE
  ORDER BY d::DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取订单趋势（近7天）
CREATE OR REPLACE FUNCTION get_order_trend(days INTEGER DEFAULT 7)
RETURNS TABLE (date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d::DATE as date,
    COALESCE(COUNT(o.id), 0) as count
  FROM generate_series(
    CURRENT_DATE - (days - 1),
    CURRENT_DATE,
    '1 day'::INTERVAL
  ) d
  LEFT JOIN orders o ON DATE(o.created_at) = d::DATE
  GROUP BY d::DATE
  ORDER BY d::DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. 更新 handle_new_user 函数，设置默认角色
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, status)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user',  -- 默认角色为普通用户
    'active' -- 默认状态为正常
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. 为现有用户设置默认值
-- ============================================

-- 为没有角色的用户设置默认角色
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- 为没有状态的用户设置默认状态
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- ============================================
-- 完成提示
-- ============================================
-- 执行完成后，请手动将需要的用户设置为管理员：
-- UPDATE profiles SET role = 'admin' WHERE id = '用户ID';
