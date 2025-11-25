# KFM·SCADA 用户界面和用户体验(UI/UX)设计文档

## 1. 产品定位与设计理念

### 1.1 产品定位
本产品定位于生产管理的数字化和智能化，专注于工业生产线的实时监控与数据分析。系统面向制造业企业，提供全方位的生产数据可视化、告警管理和设备监控解决方案。

### 1.2 设计理念
- **科技感与现代感**：采用深色主题配合青色(Cyan)主色调，营造专业的工业监控氛围
- **数据驱动**：以实时数据展示为核心，通过图表和可视化组件直观呈现生产状态
- **响应式设计**：支持桌面端、平板和移动端的完整体验
- **用户友好**：简洁直观的界面设计，降低操作复杂度
- **实时性**：2-5秒数据刷新频率，确保生产监控的时效性
- **工业标准**：遵循工业SCADA系统的视觉规范和交互模式

### 1.3 设计原则
- **一致性原则**：统一的视觉语言和交互模式
- **可访问性原则**：支持键盘导航和屏幕阅读器
- **性能优先**：优化渲染性能，确保实时数据流畅展示
- **渐进增强**：核心功能优先，高级功能渐进加载

## 2. 视觉设计系统

### 2.1 色彩系统

#### 主色调
- **主色(Primary)**: `hsl(195, 100%, 45%)` - 青色，用于强调和交互元素
- **背景色(Background)**: 
  - 浅色模式: `hsl(220, 20%, 98%)` - 近白色
  - 深色模式: `hsl(0, 0%, 12%)` - 深灰色

#### 功能色彩
- **成功色**: `hsl(142, 71%, 45%)` - 绿色，表示正常运行状态
- **警告色**: `hsl(45, 100%, 50%)` - 黄色，表示警告状态
- **危险色**: `hsl(0, 84%, 60%)` - 红色，表示故障或告警
- **信息色**: `hsl(195, 100%, 50%)` - 青色，表示信息提示

#### 中性色彩
- **前景色**: `hsl(220, 10%, 15%)` / `hsl(220, 20%, 95%)` (深/浅色模式)
- **边框色**: `hsl(220, 13%, 91%)` / `hsl(223, 15%, 25%)` (深/浅色模式)
- **卡片背景**: 采用玻璃拟态效果 `bg-card/60 backdrop-blur-xl`

### 2.2 字体系统

#### 主字体
- **无衬线字体**: Inter - 用于界面文本，具有良好的屏幕显示效果
- **等宽字体**: JetBrains Mono - 用于数据显示和代码

#### 字体层级
- **标题1**: `text-5xl md:text-6xl font-extrabold` (48-60px)
- **标题2**: `text-4xl font-bold` (36px)
- **标题3**: `text-3xl font-bold` (30px)
- **标题4**: `text-2xl font-semibold` (24px)
- **正文**: `text-base` (16px)
- **小字**: `text-sm` (14px)
- **极小字**: `text-xs` (12px)

### 2.3 间距系统
采用Tailwind CSS的间距系统，基于4px的倍数：
- **微间距**: `space-y-1` (4px)
- **小间距**: `space-y-2` (8px)
- **中间距**: `space-y-4` (16px)
- **大间距**: `space-y-6` (24px)
- **超大间距**: `space-y-8` (32px)

### 2.4 圆角系统
- **小圆角**: `rounded-sm` (2px)
- **中圆角**: `rounded-md` (6px)
- **大圆角**: `rounded-lg` (8px)
- **超大圆角**: `rounded-xl` (12px)

## 3. 组件设计规范

### 3.1 卡片组件(Card)
- **基础样式**: 玻璃拟态效果 `glass-card`，带有微妙阴影和边框
- **悬停效果**: `hover:scale-105 hover:shadow-lg transition-transform duration-300`
- **过渡动画**: `transition-all duration-300 ease-in-out`
- **响应式**: 自适应不同屏幕尺寸，移动端垂直堆叠

### 3.2 按钮组件(Button)
- **主要按钮**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **次要按钮**: `border border-input bg-background hover:bg-accent`
- **危险按钮**: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **幽灵按钮**: `hover:bg-accent hover:text-accent-foreground`
- **尺寸变体**: 
  - `sm`: `h-9 px-3 text-xs`
  - `md`: `h-10 px-4 py-2`
  - `lg`: `h-11 px-8`
  - `icon`: `h-10 w-10`

### 3.3 状态徽章组件(StatusBadge)
基于实际代码实现的工业级状态指示系统：

#### 生产线状态
- **运行中**: `bg-emerald-50 text-emerald-700` + 旋转齿轮图标
- **空闲中**: `bg-slate-50 text-slate-700` + 虚线圆圈图标
- **维护中**: `bg-amber-50 text-amber-700` + 扳手图标
- **离线中**: `bg-red-50 text-red-700` + WiFi断开图标

#### 处理状态
- **已完成**: `bg-emerald-50 text-emerald-700` + 对勾图标
- **处理中**: `bg-blue-50 text-blue-700` + 旋转加载图标
- **失败**: `bg-red-50 text-red-700` + X图标

#### 用户角色
- **超级管理员**: `bg-purple-50 text-purple-700` + 皇冠图标
- **管理员**: `bg-indigo-50 text-indigo-700` + 盾牌图标
- **普通用户**: `bg-gray-50 text-gray-700` + 用户图标

### 3.4 数据展示组件

#### KPI卡片
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">{title}</CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
    <p className="text-xs text-muted-foreground">{unit}</p>
  </CardContent>
