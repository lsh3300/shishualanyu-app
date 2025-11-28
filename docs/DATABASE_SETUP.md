# 数据库初始化与迁移指南

项目使用 **Supabase CLI** 管理 schema。推荐始终通过迁移文件维护数据库，避免直接手写 SQL 导致环境不一致。

---

## 1. 前置准备

1. 安装 [Supabase CLI](https://supabase.com/docs/guides/cli)（Node.js 18+）。
2. 在项目根目录执行：
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
3. 确保 `.env.local` 已填好 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` 等变量。

---

## 2. 初始化/重置数据库（本地）

> ⚠️ 此操作会清空数据库，仅供本地或测试环境使用。

```bash
supabase db reset
```

该命令会重建数据库并按顺序执行 `supabase/migrations/*.sql`：

- 基础 schema（`profiles/products/orders/...`）  
- RLS 策略及触发器  
- 最新收藏扩展脚本 `20241118-favorites-support-courses.sql` 等  

执行完即可获得与当前代码一致的本地数据库。

---

## 3. 生产环境应用迁移

若无法使用 CLI，可在 Supabase 控制台 SQL Editor 中 **按文件名顺序** 手动运行 `supabase/migrations/` 目录下的 SQL。提示 “对象已存在” 可忽略（脚本均带 `IF NOT EXISTS` 判断）。  
执行完全部迁移后，再运行 `supabase/policies.sql` 以确保最新 RLS 生效。

---

## 4. 收藏表迁移重点

迁移文件：`supabase/migrations/20241118-favorites-support-courses.sql`

- 新增 `item_type`、`course_id` 字段与 `CHECK` 约束；
- 允许 `product_id` 为空并重新创建外键；
- 添加课程/商品各自的部分唯一索引；
- 新增 `(user_id, item_type)` 复合索引，提升查询性能。

若收藏功能出现 “未知课程/无法取消” 等问题，请确认该迁移已执行。

---

## 5. 新增或修改 Schema 的流程

1. 使用本地 Supabase 实例（`supabase db start`）进行 DDL 试验；
2. 运行 `supabase db diff -f <name>` 生成迁移文件；
3. 审查 SQL，必要时手动优化并添加注释；
4. 将迁移文件提交，并更新相关文档（README / 本指南）。

---

## 6. 常用命令速查

| 命令 | 说明 |
| --- | --- |
| `supabase db start` | 启动本地数据库与 Studio |
| `supabase db stop` | 停止本地实例 |
| `supabase db reset` | 清空并重新执行全部迁移 |
| `supabase db diff -f <name>` | 生成新的迁移文件 |
| `supabase db push` | 将本地迁移推送到远程项目 |

---

## 7. 故障排查

1. **迁移冲突/失败**：使用 `supabase db reset` 回滚到最新迁移状态后重新执行。
2. **收藏 API 报错**：确认 `20241118-favorites-support-courses.sql` 已执行成功。
3. **RLS 拒绝访问**：检查 `supabase/policies.sql` 是否同步，必要时重新执行。
4. **CLI 无法连接**：确认 `.supabase/config.toml` 中 `project_ref` 正确，或重新 `supabase link`。

---

## 8. 参考资料

- [Supabase CLI 文档](https://supabase.com/docs/guides/cli)
- [Supabase RLS 指南](https://supabase.com/docs/guides/auth/row-level-security)
- 仓库内 `supabase/schemas.sql`、`supabase/policies.sql`、`supabase/migrations/`