# Bearer Token 认证修复总结 🔐

## 🎯 核心问题

**原因**: 课程API使用的认证方式与产品API不一致

### 产品API（正确）✅
- 使用 **Bearer Token** 认证
- 从 `authorization` header 读取 token
- 调用 `supabase.auth.getUser(token)` 验证

### 课程API（错误）❌  
- 尝试从 cookies 读取会话
- 使用 `@supabase/ssr` 的服务端客户端
- **在客户端 fetch 调用时无法工作**

---

## ✅ 已修复的文件

### 后端 API (5个文件)

#### 1. 课程点赞 API
```
app/api/courses/[id]/like/route.ts
```
- ✅ 添加 `authenticateUser()` 函数
- ✅ 从 Bearer token 获取用户
- ✅ GET 和 POST 都支持

#### 2. 课程注册 API
```
app/api/courses/[id]/enroll/route.ts
```
- ✅ POST: 注册/开始学习
- ✅ PATCH: 更新学习进度

#### 3. 课程评论 API
```
app/api/courses/[id]/comments/route.ts
```
- ✅ GET: 获取评论列表
- ✅ POST: 发表评论

#### 4. 用户成就 API
```
app/api/user/achievements/route.ts
```
- ✅ GET: 获取用户成就数据

### 前端组件 (2个文件)

#### 5. 课程详情页
```
app/teaching/[id]/page.tsx
```
**关键修复**:
```typescript
// ✅ 使用 useAuth 获取 token
const { user, getToken } = useAuth()

// ✅ 在所有API调用中传递 Bearer token
const token = await getToken()

const response = await fetch('/api/courses/[id]/like', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,  // ← 关键！
    'Content-Type': 'application/json'
  }
})
```

#### 6. 用户成就组件
```
components/user/UserAchievements.tsx
```
- ✅ 使用 `useAuth` 获取 token
- ✅ API调用传递 Bearer token

---

## 🔑 认证函数模板

所有API都使用这个标准认证函数：

```typescript
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.replace('Bearer ', '').trim() 
    : null
  
  if (!token) {
    return { user: null, error: 'Missing authorization token' }
  }
  
  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.getUser(token)
  
  if (error || !data?.user) {
    return { user: null, error: 'Invalid token' }
  }
  
  return { user: data.user, error: null }
}
```

---

## 🧪 测试步骤

### 步骤 1: 服务器应该已自动重启
如果没有，手动重启：
```powershell
# Ctrl+C 停止
npm run dev
```

### 步骤 2: 确认登录
1. 访问 http://localhost:3000/profile
2. 确认已登录（看到用户名）
3. 如果未登录，先登录

### 步骤 3: 测试成就API
打开浏览器 F12 → Console，运行：

```javascript
fetch('/api/user/achievements', {
  headers: {
    'Authorization': 'Bearer ' + (await (async () => {
      // 从 localStorage 获取 token（简化测试）
      const auth = JSON.parse(localStorage.getItem('sb-ihsghruaglrolmpnxewt-auth-token'))
      return auth.access_token
    })())
  }
})
  .then(r => r.json())
  .then(data => {
    console.log('✅ 成就数据:', data)
    // 应该看到真实数据，不是 {error: '未登录'}
  })
```

### 步骤 4: 测试课程点赞
1. 访问 http://localhost:3000/teaching
2. 点击任意课程
3. 点击 **"点赞"** 按钮
4. 应该看到 **"点赞成功"** 提示
5. **刷新页面** (F5)
6. 点赞状态应该保持（按钮显示"已点赞"）
7. 点赞数应该增加

### 步骤 5: 测试评论功能
1. 在课程详情页，切换到 **"评论"** 标签
2. 输入评论："测试评论功能"
3. 点击 **"发表评论"**
4. 应该看到评论立即出现
5. **刷新页面** (F5)
6. 评论应该还在（证明已保存）

### 步骤 6: 测试成就展示
1. 访问 http://localhost:3000/profile
2. 查看 **"最近成就"** 卡片
3. 应该看到真实数据：
   - 如果你点赞了：点赞数 ≥ 1
   - 如果你评论了：评论数 ≥ 1
   - 总互动数 = 点赞 + 评论

