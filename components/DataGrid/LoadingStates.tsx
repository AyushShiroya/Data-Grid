"use client"

import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  rows?: number
  columns?: number
}

export function LoadingSkeletonGrid({ rows = 10, columns = 8 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={cn("flex gap-4 stagger-fade-in", `stagger-${Math.min(rowIndex + 1, 5)}`)}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="loading-skeleton h-8 flex-1 rounded"
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className="flex items-center justify-center">
      <RefreshCw className={cn("animate-spin text-primary", sizeClasses[size])} />
    </div>
  )
}

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
  showProgress?: boolean
  progress?: number
}

export function LoadingOverlay({ message = "Loading...", showProgress = false, progress = 0 }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 fade-in">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div>
          <p className="text-lg font-medium">{message}</p>
          {showProgress && (
            <div className="mt-2">
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
