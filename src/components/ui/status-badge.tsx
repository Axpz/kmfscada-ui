import { Cog, CircleDashed, CheckCircle, XCircle, AlertCircle, Wrench, Crown, Shield, User, Circle, Loader2, CheckCircle2, AlertTriangle, Zap, Pause, Settings, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  variant: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' | 'default';
}

// 预定义的状态配置，可以随时扩展
const badgeConfigs: Record<string, BadgeConfig> = {
  // 系统状态
  '已启用': {
    label: '已启用',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50',
    icon: CheckCircle,
    variant: 'success'
  },
  '已禁用': {
    label: '已禁用',
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50',
    icon: XCircle,
    variant: 'danger'
  },
  '待审核': {
    label: '待审核',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50',
    icon: AlertCircle,
    variant: 'warning'
  },
  // 生产线运行状态 (按照工业SCADA系统最佳实践)
  '生产中': {
    label: '生产中',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50',
    icon: Cog,
    iconClassName: 'animate-[spin_3s_linear_infinite]',
    variant: 'success'
  },
  '空闲中': {
    label: '空闲中',
    className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-800/50',
    icon: CircleDashed,
    variant: 'secondary'
  },
  '维护中': {
    label: '维护中',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50',
    icon: Wrench,
    variant: 'warning'
  },
  '离线中': {
    label: '离线中',
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50',
    icon: WifiOff,
    variant: 'danger'
  },
  // 英文版本支持
  'running': {
    label: '运行中',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50',
    icon: Zap,
    iconClassName: 'animate-[spin_5s_linear_infinite]',
    variant: 'success'
  },
  'idle': {
    label: '空闲中',
    className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-800/50',
    icon: Pause,
    variant: 'secondary'
  },
  'maintenance': {
    label: '维护中',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50',
    icon: Settings,
    variant: 'warning'
  },
  'offline': {
    label: '离线中',
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50',
    icon: WifiOff,
    variant: 'danger'
  },

  // 处理状态
  'completed': {
    label: '已完成',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50',
    icon: CheckCircle,
    variant: 'success'
  },
  'processing': {
    label: '处理中',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/50',
    icon: Loader2,
    iconClassName: 'animate-spin',
    variant: 'info'
  },
  'failed': {
    label: '失败',
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50',
    icon: XCircle,
    variant: 'danger'
  },

  // 用户角色
  'super_admin': {
    label: '超级管理员',
    className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800/50',
    icon: Crown,
    variant: 'primary'
  },
  'admin': {
    label: '管理员',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800/50',
    icon: Shield,
    variant: 'primary'
  },
  'user': {
    label: '普通用户',
    className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-800/50',
    icon: User,
    variant: 'secondary'
  },

  // 报警确认状态
  '已确认': {
    label: '已确认',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50',
    icon: CheckCircle2,
    variant: 'success'
  },
  '未确认': {
    label: '未确认',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50',
    icon: AlertTriangle,
    variant: 'warning'
  },
  'confirmed': {
    label: '已确认',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50',
    icon: CheckCircle2,
    variant: 'success'
  },
  'unconfirmed': {
    label: '未确认',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50',
    icon: AlertTriangle,
    variant: 'warning'
  }
};

// 默认样式配置，用于未定义的状态
const defaultConfig: BadgeConfig = {
  label: '',
  className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-800/50',
  icon: Circle,
  variant: 'default'
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge = ({
  status,
  size = 'sm',
  showIcon = true,
  className
}: StatusBadgeProps) => {
  // 获取配置，如果没有预定义则使用默认配置并显示原始状态文本
  const config = badgeConfigs[status] || { ...defaultConfig, label: status };
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {showIcon && Icon && (
        <Icon
          className={cn(
            iconSizes[size],
            config.iconClassName
          )}
        />
      )}
      {config.label}
    </span>
  );
};

// 导出工具函数，用于添加新的状态配置
export const addBadgeConfig = (status: string, config: BadgeConfig) => {
  badgeConfigs[status] = config;
};

// 导出工具函数，用于批量添加状态配置
export const addBadgeConfigs = (configs: Record<string, BadgeConfig>) => {
  Object.assign(badgeConfigs, configs);
};

// 导出获取所有配置的函数
export const getBadgeConfigs = () => badgeConfigs;

// 向后兼容的函数
export const getStatusBadge = (status: string) => {
  return badgeConfigs[status] || { ...defaultConfig, label: status };
};

// 报警确认Badge组件
interface AlarmConfirmationBadgeProps {
  isConfirmed: boolean;
  onConfirm?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const AlarmConfirmationBadge = ({
  isConfirmed,
  onConfirm,
  size = 'sm',
  showIcon = true,
  className,
  disabled = false,
  loading = false
}: AlarmConfirmationBadgeProps) => {
  const status = isConfirmed ? 'confirmed' : 'unconfirmed';
  const config = badgeConfigs[status] || { ...defaultConfig, label: status };
  const Icon = loading ? Loader2 : config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleClick = () => {
    if (!disabled && !loading && !isConfirmed && onConfirm) {
      onConfirm();
    }
  };

  const isClickable = !disabled && !loading && !isConfirmed && onConfirm;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all duration-200',
        sizeClasses[size],
        config.className,
        isClickable && 'cursor-pointer hover:opacity-80 hover:scale-105 active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={isConfirmed ? '已确认报警' : '点击确认报警'}
    >
      {showIcon && Icon && (
        <Icon
          className={cn(
            iconSizes[size],
            loading && 'animate-spin'
          )}
        />
      )}
      {config.label}
    </span>
  );
};