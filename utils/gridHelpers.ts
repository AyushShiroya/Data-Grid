import type { User, SortModel, FilterModel } from "@/types/grid.types"

export const sortData = (data: User[], sortModel: SortModel[]): User[] => {
  if (sortModel.length === 0) return data

  return [...data].sort((a, b) => {
    for (const sort of sortModel) {
      const aValue = a[sort.field as keyof User]
      const bValue = b[sort.field as keyof User]

      let comparison = 0

      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      }

      if (comparison !== 0) {
        return sort.sort === "asc" ? comparison : -comparison
      }
    }
    return 0
  })
}

export const filterData = (data: User[], filterModel: FilterModel, searchQuery: string): User[] => {
  let filteredData = [...data]

  // Apply search query
  if (searchQuery) {
    filteredData = filteredData.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }

  // Apply column filters
  Object.entries(filterModel).forEach(([field, filter]) => {
    filteredData = filteredData.filter((row) => {
      const value = row[field as keyof User]
      const filterValue = filter.value

      switch (filter.type) {
        case "contains":
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
        case "equals":
          return value === filterValue
        case "startsWith":
          return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase())
        case "endsWith":
          return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase())
        case "greaterThan":
          return Number(value) > Number(filterValue)
        case "lessThan":
          return Number(value) < Number(filterValue)
        default:
          return true
      }
    })
  })

  return filteredData
}

export const paginateData = (data: User[], page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  return data.slice(startIndex, endIndex)
}

export const generateMockUsers = (count: number): User[] => {
  const roles = ["Developer", "Designer", "Manager", "Analyst", "QA Engineer"]
  const departments = ["Engineering", "Design", "Marketing", "Sales", "HR"]
  const statuses: ("active" | "inactive")[] = ["active", "inactive"]

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    joinDate: new Date(
      2020 + Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    )
      .toISOString()
      .split("T")[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index + 1}`,
  }))
}
