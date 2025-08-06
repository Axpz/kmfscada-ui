'use client'

import React, { useState, useMemo } from 'react'
import { useAlarmRules, useUpdateAlarmRule, useProductionData } from '@/hooks/useApi'
import { DiameterAlarmConfig } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import {
  Loader2,
  AlertCircle,
  Save,
  Settings,
  PlusCircle,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'

// Mock监控参数选项
const MONITOR_PARAMETERS = [
  { value: 'real_time_diameter', label: '实时测量直径' },
  { value: 'body_temperature', label: '机身温度' },
  { value: 'flange_temperature', label: '法兰温度' },
  { value: 'mold_temperature', label: '模具温度' },
  { value: 'screw_motor_speed', label: '螺杆转速' },
  { value: 'traction_motor_speed', label: '牵引速度' },
]

// 扩展的报警规则类型
interface ExtendedAlarmRule extends DiameterAlarmConfig {
  id?: string
  parameter_type: string
  parameter_name: string
  created_at: string
  updated_at: string
}

// 排序类型
type SortField = 'production_line_id' | 'created_at' | 'updated_at'
type SortDirection = 'asc' | 'desc'

// 报警规则表单组件
const AlarmRuleForm = ({
  rule,
  onSubmit,
  onClose,
  isEdit = false,
}: {
  rule?: ExtendedAlarmRule
  onSubmit: (data: Partial<ExtendedAlarmRule>) => void
  onClose: () => void
  isEdit?: boolean
}) => {
  const { data: productionLines } = useProductionData()
  const [formData, setFormData] = useState({
    production_line_id: rule?.production_line_id || '',
    parameter_type: rule?.parameter_type || 'real_time_diameter',
    parameter_name: rule?.parameter_name || '实时测量直径',
    lower_limit: rule?.lower_limit || 0,
    upper_limit: rule?.upper_limit || 0,
    enabled: rule?.enabled || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.production_line_id) {
      toast.error('请选择生产线')
      return
    }
    if (formData.lower_limit >= formData.upper_limit) {
      toast.error('下限必须小于上限')
      return
    }
    onSubmit(formData)
  }

  const handleParameterChange = (value: string) => {
    const parameter = MONITOR_PARAMETERS.find(p => p.value === value)
    setFormData(prev => ({
      ...prev,
      parameter_type: value,
      parameter_name: parameter?.label || value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* 生产线选择 */}
        <div className="grid gap-2">
          <Label htmlFor="production_line" className="text-sm font-medium">
            生产线 <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.production_line_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, production_line_id: value }))}
            disabled={isEdit}
          >
            <SelectTrigger id="production_line" className="h-10">
              <SelectValue placeholder="请选择生产线" />
            </SelectTrigger>
            <SelectContent>
              {productionLines?.map(line => (
                <SelectItem key={line.production_line_id} value={line.production_line_id}>
                  生产线 #{line.production_line_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            选择要配置报警规则的生产线
          </p>
        </div>

        {/* 监控参数选择 */}
        <div className="grid gap-2">
          <Label htmlFor="parameter" className="text-sm font-medium">
            监控参数 <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.parameter_type} onValueChange={handleParameterChange}>
            <SelectTrigger id="parameter" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONITOR_PARAMETERS.map(param => (
                <SelectItem key={param.value} value={param.value}>
                  {param.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            选择要监控的参数类型
          </p>
        </div>

        {/* 阈值设置 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="lower_limit" className="text-sm font-medium">
              下限值 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lower_limit"
              type="number"
              step="0.001"
              value={formData.lower_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, lower_limit: Number(e.target.value) }))}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              低于此值时触发报警
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="upper_limit" className="text-sm font-medium">
              上限值 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="upper_limit"
              type="number"
              step="0.001"
              value={formData.upper_limit}
              onChange={(e) => setFormData(prev => ({ ...prev, upper_limit: Number(e.target.value) }))}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              高于此值时触发报警
            </p>
          </div>
        </div>

        {/* 启用状态 */}
        <div className="grid gap-2">
          <Label className="text-sm font-medium">启用状态</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
              {formData.enabled ? '已启用' : '已禁用'}
          </div>
          <p className="text-xs text-muted-foreground">
            启用后该规则将生效并触发报警
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2 pt-6 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="h-10">
            取消
          </Button>
        </DialogClose>
        <Button type="submit" className="h-10">
          {isEdit ? '保存更改' : '创建规则'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function AlarmRules() {
  const { data: alarmRules, isLoading, error } = useAlarmRules()
  const { data: productionLines } = useProductionData()
  const { mutate: updateRule, isPending } = useUpdateAlarmRule()

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<ExtendedAlarmRule | undefined>(undefined)
  const [sortField, setSortField] = useState<SortField>('production_line_id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Mock扩展的报警规则数据
  const extendedRules: ExtendedAlarmRule[] = useMemo(() => {
    if (!alarmRules || !productionLines) return []

    return productionLines.map((line, index) => {
      const existingRule = alarmRules.find(r => r.production_line_id === line.production_line_id)
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30))

      return {
        id: `rule_${line.production_line_id}`,
        production_line_id: line.production_line_id,
        parameter_type: 'real_time_diameter',
        parameter_name: '实时测量直径',
        lower_limit: existingRule?.lower_limit || Math.random() * 10 + 5,
        upper_limit: existingRule?.upper_limit || Math.random() * 10 + 20,
        enabled: existingRule?.enabled || Math.random() > 0.5,
        created_at: new Date(baseDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(baseDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    })
  }, [alarmRules, productionLines])

  // 排序后的规则
  const sortedRules = useMemo(() => {
    return [...extendedRules].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'production_line_id') {
        aValue = parseInt(aValue)
        bValue = parseInt(bValue)
      } else if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [extendedRules, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleCreateRule = (data: Partial<ExtendedAlarmRule>) => {
    // Mock创建逻辑
    toast.success('报警规则创建成功！')
    setCreateDialogOpen(false)
  }

  const handleEditRule = (data: Partial<ExtendedAlarmRule>) => {
    // Mock编辑逻辑
    toast.success('报警规则更新成功！')
    setEditDialogOpen(false)
    setSelectedRule(undefined)
  }

  const handleDeleteRule = (ruleId: string) => {
    // Mock删除逻辑
    toast.success('报警规则删除成功！')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-destructive/10 rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold text-destructive">加载报警规则失败</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">报警规则</h2>
          <p className="text-sm text-muted-foreground">
            管理生产线的报警规则配置，设置监控参数的阈值和启用状态
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              添加报警规则
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建报警规则</DialogTitle>
            </DialogHeader>
            <AlarmRuleForm
              onSubmit={handleCreateRule}
              onClose={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 报警规则表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('production_line_id')}
                >
                  生产线
                  {getSortIcon('production_line_id')}
                </Button>
              </TableHead>
              <TableHead>监控参数</TableHead>
              <TableHead>下限值</TableHead>
              <TableHead>上限值</TableHead>
              <TableHead>启用状态</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('created_at')}
                >
                  创建时间
                  {getSortIcon('created_at')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('updated_at')}
                >
                  修改时间
                  {getSortIcon('updated_at')}
                </Button>
              </TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  生产线 #{rule.production_line_id}
                </TableCell>
                <TableCell>{rule.parameter_name}</TableCell>
                <TableCell>
                  {rule.lower_limit.toFixed(3)}
                </TableCell>
                <TableCell>
                  {rule.upper_limit.toFixed(3)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={rule.enabled ? '已启用' : '已禁用'} />
                </TableCell>
                <TableCell>
                  {dayjs(rule.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell>
                  {dayjs(rule.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog open={isEditDialogOpen && selectedRule?.id === rule.id} onOpenChange={(open) => {
                      if (!open) setSelectedRule(undefined);
                      setEditDialogOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>编辑报警规则: 生产线 #{selectedRule?.production_line_id}</DialogTitle>
                        </DialogHeader>
                        {selectedRule && (
                          <AlarmRuleForm
                            rule={selectedRule}
                            onSubmit={handleEditRule}
                            onClose={() => setEditDialogOpen(false)}
                            isEdit={true}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除生产线 <strong>#{rule.production_line_id}</strong> 的报警规则。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRule(rule.id!)}>
                            继续删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 空状态提示 */}
      {sortedRules.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无报警规则数据</p>
        </div>
      )}
    </div>
  )
}