</Card>
```

#### ECharts仪表盘组件
- **螺杆转速仪表**: 0-200 RPM，紫色渐变
- **牵引速度仪表**: 0-50 m/min，青色渐变  
- **主轴电流仪表**: 0-100 A，橙色渐变
- **实时更新**: 2秒刷新间隔，平滑动画过渡

#### 实时图表
- **温度趋势图**: 8条曲线(机身4+法兰2+模具2)，颜色分组
- **质量监控图**: 实时直径和生产长度双Y轴图表
- **数据缓存**: 保持最近60个数据点(2分钟历史)

### 3.5 导航组件

#### 顶部导航(Header)
```tsx
<header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
  <div className="flex h-14 items-center px-4 md:px-6 lg:px-8">
    <Button variant="ghost" size="icon" onClick={onMenuClick}> // 移动端菜单
    <Logo /> // 品牌标识
    <nav className="hidden md:flex flex-1 items-center space-x-2 ml-6"> // 桌面端导航
    <AlarmNotification /> // 告警通知
    <ThemeToggle /> // 主题切换
    <UserMenu /> // 用户菜单
  </div>
</header>
```

#### 应用布局(AppLayout)
- **侧边栏**: 固定宽度 `w-48 lg:w-56 xl:w-64`，移动端可收起
- **主内容区**: 自适应宽度，带有过渡动画
- **权限控制**: 基于用户角色动态显示导航项

### 3.6 告警通知组件
```tsx
<AlarmNotification>
  <PopoverTrigger> // 带徽章的铃铛图标
    <Bell className="animate-pulse" /> // 有未确认告警时脉冲动画
    <Badge>{unacknowledgedCount}</Badge>
  </PopoverTrigger>
  <PopoverContent> // 告警列表弹窗
    <ScrollArea className="max-h-64"> // 可滚动告警列表
    <Button asChild><Link href="/alarms/history">查看所有告警</Link></Button>
  </PopoverContent>
</AlarmNotification>
```

## 4. 页面布局设计

### 4.1 主页(Landing Page)
基于 `LandingPage.tsx` 的实际实现：

#### 布局结构
```tsx
<main className="min-h-screen bg-background text-foreground">
  {/* 英雄区域 */}
  <section className="py-20 px-6 text-center bg-gradient-to-br from-background to-muted/20">
    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-primary">
      智能数据洞察，驱动未来生产力
    </h1>
    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-muted-foreground">
      通过实时可视化和智能分析，赋能您的业务决策，提升运营效率。
    </p>
  </section>

  {/* 快速访问区域 */}
  <section className="py-10 px-6 bg-muted/30">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 4个功能入口卡片 */}
    </div>
  </section>
</main>
```

#### 功能卡片设计
- **数据看板**: `BarChart3` 图标 + "查看实时生产数据"
- **告警中心**: `Bell` 图标 + "监控系统告警信息"  
- **可视化中心**: `Eye` 图标 + "数据图表与分析"
- **系统登录**: `Settings` 图标 + "登录访问完整功能"

#### 交互效果
- **悬停放大**: `hover:scale-105 hover:shadow-lg`
- **过渡动画**: `transition-all duration-300`
- **点击导航**: 通过 `onNavigate` 函数路由跳转

### 4.2 数据看板(Dashboard)
基于 `Dashboard.tsx` 的复杂实现：

#### 整体布局
```tsx
<div className="space-y-6">
  {/* 生产线选择器 */}
  <div className="flex items-center justify-between">
    <Select value={selectedLineId} onValueChange={setSelectedLineId}>
      {/* 8条生产线选择 */}
    </Select>
  </div>

  {/* 生产线详情 */}
  <ProductionLineDetail lineData={selectedLineData} />
</div>
```

#### 生产线详情组件结构
1. **生产信息卡片**: 批号、物料批号、累计产量
2. **电机监控面板**: 3个ECharts仪表盘并排显示
3. **温度监控面板**: 8条温度曲线 + 实时数值网格
4. **质量监控面板**: 实时直径和生产长度趋势图
5. **氟离子浓度**: 实时数值显示 + 告警状态
6. **摄像头监控**: 视频流 + 自动轮播功能

#### 实时数据管理
```tsx
// 数据队列管理
class RealTimeDataQueue {
  private queue: RealTimeDataPoint[] = []
  private readonly maxSize: number = 60 // 保持60个数据点

  addDataPoint(dataPoint: RealTimeDataPoint): void {
    this.queue.push(dataPoint)
    if (this.queue.length > this.maxSize) {
      this.queue.shift() // 移除最旧数据
    }
  }
}

// 2秒间隔更新
useEffect(() => {
  intervalRef.current = setInterval(updateData, 2000)
}, [])
```

### 4.3 车间大屏(Workshop Dashboard)
基于 `ScadaWorkshopDashboard.tsx` 的大屏设计：

#### 全屏布局特点
- **无边距设计**: 充分利用大屏空间
- **深色主题**: 适合车间环境的视觉效果
- **大字体显示**: 远距离可读的字体大小
- **状态色彩**: 明显的颜色区分运行状态

#### 摄像头监控集成
```tsx
<CameraMonitor lineId={selectedLineId}>
  <video autoPlay loop muted className="w-full h-full object-cover" />
  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded">
    {camera.name}
  </div>
  <div className="absolute top-2 right-2 flex items-center gap-1">
    <div className="w-2 h-2 rounded-full bg-green-500" />
    在线
  </div>
</CameraMonitor>
```

### 4.4 可视化中心
基于 `VisualizationLayout.tsx` 的模块化设计：

#### 侧边栏导航
```tsx
<VisualizationSidebar>
  <nav className="space-y-1">
    <Link href="/visualization" className={isActive ? 'bg-accent' : ''}>
      概览
    </Link>
    <Link href="/visualization/analysis">
      统计分析
    </Link>
    <Link href="/visualization/cameras">
      摄像头监控
    </Link>
  </nav>
