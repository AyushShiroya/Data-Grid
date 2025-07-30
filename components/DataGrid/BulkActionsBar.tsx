"use client"

import { useDataGrid } from "@/contexts/DataGridContext"
import { Button } from "@/components/ui/Button"
import { Trash2, Edit, Download, X, Check } from "lucide-react"
import { exportToCSV, exportToJSON } from "@/utils/exportUtils"

export function BulkActionsBar() {
  const { state, dispatch } = useDataGrid()

  if (state.selectedRows.size === 0) return null

  const selectedData = state.data.filter((row) => state.selectedRows.has(row.id.toString()))

  const handleBulkDelete = () => {
    // In a real app, this would call an API
    console.log("Bulk delete:", Array.from(state.selectedRows))
    dispatch({ type: "SELECT_ALL_ROWS", payload: false })
  }

  const handleBulkEdit = () => {
    // In a real app, this would open a bulk edit modal
    console.log("Bulk edit:", Array.from(state.selectedRows))
  }

  const handleBulkExport = (format: "csv" | "json") => {
    if (format === "csv") {
      exportToCSV(selectedData, "selected-data.csv")
    } else {
      exportToJSON(selectedData, "selected-data.json")
    }
  }

  const handleClearSelection = () => {
    dispatch({ type: "SELECT_ALL_ROWS", payload: false })
  }

  return (
    <div className="bulk-actions-bar fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Check className="h-4 w-4 text-primary" />
          <span>{state.selectedRows.size} selected</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkEdit}
            className="hover-lift micro-bounce bg-transparent"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkExport("csv")}
            className="hover-lift micro-bounce"
          >
            <Download className="h-3 w-3 mr-1" />
            CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkExport("json")}
            className="hover-lift micro-bounce"
          >
            <Download className="h-3 w-3 mr-1" />
            JSON
          </Button>

          <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="hover-lift micro-bounce">
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>

          <Button size="sm" variant="ghost" onClick={handleClearSelection} className="hover-lift micro-bounce">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
