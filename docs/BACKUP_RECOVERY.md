# 世说蓝语app - 后端备份与恢复策略

## 概述

本文档详细说明了世说蓝语app的后端数据备份与恢复策略，确保数据安全性和业务连续性。

## 数据库架构

### 主要数据表

1. **profiles** - 用户资料
2. **products** - 产品信息
3. **orders** - 订单数据
4. **order_items** - 订单项
5. **courses** - 课程信息
6. **enrollments** - 课程报名

### 数据重要性分类

| 表名 | 数据重要性 | 更新频率 | 恢复优先级 |
|------|------------|----------|------------|
| profiles | 高 | 低 | 1 |
| orders | 高 | 高 | 2 |
| order_items | 高 | 高 | 2 |
| products | 中 | 中 | 3 |
| courses | 中 | 低 | 4 |
| enrollments | 中 | 中 | 3 |

## 备份策略

### 1. 自动备份

#### Supabase自动备份

Supabase提供每日自动备份功能，保留7天。这是我们的主要备份机制。

```sql
-- 查看可用备份（在Supabase SQL编辑器中运行）
SELECT * FROM pg_backup_history();
```

#### 增量备份脚本

创建每日增量备份脚本，存储关键数据变更：

```javascript
// scripts/backup-daily.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function dailyBackup() {
  const date = new Date().toISOString().split('T')[0];
  
  // 备份关键表
  const tables = ['profiles', 'orders', 'order_items', 'products'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*');
      
    if (error) {
      console.error(`备份 ${table} 表失败:`, error);
      continue;
    }
    
    // 保存到文件或云存储
    await saveBackupData(table, data, date);
  }
  
  console.log(`每日备份完成: ${date}`);
}

dailyBackup();
```

### 2. 手动备份

#### 完整数据库备份

在重大更新或部署前执行完整备份：

```sql
-- 创建完整数据库备份
pg_dump supabase_db > backup_full_$(date +%Y%m%d).sql
```

#### 特定表备份

```sql
-- 备份用户资料表
pg_dump supabase_db -t profiles > backup_profiles_$(date +%Y%m%d).sql

-- 备份订单相关表
pg_dump supabase_db -t orders -t order_items > backup_orders_$(date +%Y%m%d).sql
```

### 3. 云存储备份

#### AWS S3备份配置

```javascript
// scripts/backup-to-s3.js
const AWS = require('aws-sdk');
const fs = require('fs');
const { execSync } = require('child_process');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function uploadBackupToS3(filePath, bucketName) {
  const fileContent = fs.readFileSync(filePath);
  const fileName = `backups/${Date.now()}_${filePath.split('/').pop()}`;
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    StorageClass: 'STANDARD_IA' // 使用低频访问存储类降低成本
  };
  
  return s3.upload(params).promise();
}

// 执行备份并上传
async function backupAndUpload() {
  const date = new Date().toISOString().split('T')[0];
  const backupFile = `backup_${date}.sql`;
  
  // 创建数据库备份
  execSync(`pg_dump supabase_db > ${backupFile}`);
  
  // 上传到S3
  await uploadBackupToS3(backupFile, 'shilan-app-backups');
  
  // 清理本地文件
  fs.unlinkSync(backupFile);
  
  console.log('备份已上传到S3');
}

backupAndUpload();
```

## 恢复策略

### 1. 完整数据库恢复

#### 从Supabase控制台恢复

1. 登录Supabase控制台
2. 进入项目设置 > 备份
3. 选择要恢复的时间点
4. 确认恢复操作

#### 使用SQL文件恢复

```sql
-- 恢复完整数据库
psql supabase_db < backup_full_20231101.sql
```

### 2. 特定表恢复

```sql
-- 恢复特定表
psql supabase_db < backup_profiles_20231101.sql
```

### 3. 部分数据恢复

#### 使用时间点恢复

```sql
-- 查询特定时间点的数据状态
SELECT * FROM orders 
AS OF SYSTEM TIME '2023-11-01 12:00:00'
WHERE user_id = 'user-uuid';
```

#### 数据合并恢复

