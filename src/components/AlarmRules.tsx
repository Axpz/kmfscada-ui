'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  useAlarmRulesList, 
  useCreateAlarmRule, 
  useUpdateAlarmRule, 
  useDeleteAlarmRule, 
  useToggleAlarmRule,
} from '@/hooks/useAlarmRules'
import { 
  type AlarmRule,
  type AlarmRuleCreate
} from '@/lib/api-alarm-rules'
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
import { useAvailableProductionLines } from '@/hooks/useProductionLines'

const ALARM_RULE_PARAMETERS = [
  { value: 'current_length', label: '当前生产长度' },
  { value: 'diameter', label: '实时测量直径' },
  { value: 'fluoride_concentration', label: '氟离子浓度' },

  { value: 'temp_body', label: '机身温度' },
  { value: 'temp_flange', label: '法兰温度' },
  { value: 'temp_mold', label: '模具温度' },

  { value: 'current_body', label: '机身电流' },
  { value: 'current_flange', label: '法兰电流' },
  { value: 'current_mold', label: '模具电流' },

  { value: 'motor_screw_speed', label: '螺杆电机速度' },
  { value: 'motor_screw_torque', label: '电机扭矩' },
  { value: 'motor_current', label: '主机电流' },
  { value: 'motor_traction_speed', label: '牵引速度' },
  { value: 'motor_vacuum_speed', label: '真空速度' },

  { value: 'winder_speed', label: '当前收卷速度' },
  { value: 'winder_torque', label: '当前收卷扭力' },
  { value: 'winder_layer_count', label: '当前排管层数' },
  { value: 'winder_tube_speed', label: '当前排管速度' },
  { value: 'winder_tube_count', label: '当前排管根数' },
]

// 扩展的报警规则类型
interface ExtendedAlarmRule {
  id?: string
  line_id: string
  parameter_name: string
  lower_limit: number
  upper_limit: number
  enabled: boolean
  created_at: string
  updated_at: string
}

// 排序类型
type SortField = 'line_id' | 'created_at' | 'updated_at'
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
  const { data: activeLineIds } = useAvailableProductionLines()
  const lineIds = ['*', ...activeLineIds?.items?.map(line => line.name) || []]
  const [formData, setFormData] = useState({
    line_id: rule?.line_id || '',
    parameter_name: rule?.parameter_name || '',
    lower_limit: rule?.lower_limit || 0,
    upper_limit: rule?.upper_limit || 0,
    enabled: rule?.enabled || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.line_id) {
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
    const parameter = ALARM_RULE_PARAMETERS.find(p => p.value === value)
    setFormData(prev => ({
      ...prev,
      parameter_name: parameter?.value || value
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
            value={formData.line_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, line_id: value }))}
          >
            <SelectTrigger id="production_line" className="h-10">
              <SelectValue placeholder="请选择生产线" />
            </SelectTrigger>
            <SelectContent>
              {lineIds?.map(lineId => (
                <SelectItem key={lineId} value={lineId}>
                  {lineId === '*' ? '所有生产线' : lineId}
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
          <Select value={formData.parameter_name} onValueChange={handleParameterChange}>
            <SelectTrigger id="parameter" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALARM_RULE_PARAMETERS.map(param => (
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
        </div>
      </div>

      <DialogFooter className="gap-2 pt-6">
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
  const { data: alarmRules, isLoading, error } = useAlarmRulesList()
  const updateMutation = useUpdateAlarmRule()
  const createMutation = useCreateAlarmRule()
  const deleteMutation = useDeleteAlarmRule()
  const toggleMutation = useToggleAlarmRule()

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<ExtendedAlarmRule | undefined>(undefined)
  const [sortField, setSortField] = useState<SortField>('line_id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // 扩展的报警规则数据
  const extendedRules: ExtendedAlarmRule[] = useMemo(() => {
    if (!alarmRules?.items) return []

    return alarmRules.items.map((rule: AlarmRule) => {
      const parameter = ALARM_RULE_PARAMETERS.find(p => p.value === rule.parameter_name)
      return {
        id: rule.id.toString(),
        line_id: rule.line_id,
        parameter_name: parameter?.value || '',
        lower_limit: rule.lower_limit || 0,
        upper_limit: rule.upper_limit || 0,
        enabled: rule.is_enabled,
        created_at: rule.created_at,
        updated_at: rule.updated_at,
      }
    })
  }, [alarmRules])


  // 排序后的规则
  const sortedRules = useMemo(() => {
    return [...extendedRules].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // 处理不同类型的排序字段
      if (sortField === 'line_id') {
        aValue = parseInt(aValue)
        bValue = parseInt(bValue)
      } else if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      let result = 0
      if (aValue > bValue) result = 1
      else if (aValue < bValue) result = -1

      // 如果主排序字段相等，则按照 parameter_name 排序
      if (result === 0) {
        result = (aValue + a.parameter_name).localeCompare(bValue + b.parameter_name)
      }

      return sortDirection === 'asc' ? result : -result
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

  const handleCreateRule = async (data: Partial<ExtendedAlarmRule>) => {
    if (!data.line_id || !data.parameter_name) {
      toast.error('请填写必要信息')
      return
    }

    const ruleData: AlarmRuleCreate = {
      line_id: data.line_id,
      parameter_name: data.parameter_name,
      lower_limit: data.lower_limit || 0,
      upper_limit: data.upper_limit || 0,
      is_enabled: data.enabled || false
    }

    createMutation.mutate(ruleData, {
      onSuccess: () => {
        setCreateDialogOpen(false)
      }
    })
  }

  const handleEditRule = async (data: Partial<ExtendedAlarmRule>) => {
    if (!selectedRule?.id) return

    const updates: any = {}
    if (data.lower_limit !== undefined) updates.lower_limit = data.lower_limit
    if (data.upper_limit !== undefined) updates.upper_limit = data.upper_limit
    if (data.enabled !== undefined) updates.is_enabled = data.enabled
    if (data.parameter_name !== undefined) updates.parameter_name = data.parameter_name
    if (data.line_id !== undefined) updates.line_id = data.line_id

    updateMutation.mutate({ id: parseInt(selectedRule.id), updates }, {
      onSuccess: () => {
        setEditDialogOpen(false)
        setSelectedRule(undefined)
      }
    })
  }

  const handleDeleteRule = async (ruleId: string) => {
    deleteMutation.mutate(parseInt(ruleId))
  }

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    toggleMutation.mutate({ id: parseInt(ruleId), enabled })
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
        <p className="mt-2 text-muted-foreground">{error?.message || '加载失败'}</p>
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
                  onClick={() => handleSort('line_id')}
                >
                  生产线
                  {getSortIcon('line_id')}
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
                  {rule.line_id === '*' ? '所有生产线' : `${rule.line_id}`}
                </TableCell>
                <TableCell>{ALARM_RULE_PARAMETERS.find(p => p.value === rule.parameter_name)?.label}</TableCell>
                <TableCell>
                  {rule.lower_limit.toFixed(3)}
                </TableCell>
                <TableCell>
                  {rule.upper_limit.toFixed(3)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(enabled) => handleToggleRule(rule.id!, enabled)}
                      disabled={toggleMutation.isPending}
                    />
                    <StatusBadge status={rule.enabled ? '已启用' : '已禁用'} />
                  </div>
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
                          <DialogTitle>编辑报警规则: {selectedRule?.line_id === '*' ? '所有生产线' : `${selectedRule?.line_id}`}</DialogTitle>
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
                            此操作无法撤销。这将永久删除生产线 <strong>{rule.line_id === '*' ? '所有生产线' : `${rule.line_id}`}</strong> 的报警规则。
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