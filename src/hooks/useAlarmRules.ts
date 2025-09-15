import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAlarmRulesList,
  getAlarmRuleById,
  getAlarmRulesByLine,
  createAlarmRule,
  updateAlarmRule,
  deleteAlarmRule,
  toggleAlarmRule,
  getAvailableParameters,
  getProductionLineIds,
  type AlarmRule,
  type AlarmRuleCreate,
  type AlarmRuleUpdate,
  type AlarmRuleListResponse,
} from '@/lib/api-alarm-rules'

// 查询键常量
export const alarmRuleKeys = {
  all: ['alarm-rules'] as const,
  lists: () => [...alarmRuleKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...alarmRuleKeys.lists(), { filters }] as const,
  details: () => [...alarmRuleKeys.all, 'detail'] as const,
  detail: (id: number) => [...alarmRuleKeys.details(), id] as const,
  parameters: () => [...alarmRuleKeys.all, 'parameters'] as const,
  lines: () => [...alarmRuleKeys.all, 'lines'] as const,
} as const



// 获取报警规则列表（支持分页和过滤）
export const useAlarmRulesList = (params?: {
  page?: number
  size?: number
  line_id?: string
  parameter_name?: string
  is_enabled?: boolean
}) => {
  return useQuery({
    queryKey: alarmRuleKeys.list(params),
    queryFn: () => getAlarmRulesList(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// 根据 ID 获取报警规则
export const useAlarmRuleById = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: alarmRuleKeys.detail(id),
    queryFn: () => getAlarmRuleById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// 根据生产线 ID 获取报警规则
export const useAlarmRulesByLine = (lineId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...alarmRuleKeys.lists(), 'by-line', lineId],
    queryFn: () => getAlarmRulesByLine(lineId),
    enabled: enabled && !!lineId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// 创建报警规则
export const useCreateAlarmRule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAlarmRule,
    onSuccess: () => {
      toast.success('报警规则创建成功')
      // 使相关查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: alarmRuleKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建规则失败')
    }
  })
}

// 更新报警规则
export const useUpdateAlarmRule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: AlarmRuleUpdate }) => 
      updateAlarmRule(id, updates),
    onSuccess: (_, { id }) => {
      toast.success('报警规则更新成功')
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: alarmRuleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alarmRuleKeys.detail(id) })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新规则失败')
    }
  })
}

// 删除报警规则
export const useDeleteAlarmRule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteAlarmRule,
    onSuccess: () => {
      toast.success('报警规则删除成功')
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: alarmRuleKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除规则失败')
    }
  })
}

// 切换规则启用状态
export const useToggleAlarmRule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => 
      toggleAlarmRule(id, enabled),
    onSuccess: (_, { id, enabled }) => {
      const action = enabled ? '启用' : '禁用'
      toast.success(`${action}报警规则成功`)
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: alarmRuleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: alarmRuleKeys.detail(id) })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新规则状态失败')
    }
  })
}