```javascript
// scripts/merge-recovery.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function mergeRecoveredData(table, recoveredData) {
  for (const record of recoveredData) {
    // 检查记录是否已存在
    const { data: existing } = await supabase
      .from(table)
      .select('id')
      .eq('id', record.id)
      .single();
      
    if (!existing) {
      // 插入新记录
      await supabase
        .from(table)
        .insert(record);
    }
  }
}
```

## 备份计划

### 自动备份计划

| 备份类型 | 频率 | 保留期 | 存储位置 |
|----------|------|--------|----------|
| 增量备份 | 每日 | 30天 | 云存储 |
| 完整备份 | 每周 | 90天 | 云存储 |
| 月度归档 | 每月 | 1年 | 冷存储 |

### 手动备份触发条件

1. 重大功能更新前
2. 数据库架构变更前
3. 季度/年度财务结算前
4. 安全事件后

## 灾难恢复计划

### RTO/RPO目标

| 指标 | 目标 | 说明 |
|------|------|------|
| RTO (恢复时间目标) | 4小时 | 从灾难发生到系统恢复运行的时间 |
| RPO (恢复点目标) | 24小时 | 可接受的最大数据丢失量 |

### 灾难恢复步骤

1. **评估灾难范围**
   - 确定受影响的数据和服务
   - 评估数据丢失程度

2. **启动恢复流程**
   - 通知相关人员
   - 记录恢复开始时间

3. **数据恢复**
   - 选择最近的可用备份
   - 执行数据恢复操作

4. **验证数据完整性**
   - 检查关键数据表
   - 验证数据一致性

5. **系统恢复**
   - 重启应用服务
   - 监控系统运行状态

6. **事后分析**
   - 记录灾难原因
   - 更新预防措施

## 备份监控与告警

### 备份状态监控

```javascript
// scripts/backup-monitor.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBackupStatus() {
  // 检查最近备份时间
  const { data, error } = await supabase
    .from('backup_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('检查备份状态失败:', error);
    return;
  }
  
  const lastBackup = data[0];
  const now = new Date();
  const lastBackupTime = new Date(lastBackup.created_at);
  const hoursSinceLastBackup = (now - lastBackupTime) / (1000 * 60 * 60);
  
  if (hoursSinceLastBackup > 24) {
    // 发送告警
    await sendAlert(`超过24小时未执行备份，上次备份时间: ${lastBackup.created_at}`);
  }
}

async function sendAlert(message) {
  // 实现告警通知逻辑（邮件、短信、Slack等）
  console.log('告警:', message);
}

checkBackupStatus();
```

### 备份验证

```javascript
// scripts/backup-verify.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyBackup() {
  // 获取关键表的记录数
  const tables = ['profiles', 'orders', 'products'];
  const counts = {};
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error(`获取 ${table} 表记录数失败:`, error);
      return;
    }
    
    counts[table] = count;
  }
  
  // 记录验证结果
  await supabase
    .from('backup_verification')
    .insert({
      verification_date: new Date().toISOString(),
      table_counts: counts,
      status: 'success'
    });
    
  console.log('备份验证完成:', counts);
}

verifyBackup();
```

## 最佳实践

1. **定期测试恢复流程**
   - 每季度进行一次恢复演练
   - 验证备份文件的可用性

2. **加密敏感数据**
   - 对备份文件进行加密
   - 安全管理加密密钥

3. **多地域备份**
   - 将备份存储在不同地理位置
   - 避免单点故障

4. **文档更新**
   - 及时更新备份策略文档
   - 记录所有变更

5. **权限管理**
   - 限制备份访问权限
   - 定期审查访问日志

## 联系信息

| 角色 | 负责人 | 联系方式 |
|------|--------|----------|
| 数据库管理员 | DBA团队 | dba@shilan.com |
| 运维负责人 | Ops团队 | ops@shilan.com |
| 技术总监 | CTO | cto@shilan.com |

## 相关文档

- [世说蓝语app部署指南](./DEPLOYMENT.md)
- [Supabase备份文档](https://supabase.com/docs/guides/platform/backups)
- [Next.js生产环境最佳实践](https://nextjs.org/docs/going-to-production)