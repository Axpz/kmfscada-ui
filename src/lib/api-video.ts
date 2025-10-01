import { apiClient } from './api-client'

/**
 * =================================================================================
 *                                视频监控 (Video)
 * =================================================================================
 */

/**
 * 萤石云播放流信息
 */
export interface EzvizStream {
  deviceSerial: string;
  channelNo: number;
  name: string
  url: string;
  expireTime: string;
  id: string;
  protocol: number;
  quality: number;
  accessToken: string;
}

/**
 * 视频流查询参数
 */
export interface VideoStreamFilter {
  protocol?: number; // 1-ezopen、2-hls、3-rtmp、4-flv
  channel_no?: number; // 通道号
  quality?: number; // 1-高清、2-流畅
}

/**
 * 视频流列表响应
 */
export interface VideoStreamListResponse {
  items: EzvizStream[];
  total: number;
}

/**
 * 获取萤石云访问令牌
 */
export const getEzvizToken = async () => {
  return apiClient.get('/video/token')
}

/**
 * 获取萤石云设备播放地址列表
 */
export const getVideoStreams = async (filters: VideoStreamFilter = {}): Promise<VideoStreamListResponse> => {
  const params: Record<string, string | number> = {}
  
  if (filters.protocol !== undefined) {
    params.protocol = filters.protocol
  }
  if (filters.channel_no !== undefined) {
    params.channel_no = filters.channel_no
  }
  if (filters.quality !== undefined) {
    params.quality = filters.quality
  }
  
  return apiClient.get('/video/streams', params)
}
