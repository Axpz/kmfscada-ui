'use client';

import { useState } from 'react';
import { AlarmConfirmationBadge, StatusBadge } from '@/components/ui/status-badge';

export const AlarmConfirmationExample = () => {
  const [alarms, setAlarms] = useState([
    { id: 1, message: '温度超限报警', isConfirmed: false, loading: false },
    { id: 2, message: '压力异常报警', isConfirmed: true, loading: false },
    { id: 3, message: '设备离线报警', isConfirmed: false, loading: false },
  ]);

  const handleConfirm = async (alarmId: number) => {
    // 设置加载状态
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, loading: true } : alarm
    ));

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 更新确认状态
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId 
        ? { ...alarm, isConfirmed: true, loading: false }
        : alarm
    ));
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">报警确认示例</h2>
      
      <div className="space-y-3">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{alarm.message}</span>
              <StatusBadge status="待审核" size="sm" />
            </div>
            
            <AlarmConfirmationBadge
              isConfirmed={alarm.isConfirmed}
              loading={alarm.loading}
              onConfirm={() => handleConfirm(alarm.id)}
              size="sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-md font-medium mb-3">不同尺寸示例</h3>
        <div className="flex items-center gap-4">
          <AlarmConfirmationBadge
            isConfirmed={false}
            onConfirm={() => console.log('Small badge confirmed')}
            size="sm"
          />
          <AlarmConfirmationBadge
            isConfirmed={false}
            onConfirm={() => console.log('Medium badge confirmed')}
            size="md"
          />
          <AlarmConfirmationBadge
            isConfirmed={true}
            size="lg"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-md font-medium mb-3">状态示例</h3>
        <div className="flex items-center gap-4">
          <AlarmConfirmationBadge
            isConfirmed={false}
            onConfirm={() => console.log('Clickable')}
          />
          <AlarmConfirmationBadge
            isConfirmed={true}
          />
          <AlarmConfirmationBadge
            isConfirmed={false}
            loading={true}
          />
          <AlarmConfirmationBadge
            isConfirmed={false}
            disabled={true}
            onConfirm={() => console.log('Should not trigger')}
          />
        </div>
      </div>
    </div>
  );
};