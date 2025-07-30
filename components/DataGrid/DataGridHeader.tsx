"use client"

import { useState } from "react"
import type { Column, SortModel } from "@/types/grid.types"
import { useDataGrid } from "@/contexts/DataGridContext"
import { useTouch } from "@/hooks/useTouch"
import { useDragAndDrop } from "@/hooks/useDragAndDrop"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronUp, ChevronDown, Filter, Pin, PinOff, EyeOff, GripVertical, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataGridHeaderProps {
  columns: Column[]
}

export function DataGridHeader({ columns }: DataGridHeaderProps) {
  const { state, dispatch } = useDataGrid()
  const [showFilters, setShowFilters] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)

  const { touchState, handleTouchStart, handleTouchMove, handleTouchEnd } = useTouch()
  const { dragState, handleDragStart, handleDragOver, handleDragEnd, handleDrop } = useDragAndDrop()

  const handleSort = (columnId: string) => {
    const existingSort = state.sortModel.find((sort) => sort.field === columnId)
    let newSortModel: SortModel[]

    if (!existingSort) {
      newSortModel = [...state.sortModel, { field: columnId, sort: "asc" }]
    } else if (existingSort.sort === "asc") {
      newSortModel = state.sortModel.map((sort) => (sort.field === columnId ? { ...sort, sort: "desc" } : sort))
    } else {
      newSortModel = state.sortModel.filter((sort) => sort.field !== columnId)
    }

    dispatch({ type: "SET_SORT", payload: newSortModel })
  }

  const handleFilter = (columnId: string, value: string) => {
    const newFilterModel = { ...state.filterModel }
    if (value) {
      newFilterModel[columnId] = { type: "contains", value }
    } else {
      delete newFilterModel[columnId]
    }
    dispatch({ type: "SET_FILTER", payload: newFilterModel })
  }

  const handleSelectAll = () => {
    const allSelected = state.selectedRows.size === state.data.length
    dispatch({ type: "SELECT_ALL_ROWS", payload: !allSelected })
  }

  const handleColumnReorder = (fromIndex: number, toIndex: number) => {
    dispatch({ type: "REORDER_COLUMNS", payload: { from: fromIndex, to: toIndex } })
  }

  const handleColumnResize = (columnId: string, width: number) => {
    dispatch({ type: "RESIZE_COLUMN", payload: { columnId, width } })
  }

  const getSortIcon = (columnId: string) => {
    const sort = state.sortModel.find((s) => s.field === columnId)
    if (!sort) return <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
    return sort.sort === "asc" ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    )
  }

  const isPinned = (columnId: string) => {
    return state.pinnedColumns.left.includes(columnId) || state.pinnedColumns.right.includes(columnId)
  }

  const getHeaderHeight = () => {
    switch (state.density) {
      case "compact":
        return "h-10"
      case "comfortable":
        return "h-16"
      default:
        return "h-12"
    }
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <div className="data-grid-header fade-in">
      {/* Header row */}
      <div className={cn("flex items-center min-w-full", getHeaderHeight())}>
        {/* Select all checkbox */}
        <div className="flex items-center justify-center w-12 px-2 flex-shrink-0 bg-muted/50 border-r border-border/50">
          <Checkbox
            checked={state.selectedRows.size === state.data.length && state.data.length > 0}
            onCheckedChange={handleSelectAll}
            aria-label="Select all rows"
            className={cn("micro-bounce focus-ring", isMobile && "mobile-touch-button")}
          />
        </div>

        {/* Column headers */}
        {columns
          .filter((col) => state.visibleColumns.includes(col.id))
          .map((column, index) => {
            const isFiltered = state.filterModel[column.id]
            const isSorted = state.sortModel.find((s) => s.field === column.id)
            const isDragging = dragState.isDragging && dragState.draggedIndex === index
            const isDropTarget = dragState.dropTarget === index

            return (
              <div
                key={column.id}
                className={cn(
                  "column-header flex items-center justify-between px-3 md:px-4 border-r border-border/50 font-semibold text-xs md:text-sm group relative flex-shrink-0 bg-muted/30",
                  getHeaderHeight(),
                  column.sortable && "sortable cursor-pointer",
                  isSorted && "sorted",
                  isDragging && "dragging",
                  isDropTarget && "drop-zone drag-over",
                  `stagger-fade-in stagger-${Math.min(index + 1, 5)}`,
                  isMobile &&
                    column.id !== "name" &&
                    column.id !== "status" &&
                    column.id !== "actions" &&
                    "mobile-hidden",
                )}
                style={{
                  width: isMobile
                    ? column.id === "name"
                      ? "150px"
                      : column.id === "status"
                        ? "100px"
                        : column.id === "actions"
                          ? "80px"
                          : "auto"
                    : column.width,
                  minWidth: isMobile ? "80px" : column.minWidth || 100,
                }}
                onClick={() => column.sortable && handleSort(column.id)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                draggable={!isMobile}
                onDragStart={() => handleDragStart(column, index)}
                onDragOver={(e) => {
                  e.preventDefault()
                  handleDragOver(index)
                }}
                onDrop={() => handleDrop(index, handleColumnReorder)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="truncate font-medium">{column.label}</span>
                  {column.sortable && <div className="flex-shrink-0">{getSortIcon(column.id)}</div>}
                  {isFiltered && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" />}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1 transition-all duration-200",
                    isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 slide-in-right",
                  )}
                >
                  {column.filterable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-6 w-6 hover-lift micro-bounce", isMobile && "mobile-touch-button")}
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowFilters(!showFilters)
                      }}
                    >
                      <Filter className={cn("h-3 w-3", isFiltered && "text-primary")} />
                    </Button>
                  )}

                  {column.pinnable && !isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover-lift micro-bounce"
                      onClick={(e) => {
                        e.stopPropagation()
                        const currentSide = state.pinnedColumns.left.includes(column.id)
                          ? "left"
                          : state.pinnedColumns.right.includes(column.id)
                            ? "right"
                            : "none"
                        const newSide = currentSide === "none" ? "left" : "none"
                        dispatch({ type: "PIN_COLUMN", payload: { columnId: column.id, side: newSide } })
                      }}
                    >
                      {isPinned(column.id) ? <PinOff className="h-3 w-3 text-primary" /> : <Pin className="h-3 w-3" />}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6 hover-lift micro-bounce", isMobile && "mobile-touch-button")}
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch({ type: "TOGGLE_COLUMN_VISIBILITY", payload: column.id })
                    }}
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>

                  {!isMobile && (
                    <div className="cursor-move hover-lift draggable">
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Column resizer */}
                {column.resizable && !isMobile && (
                  <div
                    className={cn("column-resizer", resizingColumn === column.id && "resizing")}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setResizingColumn(column.id)

                      const startX = e.clientX
                      const startWidth = column.width || 150

                      const handleMouseMove = (e: MouseEvent) => {
                        const newWidth = Math.max(50, startWidth + (e.clientX - startX))
                        handleColumnResize(column.id, newWidth)
                      }

                      const handleMouseUp = () => {
                        setResizingColumn(null)
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                      }

                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)
                    }}
                  />
                )}
              </div>
            )
          })}
      </div>

      {/* Filter row */}
      {showFilters && (
        <div
          className={cn(
            "flex items-center bg-background/80 backdrop-blur-sm border-t border-border/50 fade-in-up min-w-full",
            state.density === "compact" ? "h-10" : "h-12",
          )}
        >
          <div className="w-12 flex-shrink-0 bg-muted/30 border-r border-border/50" />{" "}
          {/* Spacer for checkbox column */}
          {columns
            .filter((col) => state.visibleColumns.includes(col.id) && col.filterable)
            .filter((col) => !isMobile || col.id === "name" || col.id === "status")
            .map((column, index) => (
              <div
                key={`filter-${column.id}`}
                className={cn(
                  "px-3 md:px-4 border-r border-border/50 slide-in-left flex-shrink-0",
                  `stagger-${Math.min(index + 1, 5)}`,
                )}
                style={{
                  width: isMobile ? (column.id === "name" ? "150px" : "100px") : column.width,
                  minWidth: isMobile ? "100px" : column.minWidth || 100,
                }}
              >
                <Input
                  placeholder={`Filter ${column.label.toLowerCase()}...`}
                  value={filterValues[column.id] || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    setFilterValues((prev) => ({ ...prev, [column.id]: value }))
                    handleFilter(column.id, value)
                  }}
                  className="h-7 md:h-8 text-xs focus-ring transition-all duration-200 hover:border-primary/50 w-full"
                />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
