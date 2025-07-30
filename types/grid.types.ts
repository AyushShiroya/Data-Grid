import type React from "react"
export interface User {
  id: number
  name: string
  email: string
  role: string
  department: string
  salary: number
  joinDate: string
  status: "active" | "inactive"
  avatar?: string
}

export interface ApiResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface Column {
  id: string
  label: string
  type: "text" | "number" | "date" | "select" | "actions"
  width?: number
  minWidth?: number
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  pinnable?: boolean
  visible?: boolean
  renderCell?: (value: any, row: any) => React.ReactNode
}

export interface SortModel {
  field: string
  sort: "asc" | "desc"
}

export interface FilterModel {
  [key: string]: {
    type: "contains" | "equals" | "startsWith" | "endsWith" | "greaterThan" | "lessThan"
    value: string | number
  }
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface GridState {
  data: User[]
  columns: Column[]
  visibleColumns: string[]
  pinnedColumns: { left: string[]; right: string[] }
  sortModel: SortModel[]
  filterModel: FilterModel
  selectedRows: Set<string>
  pagination: PaginationState
  loading: boolean
  error: string | null
  searchQuery: string
  density: "compact" | "standard" | "comfortable"
  theme: "light" | "dark"
}

export type GridAction =
  | { type: "SET_DATA"; payload: User[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_COLUMNS"; payload: Column[] }
  | { type: "TOGGLE_COLUMN_VISIBILITY"; payload: string }
  | { type: "REORDER_COLUMNS"; payload: { from: number; to: number } }
  | { type: "PIN_COLUMN"; payload: { columnId: string; side: "left" | "right" | "none" } }
  | { type: "RESIZE_COLUMN"; payload: { columnId: string; width: number } }
  | { type: "SET_SORT"; payload: SortModel[] }
  | { type: "SET_FILTER"; payload: FilterModel }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SELECT_ROW"; payload: string }
  | { type: "SELECT_ALL_ROWS"; payload: boolean }
  | { type: "SET_PAGINATION"; payload: Partial<PaginationState> }
  | { type: "SET_DENSITY"; payload: "compact" | "standard" | "comfortable" }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "UPDATE_ROW"; payload: { id: string; data: Partial<User> } }
