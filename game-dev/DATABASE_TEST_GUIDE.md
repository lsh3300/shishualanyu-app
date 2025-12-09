# 数据库测试指南
## Database Testing Guide

---

## 🎯 测试目标

验证游戏系统的数据库层是否正常工作

---

## 📋 测试步骤

### Step 1: 执行数据库迁移

#### 方式A: 通过Supabase Dashboard (推荐)

1. 打开 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 进入 `SQL Editor`
4. 打开文件: `supabase/migrations/20251130_game_system_phase1.sql`
5. 复制全部内容到SQL编辑器
6. 点击 `Run` 执行
7. 检查是否有错误提示

#### 方式B: 通过Supabase CLI

```bash
# 如果安装了Supabase CLI
supabase db push

# 或者手动执行迁移文件
supabase db execute -f supabase/migrations/20251130_game_system_phase1.sql
```

**预期结果**:
- ✅ 无错误提示
- ✅ 看到 "Success" 或 "完成" 提示

---

### Step 2: 验证表创建

在SQL Editor中执行：

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('player_profile', 'cloth_scores');
```

**预期结果**:
```
table_name
--------------
player_profile
cloth_scores
```

---

### Step 3: 测试核心函数

#### 测试1: 初始化玩家档案

```sql
-- 创建测试档案
SELECT init_player_profile('test-user-12345'::uuid);
```

**预期结果**: 返回 `test-user-12345`

**验证**:
```sql
SELECT * FROM player_profile WHERE user_id = 'test-user-12345'::uuid;
```
应该看到:
- level = 1
- exp = 0
- currency = 0
- dye_house_name = '无名染坊'

---

#### 测试2: 计算等级经验

```sql
-- 测试经验计算公式
SELECT 
  level,
  calculate_exp_for_level(level) as exp_required
FROM generate_series(1, 10) as level;
```

**预期结果**:
```
level | exp_required
------|-------------
1     | 0
2     | 100
3     | 283
4     | 520
5     | 800
6     | 1118
7     | 1469
8     | 1848
9     | 2253
10    | 2683
```

公式: 100 × ((level-1) ^ 1.5)

---

#### 测试3: 添加经验值

```sql
-- 测试添加经验（应该升级）
SELECT * FROM add_experience(
  'test-user-12345'::uuid,
  150  -- 添加150经验
);
```

**预期结果**:
```
leveled_up | old_level | new_level | new_exp | currency_reward
-----------|-----------|-----------|---------|----------------
true       | 1         | 2         | 150     | 50
```

解释:
- 从Lv1(0 exp) → Lv2(150 exp)
- Lv1→2需要100 exp，剩余50 exp到Lv3
- 升级奖励50货币

**验证**:
```sql
SELECT level, exp, currency 
FROM player_profile 
WHERE user_id = 'test-user-12345'::uuid;
```
应该看到:
- level = 2
- exp = 150
- currency = 50

---

#### 测试4: 提交评分

首先创建测试布料：
```sql
-- 创建测试布料
INSERT INTO cloths (id, creator_id, status, layers)
VALUES (
  'test-cloth-12345'::uuid,
  'test-user-12345'::uuid,
  'completed',
  '[]'::jsonb
);
```

然后提交评分：
```sql
-- 提交评分（A级作品）
SELECT * FROM submit_cloth_score(
  'test-cloth-12345'::uuid,  -- cloth_id
  'test-user-12345'::uuid,   -- user_id
  85,  -- color_score
  75,  -- pattern_score
  80,  -- creativity_score
  70   -- technique_score
);
```

**预期结果**:
```
score_id    | total_score | grade | exp_reward | currency_reward | leveled_up | old_level | new_level
------------|-------------|-------|------------|-----------------|------------|-----------|----------
[UUID]      | 77          | A     | 70         | 30              | false      | 2         | 2
```

计算说明:
- total_score = (85+75+80+70)/4 = 77.5 ≈ 77
- grade = A (70-79分)
- exp_reward = 70 (A级奖励)
- currency_reward = 30 (A级奖励)

**验证**:
```sql
-- 检查玩家档案更新
SELECT 
  level, 
  exp, 
  currency, 
  total_cloths_created,
  highest_score
FROM player_profile 
WHERE user_id = 'test-user-12345'::uuid;
```
应该看到:
- level = 2
- exp = 220 (150 + 70)
- currency = 80 (50 + 30)
- total_cloths_created = 1
- highest_score = 77

```sql
-- 检查评分记录
SELECT * FROM cloth_scores 
WHERE user_id = 'test-user-12345'::uuid;
```

---

### Step 4: 测试排行榜视图

```sql
-- 按等级排行
SELECT * FROM leaderboard_by_level LIMIT 10;

-- 按分数排行
SELECT * FROM leaderboard_by_score LIMIT 10;
```

**预期结果**: 应该能看到测试用户的数据

---

### Step 5: 测试RLS策略

```sql
-- 测试1: 查看档案（应该成功）
SET request.jwt.claims TO '{"sub": "test-user-12345"}';
SELECT * FROM player_profile WHERE user_id = 'test-user-12345'::uuid;

-- 测试2: 更新自己的档案（应该成功）
UPDATE player_profile 
SET dye_house_name = '测试染坊' 
WHERE user_id = 'test-user-12345'::uuid;

-- 测试3: 更新别人的档案（应该失败）
SET request.jwt.claims TO '{"sub": "other-user"}';
UPDATE player_profile 
SET currency = 99999 
WHERE user_id = 'test-user-12345'::uuid;
-- 预期: 0 rows affected
```

---

## 🎯 完整测试脚本

复制以下脚本到SQL Editor一次性执行：

```sql
BEGIN;

