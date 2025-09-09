import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

// 导出记录 API 端点
const EXPORT_RECORD_ENDPOINT = "/export-records"

/**
 * =================================================================================
 *                              导出记录 (Export Records)
 * =================================================================================
 */

/**
 * 导出记录状态类型
 */
export type ExportRecordStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * 导出记录基础结构
 */
export interface ExportRecord {
  id: number
  line_names: string
  fields: string
  start_time: string
  end_time: string
  format: string
  size?: number
  created_by?: string
  status: ExportRecordStatus
  created_at: string
  updated_at: string
}

/**
 * 创建导出记录请求
 */
export interface ExportRecordCreate {
  line_names: string
  fields: string
  start_time: string
  end_time: string
  format?: string
  size?: number
  created_by?: string
}

/**
 * 导出记录过滤条件
 */
export interface ExportRecordFilter {
  page?: number
  size?: number
  status?: ExportRecordStatus
  created_by?: string
  format?: string
}

/**
 * 导出记录列表响应
 */
export interface ExportRecordListResponse {
  items: ExportRecord[]
  total: number
  page: number
  size: number
}

/**
 * 获取导出记录列表
 * 支持分页、状态过滤、用户过滤等
 *
 * @param filters 过滤条件
 * @returns 导出记录列表响应
 */
export const getExportRecords = async (
  filters: ExportRecordFilter = {}
): Promise<ExportRecordListResponse> => {
  return apiClient.post<ExportRecordListResponse>(
    `${EXPORT_RECORD_ENDPOINT}/list`,
    {
      page: 1,
      size: 100,
      ...filters
    }
  )
}

/**
 * 创建导出记录
 *
 * @param exportData 导出记录数据
 * @returns 创建的导出记录
 */
export const createExportRecord = async (
  exportData: ExportRecordCreate
): Promise<ExportRecord> => {
  return apiClient.post<ExportRecord>(
    EXPORT_RECORD_ENDPOINT,
    exportData
  )
}

/**
 * =================================================================================
 *                               React Hooks
 * =================================================================================
 */

/**
 * 获取导出记录列表的 Hook
 * 支持分页、过滤等功能
 *
 * @param filters 过滤条件
 * @param enabled 是否启用查询
 * @returns 导出记录列表查询结果
 */
export const useExportRecords = (
  filters: ExportRecordFilter = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['export-records', filters],
    queryFn: () => getExportRecords(filters),
    enabled,
    staleTime: 30 * 1000, // 30秒内认为数据是新鲜的
    refetchInterval: 10 * 1000, // 每10秒自动刷新，用于获取状态更新
  })
}

