# 材料包与定制工坊真实数据集成文档

## 更新日期
2025-11-28

## 更新概述

将"材料包"和"定制工坊"两个页面从**静态假数据**改为**动态从 Supabase 数据库获取真实产品数据**，实现数据库驱动的内容展示。

---

## 一、数据库层面的变更

### 1. 新增产品类别

在 `products` 表中新增了两个产品类别：

- **材料包**（7个产品）
- **定制服务**（4个产品）

### 2. 数据填充脚本

**文件**: `scripts/seed-materials-and-custom.js`

**功能**:
- 向 `products` 表插入材料包和定制服务产品
- 自动关联 `product_media` 表，为每个产品添加封面图
- 使用项目中已有的真实图片资源

**运行方式**:
```bash
node scripts/seed-materials-and-custom.js
```

**执行结果**:
```
✅ 成功添加 7 个材料包产品
✅ 成功添加 4 个定制服务产品
✅ 成功添加封面图
```

### 3. 材料包产品列表

| ID | 产品名称 | 价格 | 类别 | 技术类型 | 难度 |
|----|---------|------|------|---------|------|
| 自动生成 | 扎染入门材料包 | ¥68 | 材料包 | 扎染 | beginner |
| 自动生成 | 扎染进阶工具套装 | ¥128 | 材料包 | 扎染 | advanced |
| 自动生成 | 天然植物染料组合 | ¥198 | 材料包 | 天然染色 | intermediate |
| 自动生成 | 蜡染入门材料包 | ¥88 | 材料包 | 蜡染 | beginner |
| 自动生成 | 蜡染图案练习套装 | ¥158 | 材料包 | 蜡染 | intermediate |
| 自动生成 | 蓝染家居小物材料包 | ¥188 | 材料包 | 蓝染 | beginner |
| 自动生成 | 蓝染帆布包材料包 | ¥208 | 材料包 | 扎染/蓝染 | beginner |

### 4. 定制服务产品列表

| ID | 产品名称 | 价格 | 类别 | 制作周期 |
|----|---------|------|------|---------|
| 自动生成 | 私人定制扎染丝巾 | ¥368 | 定制服务 | 14天 |
| 自动生成 | 蜡染家居软装定制 | ¥498 | 定制服务 | 21天 |
| 自动生成 | 企业礼品蓝染套装 | ¥688 | 定制服务 | 28天 |
| 自动生成 | 蓝染服饰与配饰定制 | ¥298 | 定制服务 | 14天 |

---

## 二、前端代码变更

### 1. 材料包页面 (`app/store/materials/page.tsx`)

#### 主要变更

**之前**: 使用硬编码的 `materialPackages` 数组
**现在**: 从 Supabase 动态获取 `category="材料包"` 的产品

#### 核心代码

```typescript
// 从 Supabase 获取材料包产品
useEffect(() => {
  async function fetchMaterials() {
    const supabase = createClient()
    
    // 获取所有材料包类别的产品
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', '材料包')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    // 获取每个产品的封面图
    const materialsWithImages = await Promise.all(
      (products || []).map(async (product) => {
        const { data: media } = await supabase
          .from('product_media')
          .select('url')
          .eq('product_id', product.id)
          .eq('cover', true)
          .single()
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: media?.url || '/placeholder.svg',
          description: product.description || '',
          category: getTechnique(product.metadata?.technique),
          level: product.metadata?.level || 'beginner',
        }
      })
    )
    
    setMaterials(materialsWithImages)
  }

  fetchMaterials()
}, [])
```

#### 新增功能

- ✅ 加载状态显示（骨架屏 + 加载提示）
- ✅ 空状态处理（无数据时的友好提示）
- ✅ 筛选功能保留（按技术类型和难度筛选）
- ✅ 自动从 `metadata` 字段提取技术类型和难度等级

---

### 2. 定制工坊页面 (`app/store/custom/page.tsx`)

#### 主要变更

**之前**: 使用硬编码的 `customServices` 数组
**现在**: 从 Supabase 动态获取 `category="定制服务"` 的产品

