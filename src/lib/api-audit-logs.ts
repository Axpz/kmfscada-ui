import { apiClient } from './api-client'
import type {
  AuditLog,
  AuditLogCreate,
  AuditLogFilter,
  AuditLogListResponse,
} from '@/types'

// 审计日志 API 端点
const AUDIT_LOGS_ENDPOINT = '/audit-logs'

/**
 * 获取审计日志列表（支持分页和过滤）
 * 使用 POST 方法支持复杂的过滤条件
 *
 * @param filters 过滤条件
 * @returns 审计日志列表响应
 */
export const getAuditLogsList = async (filters: AuditLogFilter): Promise<AuditLogListResponse> => {
  return apiClient.post<AuditLogListResponse>(`${AUDIT_LOGS_ENDPOINT}/list`, {
    page: 1,
    size: 100,
    ...filters
  })
}

/**
 * 创建审计日志条目
 *
 * @param logData 审计日志数据
 * @returns 创建的审计日志
 */
export const createAuditLog = async (logData: AuditLogCreate): Promise<AuditLog> => {
  return apiClient.post<AuditLog>(AUDIT_LOGS_ENDPOINT, logData)
}

/**
 * 根据 ID 获取审计日志详情
 *
 * @param id 审计日志 ID
 * @returns 审计日志详情
 */
export const getAuditLogById = async (id: number): Promise<AuditLog> => {
  return apiClient.get<AuditLog>(`${AUDIT_LOGS_ENDPOINT}/${id}`)
}
