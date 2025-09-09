import { SensorValue } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSensorValueColorClass = (v: SensorValue | undefined) => {
  if (v?.alarm) {
    return 'text-red-600'
  } 
  return 'text-green-600'
}

export const getProductionStatus = (v: SensorValue | undefined) => {
  // 电机转速 > 0.1 生产中
  // 电机转速 < 0.1 空闲中
  // 无数据  离线中
  if (!v || v.value == null || v.value == undefined) {
    return '离线中'
  }
  if (v.value > 0.1) {
    return '生产中'
  } 
  return '空闲中'
}

export const getProductionStatusColorClass = (v: SensorValue | undefined) => {
  if (getProductionStatus(v) == '生产中') {
    return 'text-green-500 animate-[spin_3s_linear_infinite]'
  }
  if (getProductionStatus(v) == '空闲中') {
    return 'text-gray-500 animate-[spin_3s_linear_infinite]'
  }
  return 'text-gray-500'
}