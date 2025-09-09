import { apiClient } from './api-client'
import type {
  AlarmRecord,
  AlarmRecordAcknowledge,
  AlarmRecordFilter,
  AlarmRecordListResponse,
} from '@/types'

// 报警记录 API 端点
const ALARM_RECORDS_ENDPOINT = '/alarm-records'

// 确认报警记录
export const acknowledgeAlarmRecord = async (
  id: number,
  acknowledgeData: AlarmRecordAcknowledge
): Promise<AlarmRecord> => {
  return apiClient.put<AlarmRecord>(`${ALARM_RECORDS_ENDPOINT}/${id}/ack`, acknowledgeData)
}

// 确认所有未确认的报警记录
export const acknowledgeAllAlarmRecords = async (
  acknowledgeData: AlarmRecordAcknowledge
): Promise<number> => {
  return apiClient.put<number>(`${ALARM_RECORDS_ENDPOINT}/ack-all`, acknowledgeData)
}

// 获取报警记录列表（支持分页和过滤）
export const getAlarmRecordsList = async (filters: AlarmRecordFilter): Promise<AlarmRecordListResponse> => {
  return apiClient.post<AlarmRecordListResponse>(`${ALARM_RECORDS_ENDPOINT}/list`, filters)
}
