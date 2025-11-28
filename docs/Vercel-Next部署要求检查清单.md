# Vercel + Next.js 部署要求与排查清单

> 目标：作为 **长期参考文档**，在 Vercel 部署 Next.js 应用时，可以逐项对照，排查「代码 / 配置 不符合 Vercel 要求」导致的构建失败或运行异常。

---

## 1. 基本部署模型概览

- **[要点]** Vercel 对 Next.js 有一套「内置预设」：
  - 自动识别框架为 **Next.js**（Framework Preset: Next.js）。
  - 自动设置 **Build Command**：`next build`（或 `npm run build` / `yarn build` / `pnpm build`，最终都会调用 `next build`）。
  - 自动设置 **Output Directory**：`.next`，不需要手动配置。
- **[对照检查]**
  - 在 Vercel 项目设置 → *Build & Development Settings*：
    - **Framework Preset** 是否为 `Next.js`？
    - **Build Command** 是否保持默认（`npm run build`，并且 package.json 中的 `build` 脚本为 `next build`）？
    - **Output Directory** 是否为空或 `.next`（不要随意改成别的目录）？

---

## 2. 构建命令 & 输出目录

- **构建命令（Build Command）**
  - 默认：
    - package.json:
      ```json
      {
        "scripts": {
          "build": "next build"
        }
      }
      ```
    - Vercel：Build Command = `npm run build`
  - 若在 Vercel 中开启 Override 手动填写 Build Command：
    - 必须能在本地同样成功执行，例如：`npm run build`。
- **输出目录（Output Directory）**
  - Next.js 框架下，Vercel 自动识别输出目录为 `.next`。
  - 不要在 Vercel 中手动设置为 `public` 或其它目录（那是纯静态项目的用法）。
- **[对照检查]**
  - 本地运行：`npm run build` 能否 **100% 通过**？
  - Vercel 项目设置中是否没有奇怪的自定义 Build Command / Output Directory？

---

## 3. TypeScript 要求（构建失败的核心原因之一）

### 3.1 Next.js 默认行为

- **[官方行为]**：Next.js 在执行 `next build` 时：
  - **会执行 TypeScript 类型检查**。
  - **只要存在 TS 错误，生产构建必定失败**（这就是 Vercel 上经常看到的 `Linting and checking validity of types ... Failed to compile`）。
- **[可选项] 危险的放宽配置**：
  - 可以在 `next.config.js` 中关闭 TS 构建检查：
    ```js
    // next.config.js
    module.exports = {
      typescript: {
        // !! WARN !!: 有类型错误也会继续生成生产代码，极其不推荐
        ignoreBuildErrors: true,
      },
    }
    ```
  - 这会让 Vercel 构建即使有 TS 错误也不报错，但非常危险，一般只作为**临时过渡方案**。

### 3.2 Vercel TypeScript 配置建议（Conformance）

- Vercel 有一条内部规范 `TYPESCRIPT_CONFIGURATION`，建议：
  - `tsconfig.json` 至少包含：
    ```json
    {
      "compilerOptions": {
        "incremental": true,
        "noUncheckedIndexedAccess": true,
        "strict": true
      }
    }
    ```
  - 项目或 workspace 的 `package.json` 中有：
    ```json
    {
      "scripts": {
        "type-check": "tsc -p tsconfig.json --noEmit"
      }
    }
    ```
- 对于单体 Next.js 应用，此规范不是强制，但**建议**：
  - 在本地 CI 或开发流程中加入 `npm run type-check`。
  - 确保 Vercel 构建失败时，**本地 `npm run build` / `npm run type-check` 也会失败**，方便提前发现问题。

### 3.3 本项目排查要点

- **[检查项]**
  - `tsconfig.json` 是否存在？是否启用 `strict`？
  - `package.json` 是否安装了 `typescript`（devDependencies）？
  - 是否有一些「测试/调试用文件」仍然引用 `process.env.*` 而没有非空断言或类型保护（例如：`test-supabase-detailed` 这类 route）？

---

## 4. ESLint / Lint 检查

