# 首页轮播图和快捷入口更新文档

## 更新日期
2025-11-28

## 更新概述

本次更新对首页的轮播图和快捷入口模块进行了全面优化，使其更加贴合项目真实内容，提升用户体验。

---

## 一、轮播图更新

### 更新前
轮播图使用静态配置，内容与实际数据脱节：
- 通用的蓝染工艺介绍
- 春季新品文创系列
- 热门课程推荐

### 更新后
轮播图**动态生成**，展示真实的课程、文章和产品信息：

#### 轮播图 1：热门课程推荐
- **标题**：跟随 {instructor} 老师，学习《{title}》
- **副标题**：掌握传统蓝染图案设计技艺
- **图片**：使用课程真实封面图
- **链接**：直接跳转到课程详情页 (`/teaching/{course_id}`)
- **数据来源**：从 `courses` 表获取最新课程

#### 轮播图 2：文化传承
- **标题**：探索蓝染的千年历史
- **副标题**：{文章标题}
- **图片**：使用文章封面图
- **链接**：直接跳转到文章详情页 (`/culture/{article_slug}`)
- **数据来源**：从 `culture_articles` 表获取最新文章

#### 轮播图 3：材料包推广
- **标题**：优质蓝染材料包
- **副标题**：从零开始，体验传统扎染之美
- **图片**：材料包展示图
- **链接**：跳转到材料包页面 (`/store/materials`)
- **数据来源**：静态配置

### 技术实现

```typescript
// 添加轮播图状态
const [bannerItems, setBannerItems] = useState<any[]>([])
const [bannerLoading, setBannerLoading] = useState(true)

// 动态生成函数
async function generateBannerItems() {
  // 1. 获取最新课程
  const { data: topCourse } = await supabase
    .from('courses')
    .select('id, title, instructor, image_url')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  // 2. 获取最新文章
  const { data: topArticle } = await supabase
    .from('culture_articles')
    .select('id, slug, title, cover_image')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  // 3. 组装轮播图数据
  setBannerItems([...])
}
```

### 容错机制
- 如果数据获取失败，自动使用默认轮播图内容
- 添加了 loading 状态，显示骨架屏提升用户体验

---

## 二、快捷入口更新

### 更新前（4个模块）
1. **扎染** - `/teaching/tie-dye`
2. **蜡染** - `/teaching/wax-resist`
3. **材料包** - `/store/materials`
4. **定制工坊** - `/store/custom`

### 更新后（4个模块）

#### 模块 1：传统工艺
- **图标**：🎨 Palette（调色板）
- **标签**：传统工艺
- **链接**：`/teaching`（教学中心）
- **颜色**：`bg-primary`（主色）
- **说明**：统一入口，包含扎染、蜡染、型染、蓝印花布等所有传统工艺课程

#### 模块 2：材料包
- **图标**：📦 Package（包裹）
- **标签**：材料包
- **链接**：`/store/materials`
- **颜色**：`bg-accent`（强调色）
- **说明**：保留原有功能，提供蓝染材料包购买入口

#### 模块 3：定制工坊
- **图标**：🔧 Wrench（扳手）
- **标签**：定制工坊
- **链接**：`/store/custom`
- **颜色**：`bg-chart-4`（图表色4）
- **说明**：保留原有功能，提供个性化定制服务

#### 模块 4：AI创作（新增）
- **图标**：✨ Sparkles（火花）
- **标签**：AI创作
- **链接**：`/store/ai-create`
- **颜色**：`bg-secondary`（次要色）
- **说明**：新增模块，提供AI辅助图案设计功能

### 技术实现

```typescript
const quickAccessItems = [
  { href: "/teaching", icon: Palette, label: "传统工艺", color: "bg-primary" },
  { href: "/store/materials", icon: Package, label: "材料包", color: "bg-accent" },
  { href: "/store/custom", icon: Wrench, label: "定制工坊", color: "bg-chart-4" },
  { href: "/store/ai-create", icon: Sparkles, label: "AI创作", color: "bg-secondary" },
]
```

---

## 三、设计理念

