'use client';

import { AlarmNotification } from '@/components/ui/alarm-notification';
import { AlarmRecord } from '@/types';

// 模拟告警数据
const mockAlarms: AlarmRecord[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5分钟前
    production_line_id: '1',
    message: '实时直径超出上限',
    current_value: 25.8,
    acknowledged: false,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15分钟前
    production_line_id: '3',
    message: '温度传感器异常',
    current_value: 185.2,
    acknowledged: false,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分钟前
    production_line_id: '2',
    message: '螺杆电机转速过低',
    current_value: 45.3,
    acknowledged: true,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45分钟前
    production_line_id: '1',
    message: '实时直径低于下限',
    current_value: 24.1,
    acknowledged: false,
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1小时前
    production_line_id: '4',
    message: '牵引机速度异常',
    current_value: 12.5,
    acknowledged: false,
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5小时前
    production_line_id: '2',
    message: '氟离子浓度超标',
    current_value: 8.9,
    acknowledged: false,
  },
];

export const AlarmNotificationExample = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Header告警通知示例</h2>
        <p className="text-sm text-muted-foreground mb-4">
          这个组件会显示在Header的右侧，点击小铃铛图标查看告警详情。采用琥珀色(Amber)配色方案，符合工业监控系统的最佳实践。
        </p>
      </div>

      <div className="border rounded-lg p-4 bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/30">
        <h3 className="font-medium mb-2 text-amber-800 dark:text-amber-200">🎨 颜色设计原理</h3>
        <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          <p>• <strong>Amber/Orange</strong>: 工业标准的警告色，既醒目又不过于紧急</p>
          <p>• <strong>Red</strong>: 通常保留给紧急故障和危险状态</p>
          <p>• <strong>Dark模式优化</strong>: 使用更柔和的amber色调，提高可读性</p>
          <p>• <strong>对比度优化</strong>: 确保在各种背景下都有良好的可读性</p>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-background">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">模拟Header布局</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">告警通知 →</span>
            <AlarmNotification 
              alarms={mockAlarms} 
              isLoading={false} 
            />
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>• 琥珀色数字徽章显示未确认告警数量</p>
          <p>• 点击铃铛图标查看告警详情</p>
          <p>• 所有用户都可以查看告警通知</p>
          <p>• 有未确认告警时铃铛会有脉冲动画效果</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">有未确认告警</h4>
          <div className="flex justify-center">
            <AlarmNotification 
              alarms={mockAlarms} 
              isLoading={false} 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            显示 {mockAlarms.filter(a => !a.acknowledged).length} 条未确认告警
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">无未确认告警</h4>
          <div className="flex justify-center">
            <AlarmNotification 
              alarms={mockAlarms.filter(a => a.acknowledged)} 
              isLoading={false} 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            无徽章显示，铃铛无动画
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">加载状态</h4>
          <div className="flex justify-center">
            <AlarmNotification 
              alarms={[]} 
              isLoading={true} 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            显示加载中状态
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">空状态</h4>
          <div className="flex justify-center">
            <AlarmNotification 
              alarms={[]} 
              isLoading={false} 
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            无告警时的显示状态
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="font-medium mb-2">功能特性</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 实时显示未确认告警数量</li>
          <li>• 点击查看最近5条未确认告警预览</li>
          <li>• 支持直接跳转到告警中心页面</li>
          <li>• 响应式设计，适配移动端</li>
          <li>• 所有用户都可以查看告警通知</li>
          <li>• 优雅的加载和空状态处理</li>
        </ul>
      </div>
    </div>
  );
};