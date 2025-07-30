"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"

interface UseVirtualScrollProps {
  itemCount: number
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll({ itemCount, itemHeight, containerHeight, overscan = 5 }: UseVirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(itemCount - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan])

  const totalHeight = itemCount * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
  }
}