### 1. 内容真实性
- 轮播图不再使用虚拟内容，而是展示真实的课程、文章和产品
- 用户点击后可以直接访问相应页面，提升转化率

### 2. 入口统一性
- "传统工艺"模块作为所有工艺类课程的统一入口
- 避免分散用户注意力，简化导航结构

### 3. 功能完整性
- 保留材料包和定制工坊，满足用户购买和定制需求
- 新增AI创作模块，展示项目的创新能力

### 4. 视觉一致性
- 快捷入口使用统一的图标和配色方案
- 轮播图使用真实的高质量图片

---

## 四、数据流向

```
用户访问首页
    ↓
触发 useEffect
    ↓
并行执行 4 个数据获取函数:
├── fetchCourses() → 获取课程列表
├── fetchProducts() → 获取产品列表
├── fetchArticles() → 获取文章列表
└── generateBannerItems() → 生成轮播图
    ├── 获取最新课程 (courses 表)
    ├── 获取最新文章 (culture_articles 表)
    └── 添加材料包推广 (静态)
    ↓
更新状态
    ↓
渲染页面
```

---

## 五、优化建议

### 短期优化
1. **轮播图数据源多样化**
   - 可以根据用户浏览历史推荐相关课程
   - 可以根据季节或节日调整推广内容

2. **快捷入口个性化**
   - 记录用户常用模块，调整显示顺序
   - 添加更多工艺分类的快捷入口

3. **性能优化**
   - 使用 React Query 或 SWR 缓存数据
   - 添加预加载机制

### 长期优化
1. **智能推荐系统**
   - 基于用户行为的个性化轮播图
   - AI 驱动的内容推荐

2. **A/B 测试**
   - 测试不同轮播图内容的转化率
   - 优化快捷入口的排列组合

3. **数据分析**
   - 跟踪轮播图点击率
   - 分析快捷入口使用频率

---

## 六、相关文件

- **主文件**：`app/page.tsx`
- **组件**：`components/ui/banner-carousel.tsx`
- **组件**：`components/ui/quick-access.tsx`
- **文档**：`docs/HOMEPAGE_UPDATE_BANNER_AND_QUICKACCESS.md`（本文档）

---

## 七、测试验证

### 测试步骤

1. **轮播图测试**
   - ✅ 访问首页，确认轮播图显示 3 张
   - ✅ 确认第一张显示真实课程信息
   - ✅ 确认第二张显示真实文章信息
   - ✅ 确认第三张显示材料包推广
   - ✅ 点击各张轮播图，确认跳转正确

2. **快捷入口测试**
   - ✅ 确认显示 4 个模块：传统工艺、材料包、定制工坊、AI创作
   - ✅ 点击"传统工艺"，跳转到教学中心
   - ✅ 点击"材料包"，跳转到材料包页面
   - ✅ 点击"定制工坊"，跳转到定制页面
   - ✅ 点击"AI创作"，跳转到AI创作页面

3. **加载状态测试**
   - ✅ 刷新页面，确认显示加载骨架屏
   - ✅ 数据加载完成后，骨架屏消失

4. **错误处理测试**
   - ✅ 模拟网络错误，确认使用默认轮播图
   - ✅ 确认页面不会崩溃

---

## 八、更新日志

### v1.1 (2025-11-28)
- ✅ 将轮播图改为动态生成
- ✅ 使用真实课程数据作为第一张轮播图
- ✅ 使用真实文章数据作为第二张轮播图
- ✅ 更新快捷入口：传统工艺、材料包、定制工坊、AI创作
- ✅ 添加加载状态和错误处理
- ✅ 创建完整文档

---

## 九、备注

- 轮播图图片如果不存在，会自动使用默认占位图
- AI创作模块已在 `/store/ai-create` 页面实现
- 快捷入口的颜色可以在 `tailwind.config.ts` 中自定义
- 所有链接都已验证可用

---

**总结**：本次更新大幅提升了首页的内容质量和用户体验，使轮播图和快捷入口更加贴合项目实际情况，为用户提供更直观、更便捷的导航体验。
