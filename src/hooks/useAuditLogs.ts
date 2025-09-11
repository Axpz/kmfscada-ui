import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuditLogsList, createAuditLog, getAuditLogById } from '@/lib/api-audit-logs'
import type { AuditLog, AuditLogFilter, AuditLogCreate } from '@/types'

/**
 * =================================================================================
 *                              审计日志 Hooks
 * =================================================================================
 */

/**
 * 获取审计日志列表的 Hook
 * 支持分页、过滤等功能
 *
 * @param filters 过滤条件
 * @param enabled 是否启用查询
 * @returns 审计日志列表查询结果
 */
export const useAuditLogs = (
  filters: AuditLogFilter = {},
) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => getAuditLogsList(filters),
    staleTime: 60 * 1000, // 30秒内认为数据是新鲜的
  })
}

/**
 * 创建审计日志的 Hook
 *
 * @returns 创建审计日志的 mutation
 */
export const useCreateAuditLog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (logData: AuditLogCreate) => createAuditLog(logData),
    onSuccess: () => {
      // 创建成功后，使审计日志列表缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
    onError: (error) => {
      console.error('Failed to create audit log:', error)
    },
  })
}

