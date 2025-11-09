# Supabase 数据库初始化指南

## 问题说明
当前Supabase连接已成功，但缺少products表。我们需要在Supabase控制台的SQL编辑器中执行SQL来创建表结构。

## 操作步骤

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 在左侧菜单中点击 "SQL Editor"
4. 点击 "New query" 创建新查询
5. 将下面的SQL代码复制并粘贴到编辑器中
6. 点击 "Run" 执行SQL

## 方法一：使用项目中的SQL文件

我们已经在项目中准备好了完整的SQL文件：

1. 首先执行 `supabase/schemas.sql` 文件内容创建表结构
2. 然后执行 `supabase/seed.sql` 文件内容插入示例数据

## 方法二：直接复制以下SQL

### 1. 创建表结构 (schemas.sql内容)

```sql
-- 世说蓝语应用数据库表结构
-- 此脚本应在Supabase SQL编辑器中执行

-- 1. 用户配置文件表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 产品表
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  videos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 订单项表
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 课程表
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT NOT NULL,
  duration INTEGER NOT NULL, -- 分钟
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 课程注册表
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 7. 产品收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 8. 用户地址表
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  receiver_id UUID REFERENCES auth.users,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建用户注册后的配置文件
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 在用户注册后自动创建配置文件
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. 插入示例数据 (seed.sql内容)

```sql
-- 世说蓝语应用示例数据
-- 此脚本应在supabase/schemas.sql和supabase/policies.sql执行后运行

-- 插入示例产品数据
INSERT INTO products (name, description, price, category, image_url, in_stock) VALUES
('蓝染帆布袋', '采用传统蓝染工艺制作的帆布袋，环保耐用，适合日常使用', 89.00, 'accessories', '/images/styles/indigo-dyed-canvas-bag.jpg', true),
('蓝染亚麻茶席', '天然亚麻材质，蓝染工艺制作，适合茶道爱好者使用', 128.00, 'home', '/images/styles/indigo-dyed-linen-tea-mat.jpg', true),
('现代蓝染艺术画', '融合传统与现代的蓝染艺术作品，适合家居装饰', 299.00, 'art', '/images/styles/modern-indigo-dyeing-art.jpg', true),
('扎染体验套装', '包含扎染所需全部材料和工具，适合初学者体验', 158.00, 'materials', '/images/styles/tie-dye-tutorial-hands-on.jpg', true),
('蜡染工艺布料', '采用传统蜡染工艺制作的布料，可自行裁剪制作各种物品', 198.00, 'materials', '/images/styles/wax-resist-dyeing-fabric.jpg', true);

-- 插入示例课程数据
INSERT INTO courses (title, description, instructor, duration, price, image_url, category) VALUES
('传统蓝染入门', '学习传统蓝染的基本原理和操作方法，适合初学者', '张师傅', 120, 199.00, '/images/styles/indigo-dyeing-workshop.jpg', 'tie-dye'),
('现代扎染艺术', '探索现代扎染技术与传统工艺的结合，创作个性化作品', '李老师', 180, 299.00, '/images/styles/modern-tie-dye-art.jpg', 'tie-dye'),
('蜡染工艺进阶', '深入学习蜡染的高级技巧和复杂图案设计', '王老师', 240, 399.00, '/images/styles/wax-resist-dyeing-advanced.jpg', 'wax-resist'),
('蓝染家居用品制作', '学习如何制作蓝染家居用品，如窗帘、桌布等', '陈师傅', 150, 249.00, '/images/styles/indigo-dyeing-home-decor.jpg', 'home');

-- 创建示例通知
INSERT INTO notifications (user_id, title, content, type, is_read) VALUES
('00000000-0000-0000-0000-000000000000', '欢迎加入世说蓝语', '欢迎您加入我们的蓝染工艺社区，探索传统与现代的完美结合', 'success', false),
('00000000-0000-0000-0000-000000000000', '新课程上线', '《现代扎染艺术》课程现已上线，快来探索扎染的无限可能', 'info', false),
('00000000-0000-0000-0000-000000000000', '限时优惠', '本周所有蓝染材料享受8折优惠，不要错过', 'warning', false);
```

## 完成后操作

1. 执行完上述SQL后，表结构将创建完成
2. 返回到应用，访问 http://localhost:3000/api/test-simple-connection 测试连接
3. 访问 http://localhost:3000/products 查看产品页面

## 注意事项

- 确保在执行SQL前已选择正确的项目
- 如果遇到权限问题，确保使用的是项目所有者账户
- 执行SQL后，可以在左侧的 "Table Editor" 中查看创建的表
- 请先执行schemas.sql创建表结构，再执行seed.sql插入示例数据