# 📦 添加产品操作指南

## 快速开始

### 步骤 1: 添加产品到数据库

**方法 A: 使用 API（推荐）⭐**

1. 确保开发服务器正在运行:
```bash
npm run dev
```

2. 在浏览器或使用 curl 访问:
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/products/add-indigo" -Method POST

# 或者直接在浏览器访问（使用 Thunder Client 等工具）
POST http://localhost:3000/api/products/add-indigo
```

3. 如果成功，你会看到:
```json
{
  "success": true,
  "message": "成功添加蓝染文创产品",
  "productsAdded": 20,
  "mediaAdded": 21,
  "categories": {
    "服饰": 5,
    "配饰": 7,
    "家居": 5,
    "文具": 3,
    "艺术品": 2,
    "礼品": 3
  }
}
```

**方法 B: 使用 Supabase SQL Editor**

1. 登录你的 Supabase 项目
2. 进入 SQL Editor
3. 复制 `supabase/add-indigo-products.sql` 的内容
4. 点击 "Run" 执行

---

### 步骤 2: 验证产品已添加

**在浏览器访问商店页面:**
```
http://localhost:3000/store
```

你应该能看到新添加的蓝染文创产品！

---

## 🧪 功能测试清单

### 1. 产品展示测试

#### 测试商店页面
```
访问: http://localhost:3000/store
```

**检查项**:
- [ ] 能看到至少 20+ 个产品
- [ ] 产品卡片显示图片（目前是占位图）
- [ ] 产品名称和价格正确显示
- [ ] "NEW" 标签显示在新品上
- [ ] 折扣价格正确计算

#### 测试分类筛选
```
在商店页面点击分类标签
```

**检查项**:
- [ ] "全部" 显示所有产品
- [ ] "服饰" 显示 5 个产品
- [ ] "配饰" 显示 7 个产品
- [ ] "家居" 显示 5 个产品
- [ ] "文具" 显示 3 个产品
- [ ] "艺术品" 显示 2 个产品
- [ ] "礼品" 显示 3 个产品

---

### 2. 产品详情测试

#### 测试详情页
```
点击任意产品卡片，如"螺旋扎染T恤"
访问: http://localhost:3000/store/a1111111-1111-1111-1111-111111111111
或: http://localhost:3000/store/spiral-tie-dye-tshirt
```

**检查项**:
- [ ] 详情页能正常打开
- [ ] 产品图片显示（目前是占位图）
- [ ] 产品名称、价格、描述正确
- [ ] 规格选择器正常（颜色、尺寸）
- [ ] "加入购物车" 按钮存在

---

### 3. 购物车功能测试 🛒

#### 添加到购物车
```
1. 进入产品详情页
2. 选择规格（如颜色、尺寸）
3. 点击 "加入购物车"
```

**检查项**:
- [ ] 点击后显示成功提示
- [ ] 顶部购物车图标数字增加
- [ ] 打开购物车能看到刚添加的商品

#### 购物车页面
```
访问: http://localhost:3000/cart
```

**检查项**:
- [ ] 能看到已添加的产品
- [ ] 产品信息（图片、名称、规格、价格）正确
- [ ] 数量可以增减
- [ ] 小计价格计算正确
- [ ] 总价计算正确
- [ ] 删除功能正常

---

### 4. 收藏功能测试 ❤️

#### 添加到收藏
```
1. 在商店页面或详情页
2. 点击心形图标
```

**检查项**:
- [ ] 点击后心形图标变红/实心
- [ ] 显示收藏成功提示
- [ ] 再次点击可取消收藏

#### 收藏列表页
```
访问: http://localhost:3000/favorites
```

**检查项**:
- [ ] 能看到收藏的产品
- [ ] 可以从列表中移除收藏
- [ ] 可以直接加入购物车

---

## 🔍 常见问题排查

### 问题 1: API 返回 404
**症状**: 访问 `/api/products/add-indigo` 返回 404

**解决方案**:
```bash
# 检查文件是否存在
ls app/api/products/add-indigo/route.ts

# 重启开发服务器
npm run dev
```

---

### 问题 2: 产品列表为空
**症状**: 商店页面显示"暂无产品"

**可能原因**:
1. 产品未成功添加到数据库
2. Supabase 连接问题
3. RLS 策略问题

**排查步骤**:
```bash
# 1. 检查 Supabase 连接
# 访问: http://localhost:3000/api/debug/check-products-schema

