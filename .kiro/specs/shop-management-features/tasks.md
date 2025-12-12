# Implementation Plan

## 1. 下架功能完善

- [x] 1.1 修复下架 API 认证问题
  - 更新 `/api/listings/withdraw/route.ts` 使用 Authorization header 认证
  - 与其他 API 保持一致的认证方式
  - _Requirements: 1.2, 1.4_

- [x] 1.2 创建下架确认对话框组件
  - 创建 `components/game/listings/WithdrawConfirmDialog.tsx`
  - 显示作品预览和确认按钮
  - _Requirements: 1.1, 1.3_

- [ ]* 1.3 Write property test for withdraw status consistency
  - **Property 1: 下架状态一致性**
  - **Validates: Requirements 1.2**

## 2. 上架管理界面

- [x] 2.1 创建上架管理对话框组件
  - 创建 `components/game/listings/ListingManagerDialog.tsx`
  - 显示所有已上架作品列表
  - 包含下架、调价、设推荐按钮
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.2 创建价格调整 API
  - 创建 `/api/listings/price/route.ts`
  - 验证价格范围 1-99999
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2.3 创建设置推荐位 API
  - 创建 `/api/listings/featured/route.ts`
  - 确保每个商店最多一个推荐位
  - _Requirements: 2.5_

- [ ]* 2.4 Write property test for listing completeness
  - **Property 2: 上架列表完整性**
  - **Validates: Requirements 2.2**

- [ ]* 2.5 Write property test for featured uniqueness
  - **Property 3: 推荐位唯一性**
  - **Validates: Requirements 2.5**

- [ ]* 2.6 Write property test for price validation
  - **Property 10: 价格范围验证**
  - **Validates: Requirements 7.2**

## 3. 交易记录功能

- [x] 3.1 创建交易记录对话框组件
  - 创建 `components/game/transactions/TransactionHistoryDialog.tsx`
  - 支持销售/购买标签切换
  - 显示交易详情和作品预览
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.2 优化交易记录 API
  - 更新 `/api/transactions/route.ts` 支持分页
  - 添加买家名称字段
  - _Requirements: 3.2, 3.3_

- [ ]* 3.3 Write property test for transaction limit
  - **Property 4: 交易记录数量限制**
  - **Validates: Requirements 3.2**

- [ ]* 3.4 Write property test for transaction completeness
  - **Property 5: 交易记录完整性**
  - **Validates: Requirements 3.3**

- [ ]* 3.5 Write property test for transaction type filter
  - **Property 6: 交易类型过滤正确性**
  - **Validates: Requirements 3.5**

## 4. 背包扩容功能

- [x] 4.1 创建背包扩容 API
  - 创建 `/api/inventory/expand/route.ts`
  - 检查货币、扣除货币、增加容量
  - _Requirements: 4.3, 4.4_

- [x] 4.2 创建扩容对话框组件
  - 创建 `components/game/inventory/ExpansionDialog.tsx`
  - 显示当前容量、扩容价格、货币余额
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 4.3 在背包页面集成扩容功能
  - 更新 `app/game/inventory/page.tsx`
  - 背包满时显示扩容按钮
  - _Requirements: 4.1_

- [ ]* 4.4 Write property test for inventory expansion
  - **Property 7: 背包扩容货币扣除**
  - **Validates: Requirements 4.3**

## 5. 上架位扩容功能

- [x] 5.1 创建上架位扩容 API
  - 创建 `/api/shop/expand-listings/route.ts`
  - 实现递增价格计算 (300 + n*100)
  - _Requirements: 5.3, 5.5_

- [x] 5.2 在商店页面集成扩容功能
  - 更新 `app/game/shop/page.tsx`
  - 上架位满时显示扩容按钮
  - _Requirements: 5.1, 5.2_

- [ ]* 5.3 Write property test for listing expansion price
  - **Property 8: 上架位扩容价格递增**
  - **Validates: Requirements 5.5**

## 6. 道具商城功能

- [x] 6.1 创建道具配置和类型定义
  - 更新 `lib/game/config.ts` 添加道具定义
  - 创建 `types/items.types.ts`
  - _Requirements: 6.1, 6.2_

- [x] 6.2 创建用户道具表迁移
  - 创建 `supabase/migrations/add_user_items_table.sql`
  - _Requirements: 6.4_

- [x] 6.3 创建道具服务
  - 创建 `lib/services/itemService.ts`
  - 实现购买、查询道具功能
  - _Requirements: 6.3, 6.4_

- [x] 6.4 创建道具购买 API
  - 创建 `/api/items/purchase/route.ts`
  - 检查货币、扣除货币、添加道具
  - _Requirements: 6.3, 6.4_

- [x] 6.5 创建道具商城对话框组件
  - 创建 `components/game/items/ItemShopDialog.tsx`
  - 显示道具列表、价格、持有数量
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 6.6 在商店页面集成道具商城入口
  - 更新 `app/game/shop/page.tsx`
  - 添加道具商城按钮
  - _Requirements: 6.1_

- [ ]* 6.7 Write property test for item purchase
  - **Property 9: 道具购买货币扣除**
  - **Validates: Requirements 6.4**

## 7. 商店页面整合

- [x] 7.1 整合所有对话框到商店页面
  - 更新 `app/game/shop/page.tsx`
  - 添加管理上架、交易记录、道具商城按钮的点击处理
  - _Requirements: 2.1, 3.1, 6.1_

- [x] 7.2 优化商店页面布局
  - 调整快捷操作栏布局
  - 添加道具商城入口
  - _Requirements: 6.1_

## 8. Checkpoint - 确保所有测试通过

- [x] 8. Ensure all tests pass, ask the user if questions arise.



