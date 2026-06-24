/**
 * 游戏系统错误类型定义
 * Game System Error Types
 */

// ============================================================================
// 基础错误类
// ============================================================================

/**
 * 游戏系统基础错误类
 */
export class GameError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly userMessage: string = '操作失败，请重试'
  ) {
    super(message);
    this.name = 'GameError';
    
    // 确保原型链正确
    Object.setPrototypeOf(this, GameError.prototype);
  }

  /**
   * 转换为API响应格式
   */
  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        userMessage: this.userMessage,
      },
    };
  }
}

// ============================================================================
// 认证相关错误
// ============================================================================

/**
 * 认证错误 - 用户未登录
 */
export class AuthError extends GameError {
  constructor(message: string = '用户未登录', statusCode: number = 401) {
    super(message, 'AUTH_ERROR', statusCode, '请先登录后再进行操作');
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * 权限错误 - 用户无权限
 */
export class ForbiddenError extends GameError {
  constructor(message: string = '无权限访问') {
    super(message, 'FORBIDDEN', 403, '您没有权限执行此操作');
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 测试模式错误 - 生产环境不允许测试模式
 */
export class TestModeError extends GameError {
  constructor() {
    super(
      '生产环境不允许测试模式',
      'TEST_MODE_FORBIDDEN',
      403,
      '此功能在当前环境不可用'
    );
    this.name = 'TestModeError';
    Object.setPrototypeOf(this, TestModeError.prototype);
  }
}

// ============================================================================
// 验证相关错误
// ============================================================================

/**
 * 验证错误 - 输入数据无效
 */
export class ValidationError extends GameError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR', 400, '输入数据无效，请检查后重试');
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 资源不存在错误
 */
export class NotFoundError extends GameError {
  constructor(resource: string = '资源') {
    super(
      `${resource}不存在`,
      'NOT_FOUND',
      404,
      `找不到请求的${resource}`
    );
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// ============================================================================
// 业务逻辑错误
// ============================================================================

/**
 * 背包已满错误
 */
export class InventoryFullError extends GameError {
  constructor(current: number, max: number) {
    super(
      `背包已满 (${current}/${max})`,
      'INVENTORY_FULL',
      400,
      '背包已满，请先清理一些作品或扩容背包'
    );
    this.name = 'InventoryFullError';
    Object.setPrototypeOf(this, InventoryFullError.prototype);
  }
}

/**
 * 货币不足错误
 */
export class InsufficientCurrencyError extends GameError {
  constructor(required: number, current: number) {
    super(
      `货币不足 (需要${required}，当前${current})`,
      'INSUFFICIENT_CURRENCY',
      400,
      `蓝草币不足，还需要 ${required - current} 个`
    );
    this.name = 'InsufficientCurrencyError';
    Object.setPrototypeOf(this, InsufficientCurrencyError.prototype);
  }
}

/**
 * 作品状态错误
 */
export class ClothStatusError extends GameError {
  constructor(expectedStatus: string, actualStatus: string) {
    super(
      `作品状态错误 (期望${expectedStatus}，实际${actualStatus})`,
      'CLOTH_STATUS_ERROR',
      400,
      '作品当前状态不允许此操作'
    );
    this.name = 'ClothStatusError';
    Object.setPrototypeOf(this, ClothStatusError.prototype);
  }
}

/**
 * 上架槽位已满错误
 */
export class ListingSlotsFullError extends GameError {
  constructor(current: number, max: number) {
    super(
      `上架槽位已满 (${current}/${max})`,
      'LISTING_SLOTS_FULL',
      400,
      '上架槽位已满，请先下架一些作品或升级商店'
    );
    this.name = 'ListingSlotsFullError';
    Object.setPrototypeOf(this, ListingSlotsFullError.prototype);
  }
}

/**
 * 重复操作错误
 */
export class DuplicateError extends GameError {
  constructor(action: string) {
    super(
      `重复操作: ${action}`,
      'DUPLICATE_ACTION',
      400,
      '此操作已经执行过了'
    );
    this.name = 'DuplicateError';
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }
}

// ============================================================================
// 系统错误
// ============================================================================

/**
 * 数据库错误
 */
export class DatabaseError extends GameError {
  constructor(message: string = '数据库操作失败') {
    super(message, 'DATABASE_ERROR', 500, '服务器繁忙，请稍后重试');
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * 网络错误
 */
export class NetworkError extends GameError {
  constructor(message: string = '网络请求失败') {
    super(message, 'NETWORK_ERROR', 503, '网络连接失败，请检查网络后重试');
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

// ============================================================================
// 错误处理工具函数
// ============================================================================

/**
 * 判断是否为 GameError 实例
 */
export function isGameError(error: unknown): error is GameError {
  return error instanceof GameError;
}

/**
 * 将任意错误转换为 GameError
 */
export function toGameError(error: unknown): GameError {
  if (isGameError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new GameError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      '发生未知错误，请稍后重试'
    );
  }
  
  return new GameError(
    String(error),
    'UNKNOWN_ERROR',
    500,
    '发生未知错误，请稍后重试'
  );
}

/**
 * 创建API错误响应
 */
export function createErrorResponse(error: unknown) {
  const gameError = toGameError(error);
  return {
    status: gameError.statusCode,
    body: gameError.toResponse(),
  };
}