</VisualizationSidebar>
```

#### 主内容区域
- **标题区域**: 页面标题 + 描述文字
- **工具栏**: 筛选器、导出按钮等操作
- **图表网格**: 响应式图表布局
- **数据表格**: 可排序、可筛选的数据表

### 4.5 告警管理页面
基于 `AlarmLayout.tsx` 的专业设计：

#### 告警列表
```tsx
<div className="space-y-4">
  {alarms.map(alarm => (
    <Card key={alarm.id} className={alarm.acknowledged ? '' : 'border-amber-200'}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium">生产线 #{alarm.production_line_id}</p>
            <p className="text-sm text-muted-foreground">{alarm.message}</p>
            <p className="text-xs text-muted-foreground">
              {dayjs(alarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </p>
          </div>
        </div>
        <AlarmConfirmationBadge 
          isConfirmed={alarm.acknowledged}
          onConfirm={() => acknowledgeAlarm(alarm.id)}
        />
      </CardContent>
    </Card>
  ))}
</div>
```

### 4.6 用户管理页面
基于 `ManagementLayout.tsx` 的管理界面：

#### 用户表格
- **角色徽章**: 不同颜色区分用户权限
- **操作按钮**: 编辑、删除、重置密码
- **批量操作**: 支持多选和批量处理
- **搜索筛选**: 实时搜索和角色筛选

## 5. 响应式设计

### 5.1 断点设置
- **移动端**: `< 768px` - 单列布局，简化导航
- **平板端**: `768px - 1024px` - 2列布局，保持核心功能
- **桌面端**: `> 1024px` - 多列布局，完整功能展示

### 5.2 移动端适配
- **导航优化**: 汉堡菜单，收起式侧边栏
- **卡片堆叠**: 生产线卡片垂直堆叠显示
- **图表适配**: 图表高度和边距针对小屏优化
- **触摸友好**: 按钮和交互区域符合触摸标准

### 5.3 移动端浏览器支持
- **微信浏览器**: 完全兼容微信内置浏览器
- **Edge浏览器**: 支持最新版Edge浏览器
- **Safari移动版**: 适配iOS Safari浏览器
- **Chrome移动版**: 适配Android Chrome浏览器

## 6. 交互设计

### 6.1 动画效果系统

#### CSS动画配置
基于 `tailwind.config.js` 的自定义动画：

```javascript
keyframes: {
  "accordion-down": {
    from: { height: 0 },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: 0 },
  },
  "aurora": {
    from: { backgroundPosition: "50% 50%, 50% 50%" },
    to: { backgroundPosition: "350% 50%, 350% 50%" },
  },
  "pulse-sm": {
    "0%, 100%": { transform: "scale(1)", opacity: 1 },
    "50%": { transform: "scale(1.1)", opacity: 0.7 },
  }
},
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
  "aurora": "aurora 60s linear infinite",
  "pulse-sm": "pulse-sm 2s infinite",
}
```

#### 实际应用场景
- **卡片悬停**: `hover:scale-105 transition-transform duration-300`
- **告警脉冲**: `animate-pulse` (未确认告警时)
- **加载旋转**: `animate-spin` (数据加载和处理状态)
- **齿轮旋转**: `animate-[spin_3s_linear_infinite]` (生产线运行状态)
- **背景极光**: `animate-aurora` (主页背景效果)

### 6.2 反馈机制设计

#### 状态指示系统
基于 `StatusBadge` 组件的完整状态反馈：

```tsx
// 生产线状态反馈
const statusConfigs = {
  '运行中': {
    className: 'bg-emerald-50 text-emerald-700',
    icon: Cog,
    iconClassName: 'animate-[spin_3s_linear_infinite]', // 慢速旋转
  },
  '维护中': {
    className: 'bg-amber-50 text-amber-700',
    icon: Wrench,
  },
  '离线中': {
    className: 'bg-red-50 text-red-700',
    icon: WifiOff,
  }
}
```

#### 告警通知系统
基于 `AlarmNotification` 组件的多层级反馈：

```tsx
<AlarmNotification>
  {/* 1. 图标状态 */}
  <Bell className={hasUnacknowledgedAlarms && "animate-pulse"} />
  
  {/* 2. 数字徽章 */}
  <Badge className="bg-amber-500 text-white">
    {unacknowledgedAlarms.length > 99 ? '99+' : unacknowledgedAlarms.length}
  </Badge>
  
  {/* 3. 弹窗详情 */}
  <PopoverContent>
    <ScrollArea className="max-h-64">
      {recentAlarms.map(alarm => (
        <div className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
          <AlertTriangle className="text-amber-600 dark:text-amber-400" />
          {/* 告警详情 */}
        </div>
      ))}
    </ScrollArea>
  </PopoverContent>
</AlarmNotification>
```

#### Toast通知系统
基于 `sonner` 库的通知反馈：

```tsx
import { Toaster } from 'sonner'

// 在 RootLayout 中全局配置
<Toaster />

// 使用示例
import { toast } from 'sonner'

const handleSuccess = () => {
  toast.success('操作成功', {
    description: '数据已保存',
    duration: 3000,
  })
}

const handleError = () => {
  toast.error('操作失败', {
    description: '请检查网络连接',
    action: {
      label: '重试',
      onClick: () => retryOperation(),
    },
  })
}
```

### 6.3 用户操作交互

#### 权限控制交互
基于 `AuthContext` 的动态权限显示：

```tsx
const { hasRole } = useAuth()

// 导航项权限控制
const filteredMainItems = mainNavigationItems.filter(item => {
  if (!item.requiredRole) return true
  return hasRole(item.requiredRole)
})

// 按钮权限控制
{hasRole(['superadmin']) && (
  <Button onClick={handleDelete} variant="destructive">
    删除用户
  </Button>
)}
```

#### 响应式导航交互
基于 `AppLayout` 的自适应导航：

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false)

// 移动端汉堡菜单
<Button 
  variant="ghost" 
  size="icon" 
  className="md:hidden" 
  onClick={() => setSidebarOpen(!sidebarOpen)}
>
  <Menu className="h-5 w-5" />
</Button>

// 侧边栏响应式显示
<aside className={cn(
  'fixed inset-y-0 left-0 z-50 w-48 lg:w-56 xl:w-64 transition-transform duration-300',
  sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
)}>
```

