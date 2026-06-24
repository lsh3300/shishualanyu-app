/**
 * 历史记录Hook
 * 用于撤销/重做功能
 */

import { useState, useCallback } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: []
  })

  // 设置新状态
  const set = useCallback((newPresent: T) => {
    setState((currentState) => ({
      past: [...currentState.past, currentState.present],
      present: newPresent,
      future: []
    }))
  }, [])

  // 撤销
  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) return currentState

      const newPast = [...currentState.past]
      const newPresent = newPast.pop()!

      return {
        past: newPast,
        present: newPresent,
        future: [currentState.present, ...currentState.future]
      }
    })
  }, [])

  // 重做
  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) return currentState

      const newFuture = [...currentState.future]
      const newPresent = newFuture.shift()!

      return {
        past: [...currentState.past, currentState.present],
        present: newPresent,
        future: newFuture
      }
    })
  }, [])

  // 清空历史
  const clear = useCallback(() => {
    setState({
      past: [],
      present: state.present,
      future: []
    })
  }, [state.present])

  return {
    state: state.present,
    set,
    undo,
    redo,
    clear,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    historySize: state.past.length + state.future.length + 1
  }
}
