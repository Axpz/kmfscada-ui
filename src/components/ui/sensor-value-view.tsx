import React from 'react';
import { SensorValue } from '@/types';
import { cn } from '@/lib/utils';

interface SensorValueViewProps {
  sensor: SensorValue | null | undefined;
  unit?: string; // 可选的单位，例如 "A"、"°C"、"mm"、"rpm"、"mg/L" 等
  precision?: number; // 小数位数，默认为 2
  className?: string; // 额外的 CSS 类名
  fallbackText?: string; // 无数据时显示的文本，默认为 "-"
}

export const SensorValueView: React.FC<SensorValueViewProps> = ({
  sensor,
  unit = '',
  precision = 1,
  className = 'text-green-500',
  fallbackText = '-'
}) => {
  // 处理空值情况
  if (!sensor || sensor.value == null || sensor.value == undefined || isNaN(sensor.value)) {
    return (
      <span>
        {`${fallbackText || '-'} ${unit || ''}`}
      </span>
    );
  }

  // 根据报警状态确定颜色和样式
  const isAlarm = sensor.alarm;
  const colorClass = isAlarm 
    ? 'text-red-500' 
    : className;

  let displayValue = sensor.value.toString();//.toFixed(precision);
  if (precision !== 0)
  {
    displayValue = sensor.value.toFixed(precision)
  }
  const displayText = unit ? `${displayValue} ${unit}` : displayValue;

  // 构建 tooltip 内容
  const tooltipContent = isAlarm && sensor.alarmMessage 
    ? sensor.alarmMessage 
    : undefined;

  return (
    <span 
      className={cn(colorClass)}
      title={tooltipContent}
    >
      {displayText}
    </span>
  );
};
