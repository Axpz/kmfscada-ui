'use client'

import React from 'react'
import { useProductionData } from '@/hooks/useApi'
import { ProductionDataPoint } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  AlertCircle,
  Activity,
  CheckCircle,
  XCircle,
  Thermometer,
  Zap,
  Gauge,
  Factory,
  Maximize,
  Ruler,
} from 'lucide-react'

// --- Helper Components ---

const KpiCard = ({
  title,
  value,
  icon: Icon,
  unit,
  color,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  unit?: string
  color?: string
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
    </CardContent>
  </Card>
)

const DataPoint = ({
  label,
  value,
  unit,
}: {
  label: string
  value: string | number
  unit: string
}) => (
  <div className="flex justify-between items-baseline">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="font-mono text-sm font-semibold">
      {value} <span className="text-xs text-muted-foreground">{unit}</span>
    </span>
  </div>
)

const ProductionLineCard = ({ lineData }: { lineData: ProductionDataPoint }) => {
  const statusMap: { [key: string]: { color: string; label: string; icon: React.ElementType } } = {
    running: { color: 'bg-green-500', label: '运行中', icon: CheckCircle },
    stopped: { color: 'bg-red-500', label: '已停止', icon: XCircle },
    alarm: { color: 'bg-yellow-500', label: '报警中', icon: AlertCircle },
    maintenance: { color: 'bg-blue-500', label: '维护中', icon: Activity },
  }
  
  // This is a placeholder. In a real app, status would come from the data.
  const statusKeys = Object.keys(statusMap)
  const randomKey = statusKeys[Math.floor(Math.random() * statusKeys.length)]
  const currentStatus = statusMap[randomKey as keyof typeof statusMap]!

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-primary" />
              生产线 #{lineData.production_line_id}
            </CardTitle>
            <CardDescription>批号: {lineData.production_batch_number}</CardDescription>
          </div>
          <Badge variant="ghost">
            <div className={`w-2 h-2 rounded-full mr-2 ${currentStatus.color}`} />
            {currentStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-1">
        {/* Temperatures */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center text-sm"><Thermometer className="w-4 h-4 mr-2" />温度</h4>
          <DataPoint label="机身" value={lineData.body_temperatures.join(' / ')} unit="°C" />
          <DataPoint label="法兰" value={lineData.flange_temperatures.join(' / ')} unit="°C" />
          <DataPoint label="模具" value={lineData.mold_temperatures.join(' / ')} unit="°C" />
        </div>
        
        {/* Speeds & Motors */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center text-sm"><Gauge className="w-4 h-4 mr-2" />速度/转速</h4>
          <DataPoint label="螺杆电机" value={lineData.screw_motor_speed} unit="rpm" />
          <DataPoint label="牵引机" value={lineData.traction_motor_speed} unit="m/min" />
          <DataPoint label="主轴电流" value={lineData.main_spindle_current} unit="A" />
        </div>

        {/* Measurements */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center text-sm"><Ruler className="w-4 h-4 mr-2" />测量</h4>
          <DataPoint label="实时直径" value={lineData.real_time_diameter.toFixed(3)} unit="mm" />
          <DataPoint label="生产长度" value={lineData.total_length_produced} unit="m" />
        </div>

        {/* Other */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center text-sm"><Maximize className="w-4 h-4 mr-2" />其他</h4>
          <DataPoint label="氟离子" value={lineData.fluoride_ion_concentration.toFixed(2)} unit="ppm" />
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Dashboard Component ---

export default function Dashboard() {
  const { data: productionData, isLoading, error } = useProductionData()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-destructive/10 rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold text-destructive">加载数据失败</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  // --- Aggregate KPIs ---
  const totalLines = productionData?.length || 0
  // Placeholder for active lines logic
  const activeLines = productionData?.filter(() => Math.random() > 0.2).length || 0
  const totalLength = productionData?.reduce((sum, line) => sum + line.total_length_produced, 0) || 0
  // Placeholder for alarm count
  const alarmCount = productionData?.filter(() => Math.random() > 0.9).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">实时数据看板</h1>
        <p className="text-muted-foreground">
          监控所有生产线的关键实时指标。
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="总生产线" value={totalLines} icon={Factory} />
        <KpiCard title="活跃生产线" value={activeLines} icon={Activity} />
        <KpiCard title="总产量" value={totalLength.toLocaleString()} icon={Ruler} unit="米" />
        <KpiCard title="当前告警" value={alarmCount} icon={AlertCircle} color={alarmCount > 0 ? 'text-yellow-500' : ''} />
      </div>

      {/* Production Lines Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">生产线详情</h2>
        {productionData && productionData.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {productionData.map((lineData: ProductionDataPoint) => (
              <ProductionLineCard key={lineData.production_line_id} lineData={lineData} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <Factory className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">无生产数据</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              当前没有可用的生产线数据。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}