#### 实时数据交互
基于 `useRealTimeData` Hook 的数据流控制：

```tsx
// 数据更新控制
const useRealTimeData = (lineData: ProductionDataPoint) => {
  const [chartData, setChartData] = useState<RealTimeDataPoint[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 自动启动/停止数据流
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const newDataPoint = generateRealTimeDataPoint(lineData)
      setChartData(prevData => {
        // 滑动窗口更新
        const newData = prevData.length >= 60 ? prevData.slice(1) : prevData
        return [...newData, newDataPoint]
      })
    }, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [lineData])

  return chartData
}
```

### 6.4 摄像头监控交互

#### 自动轮播控制
```tsx
const useCameraSwitcher = (cameras: CameraData[]) => {
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [isAutoSwitching, setIsAutoSwitching] = useState(true)

  useEffect(() => {
    if (!isAutoSwitching || onlineCameras.length === 0) return

    const interval = setInterval(() => {
      setCurrentCameraIndex(prevIndex =>
        (prevIndex + 1) % onlineCameras.length
      )
    }, 10000) // 10秒切换

    return () => clearInterval(interval)
  }, [isAutoSwitching, onlineCameras.length])

  return {
    currentCamera: onlineCameras[currentCameraIndex],
    isAutoSwitching,
    setIsAutoSwitching,
    setCurrentCameraIndex
  }
}
```

#### 手动控制界面
```tsx
<div className="flex items-center gap-2">
  {/* 摄像头选择器 */}
  <Select value={selectedCameraId} onValueChange={setSelectedCameraId}>
    <SelectTrigger className="w-24 h-7 text-xs">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {cameras.map(camera => (
        <SelectItem key={camera.id} value={camera.id}>
          Cam {camera.id.split('-').pop()}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* 轮播控制 */}
  <button
    onClick={() => setIsAutoPlay(!isAutoPlay)}
    className={`px-2 py-1 text-xs rounded-md transition ${
      isAutoPlay
        ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
    }`}
  >
    {isAutoPlay ? '停止' : '轮播'}
  </button>
</div>
```

### 6.5 表单交互设计

#### 告警确认交互
基于 `AlarmConfirmationBadge` 的可点击徽章：

```tsx
<AlarmConfirmationBadge
  isConfirmed={alarm.acknowledged}
  onConfirm={() => acknowledgeAlarm(alarm.id)}
  loading={isAcknowledging}
  className="cursor-pointer hover:opacity-80 hover:scale-105 active:scale-95"
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleConfirm()
    }
  }}
/>
```

#### 数据导出交互
```tsx
const { mutate: createExportTask, isLoading } = useCreateExportTask()

const handleExport = (config: ExportConfig) => {
  createExportTask(config, {
    onSuccess: () => {
      toast.success('导出任务已创建', {
        description: '请在导出历史中查看进度'
      })
    },
    onError: (error) => {
      toast.error('导出失败', {
        description: error.message
      })
    }
  })
}

<Button 
  onClick={handleExport} 
  disabled={isLoading}
  className="relative"
>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? '创建中...' : '开始导出'}
</Button>
```

## 7. 数据可视化设计

### 7.1 图表类型与实现

#### Recharts折线图 - 温度监控
```tsx
<ResponsiveContainer width="100%" height="100%">
  <RechartsLineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
    <XAxis dataKey="index" tick={false} tickLine={false} axisLine={false} />
    <YAxis 
      tick={{ fontSize: 9 }}
      width={35}
      domain={[150, 250]} // 温度范围
    />
    <Tooltip contentStyle={{
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px'
    }} />
    {temperatureLines.map(line => (
      <Line
        key={line.key}
        type="monotone"
        dataKey={line.key}
        stroke={line.color}
        strokeWidth={1.5}
        dot={false}
        connectNulls
      />
    ))}
  </RechartsLineChart>
</ResponsiveContainer>
```

#### ECharts仪表盘 - 电机监控
基于 `ScrewSpeedGauge.tsx`、`TractionSpeedGauge.tsx`、`SpindleCurrentGauge.tsx` 的实现：

```tsx
// 螺杆转速仪表盘配置
const option = {
  series: [{
    type: 'gauge',
    min: 0,
    max: 200,
    splitNumber: 10,
    radius: '80%',
    axisLine: {
      lineStyle: {
        width: 8,
        color: [[1, new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#8B5CF6' },
          { offset: 1, color: '#A855F7' }
        ])]]
      }
    },
    pointer: {
      itemStyle: { color: '#8B5CF6' }
    },
    axisTick: { distance: -15, length: 8 },
    splitLine: { distance: -20, length: 15 },
    axisLabel: { distance: -35, fontSize: 10 },
    detail: {
      valueAnimation: true,
      formatter: '{value} RPM',
      fontSize: 14,
      fontWeight: 'bold',
      color: '#8B5CF6'
    },
    data: [{ value: value, name: '螺杆转速' }]
  }]
}
```

### 7.2 颜色编码系统

#### 温度数据分组着色
```tsx
const temperatureLines = [
  // 机身温度 - 蓝色系
  { key: '机筒1', color: '#1e40af', name: '机筒1' },
  { key: '机身2', color: '#3b82f6', name: '机身2' },
  { key: '机身3', color: '#60a5fa', name: '机身3' },
  { key: '机身4', color: '#93c5fd', name: '机身4' },
  
  // 法兰温度 - 绿色系
  { key: '法兰1', color: '#059669', name: '法兰1' },
  { key: '法兰2', color: '#10b981', name: '法兰2' },
  
  // 模具温度 - 橙色系
  { key: '模具1', color: '#ea580c', name: '模具1' },
  { key: '模具2', color: '#f97316', name: '模具2' },
]
```

#### 仪表盘渐变配置
- **螺杆转速**: `#8B5CF6` → `#A855F7` (紫色渐变)
- **牵引速度**: `#0891B2` → `#06B6D4` (青色渐变)
- **主轴电流**: `#EA580C` → `#F97316` (橙色渐变)

