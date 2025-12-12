# Design Document: Shop Management Features

## Overview

本设计文档描述商店管理系统的完善功能，包括下架、上架管理、交易记录、扩容和道具商城。这些功能将增强玩家的商店管理体验，并提供货币消费途径。

## Architecture

```mermaid
graph TB
    subgraph Frontend
        ShopPage[商店页面]
        ListingManager[上架管理对话框]
        TransactionHistory[交易记录对话框]
        ExpansionDialog[扩容对话框]
        ItemShop[道具商城]
    end
    
    subgraph API
        ListingsAPI[/api/listings/*]
        TransactionsAPI[/api/transactions]
        InventoryAPI[/api/inventory/*]
        ItemsAPI[/api/items/*]
    end
    
    subgraph Services
        ShopService[shopService]
        InventoryService[inventoryService]
        ItemService[itemService]
    end
    
    subgraph Database
        ShopListings[(shop_listings)]
        Transactions[(transactions)]
        UserInventory[(user_inventory)]
        UserShops[(user_shops)]
        PlayerProfile[(player_profile)]
        UserItems[(user_items)]
    end
    
    ShopPage --> ListingManager
    ShopPage --> TransactionHistory
    ShopPage --> ExpansionDialog
    ShopPage --> ItemShop
    
    ListingManager --> ListingsAPI
    TransactionHistory --> TransactionsAPI
    ExpansionDialog --> InventoryAPI
    ItemShop --> ItemsAPI
    
    ListingsAPI --> ShopService
    TransactionsAPI --> ShopService
    InventoryAPI --> InventoryService
    ItemsAPI --> ItemService
    
    ShopService --> ShopListings
    ShopService --> Transactions
    ShopService --> UserShops
    InventoryService --> UserInventory
    InventoryService --> PlayerProfile
    ItemService --> UserItems
    ItemService --> PlayerProfile
```

## Components and Interfaces

### 1. 上架管理对话框 (ListingManagerDialog)

```typescript
interface ListingManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listings: ShopListing[]
  onWithdraw: (listingId: string) => Promise<void>
  onUpdatePrice: (listingId: string, newPrice: number) => Promise<void>
  onSetFeatured: (listingId: string) => Promise<void>
  onRefresh: () => void
}
```

### 2. 交易记录对话框 (TransactionHistoryDialog)

```typescript
interface TransactionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

interface TransactionRecord {
  id: string
  cloth_id: string
  seller_id: string
  buyer_id: string | null
  price: number
  actual_price: number
  transaction_type: 'player_buy' | 'system_buy'
  created_at: string
  cloth?: {
    id: string
    layers: ClothLayer[]
    score_data?: ClothScore
  }
  buyer_name?: string
}
```

### 3. 扩容对话框 (ExpansionDialog)

```typescript
interface ExpansionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'inventory' | 'listing'
  currentCapacity: number
  maxCapacity: number
  expansionCost: number
  expansionAmount: number
  userCurrency: number
  onConfirm: () => Promise<void>
}
```

### 4. 道具商城 (ItemShopDialog)

```typescript
interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  price: number
  type: 'consumable' | 'permanent'
  effect: string
}

interface ItemShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ShopItem[]
  userCurrency: number
  userItems: Record<string, number>
  onPurchase: (itemId: string) => Promise<void>
}
```

### 5. API 接口

```typescript
// POST /api/listings/withdraw
interface WithdrawRequest {
  listing_id: string
}

// PUT /api/listings/price
interface UpdatePriceRequest {
  listing_id: string
  new_price: number
}

// PUT /api/listings/featured
interface SetFeaturedRequest {
  listing_id: string
}

// POST /api/inventory/expand
interface ExpandInventoryRequest {
  // 无需参数，自动计算价格
}

// POST /api/shop/expand-listings
interface ExpandListingsRequest {
  // 无需参数，自动计算价格
}

// POST /api/items/purchase
interface PurchaseItemRequest {
  item_id: string
  quantity?: number
}
```

## Data Models

### 道具定义 (Items)

```typescript
// 预定义道具列表（存储在配置中）
const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'lucky_dye',
    name: '幸运染料',
    description: '使用后下次评分有10%概率提升一个等级',
    icon: '🍀',
    price: 50,
    type: 'consumable',
    effect: 'score_boost'
  },
  {
    id: 'golden_frame',
    name: '金色画框',
    description: '为作品添加金色边框，提升展示效果',
    icon: '🖼️',
    price: 100,
    type: 'consumable',
    effect: 'frame_gold'
  },
  {
    id: 'vip_badge',
    name: 'VIP徽章',
    description: '商店名称旁显示VIP标识',
    icon: '⭐',
    price: 500,
    type: 'permanent',
    effect: 'vip_badge'
  },
  {
    id: 'extra_recent',
    name: '最近创作+1',
    description: '永久增加1个最近创作槽位',
    icon: '📦',
    price: 200,
    type: 'permanent',
    effect: 'recent_slot'
  }
]
```

### 用户道具表 (user_items)

```sql
CREATE TABLE IF NOT EXISTS user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 下架状态一致性
*For any* 已上架的作品，执行下架操作后，作品状态应变为"在背包中"，且不再出现在商店列表中
**Validates: Requirements 1.2**

### Property 2: 上架列表完整性
*For any* 用户的商店，管理界面应显示该用户所有状态为"listed"的作品
**Validates: Requirements 2.2**

### Property 3: 推荐位唯一性
*For any* 用户的商店，最多只能有一个作品被标记为推荐位
**Validates: Requirements 2.5**

### Property 4: 交易记录数量限制
*For any* 交易记录查询，返回的记录数量不超过50条
**Validates: Requirements 3.2**

### Property 5: 交易记录完整性
*For any* 交易记录，必须包含交易时间、作品ID、成交价格字段
**Validates: Requirements 3.3**

### Property 6: 交易类型过滤正确性
*For any* 交易记录查询，当指定类型为"sell"时，返回的记录seller_id应等于当前用户ID
**Validates: Requirements 3.5**

### Property 7: 背包扩容货币扣除
*For any* 背包扩容操作，用户货币应减少扩容价格，背包容量应增加扩容数量
**Validates: Requirements 4.3**

### Property 8: 上架位扩容价格递增
*For any* 上架位扩容，价格应为 300 + (当前扩容次数 * 100)
**Validates: Requirements 5.5**

### Property 9: 道具购买货币扣除
*For any* 道具购买操作，用户货币应减少道具价格，道具数量应增加
**Validates: Requirements 6.4**

### Property 10: 价格范围验证
*For any* 价格调整操作，新价格必须在1-99999范围内
**Validates: Requirements 7.2**

## Error Handling

| 错误场景 | 错误码 | 用户提示 |
|---------|--------|---------|
| 下架不存在的作品 | LISTING_NOT_FOUND | 作品不存在或已下架 |
| 货币不足 | INSUFFICIENT_CURRENCY | 货币不足，需要 X 币 |
| 价格超出范围 | INVALID_PRICE | 价格必须在1-99999之间 |
| 道具不存在 | ITEM_NOT_FOUND | 道具不存在 |
| 已达最大容量 | MAX_CAPACITY_REACHED | 已达到最大容量限制 |

## Testing Strategy

### 单元测试
- 价格计算函数测试
- 扩容价格递增公式测试
- 货币扣除逻辑测试

### Property-Based Testing
使用 fast-check 库进行属性测试：
- 下架状态转换测试
- 交易记录过滤测试
- 价格范围验证测试
- 货币扣除一致性测试

### 集成测试
- 完整的下架流程测试
- 扩容流程测试
- 道具购买流程测试

