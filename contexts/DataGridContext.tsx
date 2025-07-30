"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import type { GridState, GridAction, Column } from "@/types/grid.types"
import { useLocalStorage } from "@/hooks/useLocalStorage"

const initialColumns: Column[] = [
  { id: "id", label: "ID", type: "number", width: 80, sortable: true, filterable: true, visible: true },
  { id: "name", label: "Name", type: "text", width: 150, sortable: true, filterable: true, visible: true },
  { id: "email", label: "Email", type: "text", width: 200, sortable: true, filterable: true, visible: true },
  { id: "role", label: "Role", type: "select", width: 120, sortable: true, filterable: true, visible: true },
  {
    id: "department",
    label: "Department",
    type: "select",
    width: 130,
    sortable: true,
    filterable: true,
    visible: true,
  },
  { id: "salary", label: "Salary", type: "number", width: 120, sortable: true, filterable: true, visible: true },
  { id: "joinDate", label: "Join Date", type: "date", width: 120, sortable: true, filterable: true, visible: true },
  { id: "status", label: "Status", type: "select", width: 100, sortable: true, filterable: true, visible: true },
  { id: "actions", label: "Actions", type: "actions", width: 120, sortable: false, filterable: false, visible: true },
]

const initialState: GridState = {
  data: [],
  columns: initialColumns,
  visibleColumns: initialColumns.filter((col) => col.visible).map((col) => col.id),
  pinnedColumns: { left: [], right: [] },
  sortModel: [],
  filterModel: {},
  selectedRows: new Set(),
  pagination: { page: 1, pageSize: 50, total: 0 },
  loading: false,
  error: null,
  searchQuery: "",
  density: "standard",
  theme: "light",
}

function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, data: action.payload }

    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "SET_COLUMNS":
      return { ...state, columns: action.payload }

    case "TOGGLE_COLUMN_VISIBILITY":
      const columnId = action.payload
      const isVisible = state.visibleColumns.includes(columnId)
      return {
        ...state,
        visibleColumns: isVisible
          ? state.visibleColumns.filter((id) => id !== columnId)
          : [...state.visibleColumns, columnId],
      }

    case "REORDER_COLUMNS":
      const { from, to } = action.payload
      const newColumns = [...state.columns]
      const [movedColumn] = newColumns.splice(from, 1)
      newColumns.splice(to, 0, movedColumn)
      return { ...state, columns: newColumns }

    case "PIN_COLUMN":
      const { columnId: pinColumnId, side } = action.payload
      const newPinnedColumns = { ...state.pinnedColumns }

      // Remove from both sides first
      newPinnedColumns.left = newPinnedColumns.left.filter((id) => id !== pinColumnId)
      newPinnedColumns.right = newPinnedColumns.right.filter((id) => id !== pinColumnId)

      // Add to the specified side
      if (side === "left") {
        newPinnedColumns.left.push(pinColumnId)
      } else if (side === "right") {
        newPinnedColumns.right.push(pinColumnId)
      }

      return { ...state, pinnedColumns: newPinnedColumns }

    case "RESIZE_COLUMN":
      const { columnId: resizeColumnId, width } = action.payload
      return {
        ...state,
        columns: state.columns.map((col) => (col.id === resizeColumnId ? { ...col, width } : col)),
      }

    case "SET_SORT":
      return { ...state, sortModel: action.payload }

    case "SET_FILTER":
      return { ...state, filterModel: action.payload }

    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload }

    case "SELECT_ROW":
      const rowId = action.payload
      const newSelectedRows = new Set(state.selectedRows)
      if (newSelectedRows.has(rowId)) {
        newSelectedRows.delete(rowId)
      } else {
        newSelectedRows.add(rowId)
      }
      return { ...state, selectedRows: newSelectedRows }

    case "SELECT_ALL_ROWS":
      const selectAll = action.payload
      return {
        ...state,
        selectedRows: selectAll ? new Set(state.data.map((row) => row.id.toString())) : new Set(),
      }

    case "SET_PAGINATION":
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      }

    case "SET_DENSITY":
      return { ...state, density: action.payload }

    case "SET_THEME":
      return { ...state, theme: action.payload }

    case "UPDATE_ROW":
      const { id, data: rowData } = action.payload
      return {
        ...state,
        data: state.data.map((row) => (row.id.toString() === id ? { ...row, ...rowData } : row)),
      }

    default:
      return state
  }
}

