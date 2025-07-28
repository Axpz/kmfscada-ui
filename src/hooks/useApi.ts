import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { ProductionDataPoint, User, Role, AlarmRecord, DiameterAlarmConfig } from '../types'
import { 
  generateMockProductionData,
  generateMockUsers,
  generateMockAlarmHistory,
  generateMockAlarmRules,
  generateMockHistoricalData,
  MockDataSimulator
} from '../lib/mockData'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
})

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await import('../lib').then(m => m.supabase.auth.getSession())
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Mock API 延迟模拟
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// --- Production Data Hooks ---

export function useProductionData(refetchInterval: number = 0) {
  return useQuery<ProductionDataPoint[]>({
    queryKey: ['production-data'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(300)
        return generateMockProductionData()
      }
      const { data } = await apiClient.get('/production/latest')
      return data
    },
    refetchInterval,
  })
}

export function useHistoricalData(
  productionLineId: string,
  startTime: string,
  endTime: string,
  enabled: boolean = true
) {
  return useQuery<ProductionDataPoint[]>({
    queryKey: ['historical-data', productionLineId, startTime, endTime],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(800)
        return generateMockHistoricalData(productionLineId, startTime, endTime)
      }
      const params = new URLSearchParams({
        start_time: startTime,
        end_time: endTime,
      })
      const { data } = await apiClient.get(`/production/history/${productionLineId}`, { params })
      return data
    },
    enabled: !!productionLineId && !!startTime && !!endTime && enabled,
  })
}

// --- User Management Hooks ---

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(400)
        return generateMockUsers()
      }
      const { data } = await apiClient.get('/users')
      return data.users
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userData: { email: string; password: string; role?: string; username?: string }) => {
      if (USE_MOCK_DATA) {
        await mockDelay(600)
        // 模拟创建成功
        return { 
          success: true, 
          user: { 
            id: Date.now().toString(), 
            ...userData,
            username: userData.username || userData.email.split('@')[0],
            created_at: new Date().toISOString() 
          } 
        }
      }
      const { data } = await apiClient.post('/users', userData)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { username?: string, email?: string, role?: Role } }) => {
      if (USE_MOCK_DATA) {
        await mockDelay(400)
        return { success: true, message: '用户更新成功' }
      }
      const { data: responseData } = await apiClient.put(`/users/${id}`, data)
      return responseData
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK_DATA) {
        await mockDelay(400)
        return { success: true, message: '用户删除成功' }
      }
      const { data } = await apiClient.delete(`/users/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

// --- Alarm Hooks ---

export function useAlarmHistory() {
  return useQuery<AlarmRecord[]>({
    queryKey: ['alarms-history'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(500)
        return generateMockAlarmHistory()
      }
      const { data } = await apiClient.get('/alarms/history')
      return data.alarms
    },
  })
}

export function useAcknowledgeAlarm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (alarmId: string) => {
      if (USE_MOCK_DATA) {
        await mockDelay(300)
        return { success: true, message: '报警已确认' }
      }
      const { data } = await apiClient.post(`/alarms/${alarmId}/ack`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alarms-history'] }),
  })
}

export function useAlarmRules() {
  return useQuery<DiameterAlarmConfig[]>({
    queryKey: ['alarms-rules'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(400)
        return generateMockAlarmRules()
      }
      const { data } = await apiClient.get('/alarms/rules')
      return data.rules
    },
  })
}

export function useUpdateAlarmRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rule: DiameterAlarmConfig) => {
      if (USE_MOCK_DATA) {
        await mockDelay(500)
        return { success: true, message: '报警规则已更新' }
      }
      const { data } = await apiClient.put(`/alarms/rules/${rule.production_line_id}`, rule)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alarms-rules'] }),
  })
}

// --- Additional Mock Hooks for Missing Components ---

export function useProductionLines() {
  return useQuery({
    queryKey: ['production-lines'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(400)
        return Array.from({ length: 8 }, (_, i) => ({
          id: `${i + 1}`,
          name: `生产线${i + 1}`,
          description: `第${i + 1}号生产线`,
          status: Math.random() > 0.2 ? 'running' : 'stopped',
        }))
      }
      const { data } = await apiClient.get('/production-lines')
      return data
    },
  })
}

export function useCreateProductionLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (lineData: { name: string; description?: string }) => {
      if (USE_MOCK_DATA) {
        await mockDelay(600)
        return { 
          success: true, 
          line: { 
            id: Date.now().toString(), 
            ...lineData,
            status: 'stopped',
            created_at: new Date().toISOString() 
          } 
        }
      }
      const { data } = await apiClient.post('/production-lines', lineData)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['production-lines'] }),
  })
}

export function useDeleteProductionLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK_DATA) {
        await mockDelay(400)
        return { success: true, message: '生产线删除成功' }
      }
      const { data } = await apiClient.delete(`/production-lines/${id}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['production-lines'] }),
  })
}

export function useExportHistory() {
  return useQuery({
    queryKey: ['export-history'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await mockDelay(500)
        return Array.from({ length: 10 }, (_, i) => {
          const startDate = new Date(Date.now() - (i + 7) * 86400000)
          const endDate = new Date(Date.now() - i * 86400000)
          const status = ['completed', 'processing', 'failed'][Math.floor(Math.random() * 3)] as 'completed' | 'processing' | 'failed'
          
          return {
            id: `export-${i + 1}`,
            filename: `production_data_${endDate.toISOString().split('T')[0]}.xlsx`,
            status,
            created_at: new Date(Date.now() - i * 86400000).toISOString(),
            createdAt: new Date(Date.now() - i * 86400000).toISOString(), // 兼容性字段
            download_url: status === 'completed' ? `/downloads/export-${i + 1}.xlsx` : undefined,
            downloadUrl: status === 'completed' ? `/downloads/export-${i + 1}.xlsx` : undefined, // 兼容性字段
            error_message: status === 'failed' ? '数据处理失败' : undefined,
            config: {
              start_time: startDate.toISOString().split('T')[0],
              end_time: endDate.toISOString().split('T')[0],
              format: Math.random() > 0.5 ? 'xlsx' : 'csv' as 'xlsx' | 'csv',
              fields: [
                'real_time_diameter',
                'body_temperatures',
                'screw_motor_speed',
                'total_length_produced'
              ] as any[]
            }
          }
        })
      }
      const { data } = await apiClient.get('/exports/history')
      return data
    },
  })
}

export function useCreateExportTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (exportConfig: any) => {
      if (USE_MOCK_DATA) {
        await mockDelay(800)
        return { 
          success: true, 
          task: { 
            id: Date.now().toString(), 
            ...exportConfig,
            status: 'processing',
            created_at: new Date().toISOString() 
          } 
        }
      }
      const { data } = await apiClient.post('/exports', exportConfig)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['export-history'] }),
  })
}

export function useCreateProductionData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productionData: Partial<ProductionDataPoint>) => {
      if (USE_MOCK_DATA) {
        await mockDelay(600)
        return { 
          success: true, 
          data: { 
            id: Date.now().toString(), 
            ...productionData,
            timestamp: new Date().toISOString() 
          } 
        }
      }
      const { data } = await apiClient.post('/production', productionData)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['production-data'] }),
  })
}

export function useUpdateProductionData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductionDataPoint> }) => {
      if (USE_MOCK_DATA) {
        await mockDelay(500)
        return { success: true, message: '生产数据更新成功' }
      }
      const { data: responseData } = await apiClient.put(`/production/${id}`, data)
      return responseData
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['production-data'] }),
  })
}
 