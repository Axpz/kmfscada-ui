import { apiClient } from './api-client'

// 报警规则类型定义
export interface AlarmRule {
  id: number
  line_id: string
  parameter_name: string
  lower_limit?: number
  upper_limit?: number
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface AlarmRuleCreate {
  line_id: string
  parameter_name: string
  lower_limit?: number
  upper_limit?: number
  is_enabled?: boolean
}

export interface AlarmRuleUpdate {
  lower_limit?: number
  upper_limit?: number
  is_enabled?: boolean
}

export interface AlarmRuleListResponse {
  items: AlarmRule[]
  total: number
  page: number
  size: number
}

// 报警规则 API 端点
const ALARM_RULES_ENDPOINT = '/alarm-rules'

// 获取报警规则列表（支持分页和过滤）
export const getAlarmRulesList = async (params?: {
  page?: number
  size?: number
  line_id?: string
  parameter_name?: string
  is_enabled?: boolean
}): Promise<AlarmRuleListResponse> => {
  return apiClient.get<AlarmRuleListResponse>(ALARM_RULES_ENDPOINT, params)
}

// 根据 ID 获取报警规则
export const getAlarmRuleById = async (id: number): Promise<AlarmRule> => {
  return apiClient.get<AlarmRule>(`${ALARM_RULES_ENDPOINT}/${id}`)
}

// 根据生产线 ID 获取报警规则
export const getAlarmRulesByLine = async (lineId: string): Promise<AlarmRule[]> => {
  return apiClient.get<AlarmRule[]>(`${ALARM_RULES_ENDPOINT}`, { line_id: lineId })
}

// 创建报警规则
export const createAlarmRule = async (ruleData: AlarmRuleCreate): Promise<AlarmRule> => {
  return apiClient.post<AlarmRule>(ALARM_RULES_ENDPOINT, ruleData)
}

// 更新报警规则
export const updateAlarmRule = async (id: number, updates: AlarmRuleUpdate): Promise<AlarmRule> => {
  return apiClient.put<AlarmRule>(`${ALARM_RULES_ENDPOINT}/${id}`, updates)
}

// 删除报警规则
export const deleteAlarmRule = async (id: number): Promise<void> => {
  return apiClient.delete<void>(`${ALARM_RULES_ENDPOINT}/${id}`)
}

// 切换规则启用状态
export const toggleAlarmRule = async (id: number, enabled: boolean): Promise<AlarmRule> => {
  return apiClient.put<AlarmRule>(`${ALARM_RULES_ENDPOINT}/${id}`, { is_enabled: enabled })
}

// 获取可用的监控参数
export const getAvailableParameters = async (): Promise<string[]> => {
  return apiClient.get<string[]>(`${ALARM_RULES_ENDPOINT}/parameters`)
}

// 获取生产线 ID 列表
export const getProductionLineIds = async (): Promise<string[]> => {
  return apiClient.get<string[]>(`${ALARM_RULES_ENDPOINT}/lines`)
}