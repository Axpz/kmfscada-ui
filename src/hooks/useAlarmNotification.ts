import { useAlarmHistory } from './useApi'
import { useMemo } from 'react'

/**
 * 专门用于Header告警通知的hook
 * 提供告警数据和统计信息
 */
export function useAlarmNotification() {
  const { data: alarms, isLoading, error } = useAlarmHistory()

  const alarmStats = useMemo(() => {
    if (!alarms) {
      return {
        total: 0,
        unacknowledged: 0,
        acknowledged: 0,
        hasUnacknowledgedAlarms: false
      }
    }

    const unacknowledged = alarms.filter(alarm => !alarm.acknowledged)
    const acknowledged = alarms.filter(alarm => alarm.acknowledged)

    return {
      total: alarms.length,
      unacknowledged: unacknowledged.length,
      acknowledged: acknowledged.length,
      hasUnacknowledgedAlarms: unacknowledged.length > 0
    }
  }, [alarms])

  return {
    alarms: alarms || [],
    isLoading,
    error,
    ...alarmStats
  }
}