### 7.3 实时数据流管理

#### 数据队列系统
```tsx
class RealTimeDataQueue {
  private queue: RealTimeDataPoint[] = []
  private readonly maxSize: number = 60 // 2分钟历史数据

  addDataPoint(dataPoint: RealTimeDataPoint): void {
    this.queue.push(dataPoint)
    if (this.queue.length > this.maxSize) {
      this.queue.shift() // FIFO队列
    }
  }

  getAllData(): RealTimeDataPoint[] {
    return [...this.queue] // 返回副本
  }
}
```

#### 实时更新机制
```tsx
const useRealTimeData = (lineData: ProductionDataPoint) => {
  const [chartData, setChartData] = useState<RealTimeDataPoint[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateData = () => {
      const newDataPoint = generateRealTimeDataPoint(lineData)
      
      setChartData(prevData => {
        if (prevData.length < 60) {
          return [...prevData, newDataPoint]
        }
        
        const newData = prevData.slice()
        newData.shift() // 移除最旧数据
        newData.push(newDataPoint) // 添加新数据
        return newData
      })
    }

    intervalRef.current = setInterval(updateData, 2000) // 2秒更新
    return () => clearInterval(intervalRef.current)
  }, [lineData])

  return chartData
}
```

### 7.4 图表性能优化

#### React优化策略
```tsx
// 使用React.memo防止不必要的重渲染
const TemperaturePanel = React.memo(({ realTimeData }: { realTimeData: RealTimeDataPoint[] }) => {
  // 使用useMemo缓存计算结果
  const chartData = useMemo(() => {
    return realTimeData.map((point, index) => ({
      index,
      机筒1: point.机筒1,
      机身2: point.机身2,
      // ... 其他数据
    }))
  }, [realTimeData])

  // 缓存温度线配置
  const temperatureLines = useMemo(() => [
    { key: '机筒1', color: '#1e40af', name: '机筒1' },
    // ... 其他配置
  ], [])

  return (
    <Card>
      {/* 图表内容 */}
    </Card>
  )
})
```

### 7.5 摄像头监控可视化

#### 视频流管理
```tsx
const CameraMonitor = React.memo(({ lineId }: { lineId: string }) => {
  const cameras = useMemo(() => generateCameraData(lineId), [lineId])
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')
  const [isAutoPlay, setIsAutoPlay] = useState(false)

  // 自动轮播功能
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isAutoPlay && onlineCameras.length > 0) {
      interval = setInterval(() => {
        const currentIndex = onlineCameras.findIndex(c => c.id === selectedCameraId)
        const nextIndex = (currentIndex + 1) % onlineCameras.length
        setSelectedCameraId(onlineCameras[nextIndex].id)
      }, 5000) // 5秒切换
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoPlay, onlineCameras, selectedCameraId])

  return (
    <Card className="w-full">
      {/* 摄像头视频显示区域 */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {selectedCamera?.videoUrl ? (
          <video
            key={selectedCamera.id}
            src={selectedCamera.videoUrl}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-white">
            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm opacity-75">实时视频流</p>
          </div>
        )}
        
        {/* 摄像头信息叠加层 */}
        {selectedCamera && (
          <>
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {selectedCamera.name}
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
              <div className={`w-2 h-2 rounded-full ${
                selectedCamera.status === 'online' ? 'bg-green-500' :
                selectedCamera.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              {getStatusText(selectedCamera.status)}
            </div>
          </>
        )}
      </div>
    </Card>
  )
})
```

## 8. 主页生产线概要设计

### 8.1 长度显示
- **当前生产线长度**: 实时显示每条生产线的累积生产长度
- **当前生产批次长度**: 显示当前批次的累积长度
- **单位标识**: 明确标注长度单位(米)
- **数值格式**: 使用千分位分隔符，保留1位小数

### 8.2 布局设计
```
┌─────────────────────────────────────────┐
│ 生产线 #1                    [运行中]    │
├─────────────────────────────────────────┤
│ 产品批号: BATCH-1-001                   │
│ 物料批号: MAT-0001                      │
│                                         │
│ 当前批次长度: 1,500.0 m                 │
│ 累积生产长度: 15,230.5 m                │
│                                         │
│ [实时参数图表区域]                      │
└─────────────────────────────────────────┘
```

### 8.3 状态指示
- **运行状态**: 绿色圆点 + "运行中"
- **停止状态**: 红色圆点 + "已停止"  
- **维护状态**: 蓝色圆点 + "维护中"
- **告警状态**: 黄色圆点 + "告警中"

## 9. 移动端优化

### 9.1 布局适配
- **单列布局**: 生产线卡片垂直排列
- **紧凑设计**: 减少内边距，增加信息密度
- **滑动导航**: 支持左右滑动切换生产线
- **折叠面板**: 详细参数可折叠显示

### 9.2 触摸优化
- **按钮尺寸**: 最小44px×44px的触摸区域
- **间距调整**: 增加元素间距，避免误触
- **滑动手势**: 支持滑动刷新和无限滚动
- **缩放支持**: 图表支持双指缩放

### 9.3 性能优化
- **懒加载**: 图表和图片的懒加载
- **虚拟滚动**: 长列表的虚拟滚动
- **缓存策略**: 合理的数据缓存机制
- **网络优化**: 数据压缩和请求合并

## 10. 可访问性设计

### 10.1 键盘导航
- **Tab顺序**: 逻辑清晰的Tab键导航顺序
- **焦点指示**: 明显的焦点状态样式
- **快捷键**: 常用功能的键盘快捷键
- **跳转链接**: 跳过导航的快速链接

### 10.2 屏幕阅读器
- **语义化标签**: 使用正确的HTML语义标签
- **ARIA标签**: 为复杂组件添加ARIA属性
- **替代文本**: 图片和图标的替代文本
- **状态描述**: 动态内容的状态描述

### 10.3 视觉辅助
- **对比度**: 确保足够的颜色对比度
- **字体大小**: 支持字体大小调整
- **颜色编码**: 不仅依赖颜色传达信息
- **动画控制**: 支持减少动画的用户偏好

## 11. 品牌一致性

### 11.1 Logo设计
- **主Logo**: KFM·SCADA标识，支持深浅色主题
- **图标系统**: 统一的图标风格，使用Lucide React图标库
- **品牌色彩**: 青色主色调贯穿整个系统

### 11.2 文案风格
- **专业术语**: 使用准确的工业术语
- **简洁明了**: 避免冗长的描述文字
- **一致性**: 保持术语和表达方式的一致性
- **本地化**: 完整的中文界面支持

## 12. 未来扩展性

### 12.1 主题系统
- **多主题支持**: 深色/浅色主题切换
- **自定义主题**: 支持企业定制主题
- **主题持久化**: 用户主题偏好的本地存储

### 12.2 国际化
- **多语言支持**: 预留国际化接口
- **RTL支持**: 支持从右到左的语言
- **时区处理**: 多时区的时间显示

### 12.3 组件扩展
- **组件库**: 可复用的组件库架构
- **插件系统**: 支持第三方组件集成
- **API设计**: 灵活的数据接口设计

## 13. 技术实现

### 13.1 前端技术栈
基于 `package.json` 的完整技术栈：

#### 核心框架
- **Next.js 15.3.5**: App Router + React 19.1.0
- **TypeScript 5.4.0**: 类型安全的开发体验
- **Tailwind CSS 3.4.1**: 原子化CSS框架

#### UI组件库
- **Radix UI**: 无障碍的底层组件
- **shadcn/ui**: 基于Radix的设计系统
- **Lucide React 0.400.0**: 统一的图标系统
- **class-variance-authority**: 组件变体管理

#### 数据可视化
- **Recharts 3.0.2**: React图表库
- **ECharts 6.0.0**: 专业仪表盘组件
- **echarts-for-react 3.0.2**: React集成

#### 状态管理
- **React Query 5.28.0**: 服务端状态管理
- **Context API**: 全局状态(认证、主题)
- **React Hook Form 7.51.0**: 表单状态管理

#### 工具库
- **Axios 1.7.0**: HTTP客户端
- **date-fns 4.1.0** + **dayjs 1.11.13**: 时间处理
- **Zod 3.23.0**: 数据验证
- **clsx + tailwind-merge**: 样式合并

### 13.2 架构设计模式

#### 组件架构
```tsx
// 基于组合模式的组件设计
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 内容 */}
  </CardContent>