interface DataGridContextType {
  state: GridState
  dispatch: React.Dispatch<GridAction>
}

const DataGridContext = createContext<DataGridContextType | undefined>(undefined)

export function DataGridProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gridReducer, initialState)
  const [savedPreferences, setSavedPreferences] = useLocalStorage("dataGridPreferences", {})

  // Track if we've loaded preferences to prevent infinite loops
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)

  // Load saved preferences only once on mount
  useEffect(() => {
    if (preferencesLoaded || !savedPreferences || Object.keys(savedPreferences).length === 0) {
      return
    }

    let hasChanges = false

    // Apply density if different
    if (savedPreferences.density && savedPreferences.density !== state.density) {
      dispatch({ type: "SET_DENSITY", payload: savedPreferences.density })
      hasChanges = true
    }

    // Apply theme if different
    if (savedPreferences.theme && savedPreferences.theme !== state.theme) {
      dispatch({ type: "SET_THEME", payload: savedPreferences.theme })
      document.documentElement.classList.toggle("dark", savedPreferences.theme === "dark")
      hasChanges = true
    }

    // Apply visible columns if different
    if (savedPreferences.visibleColumns && Array.isArray(savedPreferences.visibleColumns)) {
      const currentVisible = [...state.visibleColumns].sort()
      const savedVisible = [...savedPreferences.visibleColumns].sort()

      if (JSON.stringify(currentVisible) !== JSON.stringify(savedVisible)) {
        // Reset to saved visible columns
        const allColumnIds = state.columns.map((col) => col.id)
        allColumnIds.forEach((columnId) => {
          const shouldBeVisible = savedPreferences.visibleColumns.includes(columnId)
          const isCurrentlyVisible = state.visibleColumns.includes(columnId)

          if (shouldBeVisible !== isCurrentlyVisible) {
            dispatch({ type: "TOGGLE_COLUMN_VISIBILITY", payload: columnId })
          }
        })
        hasChanges = true
      }
    }

    // Apply pinned columns if different
    if (savedPreferences.pinnedColumns) {
      const { left = [], right = [] } = savedPreferences.pinnedColumns
      const currentLeft = [...state.pinnedColumns.left].sort()
      const currentRight = [...state.pinnedColumns.right].sort()

      if (
        JSON.stringify(currentLeft) !== JSON.stringify([...left].sort()) ||
        JSON.stringify(currentRight) !== JSON.stringify([...right].sort())
      ) {
        // Clear current pins and apply saved ones
        ;[...state.pinnedColumns.left, ...state.pinnedColumns.right].forEach((columnId) => {
          dispatch({ type: "PIN_COLUMN", payload: { columnId, side: "none" } })
        })

        left.forEach((columnId: string) => {
          dispatch({ type: "PIN_COLUMN", payload: { columnId, side: "left" } })
        })

        right.forEach((columnId: string) => {
          dispatch({ type: "PIN_COLUMN", payload: { columnId, side: "right" } })
        })
        hasChanges = true
      }
    }

    setPreferencesLoaded(true)
  }, [
    savedPreferences,
    state.density,
    state.theme,
    state.visibleColumns,
    state.pinnedColumns,
    state.columns,
    preferencesLoaded,
  ])

  // Save preferences when state changes (but only after initial load)
  useEffect(() => {
    if (!preferencesLoaded) return

    const newPreferences = {
      visibleColumns: state.visibleColumns,
      density: state.density,
      theme: state.theme,
      pinnedColumns: state.pinnedColumns,
    }

    // Only update if preferences actually changed
    const currentPrefs = JSON.stringify(savedPreferences)
    const newPrefs = JSON.stringify(newPreferences)

    if (currentPrefs !== newPrefs) {
      setSavedPreferences(newPreferences)
    }
  }, [
    state.visibleColumns,
    state.density,
    state.theme,
    state.pinnedColumns,
    setSavedPreferences,
    savedPreferences,
    preferencesLoaded,
  ])

  return <DataGridContext.Provider value={{ state, dispatch }}>{children}</DataGridContext.Provider>
}

export function useDataGrid() {
  const context = useContext(DataGridContext)
  if (context === undefined) {
    throw new Error("useDataGrid must be used within a DataGridProvider")
  }
  return context
}