- Next.js 在 `next build` 时也会跑 ESLint（如果项目中开启了 ESLint）。
- 类似 TypeScript，**只要 Lint 有错误，Vercel 构建也会失败**。
- 可选的放宽配置（不建议长期使用）：
  ```js
  // next.config.js
  module.exports = {
    eslint: {
      // 允许构建在有 ESLint 错误时继续
      ignoreDuringBuilds: true,
    },
  }
  ```
- **[对照检查]**
  - 本地执行：`npm run lint` 是否通过？
  - Vercel 日志中，如果卡在 `Linting and checking validity of types...`，要确认：
    - 是 TS 错误，还是 ESLint 错误。

---

## 5. 环境变量（Environment Variables）

- **定义位置**：Vercel → Project → *Settings* → *Environment Variables*。
- **作用范围**：
  - 以 `NEXT_PUBLIC_` 开头的变量：
    - 会同时注入到 **浏览器端** 和 **服务端**。
  - 其它变量（例如 `SUPABASE_SERVICE_KEY`）：
    - 只在服务端可读（API Route、Server Component、Route Handler 等）。
- **常见问题**：
  - 在代码里直接写：
    ```ts
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    // 直接当 string 用，TS 报错：string | undefined
    ```
  - 解决方式：
    - 在真正需要的地方加非空断言：`process.env.NEXT_PUBLIC_SUPABASE_URL!`；
    - 或提前做校验：
      ```ts
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
      }
      ```
- **[对照检查]**
  - 所有在代码中用到的环境变量，是否都已经在 Vercel 项目设置中配置？
  - 是否有地方把 `string | undefined` 当成 `string` 使用却没有非空断言或校验？

---

## 6. Middleware 与 Edge Runtime 限制

- Next.js 的 `middleware.ts`（项目根目录）在 Vercel 上：
  - **默认运行在 Edge Runtime**。
  - Edge Runtime 只支持浏览器 / Web 标准 API 的子集，不支持完整 Node.js API。
- **在 Edge Runtime 中禁止的典型 Node 能力**：
  - `fs`, `fs/promises`、`path`、`crypto` 某些同步 API 等。
  - `process.cwd()`、读写本地文件系统等。
- **[对照检查]**
  - `middleware.ts` 中是否引用了 `fs`, `path`, `process.cwd` 等 Node API？
    - 如果是 → 必须删除或改成通过 **API Route** 或 **Supabase / 外部服务** 来实现。
  - 是否只做「路由控制/重定向/简单逻辑」，而没有重 CPU / IO 操作？

> 备注：部分文档提到 `runtime: 'nodejs'`，但这是对 **Route Handlers / API Routes** 更常见；`middleware.ts` 在当前 Next.js 版本上主打 Edge Runtime。

---

## 7. API Routes / Route Handlers 运行环境

- **`app/api/**/route.ts`（App Router）**：
  - 默认运行在 **Node.js Runtime**。
  - 可以使用大部分 Node.js API（但要注意 bundle 体积）。
  - 若显式设置：
    ```ts
    export const runtime = 'edge'
    ```
    则会改为 Edge Runtime，届时同样不能用 Node API。
- **[对照检查]**
  - 是否无意中把某些需要 Node API 的 route 配成了 `runtime = 'edge'`？
  - 是否在 Edge Runtime 下使用了不被支持的依赖库（例如内部用到 `fs` 或 `net` 的 SDK）？

---

## 8. 静态资源与 Image 优化

- **public 目录**：
  - `public/` 下的文件会被当作静态资源，URL 形如 `/images/foo.png`。
  - 不需要、也不应该通过 `fs` 在运行时去读 public 里的文件。
- **next/image & Vercel Image Optimization**：
  - 在 Vercel 上使用 `next/image` 会自动走 Vercel 的图片优化服务。
  - 需要在 `next.config.js` 中正确配置 `images.domains` 列表，以允许外链图片域名。
- **[对照检查]**
  - 是否有通过 Node `fs` 读取图片/静态文件的代码？尽量用 `public` 或远程存储（如 Supabase Storage）代替。
  - `next.config.js` 中 `images.domains` 是否包含所有实际使用的远程图片域名？

---

## 9. Build & Runtime 常见错误排查流程