#### 核心代码

```typescript
// 从 Supabase 获取定制服务产品
useEffect(() => {
  async function fetchCustomServices() {
    const supabase = createClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', '定制服务')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    // 获取每个产品的封面图
    const servicesWithImages = await Promise.all(
      (products || []).map(async (product) => {
        const { data: media } = await supabase
          .from('product_media')
          .select('url')
          .eq('product_id', product.id)
          .eq('cover', true)
          .single()
        
        return {
          id: product.id,
          title: product.name,
          price: product.price,
          image: media?.url || '/placeholder.svg',
          description: product.description || '',
          popular: product.is_new || false,
        }
      })
    )
    
    setCustomServices(servicesWithImages)
  }

  fetchCustomServices()
}, [])
```

#### 新增功能

- ✅ 加载状态显示
- ✅ 空状态处理
- ✅ 动态"热门"标记（基于 `is_new` 字段）

---

### 3. 精选作品组件 (`app/store/custom/custom-works.tsx`)

#### 主要变更

**之前**: 使用硬编码的作品数组
**现在**: 从 Supabase 动态获取家居、配饰、服饰类产品

#### 核心代码

```typescript
// 从数据库获取精选作品
useEffect(() => {
  async function fetchFeaturedWorks() {
    const supabase = createClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .in('category', ['家居', '配饰', '服饰'])
      .eq('status', 'published')
      .limit(4);
    
    // 获取封面图并格式化数据
    const worksWithImages = await Promise.all(
      (products || []).map(async (product) => {
        const { data: media } = await supabase
          .from('product_media')
          .select('url')
          .eq('product_id', product.id)
          .eq('cover', true)
          .single();
        
        return {
          id: product.id,
          title: product.name,
          image: media?.url || '/placeholder.jpg',
          price: `¥${product.price}`,
        };
      })
    );
    
    setWorks(worksWithImages);
  }

  fetchFeaturedWorks();
}, []);
```

#### 新增功能

- ✅ 动态展示真实产品作为精选作品
- ✅ 加载状态和空状态处理
- ✅ 限制显示 4 个产品

---

## 三、数据结构说明

### 产品表 (`products`)

关键字段：
- `id`: UUID 主键（自动生成）
- `name`: 产品名称
- `slug`: URL 友好标识
- `description`: 产品描述
- `price`: 价格
- `original_price`: 原价
- `category`: 类别（"材料包" 或 "定制服务"）
- `status`: 状态（"published" 表示已发布）
- `is_new`: 是否新品
- `metadata`: JSON 字段，存储额外信息
  - `technique`: 技术类型（"扎染"、"蜡染"、"天然染色"等）
  - `level`: 难度等级（"beginner"、"intermediate"、"advanced"）
  - `production_days`: 制作周期（天数）
  - `includes`: 包含内容数组
  - `customizable`: 是否可定制

### 产品媒体表 (`product_media`)

关键字段：
- `id`: UUID 主键
- `product_id`: 关联的产品 ID
- `type`: 媒体类型（"image"）
- `url`: 图片 URL
- `cover`: 是否为封面图（`true` 表示封面）
- `position`: 排序位置

---

## 四、测试验证

### 1. 材料包页面测试

**访问地址**: `http://localhost:3000/store/materials`

**验证项目**:
- ✅ 页面加载时显示"加载材料包中..."
- ✅ 显示 7 个材料包产品
- ✅ 每个产品都有真实的封面图（不是 placeholder）
- ✅ 产品信息完整（名称、价格、描述）
- ✅ 筛选功能正常工作：
  - 点击"扎染材料"→ 显示扎染相关材料包
  - 点击"蜡染材料"→ 显示蜡染相关材料包
  - 点击"初学者套装"→ 显示 beginner 级别产品
  - 点击"进阶工具"→ 显示 advanced 级别产品
  - 点击"天然染料"→ 显示天然染料类产品
- ✅ 图片加载正常（使用项目 public 目录中的图片）

