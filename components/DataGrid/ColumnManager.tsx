"use client"

import { useState } from "react"
import { useDataGrid } from "@/contexts/DataGridContext"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings, Pin, PinOff, RotateCcw, Download, X, Palette, Grid3X3 } from "lucide-react"
import { exportToCSV, exportToJSON } from "@/utils/exportUtils"
import { cn } from "@/lib/utils"

export function ColumnManager() {
  const { state, dispatch } = useDataGrid()
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleColumn = (columnId: string) => {
    dispatch({ type: "TOGGLE_COLUMN_VISIBILITY", payload: columnId })
  }

  const handlePinColumn = (columnId: string, side: "left" | "right" | "none") => {
    dispatch({ type: "PIN_COLUMN", payload: { columnId, side } })
  }

  const handleDensityChange = (density: "compact" | "standard" | "comfortable") => {
    dispatch({ type: "SET_DENSITY", payload: density })
  }

  const handleExport = (format: "csv" | "json") => {
    const visibleData = state.data.map((row) => {
      const filteredRow: any = {}
      state.visibleColumns.forEach((columnId) => {
        if (columnId !== "actions") {
          filteredRow[columnId] = row[columnId as keyof typeof row]
        }
      })
      return filteredRow
    })

    if (format === "csv") {
      exportToCSV(visibleData, "data-grid-export.csv")
    } else {
      exportToJSON(visibleData, "data-grid-export.json")
    }
  }

  const resetColumns = () => {
    const defaultVisibleColumns = state.columns.filter((col) => col.visible !== false).map((col) => col.id)

    state.columns.forEach((col) => {
      if (!state.visibleColumns.includes(col.id) && defaultVisibleColumns.includes(col.id)) {
        dispatch({ type: "TOGGLE_COLUMN_VISIBILITY", payload: col.id })
      } else if (state.visibleColumns.includes(col.id) && !defaultVisibleColumns.includes(col.id)) {
        dispatch({ type: "TOGGLE_COLUMN_VISIBILITY", payload: col.id })
      }
    })
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 hover-lift micro-bounce shadow-lg bg-background/80 backdrop-blur-sm border-2"
      >
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="settings-panel fixed top-4 right-4 z-50 w-80 rounded-xl p-6 scale-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Grid Settings</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover-lift micro-bounce">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Row Density</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["compact", "standard", "comfortable"] as const).map((density) => (
            <Button
              key={density}
              variant={state.density === density ? "default" : "outline"}
              size="sm"
              onClick={() => handleDensityChange(density)}
              className={cn(
                "capitalize text-xs hover-lift micro-bounce transition-all duration-200",
                state.density === density && "shadow-md scale-105",
              )}
            >
              {density}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Columns</h4>
          <Button variant="ghost" size="sm" onClick={resetColumns} className="hover-lift micro-bounce text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
          {state.columns.map((column, index) => {
            const isVisible = state.visibleColumns.includes(column.id)
            const isPinnedLeft = state.pinnedColumns.left.includes(column.id)
            const isPinnedRight = state.pinnedColumns.right.includes(column.id)

            return (
              <div
                key={column.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-all duration-200",
                  `stagger-fade-in stagger-${Math.min(index + 1, 5)}`,
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isVisible}
                    onCheckedChange={() => handleToggleColumn(column.id)}
                    className="micro-bounce"
                  />
                  <span className="text-sm font-medium">{column.label}</span>
                </div>

                {column.pinnable && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover-lift micro-bounce"
                      onClick={() => handlePinColumn(column.id, isPinnedLeft ? "none" : "left")}
                    >
                      <Pin className={cn("h-3 w-3", isPinnedLeft && "text-primary")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover-lift micro-bounce"
                      onClick={() => handlePinColumn(column.id, isPinnedRight ? "none" : "right")}
                    >
                      <PinOff className={cn("h-3 w-3", isPinnedRight && "text-primary")} />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-3">Export Data</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="hover-lift micro-bounce">
            <Download className="h-3 w-3 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("json")} className="hover-lift micro-bounce">
            <Download className="h-3 w-3 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {state.selectedRows.size > 0 && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm font-medium bounce-in">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {state.selectedRows.size} row(s) selected
          </div>
        </div>
      )}
    </div>
  )
}
