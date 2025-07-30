"use client"

import type React from "react"
import type { User, Column } from "@/types/grid.types"
import { DataGridCell } from "./DataGridCell"
import { useDataGrid } from "@/contexts/DataGridContext"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface DataGridRowProps {
  row: User
  columns: Column[]
  index: number
  style?: React.CSSProperties
  isMobile?: boolean
}

export function DataGridRow({ row, columns, index, style, isMobile = false }: DataGridRowProps) {
  const { state, dispatch } = useDataGrid()
  const isSelected = state.selectedRows.has(row.id.toString())

  const handleRowSelect = () => {
    dispatch({ type: "SELECT_ROW", payload: row.id.toString() })
  }

  const getRowHeight = () => {
    switch (state.density) {
      case "compact":
        return isMobile ? 36 : 32
      case "comfortable":
        return isMobile ? 64 : 56
      default:
        return isMobile ? 48 : 44
    }
  }

  return (
    <div
      className={cn(
        "data-grid-row flex items-center transition-all duration-200 ease-out min-w-full",
        isSelected && "selected",
        "hover:shadow-sm",
        // Staggered animation for initial load
        index < 10 && `stagger-fade-in stagger-${Math.min(index + 1, 5)}`,
      )}
      style={{ ...style, height: getRowHeight() }}
    >
      {/* Selection checkbox */}
      <div className="flex items-center justify-center w-12 px-2 flex-shrink-0 border-r border-border/50">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleRowSelect}
          aria-label={`Select row ${row.id}`}
          className={cn("micro-bounce focus-ring transition-all duration-150", isMobile && "mobile-touch-button")}
        />
      </div>

      {/* Render cells for visible columns */}
      {columns
        .filter((col) => state.visibleColumns.includes(col.id))
        .filter((col) => !isMobile || col.id === "name" || col.id === "status" || col.id === "actions")
        .map((column, cellIndex) => (
          <DataGridCell
            key={column.id}
            column={column}
            row={row}
            value={row[column.id as keyof User]}
            isSelected={isSelected}
            density={state.density}
            cellIndex={cellIndex}
            isMobile={isMobile}
          />
        ))}
    </div>
  )
}