-- ============================================================
-- 游戏系统数据库测试
-- ============================================================

-- 1. 清理旧测试数据
DELETE FROM cloth_scores WHERE user_id = 'test-user-12345'::uuid;
DELETE FROM cloths WHERE id = 'test-cloth-12345'::uuid;
DELETE FROM player_profile WHERE user_id = 'test-user-12345'::uuid;

-- 2. 初始化测试用户
SELECT init_player_profile('test-user-12345'::uuid);

-- 3. 验证初始状态
DO $$
DECLARE
  v_profile player_profile%ROWTYPE;
BEGIN
  SELECT * INTO v_profile 
  FROM player_profile 
  WHERE user_id = 'test-user-12345'::uuid;
  
  ASSERT v_profile.level = 1, '初始等级应为1';
  ASSERT v_profile.exp = 0, '初始经验应为0';
  ASSERT v_profile.currency = 0, '初始货币应为0';
  
  RAISE NOTICE '✅ 初始状态正确';
END $$;

-- 4. 测试添加经验
DO $$
DECLARE
  v_result RECORD;
BEGIN
  SELECT * INTO v_result 
  FROM add_experience('test-user-12345'::uuid, 150);
  
  ASSERT v_result.leveled_up = true, '应该升级';
  ASSERT v_result.new_level = 2, '应该升到Lv2';
  ASSERT v_result.currency_reward = 50, '应该获得50货币';
  
  RAISE NOTICE '✅ 经验系统正确';
END $$;

-- 5. 测试评分系统
INSERT INTO cloths (id, creator_id, status, layers)
VALUES (
  'test-cloth-12345'::uuid,
  'test-user-12345'::uuid,
  'completed',
  '[]'::jsonb
);

DO $$
DECLARE
  v_result RECORD;
  v_profile player_profile%ROWTYPE;
BEGIN
  SELECT * INTO v_result 
  FROM submit_cloth_score(
    'test-cloth-12345'::uuid,
    'test-user-12345'::uuid,
    85, 75, 80, 70
  );
  
  ASSERT v_result.total_score BETWEEN 75 AND 80, '总分应在75-80之间';
  ASSERT v_result.grade = 'A', '等级应为A';
  ASSERT v_result.exp_reward = 70, '经验奖励应为70';
  ASSERT v_result.currency_reward = 30, '货币奖励应为30';
  
  -- 验证档案更新
  SELECT * INTO v_profile 
  FROM player_profile 
  WHERE user_id = 'test-user-12345'::uuid;
  
  ASSERT v_profile.exp = 220, '总经验应为220';
  ASSERT v_profile.currency = 80, '总货币应为80';
  ASSERT v_profile.total_cloths_created = 1, '作品数应为1';
  
  RAISE NOTICE '✅ 评分系统正确';
END $$;

-- 6. 测试等级计算
DO $$
DECLARE
  v_exp_required INT;
BEGIN
  v_exp_required := calculate_exp_for_level(2);
  ASSERT v_exp_required = 100, 'Lv2所需经验应为100';
  
  v_exp_required := calculate_exp_for_level(3);
  ASSERT v_exp_required BETWEEN 280 AND 290, 'Lv3所需经验应约为283';
  
  RAISE NOTICE '✅ 等级计算正确';
END $$;

-- 7. 显示最终状态
SELECT 
  '最终测试结果' as title,
  level,
  exp,
  currency,
  total_cloths_created,
  highest_score
FROM player_profile 
WHERE user_id = 'test-user-12345'::uuid;

SELECT 
  '评分记录' as title,
  total_score,
  grade,
  exp_reward,
  currency_reward
FROM cloth_scores 
WHERE user_id = 'test-user-12345'::uuid;

RAISE NOTICE '🎉 所有测试通过！';

ROLLBACK;  -- 回滚测试数据，不影响生产环境
-- 如果要保留测试数据，改为 COMMIT;
```

---

## ✅ 成功标准

如果你看到：
```
✅ 初始状态正确
✅ 经验系统正确  
✅ 评分系统正确
✅ 等级计算正确
🎉 所有测试通过！
```

**恭喜！数据库系统完全正常！**

---

## ❌ 故障排查

### 问题1: 找不到函数
```
ERROR: function add_experience does not exist
```
**原因**: 迁移文件未成功执行  
**解决**: 重新执行 Step 1

### 问题2: 权限错误
```
ERROR: permission denied for table player_profile
```
**原因**: RLS策略导致  
**解决**: 
```sql
-- 临时禁用RLS进行测试
ALTER TABLE player_profile DISABLE ROW LEVEL SECURITY;
-- 测试完成后重新启用
ALTER TABLE player_profile ENABLE ROW LEVEL SECURITY;
```

### 问题3: UUID类型错误
```
ERROR: invalid input syntax for type uuid
```
**原因**: 字符串未转换为UUID  
**解决**: 使用 `'xxx'::uuid` 或 `'xxx'::uuid`

---

## 📊 测试报告模板

测试完成后，请填写：

```markdown
测试日期: ____
测试人: ____

✅/❌ Step 1: 执行迁移
✅/❌ Step 2: 验证表创建
✅/❌ Step 3: 测试核心函数
  ✅/❌ 3.1 初始化档案
  ✅/❌ 3.2 计算经验
  ✅/❌ 3.3 添加经验
  ✅/❌ 3.4 提交评分
✅/❌ Step 4: 测试排行榜
✅/❌ Step 5: 测试RLS策略

遇到的问题:
1. ____
2. ____

总结: ____
```

---

**准备好了吗？** 让我们开始测试！ 🚀