# 2. 查看 Supabase 控制台
# Table Editor -> products -> 查看数据

# 3. 检查 RLS 策略
# SQL Editor 执行:
SELECT * FROM public.products LIMIT 5;
```

---

### 问题 3: 购物车添加失败
**症状**: 点击"加入购物车"无反应或报错

**检查**:
1. 打开浏览器开发者工具（F12）
2. 查看 Console 选项卡的错误信息
3. 查看 Network 选项卡的 API 请求

**常见错误**:
- `column products.in_stock does not exist` 
  → 数据库schema不匹配，需要使用 `inventory` 字段
- `product_id not found`
  → 产品ID格式错误或产品不存在

---

### 问题 4: 图片不显示
**症状**: 产品图片显示为占位图或无法加载

**说明**: 当前使用 `https://picsum.photos` 占位图服务，这是正常的。

**替换为真实图片**:
```sql
-- 在 Supabase SQL Editor 中更新图片URL
UPDATE public.product_media
SET url = 'https://your-image-url.jpg'
WHERE product_id = 'a1111111-1111-1111-1111-111111111111'
AND position = 0;
```

---

## 📊 数据验证

### 验证产品数量
```sql
-- 在 Supabase SQL Editor 执行
SELECT category, COUNT(*) as count
FROM public.products
GROUP BY category
ORDER BY category;
```

**预期结果**:
```
category    | count
------------|------
服饰        | 5
配饰        | 7
家居        | 5
文具        | 3
艺术品      | 2
礼品        | 3
```

### 验证产品图片
```sql
SELECT 
  p.name,
  COUNT(pm.id) as image_count
FROM public.products p
LEFT JOIN public.product_media pm ON p.id = pm.product_id
WHERE p.id LIKE 'a%' OR p.id LIKE 'b%' OR p.id LIKE 'c%'
GROUP BY p.id, p.name
ORDER BY p.name;
```

---

## 🎯 完整测试流程

### 端到端测试（15分钟）

1. **添加产品** (2分钟)
   ```bash
   POST http://localhost:3000/api/products/add-indigo
   ```

2. **浏览商店** (3分钟)
   - 访问 `/store`
   - 切换不同分类
   - 查看产品卡片

3. **查看详情** (2分钟)
   - 点击"螺旋扎染T恤"
   - 查看产品信息
   - 测试规格选择

4. **添加购物车** (3分钟)
   - 选择颜色和尺码
   - 点击"加入购物车"
   - 打开购物车页面
   - 调整数量

5. **测试收藏** (2分钟)
   - 返回商店页面
   - 点击心形图标收藏产品
   - 访问 `/favorites`
   - 查看收藏列表

6. **测试搜索** (3分钟)
   - 在商店页面搜索"T恤"
   - 搜索"笔记本"
   - 搜索"礼盒"

**如果所有步骤都通过，说明产品系统工作正常！** ✅

---

## 🔧 高级配置

### 自定义产品数据

编辑 `app/api/products/add-indigo/route.ts`:

```typescript
// 添加你自己的产品
const customProduct = {
  id: 'custom-uuid-here',
  name: '你的产品名称',
  slug: 'your-product-slug',
  description: '产品描述',
  price: 199.00,
  original_price: 299.00,
  category: '服饰', // 或其他分类
  inventory: 100,
  is_new: true,
  discount: 33,
  metadata: {
    colors: ['蓝色', '白色'],
    sizes: ['S', 'M', 'L']
  }
}
```

### 批量更新产品

```sql
-- 更新所有产品的库存
UPDATE public.products
SET inventory = inventory + 10
WHERE category = '服饰';

-- 设置所有产品为上架状态
UPDATE public.products
SET status = 'published'
WHERE status IS NULL;
```

---

## 📞 需要帮助？

### 调试工具

1. **Supabase 控制台**
   - 查看产品数据
   - 检查 RLS 策略
   - 查看 API 日志

2. **浏览器开发者工具**
   - Console: 查看 JavaScript 错误
   - Network: 查看 API 请求
   - Application: 查看 localStorage

3. **后端日志**
   ```bash
   # 查看开发服务器日志
   npm run dev
   # 观察控制台输出
   ```

### 联系支持

如果遇到问题：
1. 检查控制台错误信息
2. 截图问题界面
3. 记录复现步骤
4. 描述预期行为和实际行为

---

**文档版本**: v1.0  
**最后更新**: 2025-11-22  
**测试状态**: ✅ 已验证
