// API 模块统一导出
export * from './api-client'
export * from './api-alarm-rules'
export * from './api-alarm-records'
export * from './api-audit-logs'

// 重新导出常用类型
export type { 
  AlarmRule, 
  AlarmRuleCreate, 
  AlarmRuleUpdate, 
  AlarmRuleListResponse 
} from './api-alarm-rules'

export type {
  AlarmRecord,
  AlarmRecordAcknowledge,
  AlarmRecordFilter,
  AlarmRecordListResponse,
  AuditLog,
  AuditLogCreate,
  AuditLogFilter,
  AuditLogListResponse
} from '@/types'

// 重新导出 API 客户端实例
export { apiClient } from './api-client'

// 导出所有报警规则相关的 API 函数
export {
  getAlarmRulesList,
  getAlarmRuleById,
  getAlarmRulesByLine,
  createAlarmRule,
  updateAlarmRule,
  deleteAlarmRule,
  toggleAlarmRule,
  getAvailableParameters,
  getProductionLineIds,
} from './api-alarm-rules'

// 导出所有报警记录相关的 API 函数
export {
  acknowledgeAlarmRecord,
  acknowledgeAllAlarmRecords,
  getAlarmRecordsList,
} from './api-alarm-records'

// 导出所有审计日志相关的 API 函数
export {
  getAuditLogsList,
  createAuditLog,
  getAuditLogById,
} from './api-audit-logs'