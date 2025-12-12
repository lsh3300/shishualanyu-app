# Requirements Document

## Introduction

本文档定义了"蓝染·漂流记"游戏商店管理系统的完善需求。包括下架功能、上架管理、交易记录查看、以及货币消费功能（背包扩容、上架位扩容、购买道具等）。

## Glossary

- **Shop Management（商店管理）**: 管理上架作品的界面和功能
- **Listing（上架）**: 将作品放到商店出售的状态
- **Withdraw（下架）**: 将作品从商店撤回到背包
- **Transaction（交易）**: 作品买卖的记录
- **Currency（货币/蓝草币）**: 游戏内货币，用于购买和扩容
- **Expansion（扩容）**: 增加背包或上架位的容量
- **Featured（推荐位）**: 商店中突出显示的作品位置

## Requirements

### Requirement 1: 下架功能完善

**User Story:** As a 玩家, I want 能够下架我的作品, so that 我能灵活管理商店中的作品。

#### Acceptance Criteria

1. WHEN 用户在商店管理界面点击下架按钮 THEN the Shop System SHALL 显示确认对话框
2. WHEN 用户确认下架 THEN the Shop System SHALL 将作品状态从"已上架"更新为"在背包中"
3. WHEN 下架成功 THEN the Shop System SHALL 刷新商店列表并显示成功提示
4. IF 下架过程中发生错误 THEN the Shop System SHALL 显示错误原因并保持作品状态不变

### Requirement 2: 上架管理界面

**User Story:** As a 玩家, I want 有一个专门的界面管理我的上架作品, so that 我能方便地查看和调整上架状态。

#### Acceptance Criteria

1. WHEN 用户点击"管理上架"按钮 THEN the Shop System SHALL 显示上架管理对话框
2. WHEN 管理界面打开 THEN the Shop System SHALL 显示所有已上架作品的列表（包含预览图、价格、上架时间）
3. WHEN 用户点击某个作品的"调整价格"按钮 THEN the Shop System SHALL 允许用户修改价格
4. WHEN 用户点击某个作品的"下架"按钮 THEN the Shop System SHALL 执行下架流程
5. WHEN 用户点击"设为推荐"按钮 THEN the Shop System SHALL 将该作品标记为推荐位（最多1个）

### Requirement 3: 交易记录查看

**User Story:** As a 玩家, I want 查看我的交易历史, so that 我能了解我的销售情况。

#### Acceptance Criteria

1. WHEN 用户点击"交易记录"按钮 THEN the Shop System SHALL 显示交易记录对话框
2. WHEN 交易记录界面打开 THEN the Shop System SHALL 显示最近50条交易记录
3. WHEN 显示交易记录 THEN the Shop System SHALL 包含交易时间、作品预览、成交价格、买家信息
4. WHEN 交易类型为系统收购 THEN the Shop System SHALL 显示"系统收购"标签
5. WHEN 用户切换"我的销售/我的购买"标签 THEN the Shop System SHALL 显示对应类型的交易记录

### Requirement 4: 背包扩容功能

**User Story:** As a 玩家, I want 能够扩容我的背包, so that 我能保存更多作品。

#### Acceptance Criteria

1. WHEN 用户背包已满 THEN the Inventory System SHALL 显示"扩容"按钮
2. WHEN 用户点击扩容按钮 THEN the Inventory System SHALL 显示扩容确认对话框（显示价格和增加格数）
3. WHEN 用户货币足够且确认扩容 THEN the Inventory System SHALL 扣除货币并增加背包容量
4. IF 用户货币不足 THEN the Inventory System SHALL 显示"货币不足"提示并禁用确认按钮
5. WHEN 扩容成功 THEN the Inventory System SHALL 刷新容量显示并显示成功提示

### Requirement 5: 上架位扩容功能

**User Story:** As a 玩家, I want 能够扩容我的上架位, so that 我能同时出售更多作品。

#### Acceptance Criteria

1. WHEN 用户上架位已满 THEN the Shop System SHALL 显示"扩容上架位"按钮
2. WHEN 用户点击扩容按钮 THEN the Shop System SHALL 显示扩容确认对话框
3. WHEN 用户货币足够且确认扩容 THEN the Shop System SHALL 扣除货币并增加上架位数量
4. IF 用户货币不足 THEN the Shop System SHALL 显示"货币不足"提示
5. WHEN 扩容价格 THEN the Shop System SHALL 根据当前上架位数量递增计算（基础300币，每次+100）

### Requirement 6: 道具商城（货币消费）

**User Story:** As a 玩家, I want 能够用货币购买有用的道具, so that 我能提升游戏体验。

#### Acceptance Criteria

1. WHEN 用户访问道具商城 THEN the Shop System SHALL 显示可购买的道具列表
2. WHEN 显示道具 THEN the Shop System SHALL 包含道具图标、名称、描述、价格
3. WHEN 用户点击购买道具 THEN the Shop System SHALL 检查货币是否足够
4. WHEN 购买成功 THEN the Shop System SHALL 扣除货币并将道具添加到用户背包
5. WHEN 道具为消耗品 THEN the Shop System SHALL 显示当前持有数量

### Requirement 7: 价格调整功能

**User Story:** As a 玩家, I want 能够调整已上架作品的价格, so that 我能根据市场情况灵活定价。

#### Acceptance Criteria

1. WHEN 用户在管理界面选择调整价格 THEN the Shop System SHALL 显示价格输入框和建议价格
2. WHEN 用户输入新价格 THEN the Shop System SHALL 验证价格在合理范围内（1-99999）
3. WHEN 用户确认调整 THEN the Shop System SHALL 更新作品价格并显示成功提示
4. IF 价格无效 THEN the Shop System SHALL 显示错误提示并阻止提交

