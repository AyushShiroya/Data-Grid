"use client"

import { useState } from "react"
import type { Column, User } from "@/types/grid.types"
import { useDataGrid } from "@/contexts/DataGridContext"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Edit, Trash2, Save, X, UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataGridCellProps {
  column: Column
  row: User
  value: any
  isSelected: boolean
  density: "compact" | "standard" | "comfortable"
  cellIndex: number
  isMobile?: boolean
}

export function DataGridCell({
  column,
  row,
  value,
  isSelected,
  density,
  cellIndex,
  isMobile = false,
}: DataGridCellProps) {
  const { dispatch } = useDataGrid()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    dispatch({
      type: "UPDATE_ROW",
      payload: { id: row.id.toString(), data: { [column.id]: editValue } },
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleDelete = () => {
    // In a real app, this would call an API
    console.log("Delete row:", row.id)
  }

  const getCellHeight = () => {
    switch (density) {
      case "compact":
        return "h-8"
      case "comfortable":
        return "h-14"
      default:
        return "h-11"
    }
  }

  const renderCellContent = () => {
    if (column.type === "actions") {
      return (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 hover-lift micro-bounce transition-all duration-150"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover-lift micro-bounce transition-all duration-150"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    if (isEditing && column.type !== "actions") {
      return (
        <div className="flex items-center gap-1 w-full scale-in">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 text-xs focus-ring"
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-green-600 hover:bg-green-50 micro-bounce"
            onClick={handleSave}
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-red-600 hover:bg-red-50 micro-bounce"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    if (column.renderCell) {
      return column.renderCell(value, row)
    }

    switch (column.type) {
      case "number":
        return <span className="font-mono text-sm">{typeof value === "number" ? value.toLocaleString() : value}</span>
      case "date":
        return <span className="text-sm">{value ? new Date(value).toLocaleDateString() : ""}</span>
      case "select":
        if (column.id === "status") {
          return (
            <span
              className={cn(
                "status-badge px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1",
                value === "active" ? "status-active text-white" : "status-inactive text-white",
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", value === "active" ? "bg-green-200" : "bg-red-200")} />
              {value}
            </span>
          )
        }
        return <span className="text-sm font-medium">{value}</span>
      case "text":
        if (column.id === "name") {
          return (
            <div className="flex items-center gap-2">
              {row.avatar ? (
                <img
                  src={row.avatar || "/placeholder.svg"}
                  alt={`${value} avatar`}
                  className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform duration-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              <span className="text-sm font-medium truncate">{value}</span>
            </div>
          )
        }
        if (column.id === "email") {
          return (
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              {value}
            </span>
          )
        }
        return <span className="text-sm">{value}</span>
      default:
        return <span className="text-sm">{value}</span>
    }
  }

  return (
    <div
      className={cn(
        "data-grid-cell flex items-center px-2 md:px-4 text-xs md:text-sm transition-all duration-150 border-r border-border/50 last:border-r-0 flex-shrink-0",
        getCellHeight(),
        isSelected && "bg-primary/5",
        isEditing && "editing",
        "group relative",
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
        minWidth: isMobile ? "60px" : "auto",
      }}
    >
      {renderCellContent()}

      {/* Hover indicator */}
      <div className="absolute inset-y-0 left-0 w-0.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />
    </div>
  )
}
