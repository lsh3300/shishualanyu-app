# Implementation Plan

## Phase 1: 基础设施和配置

- [x] 1. 创建游戏系统配置和错误处理基础
  - [x] 1.1 创建游戏配置文件 `lib/game/config.ts`
    - 定义环境配置（isProduction, allowTestMode）
    - 定义测试模式header常量
    - 定义等级系统配置常量
    - _Requirements: 2.1, 2.2_
  - [x] 1.2 创建统一错误类型 `lib/game/errors.ts`
    - 实现 GameError 基类
    - 实现 AuthError, ValidationError, InventoryFullError 等子类
    - _Requirements: 6.1, 6.2_
  - [x] 1.3 创建API认证中间件 `lib/game/middleware/auth.ts`
    - 实现 requireAuth 函数
    - 支持开发环境测试模式
    - 生产环境拒绝测试模式请求
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 1.4 编写配置和错误处理的单元测试
    - 测试环境配置正确性
    - 测试错误类型实例化
    - _Requirements: 2.1, 2.2_

## Phase 2: 评分系统修复

- [ ] 2. 重构评分计算逻辑
  - [ ] 2.1 重写颜色分数计算函数 `calculateColorScore`
    - 基于染色深度分布计算（30分）
    - 基于深度变化丰富度计算（30分）
    - 基于颜色和谐度计算（40分）
    - _Requirements: 1.1, 1.2_




  - [ ]* 2.2 编写属性测试：颜色分数动态计算
    - **Property 1: 颜色分数动态计算**
    - **Validates: Requirements 1.1**
  - [ ] 2.3 优化纹样分数计算函数 `calculatePatternComplexity`
    - 确保返回值在0-100范围内
    - _Requirements: 1.3_

  - [ ] 2.4 优化创意分数计算函数 `calculateCreativityScore`
    - 确保返回值在0-100范围内

    - _Requirements: 1.3_
  - [x] 2.5 优化技法分数计算函数 `calculateTechniqueScore`

    - 确保返回值在0-100范围内
    - _Requirements: 1.3_
  - [ ]* 2.6 编写属性测试：分数范围约束
    - **Property 2: 分数范围约束**
    - **Validates: Requirements 1.3**

  - [ ] 2.7 修复等级映射函数 `calculateTotalScore`
    - 确保等级边界正确：C(<60), B(60-69), A(70-79), S(80-89), SS(90-94), SSS(>=95)
    - _Requirements: 1.4_
  - [ ]* 2.8 编写属性测试：等级映射正确性
    - **Property 3: 等级映射正确性**
    - **Validates: Requirements 1.4**

- [ ] 3. Checkpoint - 确保评分系统测试通过
  - Ensure all tests pass, ask the user if questions arise.





## Phase 3: 评分API修复

- [x] 4. 修复评分API

  - [ ] 4.1 重构 `/api/game/score/route.ts`
    - 使用新的认证中间件
    - 移除硬编码的测试用户ID
    - 未登录时返回401错误
    - _Requirements: 2.1, 2.3, 2.4_
  - [ ] 4.2 添加评分结果验证
    - 验证四个维度分数在有效范围内
    - 验证等级映射正确
    - _Requirements: 1.3, 1.4_




  - [ ]* 4.3 编写API集成测试
    - 测试未登录返回401

    - 测试正常评分流程
    - _Requirements: 2.1_

## Phase 4: 玩家档案系统完善

- [x] 5. 完善玩家档案系统


  - [ ] 5.1 更新 `hooks/game/use-player-profile.ts`
    - 优化档案自动创建逻辑
    - 添加错误处理和用户反馈
    - _Requirements: 3.1, 3.4_
  - [ ] 5.2 实现经验值增加和升级逻辑
    - 创建或更新数据库函数 `add_experience`
    - 正确计算升级和奖励



    - _Requirements: 3.2, 3.3_

  - [ ]* 5.3 编写属性测试：经验值升级一致性
    - **Property 4: 经验值升级一致性**

    - **Validates: Requirements 3.2, 3.3**

  - [ ] 5.4 更新 `PlayerStatsCard` 组件
    - 显示准确的等级、经验进度、货币余额
    - 添加加载状态和错误状态
    - _Requirements: 3.4_