### 2. 定制工坊页面测试

**访问地址**: `http://localhost:3000/store/custom`

**验证项目**:
- ✅ 页面加载时显示"加载定制服务中..."
- ✅ "定制服务" Tab 显示 4 个定制服务
- ✅ 每个服务都有真实的封面图
- ✅ "热门"标记正确显示（企业礼品为新品，显示热门）
- ✅ "精选作品"区域显示真实产品（家居、配饰、服饰）
- ✅ "定制流程" Tab 正常显示
- ✅ "匠人团队" Tab 正常显示

### 3. 数据一致性测试

**在浏览器控制台运行**:
```javascript
// 检查材料包数量
fetch('/api/products?category=材料包')
  .then(r => r.json())
  .then(d => console.log('材料包数量:', d.products?.length))

// 检查定制服务数量
fetch('/api/products?category=定制服务')
  .then(r => r.json())
  .then(d => console.log('定制服务数量:', d.products?.length))
```

---

## 五、优点与改进

### 优点

1. **数据真实性**: 不再使用假数据，所有内容都来自数据库
2. **可维护性**: 产品信息在数据库中统一管理，修改方便
3. **可扩展性**: 新增材料包或定制服务只需在数据库中添加记录
4. **图片管理**: 使用 product_media 表统一管理产品图片
5. **用户体验**: 添加加载状态和空状态，提升用户体验

### 未来改进方向

1. **产品详情页**: 为材料包和定制服务创建专门的详情页
2. **购物车集成**: 支持将材料包和定制服务加入购物车
3. **库存管理**: 显示材料包库存情况，售罄时禁用购买按钮
4. **评论系统**: 允许用户对材料包和定制服务进行评价
5. **相关推荐**: 根据课程推荐相关材料包
6. **定制流程优化**: 实现在线定制下单流程

---

## 六、相关文件清单

### 新增文件
- `scripts/seed-materials-and-custom.js` - 数据填充脚本
- `docs/MATERIALS_CUSTOM_REAL_DATA_INTEGRATION.md` - 本文档

### 修改文件
- `app/store/materials/page.tsx` - 材料包页面
- `app/store/custom/page.tsx` - 定制工坊页面
- `app/store/custom/custom-works.tsx` - 精选作品组件

### 数据库表
- `products` - 产品表（新增 11 条记录）
- `product_media` - 产品媒体表（新增 11 条记录）

---

## 七、常见问题

### Q1: 如果需要添加新的材料包怎么办？

A: 有两种方式：
1. **通过脚本**: 修改 `scripts/seed-materials-and-custom.js`，添加新产品数据后重新运行
2. **通过管理后台**: 在产品管理后台添加新产品，设置 `category="材料包"`

### Q2: 筛选功能是如何工作的？

A: 筛选基于产品的 `metadata.technique` 和 `metadata.level` 字段：
- `getTechnique()` 函数将技术类型转换为筛选分类
- 前端根据选中的筛选项过滤产品列表

### Q3: 如何修改产品图片？

A: 两种方式：
1. **修改脚本**: 在 `scripts/seed-materials-and-custom.js` 中修改 `materialImages` 或 `customImages` 数组
2. **更新数据库**: 直接在 `product_media` 表中更新对应产品的 `url` 字段

### Q4: 精选作品为什么显示家居、配饰类产品？

A: 精选作品的目的是展示定制工坊的成品效果，因此选择展示已有的家居、配饰、服饰类产品作为案例。如果需要展示其他产品，可以修改 `custom-works.tsx` 中的查询条件。

---

## 八、总结

本次更新实现了材料包和定制工坊页面的**数据库驱动化**，从静态假数据过渡到动态真实数据，显著提升了系统的可维护性和可扩展性。所有产品信息现在都统一存储在 Supabase 数据库中，便于后续管理和扩展。

**核心价值**:
- ✅ 真实数据展示
- ✅ 统一数据管理
- ✅ 灵活可扩展
- ✅ 用户体验优化
