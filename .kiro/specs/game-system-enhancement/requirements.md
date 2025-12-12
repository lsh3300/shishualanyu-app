# Requirements Document

## Introduction

本文档定义了"蓝染·漂流记"游戏系统的修复和完善需求。当前游戏功能完成度约35%，存在评分系统不完整、测试代码混入生产环境、核心玩法未实现等问题。本次迭代目标是修复现有问题并完善核心功能，使游戏能够真正运行。

## Glossary

- **Game System（游戏系统）**: 蓝染·漂流记游戏的整体功能模块
- **Workshop（工坊）**: 用户创作蓝染作品的画布界面
- **Scoring System（评分系统）**: 对用户作品进行多维度评分的算法
- **Player Profile（玩家档案）**: 存储玩家等级、经验、货币等数据的系统
- **Inventory（背包）**: 用户保存作品的存储系统
- **Shop（商店）**: 用户展示和出售作品的界面
- **Drift River（漂流河）**: 多人协作接力染布的核心玩法
- **ClothLayer（布料图层）**: 用户在画布上添加的单个图案层
- **ScoreGrade（评分等级）**: C/B/A/S/SS/SSS 六个等级

## Requirements

### Requirement 1: 评分系统修复

**User Story:** As a 玩家, I want 我的作品能够获得准确的评分, so that 我能了解作品的真实质量并获得相应奖励。

#### Acceptance Criteria

1. WHEN 用户提交作品评分 THEN the Scoring System SHALL 基于实际图层数据计算颜色分数（而非固定值85）
2. WHEN 用户作品包含多个图层 THEN the Scoring System SHALL 分析图层的染色深度分布并计算颜色匹配度
3. WHEN 评分计算完成 THEN the Scoring System SHALL 返回四个维度的分数（颜色、纹样、创意、技法）且每个分数在0-100范围内
4. WHEN 评分结果生成 THEN the Scoring System SHALL 根据总分正确映射到对应等级（C<60, B<70, A<80, S<90, SS<95, SSS>=95）

### Requirement 2: 测试模式隔离

**User Story:** As a 开发者, I want 测试代码与生产代码分离, so that 生产环境不会受到测试逻辑的影响。

#### Acceptance Criteria

1. WHEN 用户未登录访问游戏API THEN the Game System SHALL 返回401未授权错误（而非使用临时用户ID）
2. WHEN 环境变量NODE_ENV为development THEN the Game System SHALL 允许通过特定header启用测试模式
3. WHEN 测试模式启用 THEN the Game System SHALL 在响应中标记isTestMode为true
4. IF 生产环境收到测试模式请求 THEN the Game System SHALL 拒绝请求并返回403错误

### Requirement 3: 玩家档案系统完善

**User Story:** As a 玩家, I want 我的游戏进度能够正确保存和显示, so that 我能看到自己的成长。

#### Acceptance Criteria

1. WHEN 新用户首次进入游戏 THEN the Player Profile System SHALL 自动创建玩家档案并设置默认值
2. WHEN 用户完成作品评分 THEN the Player Profile System SHALL 正确增加经验值和货币
3. WHEN 用户经验值达到升级阈值 THEN the Player Profile System SHALL 自动升级并发放升级奖励
4. WHEN 用户查看个人档案 THEN the Player Profile System SHALL 显示准确的等级、经验进度、货币余额和创作统计

### Requirement 4: 背包系统完善

**User Story:** As a 玩家, I want 我的作品能够正确保存到背包, so that 我能管理和查看我的创作。

#### Acceptance Criteria

1. WHEN 用户完成作品创作 THEN the Inventory System SHALL 将作品保存到"最近创作"分类
2. WHEN 用户手动保存作品到背包 THEN the Inventory System SHALL 将作品移动到"背包"分类
3. WHEN 背包中作品数量超过上限 THEN the Inventory System SHALL 提示用户并阻止新增
4. WHEN 用户查看背包 THEN the Inventory System SHALL 显示作品缩略图、评分等级和创建时间

### Requirement 5: 商店系统基础功能

**User Story:** As a 玩家, I want 能够在商店上架和管理我的作品, so that 我能展示和出售我的创作。

#### Acceptance Criteria

1. WHEN 用户首次访问商店 THEN the Shop System SHALL 自动创建用户商店
2. WHEN 用户选择上架作品 THEN the Shop System SHALL 根据作品评分计算建议价格
3. WHEN 用户确认上架 THEN the Shop System SHALL 将作品状态更新为"已上架"并显示在商店中
4. WHEN 用户下架作品 THEN the Shop System SHALL 将作品状态恢复为"在背包中"

### Requirement 6: 错误处理和用户反馈

**User Story:** As a 玩家, I want 在操作失败时获得清晰的错误提示, so that 我知道发生了什么问题。

#### Acceptance Criteria

1. WHEN API请求失败 THEN the Game System SHALL 显示用户友好的错误消息（而非技术错误）
2. WHEN 网络连接中断 THEN the Game System SHALL 提示用户检查网络并提供重试选项
3. WHEN 操作成功完成 THEN the Game System SHALL 显示成功提示（如保存成功、上架成功）
4. IF 画布渲染出错 THEN the Game System SHALL 捕获错误并显示降级界面

### Requirement 7: 数据库初始化和迁移

**User Story:** As a 开发者, I want 数据库能够正确初始化, so that 游戏功能能够正常运行。

#### Acceptance Criteria

1. WHEN 执行数据库初始化 THEN the Database System SHALL 创建所有必需的表（player_profile, cloths, user_inventory, user_shops等）
2. WHEN 表已存在时执行迁移 THEN the Database System SHALL 跳过已存在的表并只添加新字段
3. WHEN 创建表时 THEN the Database System SHALL 同时创建必要的索引和RLS策略
4. WHEN 初始化完成 THEN the Database System SHALL 返回成功状态和创建的表列表
