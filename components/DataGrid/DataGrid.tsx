"use client"

import React, { useEffect, useRef, useState } from "react"
import { useDataGrid } from "@/contexts/DataGridContext"
import { useApi } from "@/hooks/useApi"
import { useVirtualScroll } from "@/hooks/useVirtualScroll"
import { useTouch } from "@/hooks/useTouch"
import { DataGridHeader } from "./DataGridHeader"
import { DataGridRow } from "./DataGridRow"
import { Pagination } from "./Pagination"
import { ColumnManager } from "./ColumnManager"
import { BulkActionsBar } from "./BulkActionsBar"
import { LoadingSkeletonGrid, LoadingSpinner } from "./LoadingStates"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { sortData, filterData } from "@/utils/gridHelpers"
import { Search, RefreshCw, Sun, Moon, Database, Zap, X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function DataGrid() {
  const { state, dispatch } = useDataGrid()
  const { fetchUsers, loading } = useApi()
  const containerRef = useRef<HTMLDivElement>(null)
  const [searchValue, setSearchValue] = React.useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const { touchState, handleTouchStart, handleTouchMove, handleTouchEnd } = useTouch()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const processedData = React.useMemo(() => {
    let data = [...state.data]

    if (state.sortModel.length > 0) {
      data = sortData(data, state.sortModel)
    }

    data = filterData(data, state.filterModel, state.searchQuery)

    return data
  }, [state.data, state.sortModel, state.filterModel, state.searchQuery])

  const containerHeight = isMobile ? 400 : 500
  const itemHeight =
    state.density === "compact"
      ? isMobile
        ? 36
        : 32
      : state.density === "comfortable"
        ? isMobile
          ? 64
          : 56
        : isMobile
          ? 48
          : 44

  const { visibleRange, totalHeight, offsetY, handleScroll } = useVirtualScroll({
    itemCount: processedData.length,
    itemHeight,
    containerHeight,
    overscan: isMobile ? 3 : 5,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const response = await fetchUsers({
          page: state.pagination.page,
          pageSize: state.pagination.pageSize,
          search: state.searchQuery,
        })

        dispatch({ type: "SET_DATA", payload: response.data })
        dispatch({
          type: "SET_PAGINATION",
          payload: {
            total: response.total,
            page: response.page,
            pageSize: response.pageSize,
          },
        })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load data" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    loadData()
  }, [state.pagination.page, state.pagination.pageSize, state.searchQuery, fetchUsers, dispatch])

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "SET_SEARCH", payload: searchValue })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, dispatch])

  useEffect(() => {
    if (touchState.isSwipe && touchState.direction === "right" && state.pagination.page > 1) {
      dispatch({ type: "SET_PAGINATION", payload: { page: state.pagination.page - 1 } })
    } else if (touchState.isSwipe && touchState.direction === "left") {
      const totalPages = Math.ceil(state.pagination.total / state.pagination.pageSize)
      if (state.pagination.page < totalPages) {
        dispatch({ type: "SET_PAGINATION", payload: { page: state.pagination.page + 1 } })
      }
    }
  }, [touchState, state.pagination, dispatch])

  const handleRefresh = () => {
    dispatch({ type: "SET_PAGINATION", payload: { page: 1 } })
  }

  const toggleTheme = () => {
    const newTheme = state.theme === "light" ? "dark" : "light"
    dispatch({ type: "SET_THEME", payload: newTheme })
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const visibleColumns = state.columns.filter((col) => state.visibleColumns.includes(col.id))

  return (
    <div className={cn("w-full h-screen flex flex-col", state.theme === "dark" && "dark")}>
      <div
        className={cn(
          "flex items-center justify-between border-b border-border bg-gradient-to-r from-background to-muted/20 fade-in",
          isMobile ? "mobile-toolbar p-4" : "p-6",
        )}
      >
        {isMobile ? (
          <>
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Data Grid</h1>
                  <p className="text-xs text-muted-foreground">Mobile View</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="mobile-touch-button"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-full space-y-3">
              <div className="relative mobile-search">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 focus-ring mobile-touch-button"
                />
              </div>

              {showMobileMenu && (
                <div className="flex items-center gap-2 fade-in">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="mobile-touch-button flex-1 bg-transparent"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Refresh
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="mobile-touch-button flex-1 bg-transparent"
                  >
                    {state.theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    Theme
                  </Button>
                </div>
              )}
            </div>

            {state.selectedRows.size > 0 && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-primary/10 rounded-lg bounce-in">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-sm font-medium text-primary">{state.selectedRows.size} selected</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Data Grid Pro
                  </h1>
                  <p className="text-sm text-muted-foreground">Advanced data management system</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search across all columns..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10 w-80 focus-ring transition-all duration-200 hover:border-primary/50"
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="hover-lift micro-bounce bg-transparent"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover-lift micro-bounce bg-transparent"
                >
                  {state.theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {state.selectedRows.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full bounce-in">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="font-medium text-primary">{state.selectedRows.size} selected</span>
                </div>
              )}
              <div className="text-muted-foreground font-medium">
                <span className="text-foreground font-semibold">{processedData.length}</span> rows
              </div>
            </div>
          </>
        )}
      </div>

      <div
        className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DataGridHeader columns={visibleColumns} />

        <div
          ref={containerRef}
          className="data-grid-container flex-1 overflow-auto"
          style={{ height: containerHeight }}
          onScroll={handleScroll}
        >
          {loading ? (
            isMobile ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4 p-4">
                <LoadingSpinner size="lg" />
                <div className="text-center">
                  <p className="text-base font-medium">Loading...</p>
                  <p className="text-sm text-muted-foreground">Please wait</p>
                </div>
              </div>
            ) : (
              <LoadingSkeletonGrid rows={10} columns={6} />
            )
          ) : state.error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 p-4">
              <div className="p-4 bg-destructive/10 rounded-full">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-destructive">Error loading data</p>
                <p className="text-sm text-muted-foreground">{state.error}</p>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2 hover-lift bg-transparent">
                  Try Again
                </Button>
              </div>
            </div>
          ) : processedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 p-4">
              <div className="p-4 bg-muted/20 rounded-full">
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">No data found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div style={{ height: totalHeight, position: "relative" }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                {processedData.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((row, index) => (
                  <DataGridRow
                    key={row.id}
                    row={row}
                    columns={visibleColumns}
                    index={visibleRange.startIndex + index}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Pagination />
      </div>

      {!isMobile && <ColumnManager />}

      <BulkActionsBar />
    </div>
  )
}
