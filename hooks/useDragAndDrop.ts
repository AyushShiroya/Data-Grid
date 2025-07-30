"use client"

import { useState, useCallback } from "react"

interface DragState {
  isDragging: boolean
  draggedItem: any
  draggedIndex: number
  dropTarget: number | null
}

export function useDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    draggedIndex: -1,
    dropTarget: null,
  })

  const handleDragStart = useCallback((item: any, index: number) => {
    setDragState({
      isDragging: true,
      draggedItem: item,
      draggedIndex: index,
      dropTarget: null,
    })
  }, [])

  const handleDragOver = useCallback((index: number) => {
    setDragState((prev) => ({
      ...prev,
      dropTarget: index,
    }))
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedIndex: -1,
      dropTarget: null,
    })
  }, [])

  const handleDrop = useCallback(
    (targetIndex: number, onDrop: (from: number, to: number) => void) => {
      if (dragState.draggedIndex !== -1 && dragState.draggedIndex !== targetIndex) {
        onDrop(dragState.draggedIndex, targetIndex)
      }
      handleDragEnd()
    },
    [dragState.draggedIndex, handleDragEnd],
  )

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  }
}
