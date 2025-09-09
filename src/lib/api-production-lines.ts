import { apiClient } from './api-client'

// 生产线类型定义
export interface ProductionLine {
  id: number
  name: string
  description?: string
  enabled: boolean
  status: 'running' | 'idle' | 'offline'
  created_at: string
  updated_at: string
}

export interface ProductionLineCreate {
  name: string
  description?: string
  enabled?: boolean
  status?: 'running' | 'idle' | 'offline'
}

export interface ProductionLineUpdate {
  name?: string
  description?: string
  enabled?: boolean
  status?: 'running' | 'idle' | 'offline'
}

export interface ProductionLineListResponse {
  items: ProductionLine[]
  total: number
  page: number
  size: number
}

// 生产线 API 端点
const PRODUCTION_LINES_ENDPOINT = '/production-lines'

// 获取生产线列表（支持分页和复杂过滤）
export const getProductionLines = async (filters?: {
  page?: number
  size?: number
  enabled?: boolean
  status?: 'running' | 'idle' | 'offline'
  name?: string
  description?: string
}): Promise<ProductionLineListResponse> => {
  return apiClient.post<ProductionLineListResponse>(`${PRODUCTION_LINES_ENDPOINT}/list`, filters)
}

// 根据 ID 获取生产线详情
export const getProductionLineById = async (id: number): Promise<ProductionLine> => {
  return apiClient.get<ProductionLine>(`${PRODUCTION_LINES_ENDPOINT}/${id}`)
}

// 创建生产线
export const createProductionLine = async (lineData: ProductionLineCreate): Promise<ProductionLine> => {
  return apiClient.post<ProductionLine>(PRODUCTION_LINES_ENDPOINT, lineData)
}

// 更新生产线
export const updateProductionLine = async (id: number, updates: ProductionLineUpdate): Promise<ProductionLine> => {
  return apiClient.put<ProductionLine>(`${PRODUCTION_LINES_ENDPOINT}/${id}`, updates)
}

// 删除生产线
export const deleteProductionLine = async (id: number): Promise<void> => {
  return apiClient.delete<void>(`${PRODUCTION_LINES_ENDPOINT}/${id}`)
}

// 切换生产线启用状态
export const toggleProductionLineEnabled = async (id: number, enabled: boolean): Promise<ProductionLine> => {
  return apiClient.put<ProductionLine>(`${PRODUCTION_LINES_ENDPOINT}/${id}`, { enabled })
}

// 更新生产线状态
export const updateProductionLineStatus = async (id: number, status: 'running' | 'idle' | 'offline'): Promise<ProductionLine> => {
  return apiClient.put<ProductionLine>(`${PRODUCTION_LINES_ENDPOINT}/${id}`, { status })
}