> 下面是每次 Vercel 构建失败时，推荐执行的一套 **标准排查路径**。

- **步骤 1：先本地复现**
  - 在本地执行：
    - `npm run lint`
    - `npm run build`
  - 确保本地也会在同样的位置报错（TS / ESLint / Runtime 打包）。

- **步骤 2：检查 TS / Lint 配置**
  - TS 报错：是否因为环境变量为 `string | undefined`？类型定义不匹配？
  - 若只是「测试文件」报错，可以：
    - 加 `!` 非空断言，或
    - 用 `// @ts-nocheck` 临时关闭该文件 TS 检查（仅放在测试/管理页面上，谨慎使用）。

- **步骤 3：查看 Middleware、Edge 相关代码**
  - `middleware.ts` 中是否有 Node API？如果有 → 必须移除或重构。
  - 任何声明 `export const runtime = 'edge'` 的 route handler，是否依赖了 Node API？

- **步骤 4：确认环境变量配置**
  - 对照 `.env.local` / 代码中用到的 `process.env.*`，检查 Vercel 项目中的 Environment Variables 是否齐全。
  - 对所有 **必须存在** 的变量，在代码中加上类型保护或非空断言。

- **步骤 5：确认 Vercel Build 设置**
  - Framework Preset: `Next.js`。
  - Build Command: 默认 `npm run build`，且 package.json 中脚本正确。
  - Output Directory: 未随意修改。

- **步骤 6：查看 Vercel Build Logs**
  - 关键阶段：
    - `Creating an optimized production build ...`
    - `Linting and checking validity of types ...`
  - 错误一般会标出具体文件与行号，优先修复这些地方。

---

## 10. 建议的项目级脚本与配置模板

- **package.json 建议增加：**
  ```json
  {
    "scripts": {
      "lint": "next lint",
      "build": "next build",
      "type-check": "tsc -p tsconfig.json --noEmit"
    }
  }
  ```

- **tsconfig.json 建议启用严格模式：**
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "incremental": true,
      "noUncheckedIndexedAccess": true
    }
  }
  ```

> 有了本文件之后，每次 Vercel 构建失败，都可以先 **对照第 9 节的排查流程**，再结合 Vercel 日志中给出的具体文件行号，逐条修复。这样能显著减少「反复试错」的时间。

---

## 11. 实战案例：Supabase URL 导致的 Vercel 构建失败

- **现象**：构建在 “Collecting page data” 或 “Generating static pages” 阶段报错：
  - `Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.`
- **隐含特点**：
  - 本地 `npm run build` 可以通过。
  - Vercel 日志中错误位置指向多个不同的 API Route（例如 `/api/cart`、`/api/comment-likes`、`/api/test/*`）。

### 11.1 根因模式

- 项目里存在多处各自读取 `process.env.NEXT_PUBLIC_SUPABASE_URL` 来创建 Supabase 客户端。
- 在 Vercel 构建环境中，`NEXT_PUBLIC_SUPABASE_URL` 某些阶段的值不符合 supabase-js 校验（可能为空、被 dotenv 覆盖等），触发 `Invalid supabaseUrl`。
- 同时，若 Output Directory 被手动改成 `out`，会额外导致：
  - `The file "/vercel/path0/out/routes-manifest.json" couldn't be found.`

### 11.2 推荐解决方案（本项目采纳）

1. **统一 URL 来源**
   - 新建 `lib/supabase/config.ts`：
     - `export const SUPABASE_URL = 'https://<your-project-id>.supabase.co'`
   - 所有服务端 Supabase 客户端统一改为：
     - `createClient(SUPABASE_URL, serviceKeyOrAnonKey, {...})`
   - 环境变量只用于 **密钥**：
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`

2. **修正 Vercel 配置**
   - Framework Preset：`Next.js`
   - Build Command：`npm run build`
   - Output Directory：保持默认（不要填写 `out`）。

3. **验证顺序**
   - 本地先跑：`npm run build`。
   - 然后使用：`vercel` 做预览部署。
   - 若日志里不再出现 `Invalid supabaseUrl` / `routes-manifest.json` 相关错误，则说明配置已恢复正常.
