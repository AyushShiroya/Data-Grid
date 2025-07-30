"use client"

import { useState, useCallback } from "react"
import type { ApiResponse, User } from "@/types/grid.types"
import type { PaginationParams } from "@/types/api.types"
import { generateMockUsers, sortData, filterData, paginateData } from "@/utils/gridHelpers"

// Mock API implementation
const mockUsers = generateMockUsers(1000)

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async (params: PaginationParams): Promise<ApiResponse<User>> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      let filteredData = [...mockUsers]

      // Apply search
      if (params.search) {
        filteredData = filterData(filteredData, {}, params.search)
      }

      // Apply sorting
      if (params.sortBy && params.sortOrder) {
        filteredData = sortData(filteredData, [{ field: params.sortBy, sort: params.sortOrder }])
      }

      // Apply pagination
      const total = filteredData.length
      const paginatedData = paginateData(filteredData, params.page, params.pageSize)

      return {
        data: paginatedData,
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize),
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (id: string, data: Partial<User>): Promise<User> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const userIndex = mockUsers.findIndex((user) => user.id === Number.parseInt(id))
      if (userIndex === -1) {
        throw new Error("User not found")
      }

      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data }
      return mockUsers[userIndex]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const userIndex = mockUsers.findIndex((user) => user.id === Number.parseInt(id))
      if (userIndex === -1) {
        throw new Error("User not found")
      }

      mockUsers.splice(userIndex, 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    fetchUsers,
    updateUser,
    deleteUser,
    loading,
    error,
  }
}
