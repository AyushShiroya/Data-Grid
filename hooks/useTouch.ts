"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"

interface TouchState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  isSwipe: boolean
  direction: "left" | "right" | "up" | "down" | null
}

export function useTouch() {
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwipe: false,
    direction: null,
  })

  const touchStartRef = useRef<number>(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = Date.now()

    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwipe: false,
      direction: null,
    })
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchState.startX
      const deltaY = touch.clientY - touchState.startY

      setTouchState((prev) => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX,
        deltaY,
      }))
    },
    [touchState.startX, touchState.startY],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchDuration = Date.now() - touchStartRef.current
      const { deltaX, deltaY } = touchState
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Determine if it's a swipe (fast movement over distance)
      const isSwipe = distance > 50 && touchDuration < 300

      let direction: "left" | "right" | "up" | "down" | null = null

      if (isSwipe) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? "right" : "left"
        } else {
          direction = deltaY > 0 ? "down" : "up"
        }
      }

      setTouchState((prev) => ({
        ...prev,
        isSwipe,
        direction,
      }))
    },
    [touchState],
  )

  return {
    touchState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