---

## 📊 预期结果对比

### 修复前 ❌
```javascript
// API 响应
{error: '未登录'}

// 控制台
❌ 成就 API 正常: {error: '未登录'}
GET /api/user/achievements 401 (Unauthorized)

// 行为
- 点赞后刷新，数据消失
- 评论后刷新，数据消失
- 成就显示全是 0
```

### 修复后 ✅
```javascript
// API 响应
{
  user_id: "uuid-string",
  completed_courses: 0,
  in_progress_courses: 0,
  learning_days: 0,
  total_likes: 1,        // ← 有数据！
  total_comments: 1,     // ← 有数据！
  total_engagements: 2   // ← 自动计算
}

// 控制台
✅ 成就 API 正常: {user_id: "...", total_likes: 1, ...}
GET /api/user/achievements 200 OK

// 行为
- 点赞后刷新，状态保持 ✅
- 评论后刷新，评论还在 ✅
- 成就显示真实数据 ✅
```

---

## 🎯 关键区别

### 为什么产品API可以工作？

**产品API从一开始就使用了正确的方式：**

1. **前端** (`hooks/use-likes.ts`):
   ```typescript
   const { getToken } = useAuth()
   const token = await getToken()
   
   fetch('/api/likes', {
     headers: {
       'Authorization': `Bearer ${token}`  // ← 传递token
     }
   })
   ```

2. **后端** (`app/api/likes/route.ts`):
   ```typescript
   const authHeader = request.headers.get('authorization')
   const token = authHeader.replace('Bearer ', '')
   const { data } = await supabase.auth.getUser(token)  // ← 验证token
   ```

### 课程API为什么失败？

**课程API最初使用了错误的方式：**

1. **后端尝试从cookies读取**:
   ```typescript
   // ❌ 错误方式
   const supabase = await createClient()  // 从cookies读取
   const { data: { user } } = await supabase.auth.getUser()
   ```

2. **问题**: 客户端 `fetch()` 不会自动发送所有cookies
3. **结果**: API 检测不到登录状态

---

## 🔐 安全说明

### Service Key vs Anon Key

**Service Key** (绕过 RLS):
```typescript
createServiceClient()
// 使用 SERVICE_KEY
// 绕过所有RLS策略
// 仅在服务端使用
```

**Anon Key** (受RLS保护):
```typescript
createClient()  // 客户端
// 使用 ANON_KEY
// 受RLS策略保护
// 可以在前端使用
```

**认证流程**:
```
1. 前端获取用户token (来自 Supabase Auth)
2. 前端发送 Bearer token 到API
3. API 使用 Service Key 验证 token
4. API 使用验证后的 user.id 操作数据
```

这样既保证了安全性，又绕过了RLS限制！

---

## ✅ 修复验证清单

完成所有步骤确认修复成功：

- [ ] 服务器已重启
- [ ] 已登录账户
- [ ] 成就API返回真实数据（不是401）
- [ ] 点击点赞按钮成功
- [ ] 刷新后点赞状态保持 ✅
- [ ] 发表评论成功
- [ ] 刷新后评论还在 ✅
- [ ] 个人主页显示真实成就数据 ✅
- [ ] 没有401错误 ✅
- [ ] 没有控制台错误 ✅

---

## 📚 参考文件

### 学习参考（产品API）
- `app/api/likes/route.ts` - 标准Bearer Token实现
- `hooks/use-likes.ts` - 前端token传递

### 修复后的文件
- `app/api/courses/[id]/like/route.ts`
- `app/api/courses/[id]/enroll/route.ts`
- `app/api/courses/[id]/comments/route.ts`
- `app/api/user/achievements/route.ts`
- `app/teaching/[id]/page.tsx`
- `components/user/UserAchievements.tsx`

---

**修复时间**: 2025-11-27  
**修复方式**: 完全重写为Bearer Token认证  
**状态**: ✅ 完成，等待测试验证
