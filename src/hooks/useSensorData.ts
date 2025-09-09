import { useQuery, useQueries, useMutation } from '@tanstack/react-query'
import { exportSensorData, getSensorData, getUtilization } from '@/lib/api-sensor-data'
import type { SensorDataExportFilter, SensorDataFilter } from '@/lib/api-sensor-data'



/**
 * 获取多条生产线的历史数据（并行查询）
 */
export const useSensorDataHistorical = (
  lineIds: string[],
  startTime: string,
  endTime: string
) => {
  const queries = useQueries({
    queries: lineIds.map(lineId => ({
      queryKey: ['historical-data', lineId, startTime, endTime],
      queryFn: () => getSensorData({
        line_id: lineId,
        start_time: startTime,
        end_time: endTime,
      }),
      enabled: !!(lineId && startTime && endTime),
    }))
  })

  // 封装常用的状态和数据
  const isLoading = queries.some(query => query.isLoading)
  const hasError = queries.some(query => query.error)
  const allHistoricalData = queries.map(query => query.data).filter(Boolean)

  return {
    queries,
    isLoading,
    hasError,
    allHistoricalData,
  }
}

export const useUtilizationData = (
  lineIds: string[],
  startTime: string,
  endTime: string
) => {
  const queries = useQueries({
    queries: lineIds.map(lineId => ({
      queryKey: ['utilization-data', lineId, startTime, endTime],
      queryFn: () => getUtilization({
        line_id: lineId,
        start_time: startTime,
        end_time: endTime,
      }),
      enabled: !!(lineId && startTime && endTime),
    }))
  })

  // 封装常用的状态和数据
  const isLoading = queries.some(query => query.isLoading)
  const hasError = queries.some(query => query.error)
  const allUtilizationData = queries.map(query => query.data).filter(Boolean)

  return {
    queries,
    isLoading,
    hasError,
    allUtilizationData,
  }
}

export const useSensorDataExport = () => {
  return useMutation({
    mutationFn: async (filters: SensorDataExportFilter) => {
      
      const blob = await exportSensorData(filters)
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      link.download = `sensor_data_export_${timestamp}.xlsx`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理URL对象
      window.URL.revokeObjectURL(url)
      
      return blob
    },
  })
}
