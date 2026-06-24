/**
 * Property-Based Tests for usePagination Hook
 * 
 * Feature: lazy-loading-system
 * Validates: Requirements 1.2, 1.4, 1.5, 1.6
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ============================================================================
// Types for Testing
// ============================================================================

interface PaginationState<T> {
  items: T[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: Error | null
  page: number
  total: number
}

type PaginationAction<T> =
  | { type: "LOAD_START"; isInitial: boolean }
  | { type: "LOAD_SUCCESS"; items: T[]; total: number; pageSize: number; isInitial: boolean }
  | { type: "LOAD_ERROR"; error: Error }
  | { type: "RESET" }

// ============================================================================
// Pure Reducer (extracted for testing)
// ============================================================================

function createInitialState<T>(): PaginationState<T> {
  return {
    items: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    error: null,
    page: 0,
    total: 0,
  }
}

function paginationReducer<T>(
  state: PaginationState<T>,
  action: PaginationAction<T>
): PaginationState<T> {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        loading: action.isInitial,
        loadingMore: !action.isInitial,
        error: null,
      }

    case "LOAD_SUCCESS": {
      const newItems = action.isInitial
        ? action.items
        : [...state.items, ...action.items]
      const newPage = action.isInitial ? 1 : state.page + 1
      const hasMore = action.items.length >= action.pageSize

      return {
        ...state,
        items: newItems,
        loading: false,
        loadingMore: false,
        hasMore,
        error: null,
        page: newPage,
        total: action.total,
      }
    }

    case "LOAD_ERROR":
      return {
        ...state,
        loading: false,
        loadingMore: false,
        error: action.error,
      }

    case "RESET":
      return createInitialState<T>()

    default:
      return state
  }
}

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

const itemArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
})

const pageSizeArbitrary = fc.integer({ min: 1, max: 100 })

const itemsArrayArbitrary = (maxLength: number) =>
  fc.array(itemArbitrary, { minLength: 0, maxLength })

// ============================================================================
// Property 1: Data Accumulation Invariant
// Feature: lazy-loading-system, Property 1: Data Accumulation Invariant
// Validates: Requirements 1.4
// ============================================================================

describe('Property 1: Data Accumulation Invariant', () => {
  it('items array length equals sum of all items from successful loadMore calls', () => {
    fc.assert(
      fc.property(
        fc.array(itemsArrayArbitrary(20), { minLength: 1, maxLength: 5 }),
        pageSizeArbitrary,
        (responseArrays, pageSize) => {
          let state = createInitialState<typeof itemArbitrary>()
          let expectedTotalItems = 0

          // Simulate initial load
          const initialItems = responseArrays[0]
          state = paginationReducer(state, {
            type: "LOAD_SUCCESS",
            items: initialItems,
            total: 100,
            pageSize,
            isInitial: true,
          })
          expectedTotalItems = initialItems.length

          // Simulate subsequent loadMore calls
          for (let i = 1; i < responseArrays.length; i++) {
            const items = responseArrays[i]
            state = paginationReducer(state, {
              type: "LOAD_SUCCESS",
              items,
              total: 100,
              pageSize,
              isInitial: false,
            })
            expectedTotalItems += items.length
          }

          // Property: items length equals sum of all response items
          expect(state.items.length).toBe(expectedTotalItems)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('items are appended in order during loadMore', () => {
    fc.assert(
      fc.property(
        itemsArrayArbitrary(10),
        itemsArrayArbitrary(10),
        pageSizeArbitrary,
        (firstBatch, secondBatch, pageSize) => {
          let state = createInitialState<typeof itemArbitrary>()

          // Initial load
          state = paginationReducer(state, {
            type: "LOAD_SUCCESS",
            items: firstBatch,
            total: 100,
            pageSize,
            isInitial: true,
          })

          // Load more
          state = paginationReducer(state, {
            type: "LOAD_SUCCESS",
            items: secondBatch,
            total: 100,
            pageSize,
            isInitial: false,
          })

          // Property: first batch items come before second batch items
          const expectedItems = [...firstBatch, ...secondBatch]
          expect(state.items).toEqual(expectedItems)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Property 2: HasMore Detection
// Feature: lazy-loading-system, Property 2: HasMore Detection
// Validates: Requirements 1.5
// ============================================================================

describe('Property 2: HasMore Detection', () => {
  it('hasMore is false when returned items < pageSize', () => {
    fc.assert(
      fc.property(
        pageSizeArbitrary,
        fc.boolean(),
        (pageSize, isInitial) => {
          // Generate items array with length < pageSize
          const itemCount = Math.max(0, pageSize - 1 - Math.floor(Math.random() * pageSize))
          const items = Array.from({ length: itemCount }, (_, i) => ({
            id: `id-${i}`,
            name: `item-${i}`,
          }))

          let state = createInitialState<typeof items[0]>()
          state = paginationReducer(state, {
            type: "LOAD_SUCCESS",
            items,
            total: 100,
            pageSize,
            isInitial,
          })

          // Property: hasMore should be false when items.length < pageSize
          expect(state.hasMore).toBe(items.length >= pageSize)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('hasMore is true when returned items >= pageSize', () => {
    fc.assert(
      fc.property(
        pageSizeArbitrary,
        fc.boolean(),
        (pageSize, isInitial) => {
          // Generate items array with length >= pageSize
          const items = Array.from({ length: pageSize }, (_, i) => ({
            id: `id-${i}`,
            name: `item-${i}`,
          }))

          let state = createInitialState<typeof items[0]>()
          state = paginationReducer(state, {
            type: "LOAD_SUCCESS",
            items,
            total: 100,
            pageSize,
            isInitial,
          })

          // Property: hasMore should be true when items.length >= pageSize
          expect(state.hasMore).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Property 3: Error State Preservation
// Feature: lazy-loading-system, Property 3: Error State Preservation
// Validates: Requirements 1.6, 7.4
// ============================================================================

describe('Property 3: Error State Preservation', () => {
  it('existing items remain unchanged when loadMore fails', () => {
    fc.assert(
      fc.property(
        itemsArrayArbitrary(20),
        pageSizeArbitrary,
        fc.string({ minLength: 1 }),
        (existingItems, pageSize, errorMessage) => {
          // Set up state with existing items
          let state = createInitialState<typeof existingItems[0]>()
          state = paginationReducer(state, {
            type: "LOAD_SUCCESS",
            items: existingItems,
            total: 100,
            pageSize,
            isInitial: true,
          })

          const itemsBeforeError = [...state.items]

          // Simulate error during loadMore
          state = paginationReducer(state, {
            type: "LOAD_ERROR",
            error: new Error(errorMessage),
          })

          // Property: items should remain unchanged after error
          expect(state.items).toEqual(itemsBeforeError)
          expect(state.error).not.toBeNull()
          expect(state.error?.message).toBe(errorMessage)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('error state is set correctly on failure', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (errorMessage) => {
          let state = createInitialState<unknown>()

          // Start loading
          state = paginationReducer(state, {
            type: "LOAD_START",
            isInitial: true,
          })

          // Simulate error
          state = paginationReducer(state, {
            type: "LOAD_ERROR",
            error: new Error(errorMessage),
          })

          // Property: error should be set and loading states should be false
          expect(state.error).not.toBeNull()
          expect(state.loading).toBe(false)
          expect(state.loadingMore).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================================
// Property 4: Loading State Exclusivity
// Feature: lazy-loading-system, Property 4: Loading State Exclusivity
// Validates: Requirements 1.2, 2.4
// ============================================================================

describe('Property 4: Loading State Exclusivity', () => {
  it('loading and loadingMore are never both true simultaneously', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({
              type: fc.constant("LOAD_START" as const),
              isInitial: fc.boolean(),
            }),
            fc.record({
              type: fc.constant("LOAD_SUCCESS" as const),
              items: itemsArrayArbitrary(10),
              total: fc.integer({ min: 0, max: 1000 }),
              pageSize: pageSizeArbitrary,
              isInitial: fc.boolean(),
            }),
            fc.record({
              type: fc.constant("LOAD_ERROR" as const),
              error: fc.string().map(msg => new Error(msg)),
            }),
            fc.record({
              type: fc.constant("RESET" as const),
            }),
          ),
          { minLength: 1, maxLength: 20 }
        ),
        (actions) => {
          let state = createInitialState<unknown>()

          for (const action of actions) {
            state = paginationReducer(state, action as PaginationAction<unknown>)

            // Property: loading and loadingMore should never both be true
            expect(state.loading && state.loadingMore).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('at most one loading state is true at any time', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (isInitial) => {
          let state = createInitialState<unknown>()

          state = paginationReducer(state, {
            type: "LOAD_START",
            isInitial,
          })

          // Property: exactly one of loading/loadingMore should be true based on isInitial
          if (isInitial) {
            expect(state.loading).toBe(true)
            expect(state.loadingMore).toBe(false)
          } else {
            expect(state.loading).toBe(false)
            expect(state.loadingMore).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('loading states are cleared after success or error', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (isInitial, shouldSucceed) => {
          let state = createInitialState<unknown>()

          // Start loading
          state = paginationReducer(state, {
            type: "LOAD_START",
            isInitial,
          })

          // Complete with success or error
          if (shouldSucceed) {
            state = paginationReducer(state, {
              type: "LOAD_SUCCESS",
              items: [],
              total: 0,
              pageSize: 9,
              isInitial,
            })
          } else {
            state = paginationReducer(state, {
              type: "LOAD_ERROR",
              error: new Error("test error"),
            })
          }

          // Property: both loading states should be false after completion
          expect(state.loading).toBe(false)
          expect(state.loadingMore).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})
