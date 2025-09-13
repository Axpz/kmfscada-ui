'use client'

import { useState, useMemo } from 'react'

interface UsePaginationProps {
  initialPage?: number
  initialPageSize?: number
}

interface UsePaginationReturn {
  currentPage: number
  pageSize: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  resetPagination: () => void
  getPaginationInfo: (totalItems: number) => {
    totalPages: number
    startIndex: number
    endIndex: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 50,
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // 重置到第一页
  }

  const resetPagination = () => {
    setCurrentPage(initialPage)
    setPageSize(initialPageSize)
  }

  const getPaginationInfo = useMemo(
    () => (totalItems: number) => {
      const totalPages = Math.ceil(totalItems / pageSize)
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1)
      const hasNextPage = currentPage < totalPages
      const hasPreviousPage = currentPage > 1

      return {
        totalPages,
        startIndex,
        endIndex,
        hasNextPage,
        hasPreviousPage,
      }
    },
    [currentPage, pageSize]
  )

  return {
    currentPage,
    pageSize,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    resetPagination,
    getPaginationInfo,
  }
}
