import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  acknowledgeAlarmRecord,
  acknowledgeAllAlarmRecords,
  getAlarmRecordsList,
} from '@/lib/api-alarm-records'
import type {
  AlarmRecord,
  AlarmRecordAcknowledge,
  AlarmRecordFilter,
  AlarmRecordListResponse,
} from '@/types'

// 查询键常量
export const alarmRecordKeys = {
  all: ['alarm-records'] as const,
  lists: () => [...alarmRecordKeys.all, 'list'] as const,
  list: (filters?: AlarmRecordFilter) => [...alarmRecordKeys.lists(), { filters }] as const,
} as const

// 获取报警记录列表（支持分页和过滤）
export const useAlarmRecordsList = (filters: AlarmRecordFilter) => {
  return useQuery({
    queryKey: [alarmRecordKeys.list(filters),filters],
    queryFn: () => getAlarmRecordsList(filters),
    staleTime: 0, // 立即过期，确保数据总是最新的
    gcTime: 5 * 60 * 1000,    // 5分钟
    refetchInterval: 5 * 1000, // 每5秒自动刷新
    refetchIntervalInBackground: false, // 即使页面不在前台也继续刷新
    refetchOnWindowFocus: true, // 窗口获得焦点时刷新
  })
}

// 确认报警记录
export const useAcknowledgeAlarmRecord = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, acknowledgeData }: { id: number; acknowledgeData: AlarmRecordAcknowledge }) =>
      acknowledgeAlarmRecord(id, acknowledgeData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: alarmRecordKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(`确认报警记录失败: ${error.message}`)
    },
  })
}

// 确认所有未确认的报警记录
export const useAcknowledgeAlarmAll = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (acknowledgeData: AlarmRecordAcknowledge) => {
      return acknowledgeAllAlarmRecords(acknowledgeData)
    },
    onSuccess: (affectedCount) => {
      if (affectedCount > 0) {
        toast.success(`成功确认 ${affectedCount} 个报警记录`)
      } else {
        toast.info('没有未确认的报警记录')
      }
      
      // 使所有相关查询失效
      queryClient.invalidateQueries({ queryKey: alarmRecordKeys.all })
    },
    onError: (error: Error) => {
      toast.error(`确认所有报警记录失败: ${error.message}`)
    },
  })
}