</Card>

// 基于Compound Components模式
<AlarmNotification>
  <AlarmNotification.Trigger>
    <Bell />
  </AlarmNotification.Trigger>
  <AlarmNotification.Content>
    <AlarmNotification.List />
  </AlarmNotification.Content>
</AlarmNotification>
```

#### Hook模式
```tsx
// 自定义Hook封装业务逻辑
const useRealTimeData = (lineData: ProductionDataPoint) => {
  const [chartData, setChartData] = useState<RealTimeDataPoint[]>([])
  // 实时数据管理逻辑
  return chartData
}

// API Hook模式
const { data, isLoading, error } = useProductionData(refetchInterval)
const { mutate, isLoading: isMutating } = useCreateUser()
```

#### 布局组合模式
```tsx
// 高阶布局组件
<AppLayout>
  <DashboardPage />
</AppLayout>

<VisualizationLayout title="可视化中心" description="数据分析">
  <VisualizationCenter />
</VisualizationLayout>

<ManagementLayout>
  <UserManagement />
</ManagementLayout>
```

### 13.3 CSS架构与设计系统

#### CSS Variables系统
基于 `globals.css` 的设计令牌：

```css
:root {
  /* 语义化颜色令牌 */
  --background: 220 20% 98%;
  --foreground: 220 10% 15%;
  --primary: 195 100% 45%;
  --secondary: 220 15% 90%;
  --muted: 220 15% 95%;
  --border: 220 13% 91%;
  
  /* 功能色彩 */
  --destructive: 0 84% 60%;
  --success: 142 71% 45%;
  
  /* 字体系统 */
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* 圆角系统 */
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 12%;
  --foreground: 220 20% 95%;
  /* 深色主题变量 */
}
```

#### 组件样式模式
```css
/* 玻璃拟态效果 */
.glass-card {
  @apply bg-card/60 backdrop-blur-xl border;
}

/* 状态徽章变体 */
.status-badge-success {
  @apply bg-emerald-50 text-emerald-700 border-emerald-200 
         dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50;
}

.status-badge-danger {
  @apply bg-red-50 text-red-700 border-red-200 
         dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50;
}
```

### 13.4 性能优化策略

#### React性能优化
```tsx
// 1. React.memo防止不必要重渲染
const TemperaturePanel = React.memo(({ realTimeData }) => {
  // 组件实现
})

// 2. useMemo缓存计算结果
const chartData = useMemo(() => {
  return realTimeData.map(transformData)
}, [realTimeData])

// 3. useCallback缓存函数引用
const handleDataUpdate = useCallback((newData) => {
  setData(prevData => [...prevData, newData])
}, [])

// 4. 条件渲染优化
{isLoading ? <LoadingSpinner /> : <DataChart data={data} />}
```

#### 数据流优化
```tsx
// 实时数据队列管理
class RealTimeDataQueue {
  private queue: RealTimeDataPoint[] = []
  private readonly maxSize: number = 60

  addDataPoint(dataPoint: RealTimeDataPoint): void {
    this.queue.push(dataPoint)
    if (this.queue.length > this.maxSize) {
      this.queue.shift() // 保持固定大小，避免内存泄漏
    }
  }
}

