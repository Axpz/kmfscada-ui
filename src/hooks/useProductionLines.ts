import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProductionLines,
  getProductionLineById,
  createProductionLine,
  updateProductionLine,
  deleteProductionLine,
  toggleProductionLineEnabled,
  updateProductionLineStatus,
  type ProductionLine,
  type ProductionLineCreate,
  type ProductionLineUpdate
} from '@/lib/api-production-lines'

// Query Keys
export const productionLineKeys = {
  all: ['production-lines'] as const,
  lists: () => [...productionLineKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productionLineKeys.lists(), filters] as const,
  details: () => [...productionLineKeys.all, 'detail'] as const,
  detail: (id: number) => [...productionLineKeys.details(), id] as const,
}

// 获取生产线列表
export const useProductionLines = (filters?: {
  page?: number
  size?: number
  enabled?: boolean
  status?: 'running' | 'idle' | 'offline'
  name?: string
  description?: string
}) => {
  return useQuery({
    queryKey: productionLineKeys.list(filters || {}),
    queryFn: () => getProductionLines(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

export const useAvailableProductionLines = () => {
  return useQuery({
    queryKey: productionLineKeys.list({ enabled: true }),
    queryFn: () => getProductionLines({ enabled: true }),
    staleTime: 5 * 60 * 1000,
  })
}

// 根据ID获取生产线详情
export const useProductionLine = (id: number) => {
  return useQuery({
    queryKey: productionLineKeys.detail(id),
    queryFn: () => getProductionLineById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// 创建生产线
export const useCreateProductionLine = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createProductionLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionLineKeys.lists() })
    },
  })
}

// 更新生产线
export const useUpdateProductionLine = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ProductionLineUpdate }) =>
      updateProductionLine(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionLineKeys.all })
    },
  })
}

// 删除生产线
export const useDeleteProductionLine = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteProductionLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionLineKeys.all })
    },
  })
}

// 切换生产线启用状态
export const useToggleProductionLineEnabled = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      toggleProductionLineEnabled(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionLineKeys.all })
    },
  })
}

// 更新生产线状态
export const useUpdateProductionLineStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'running' | 'idle' | 'offline' }) =>
      updateProductionLineStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productionLineKeys.all })
    },
  })
}