- [ ] 6. Checkpoint - 确保玩家档案系统测试通过
  - Ensure all tests pass, ask the user if questions arise.




## Phase 5: 背包系统完善


- [ ] 7. 完善背包系统
  - [ ] 7.1 创建背包服务 `lib/services/inventoryService.ts`
    - 实现 saveToRecent 函数


    - 实现 moveToInventory 函数
    - 实现 getInventoryCapacity 函数
    - _Requirements: 4.1, 4.2, 4.3_

  - [-] 7.2 更新 `/api/inventory/route.ts`

    - 添加容量检查
    - 返回正确的错误信息

    - _Requirements: 4.3_
  - [ ]* 7.3 编写属性测试：背包容量限制
    - **Property 5: 背包容量限制**
    - **Validates: Requirements 4.3**
  - [ ] 7.4 更新背包页面 `/game/inventory/page.tsx`
    - 显示作品缩略图、评分等级和创建时间
    - 添加容量显示
    - _Requirements: 4.4_





## Phase 6: 商店系统基础功能

- [ ] 8. 实现商店基础功能
  - [ ] 8.1 更新商店服务 `lib/services/shopService.ts`
    - 实现 ensureUserShop 函数（自动创建商店）


    - 实现 calculateSuggestedPrice 函数
    - _Requirements: 5.1, 5.2_
  - [ ]* 8.2 编写属性测试：建议价格计算
    - **Property 6: 建议价格计算**


    - **Validates: Requirements 5.2**

  - [ ] 8.3 创建上架API `/api/listings/create/route.ts`
    - 验证作品状态
    - 创建上架记录
    - 更新作品状态
    - _Requirements: 5.3_
  - [ ] 8.4 创建下架API `/api/listings/withdraw/route.ts`
    - 验证上架记录存在
    - 更新状态为已下架
    - 恢复作品到背包
    - _Requirements: 5.4_
  - [ ] 8.5 更新商店页面 `/game/shop/page.tsx`
    - 集成上架/下架功能
    - 显示建议价格
    - _Requirements: 5.2, 5.3, 5.4_

- [ ] 9. Checkpoint - 确保商店系统测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: 数据库初始化和迁移

- [ ] 10. 完善数据库初始化
  - [ ] 10.1 创建统一的数据库初始化脚本 `supabase/migrations/game_system_init.sql`
    - 使用 IF NOT EXISTS 确保幂等性
    - 创建所有必需的表
    - 创建索引和RLS策略
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 10.2 编写属性测试：数据库迁移幂等性
    - **Property 7: 数据库迁移幂等性**
    - **Validates: Requirements 7.2**
  - [ ] 10.3 创建数据库初始化API `/api/game/init-db/route.ts`
    - 执行迁移脚本
    - 返回创建的表列表
    - _Requirements: 7.4_

## Phase 8: 错误处理和用户反馈

- [ ] 11. 完善错误处理和用户反馈
  - [ ] 11.1 创建错误处理Hook `hooks/game/use-api-error.ts`
    - 统一处理API错误
    - 显示用户友好的错误消息
    - _Requirements: 6.1_
  - [ ] 11.2 创建画布错误边界组件 `components/game/canvas/CanvasErrorBoundary.tsx`
    - 捕获画布渲染错误
    - 显示降级界面
    - _Requirements: 6.4_
  - [ ] 11.3 更新工坊页面添加错误边界
    - 包裹 IndigoCanvas 组件
    - 添加重试功能
    - _Requirements: 6.4_
  - [ ] 11.4 添加成功提示
    - 保存成功提示
    - 上架成功提示
    - 评分完成提示
    - _Requirements: 6.3_

## Phase 9: 集成测试和最终验证

- [ ] 12. 集成测试和文档更新
  - [ ]* 12.1 编写端到端测试
    - 测试完整的创作→评分→保存→上架流程
    - _Requirements: 1.1-7.4_
  - [ ] 12.2 更新游戏开发文档
    - 更新 game-dev/README.md
    - 记录API变更
    - _Requirements: 7.4_

- [ ] 13. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.
