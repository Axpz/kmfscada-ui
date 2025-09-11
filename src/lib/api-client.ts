// 通用 API 客户端

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = `${API_BASE}/api/v1`) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...requestConfig } = config
    
    // 构建完整 URL
    let url = `${this.baseURL}${endpoint}`
    
    // 添加查询参数
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    // 获取 Supabase 认证 token
    let authHeaders: Record<string, string> = {}
    try {
      const { supabase } = await import('./supabase')
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error('Failed to get Supabase session:', error)
    }

    // 默认配置
    const defaultConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...config.headers,
      },
    }

    try {
      const response = await fetch(url, {
        ...defaultConfig,
        ...requestConfig,
      })

      // 处理 HTTP 错误
      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          // 如果无法解析 JSON，使用默认错误信息
        }

        throw new ApiError(
          errorData.detail || errorData.message || `HTTP ${response.status}`,
          response.status,
          response.statusText,
          errorData
        )
      }

      // 处理空响应
      if (response.status === 204) {
        return {} as T
      }
      
      // 根据Content-Type判断响应类型
      const contentType = response.headers.get('content-type') || '';
      console.log('Response Content-Type:', contentType);
      
      // 如果是JSON响应，解析为JSON
      if (contentType.includes('application/json')) {
        try {
          return await response.json();
        } catch (e) {
          console.error('JSON解析失败:', e);
          throw new Error('JSON 格式不正确');
        }
      }

      // 其他情况（包括Excel文件）解析为Blob
      console.log('解析为Blob');
      const blob = await response.blob();
      console.log('Blob解析成功，大小:', blob.size, '类型:', blob.type);
      return blob as unknown as T;
    } catch (error) {
      if (error instanceof ApiError) {  
        throw error
      }
      
      // 网络错误或其他错误
      throw new ApiError(
        error instanceof Error ? error.message : '网络请求失败',
        0,
        'NETWORK_ERROR'
      )
    }
  }

  // GET 请求
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...(params && { params }) })
  }

  // POST 请求
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      ...(data && { body: JSON.stringify(data) }),
    })
  }

  // PUT 请求
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      ...(data && { body: JSON.stringify(data) }),
    })
  }

  // PATCH 请求
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      ...(data && { body: JSON.stringify(data) }),
    })
  }

  // DELETE 请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// 创建默认实例
export const apiClient = new ApiClient()

// 导出类型和类
export { ApiClient, ApiError }
export type { RequestConfig }