// 防抖和节流
const debouncedSearch = useMemo(
  () => debounce((searchTerm: string) => {
    // 搜索逻辑
  }, 300),
  []
)
```

#### 图表性能优化
```tsx
// ECharts实例复用
const chartRef = useRef<EChartsInstance>()

useEffect(() => {
  if (chartRef.current) {
    chartRef.current.setOption(option, false, true) // 不合并，静默更新
  }
}, [option])

// Recharts数据优化
const optimizedData = useMemo(() => {
  return rawData.filter((_, index) => index % 2 === 0) // 数据抽样
}, [rawData])
```

### 13.5 响应式设计实现

#### Tailwind断点系统
```tsx
// 响应式网格布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 移动端1列，平板2列，桌面4列 */}
</div>

// 响应式字体大小
<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
  {/* 渐进式字体大小 */}
</h1>

// 响应式间距
<div className="p-4 md:p-6 lg:p-8">
  {/* 渐进式内边距 */}
</div>
```

#### 容器查询模拟
```tsx
// 基于容器宽度的组件适配
const useContainerQuery = (ref: RefObject<HTMLElement>) => {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')
  
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width
      if (width < 400) setSize('sm')
      else if (width < 800) setSize('md')
      else setSize('lg')
    })
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])
  
  return size
}
```

### 13.6 状态管理架构

#### React Query配置
```tsx
// QueryProvider配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// 实时数据查询
export function useProductionData(refetchInterval: number = 0) {
  return useQuery<ProductionDataPoint[]>({
    queryKey: ['production-data'],
    queryFn: fetchProductionData,
    refetchInterval, // 实时轮询
  })
}
```

#### Context状态管理
```tsx
// 认证上下文
interface AuthContextType {
  user: SupabaseUser | null
  role: Role | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  hasRole: (requiredRole: Role | Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 主题上下文
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 13.7 构建优化配置

#### Next.js配置优化
基于 `next.config.js` 的生产优化：

```javascript
const nextConfig = {
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'], // 按需导入优化
  },
  
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  
  // 压缩配置
  compress: true,
  
  // Webpack优化
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}
```

#### 代码分割策略
```tsx
// 路由级代码分割
const Dashboard = lazy(() => import('@/components/Dashboard'))
const UserManagement = lazy(() => import('@/components/UserManagement'))

// 组件级懒加载
const EChartsGauge = lazy(() => import('@/components/ui/echarts-gauge'))

// 条件加载
{showAdvancedFeatures && (
  <Suspense fallback={<LoadingSpinner />}>
    <AdvancedAnalytics />
  </Suspense>
)}
```

---

*本文档将随着产品迭代持续更新，确保设计规范与实际实现保持一致。*tem
     
 enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 13.7 构建优化配置

#### Next.js配置优化
基于 `next.config.js` 的生产优化：

```javascript
const nextConfig = {
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'], // 按需导入优化
  },
  
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  
  // 压缩配置
  compress: true,
  
  // Webpack优化
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}
```

#### 代码分割策略
```tsx
// 路由级代码分割
const Dashboard = lazy(() => import('@/components/Dashboard'))
const UserManagement = lazy(() => import('@/components/UserManagement'))

// 组件级懒加载
const EChartsGauge = lazy(() => import('@/components/ui/echarts-gauge'))

// 条件加载
{showAdvancedFeatures && (
  <Suspense fallback={<LoadingSpinner />}>
    <AdvancedAnalytics />
  </Suspense>
)}
```

## 14. 设计系统最佳实践

### 14.1 组件设计原则

#### 原子化设计方法
基于实际代码的组件层级：

```tsx
// 原子级组件 (Atoms)
<Button variant="primary" size="sm">按钮</Button>
<Badge variant="success">成功</Badge>
<Input placeholder="请输入..." />

// 分子级组件 (Molecules)
<StatusBadge status="运行中" showIcon />
<AlarmConfirmationBadge isConfirmed={false} onConfirm={handleConfirm} />
<DateRangePicker value={dateRange} onChange={setDateRange} />

// 有机体级组件 (Organisms)
<AlarmNotification alarms={alarms} isLoading={loading} />
<CameraMonitor lineId="1" />
<TemperaturePanel realTimeData={data} />

// 模板级组件 (Templates)
<AppLayout>
  <Header />
  <Sidebar />
  <MainContent />
</AppLayout>

// 页面级组件 (Pages)
<DashboardPage />
<VisualizationPage />
<UserManagementPage />
```

#### 组件API设计规范
```tsx
// 1. 明确的Props接口定义
interface ComponentProps {
  // 必需属性
  data: ProductionDataPoint[]
  
  // 可选属性带默认值
  refreshInterval?: number
  showLegend?: boolean
  
  // 回调函数
  onDataUpdate?: (data: ProductionDataPoint[]) => void
  onError?: (error: Error) => void
  
  // 样式定制
  className?: string
  style?: React.CSSProperties
  
  // 子组件
  children?: React.ReactNode
}

// 2. 使用forwardRef支持ref传递
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ data, refreshInterval = 5000, ...props }, ref) => {
    return <div ref={ref} {...props} />
  }
)

// 3. 显示名称便于调试
Component.displayName = 'ProductionChart'
```

### 14.2 状态管理最佳实践

#### 状态分层管理
```tsx
// 1. 服务端状态 - React Query
const { data: productionData, isLoading } = useProductionData(5000)
const { mutate: updateAlarm } = useAcknowledgeAlarm()

// 2. 全局客户端状态 - Context
const { user, hasRole } = useAuth()
const { theme, setTheme } = useTheme()

// 3. 组件本地状态 - useState
const [selectedLineId, setSelectedLineId] = useState('1')
const [isExpanded, setIsExpanded] = useState(false)

// 4. 表单状态 - React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm()

// 5. 派生状态 - useMemo
const filteredData = useMemo(() => 
  productionData?.filter(item => item.production_line_id === selectedLineId),
  [productionData, selectedLineId]
)
```

#### 错误边界处理
```tsx
// 全局错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // 发送错误报告到监控服务
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">出现了一些问题</h2>
          <p className="text-muted-foreground text-center mb-4">
            页面加载失败，请刷新页面重试
          </p>
          <Button onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 14.3 性能监控与优化

#### 性能指标监控
```tsx
// 1. 组件渲染性能监控
const useRenderPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // 超过一帧时间
        console.warn(`${componentName} render time: ${renderTime}ms`)
      }
    }
  })
}

