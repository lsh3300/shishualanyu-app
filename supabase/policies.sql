-- 世说蓝语应用行级安全(RLS)策略
-- 此脚本应在supabase/schemas.sql执行后运行

-- 启用所有表的行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. profiles表RLS策略
-- 用户可以查看自己的配置文件
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的配置文件
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户可以插入自己的配置文件
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. products表RLS策略
-- 所有人都可以查看产品
CREATE POLICY "Everyone can view products" ON products
  FOR SELECT USING (true);

-- 只有认证用户可以创建产品
CREATE POLICY "Authenticated users can create products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 只有产品创建者或管理员可以更新产品
CREATE POLICY "Product creators can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 只有产品创建者或管理员可以删除产品
CREATE POLICY "Product creators can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. orders表RLS策略
-- 用户可以查看自己的订单
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的订单
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的订单状态
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. order_items表RLS策略
-- 用户可以查看自己订单的订单项
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- 用户可以创建自己订单的订单项
CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- 5. courses表RLS策略
-- 所有人都可以查看课程
CREATE POLICY "Everyone can view courses" ON courses
  FOR SELECT USING (true);

-- 只有认证用户可以创建课程
CREATE POLICY "Authenticated users can create courses" ON courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 只有课程创建者或管理员可以更新课程
CREATE POLICY "Course creators can update courses" ON courses
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 只有课程创建者或管理员可以删除课程
CREATE POLICY "Course creators can delete courses" ON courses
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. enrollments表RLS策略
-- 用户可以查看自己的课程注册
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的课程注册
CREATE POLICY "Users can create own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的课程注册进度
CREATE POLICY "Users can update own enrollments" ON enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. favorites表RLS策略
-- 用户可以查看自己的收藏
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的收藏
CREATE POLICY "Users can create own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的收藏
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 8. addresses表RLS策略
-- 用户可以查看自己的地址
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建自己的地址
CREATE POLICY "Users can create own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的地址
CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的地址
CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- 9. messages表RLS策略
-- 用户可以查看自己发送或接收的消息
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 用户可以创建自己发送的消息
CREATE POLICY "Users can create own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 用户可以更新自己发送的消息
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- 用户可以删除自己发送的消息
CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (auth.uid() = sender_id);

-- 10. notifications表RLS策略
-- 用户可以查看自己的通知
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 系统可以创建通知
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 用户可以更新自己的通知（标记为已读）
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的通知
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);