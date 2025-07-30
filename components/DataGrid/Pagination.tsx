"use client"
import { useDataGrid } from "@/contexts/DataGridContext"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Pagination() {
  const { state, dispatch } = useDataGrid()
  const { pagination } = state

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)
  const startItem = (pagination.page - 1) * pagination.pageSize + 1
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total)

  const handlePageChange = (newPage: number) => {
    dispatch({ type: "SET_PAGINATION", payload: { page: newPage } })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    dispatch({
      type: "SET_PAGINATION",
      payload: {
        pageSize: newPageSize,
        page: 1, // Reset to first page when changing page size
      },
    })
  }

  const pageSizeOptions = [
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "200", label: "200" },
  ]

  return (
    <div className="pagination-container flex items-center justify-between px-6 py-4 fade-in">
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            Showing <span className="text-foreground font-semibold">{startItem}</span> to{" "}
            <span className="text-foreground font-semibold">{endItem}</span> of{" "}
            <span className="text-foreground font-semibold">{pagination.total}</span> entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Rows per page:</span>
          <Select
            value={pagination.pageSize.toString()}
            onChange={(e) => handlePageSizeChange(Number.parseInt(e.target.value))}
            options={pageSizeOptions}
            className="w-20 h-8 text-xs focus-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={pagination.page === 1}
          className="pagination-button h-8 w-8 hover-lift micro-bounce"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="pagination-button h-8 w-8 hover-lift micro-bounce"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber
            if (totalPages <= 5) {
              pageNumber = i + 1
            } else if (pagination.page <= 3) {
              pageNumber = i + 1
            } else if (pagination.page >= totalPages - 2) {
              pageNumber = totalPages - 4 + i
            } else {
              pageNumber = pagination.page - 2 + i
            }

            return (
              <Button
                key={pageNumber}
                variant={pagination.page === pageNumber ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(pageNumber)}
                className={cn(
                  "pagination-button w-8 h-8 text-sm hover-lift micro-bounce transition-all duration-200",
                  pagination.page === pageNumber && "active scale-105",
                )}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === totalPages}
          className="pagination-button h-8 w-8 hover-lift micro-bounce"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={pagination.page === totalPages}
          className="pagination-button h-8 w-8 hover-lift micro-bounce"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
