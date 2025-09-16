import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getEzvizToken, getVideoStreams } from '@/lib/api-video'
import type { VideoStreamFilter, VideoStreamListResponse } from '@/lib/api-video'

// 查询键常量
export const videoKeys = {
  all: ['video'] as const,
  token: () => [...videoKeys.all, 'token'] as const,
  streams: () => [...videoKeys.all, 'streams'] as const,
  streamsList: (filters?: VideoStreamFilter) => [...videoKeys.streams(), { filters }] as const,
} as const

/**
 * 获取萤石云访问令牌
 */
export const useEzvizToken = () => {
  return useQuery({
    queryKey: videoKeys.token(),
    queryFn: getEzvizToken,
    staleTime: 5 * 60 * 1000, // 5分钟过期
    gcTime: 10 * 60 * 1000,   // 10分钟垃圾回收
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * 获取萤石云设备播放地址列表
 */
export const useVideoStreams = (filters: VideoStreamFilter = {}) => {
  return useQuery({
    queryKey: videoKeys.streamsList(filters),
    queryFn: () => getVideoStreams(filters),
    staleTime: 90 * 60 * 1000, // 90分钟过期，因为播放地址有时效性
    gcTime: 120 * 60 * 1000,    // 120分钟垃圾回收
    refetchInterval: 90 * 60 * 1000, // 90分钟自动刷新，防止播放地址过期
    refetchOnWindowFocus: true, // 窗口获得焦点时刷新
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * 刷新视频流列表
 */
export const useRefreshVideoStreams = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (filters: VideoStreamFilter = {}) => {
      // 使相关查询失效，触发重新获取
      await queryClient.invalidateQueries({ 
        queryKey: videoKeys.streamsList(filters) 
      })
      
      // 返回最新的数据
      return queryClient.fetchQuery({
        queryKey: videoKeys.streamsList(filters),
        queryFn: () => getVideoStreams(filters),
      })
    },
    onSuccess: (data: VideoStreamListResponse) => {
      toast.success(`成功刷新 ${data.total} 个视频流`)
    },
    onError: (error: Error) => {
      toast.error(`刷新视频流失败: ${error.message}`)
    },
  })
}

/**
 * 获取特定设备的视频流
 */
export const useDeviceVideoStream = (
  deviceSerial: string, 
  filters: VideoStreamFilter = {}
) => {
  return useQuery({
    queryKey: [...videoKeys.streamsList(filters), 'device', deviceSerial],
    queryFn: async () => {
      const response = await getVideoStreams(filters)
      // 过滤出指定设备的流
      const deviceStream = response.items.find(
        stream => stream.deviceSerial === deviceSerial
      )
      return deviceStream || null
    },
    enabled: !!deviceSerial,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    retry: 2,
  })
}
