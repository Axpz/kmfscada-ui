import { StatusBadge, addBadgeConfig } from '@/components/ui/status-badge';
import { Zap } from 'lucide-react';

// 演示如何动态添加新的状态配置
addBadgeConfig('在线', {
  label: '在线',
  className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800/50',
  icon: Zap,
  variant: 'success'
});

export const StatusBadgeExample = () => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">通用状态徽章组件</h3>
        
        {/* 系统状态 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">系统状态</h4>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="已启用" />
            <StatusBadge status="已禁用" />
            <StatusBadge status="待审核" />
            <StatusBadge status="维护中" />
            <StatusBadge status="在线" />
          </div>
        </div>

        {/* 用户角色 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">用户角色</h4>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="超级管理员" />
            <StatusBadge status="管理员" />
            <StatusBadge status="普通用户" />
          </div>
        </div>

        {/* 任意字符串状态 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">任意字符串状态（自动使用默认样式）</h4>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="处理中" />
            <StatusBadge status="已完成" />
            <StatusBadge status="Custom Status" />
            <StatusBadge status="任何文本" />
          </div>
        </div>

        {/* 不同尺寸 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">不同尺寸</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm">Small:</span>
              <StatusBadge status="已启用" size="sm" />
              <StatusBadge status="超级管理员" size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm">Medium:</span>
              <StatusBadge status="已启用" size="md" />
              <StatusBadge status="超级管理员" size="md" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-sm">Large:</span>
              <StatusBadge status="已启用" size="lg" />
              <StatusBadge status="超级管理员" size="lg" />
            </div>
          </div>
        </div>

        {/* 无图标模式 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">无图标模式</h4>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="已启用" showIcon={false} />
            <StatusBadge status="管理员" showIcon={false} />
            <StatusBadge status="自定义状态" showIcon={false} />
          </div>
        </div>

        {/* 自定义样式 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">自定义样式</h4>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="已启用" className="shadow-lg" />
            <StatusBadge status="管理员" className="ring-2 ring-indigo-200 dark:ring-indigo-800" />
          </div>
        </div>

        {/* 使用示例代码 */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="text-sm font-medium mb-2">使用示例</h4>
          <pre className="text-xs text-gray-600 dark:text-gray-400">
{`// 基本使用 - 任何字符串都可以
<StatusBadge status="已启用" />
<StatusBadge status="任何状态文本" />

// 不同尺寸
<StatusBadge status="管理员" size="sm" />

// 无图标
<StatusBadge status="处理中" showIcon={false} />

// 自定义样式
<StatusBadge status="重要" className="shadow-lg" />

// 动态添加新配置
addBadgeConfig('新状态', {
  label: '新状态',
  className: '自定义样式类',
  icon: YourIcon,
  variant: 'success'
});`}
          </pre>
        </div>
      </div>
    </div>
  );
};