// 2. 数据加载性能监控
const useApiPerformance = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      if (event.type === 'updated' && event.query.state.status === 'success') {
        const loadTime = Date.now() - event.query.state.dataUpdatedAt
        console.log(`API ${event.query.queryKey} load time: ${loadTime}ms`)
      }
    })
    
    return unsubscribe
  }, [queryClient])
}
```

#### 内存泄漏防护
```tsx
// 1. 清理定时器
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// 2. 清理事件监听器
const useEventListener = (eventName: string, handler: Function, element = window) => {
  const savedHandler = useRef<Function>()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current?.(event)
    element.addEventListener(eventName, eventListener)
    
    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

// 3. 清理WebSocket连接
const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)
    setSocket(ws)

    return () => {
      ws.close()
      setSocket(null)
    }
  }, [url])

  return socket
}
```

## 15. 测试与质量保证

### 15.1 组件测试策略

#### 单元测试示例
```tsx
// StatusBadge组件测试
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/ui/status-badge'

describe('StatusBadge', () => {
  it('renders running status correctly', () => {
    render(<StatusBadge status="运行中" />)
    
    expect(screen.getByText('运行中')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveClass('animate-[spin_3s_linear_infinite]')
  })

  it('renders offline status correctly', () => {
    render(<StatusBadge status="离线中" />)
    
    expect(screen.getByText('离线中')).toBeInTheDocument()
    expect(screen.getByText('离线中')).toHaveClass('text-red-700')
  })

  it('handles unknown status gracefully', () => {
    render(<StatusBadge status="未知状态" />)
    
    expect(screen.getByText('未知状态')).toBeInTheDocument()
  })
})
```

#### 集成测试示例
```tsx
// Dashboard页面集成测试
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from '@/components/Dashboard'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

describe('Dashboard Integration', () => {
  it('loads and displays production data', async () => {
    const queryClient = createTestQueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('生产线 #1')).toBeInTheDocument()
    })

    expect(screen.getByText(/螺杆转速/)).toBeInTheDocument()
    expect(screen.getByText(/牵引速度/)).toBeInTheDocument()
    expect(screen.getByText(/主轴电流/)).toBeInTheDocument()
  })
})
```

### 15.2 可访问性测试

#### 自动化可访问性检查
```tsx
// 使用jest-axe进行可访问性测试
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Dashboard />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

#### 键盘导航测试
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Keyboard Navigation', () => {
  it('supports tab navigation', async () => {
    const user = userEvent.setup()
    render(<AlarmConfirmationBadge isConfirmed={false} onConfirm={jest.fn()} />)
    
    const badge = screen.getByRole('button')
    
    await user.tab()
    expect(badge).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(mockOnConfirm).toHaveBeenCalled()
  })
})
```

## 16. 部署与维护

### 16.1 生产环境优化

#### 构建优化配置
```javascript
// next.config.js 生产环境配置
const nextConfig = {
  // 启用生产优化
  swcMinify: true,
  compress: true,
  
  // 静态资源优化
  assetPrefix: process.env.CDN_URL,
  
  // 输出配置
  output: 'standalone',
  
  // 环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_VERSION: process.env.npm_package_version,
  },
  
  // 安全头配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

#### Docker部署配置
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# 生产镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 16.2 监控与日志

#### 性能监控
```tsx
// 性能监控Hook
const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Web Vitals监控
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }, [])
}

// 错误监控
const useErrorMonitoring = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      // 发送到错误监控服务
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      // 发送到错误监控服务
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}
```

## 17. 设计文档维护

### 17.1 版本控制
- **文档版本**: 与代码版本同步更新
- **变更记录**: 记录每次UI/UX变更的原因和影响
- **设计决策**: 保留重要设计决策的讨论记录

### 17.2 团队协作
- **设计评审**: 定期进行UI/UX设计评审
- **代码审查**: 确保实现与设计规范一致
- **用户反馈**: 收集并分析用户使用反馈

### 17.3 持续改进
- **性能优化**: 定期分析和优化页面性能
- **可访问性**: 持续改进无障碍访问体验
- **用户体验**: 基于数据分析优化用户流程

---

## 附录

### A. 浏览器兼容性矩阵

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| 基础UI | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| CSS Grid | ✅ 57+ | ✅ 52+ | ✅ 10.1+ | ✅ 16+ |
| WebRTC | ✅ 53+ | ✅ 36+ | ✅ 11+ | ✅ 79+ |
| ECharts | ✅ 全版本 | ✅ 全版本 | ✅ 全版本 | ✅ 全版本 |

### B. 性能基准

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 首屏加载时间 | < 2s | 1.8s |
| 交互响应时间 | < 100ms | 80ms |
| 数据更新延迟 | < 2s | 2s |
| 内存使用 | < 100MB | 85MB |

### C. 设计令牌参考

```css
/* 完整的设计令牌系统 */
:root {
  /* 颜色系统 */
  --color-primary-50: hsl(195, 100%, 95%);
  --color-primary-100: hsl(195, 100%, 85%);
  --color-primary-500: hsl(195, 100%, 45%);
  --color-primary-900: hsl(195, 100%, 15%);
  
  /* 间距系统 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* 字体系统 */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* 阴影系统 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

---

*本文档基于 KFM·SCADA 系统的实际代码实现编写，将随着产品迭代持续更新，确保设计规范与实际实现保持一致。*

**文档版本**: v1.0  
**最后更新**: 2025年1月  
**维护团队**: 前端开发团队 & UI/UX设计团队