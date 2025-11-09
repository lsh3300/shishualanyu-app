# Git版本管理与多版本备份指南

## 查看之前版本的方法

### 1. 查看提交历史

```bash
# 查看简洁的提交历史（每行一个提交）
git log --oneline

# 查看最近N次提交
git log --oneline -N  # 例如: git log --oneline -5

# 查看详细的提交历史
git log

# 查看图形化的提交历史
git log --graph --oneline --all

# 查看特定文件的提交历史
git log -- 文件名
```

### 2. 查看特定版本的详细信息

```bash
# 查看特定提交的详细信息（替换<commit-id>为实际的提交ID）
git show <commit-id>

# 查看特定提交中特定文件的更改
git show <commit-id>:文件路径

# 查看两个提交之间的差异
git diff <commit-id1> <commit-id>

# 查看当前工作区与特定提交的差异
git diff <commit-id>
```

### 3. 检出之前的版本

```bash
# 检出特定提交（这将创建一个"分离HEAD"状态）
git checkout <commit-id>

# 检出特定提交的特定文件
git checkout <commit-id> -- 文件路径

# 检出并创建新分支基于特定提交
git checkout -b 新分支名 <commit-id>
```

## 多版本备份策略

### 1. 使用Git标签标记重要版本

```bash
# 创建轻量级标签
git tag v1.0.0 <commit-id>

# 创建带注释的标签（推荐）
git tag -a v1.0.0 -m "版本1.0.0发布" <commit-id>

# 查看所有标签
git tag

# 查看特定标签的详细信息
git show v1.0.0

# 推送标签到远程仓库
git push origin v1.0.0

# 推送所有标签到远程仓库
git push origin --tags
```

### 2. 使用分支进行版本管理

```bash
# 创建版本分支
git checkout -b version-1.0

# 切换到主分支
git checkout main

# 查看所有分支
git branch -a

# 比较两个分支的差异
git diff main version-1.0

# 合并分支
git checkout main
git merge version-1.0
```

### 3. 使用GitHub Releases进行版本发布

1. 在GitHub仓库页面点击"Releases"选项卡
2. 点击"Create a new release"
3. 选择或创建一个标签
4. 填写版本说明
5. 上传相关文件（可选）
6. 点击"Publish release"

### 4. 多仓库备份策略

#### 方案一：主仓库+镜像仓库

```bash
# 添加多个远程仓库
git remote add origin https://github.com/lsh3300/shishualanyu-app.git
git remote add mirror https://gitlab.com/username/shishualanyu-app.git

# 推送到所有远程仓库
git push origin main
git push mirror main

# 同时推送到所有远程仓库
git remote | xargs -I {} git push {} main
```

#### 方案二：使用GitHub Actions自动同步

创建`.github/workflows/sync.yml`文件：

```yaml
name: Sync to Multiple Repositories

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Mirror to GitLab
      uses: pixta-dev/repository-mirroring-action@v1
      with:
        target_repo_url: git@gitlab.com:username/shishualanyu-app.git
        ssh_private_key: ${{ secrets.GITLAB_SSH_PRIVATE_KEY }}
```

## 版本恢复操作

### 1. 恢复到特定版本

```bash
# 方法一：使用revert（推荐，不会丢失历史）
git revert <commit-id>

# 方法二：使用reset（会丢失之后的历史，谨慎使用）
git reset --hard <commit-id>
git push --force-with-lease origin main
```

### 2. 从特定版本创建新分支

```bash
# 基于特定提交创建新分支
git checkout -b 恢复版本 <commit-id>

# 推送新分支到远程
git push origin 恢复版本
```

## 自动化备份脚本

### 1. 创建定期备份脚本

创建`backup.sh`（Linux/Mac）或`backup.bat`（Windows）：

Windows批处理文件示例：
```batch
@echo off
echo 开始备份项目...

cd /d "C:\Users\lsh\Desktop\世说蓝语app"

rem 检查是否有未提交的更改
git status --porcelain
if %errorlevel% neq 0 (
    echo 有未提交的更改，正在提交...
    git add .
    git commit -m "自动备份 - %date% %time%"
) else (
    echo 没有未提交的更改
)

rem 推送到远程仓库
git push

echo 备份完成！
pause
```

### 2. 使用GitHub Actions进行自动备份

创建`.github/workflows/backup.yml`：

```yaml
name: 自动备份

on:
  schedule:
    # 每天UTC时间02:00（北京时间10:00）运行
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: 创建备份提交
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add .
        git commit -m "自动备份 - $(date '+%Y-%m-%d %H:%M:%S')" || exit 0
        git push
```

## 最佳实践

1. **定期提交**：每天完成重要工作后提交
2. **版本标记**：完成重要里程碑时创建标签
3. **分支策略**：使用分支进行实验性开发
4. **提交信息**：使用清晰、有意义的提交信息
5. **多地点备份**：除了GitHub，考虑其他云存储
6. **定期检查**：每月检查备份完整性

## 紧急恢复流程

1. 确定需要恢复的版本（通过git log查看）
2. 创建新分支基于该版本
3. 测试恢复的版本
4. 如需替换主分支，谨慎使用reset命令
5. 通知团队成员恢复操作

## 联系信息

如有问题，请联系项目维护者。