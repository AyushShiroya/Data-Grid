export interface ApiError {
  message: string
  status: number
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  filters?: Record<string, any>
}
