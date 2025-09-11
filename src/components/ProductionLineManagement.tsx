'use client'

import React, { useState } from 'react'
import {
  useProductionLines,
  useCreateProductionLine,
  useDeleteProductionLine,
  useToggleProductionLineEnabled,
  useUpdateProductionLine,
} from '@/hooks/useProductionLines'
import { ProductionLine, ProductionLineCreate, ProductionLineUpdate } from '@/lib/api-production-lines'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Factory, Plus, Trash2, Loader2, Edit } from 'lucide-react' 

import { StatusBadge } from '@/components/ui/status-badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

// --- Production Line Form ---
const ProductionLineForm = ({
  line,
  onSubmit,
  onClose,
  isEdit = false,
}: {
  line?: ProductionLine
  onSubmit: (data: any) => void
  onClose: () => void
  isEdit?: boolean
}) => {
  const [formData, setFormData] = useState({
    name: line?.name || '',
    description: line?.description || '',
    enabled: line?.enabled !== false
  })

  // 当 line 属性变化时，更新表单数据
  React.useEffect(() => {
    if (line) {
      setFormData({
        name: line.name || '',
        description: line.description || '',
        enabled: line.enabled !== false
      })
    }
  }, [line])

  const handleParameterChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('请输入生产线名称')
      return
    }
    
    // 准备提交的数据
    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      enabled: formData.enabled
    }
    
    onSubmit(submitData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* 生产线名称字段 */}
        <div className="grid gap-2">
          <Label htmlFor="line-name" className="text-sm font-medium">
            生产线名称 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="line-name"
            value={formData.name}
            onChange={(e) => handleParameterChange('name', e.target.value)}
            placeholder="请输入生产线名称"
            required
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            输入生产线的唯一标识名称
          </p>
        </div>

        {/* 描述字段 */}
        <div className="grid gap-2">
          <Label htmlFor="line-description" className="text-sm font-medium">
            生产线描述
          </Label>
          <Input
            id="line-description"
            value={formData.description}
            onChange={(e) => handleParameterChange('description', e.target.value)}
            placeholder="请输入生产线描述信息（可选）"
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            描述生产线的用途和特点
          </p>
        </div>

        {/* 启动状态字段 */}
        <div className="grid gap-2">
          <Label htmlFor="line-enabled" className="text-sm font-medium">
            启动状态
          </Label>
          <div className="flex items-center gap-3 h-10">
            <Switch
              id="line-enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => handleParameterChange('enabled', checked)}
            />
            <span className="text-sm">
              {formData.enabled ? '已启用' : '已禁用'}
            </span>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 pt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="h-10" onClick={onClose}>
            取消
          </Button>
        </DialogClose>
        <Button type="submit" className="h-10">
          {isEdit ? '保存更改' : '创建生产线'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// --- Main Component ---
export default function ProductionLineManagement() {
  const { hasRole } = useSupabaseAuth()
  const isDisabled = !hasRole(['admin', 'super_admin'])

  const [isAddDialogOpen, setAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState<ProductionLine | undefined>(undefined)
  const { data: lines, isLoading, error } = useProductionLines()
  const { mutate: deleteLine, isPending: isDeleting } = useDeleteProductionLine()
  const { mutate: createLine, isPending: isCreating } = useCreateProductionLine()
  const { mutate: updateLine, isPending: isUpdating } = useUpdateProductionLine()

  const handleDelete = (line: ProductionLine) => {
    deleteLine(line.id, {
      onSuccess: () => toast.success(`生产线 ${line.name} 已删除。`),
      onError: (err) => toast.error(`删除失败: ${err.message}`),
    })
  }

  const handleCreateLine = (data: ProductionLineCreate) => {
    createLine(data, {
      onSuccess: () => {
        toast.success('生产线创建成功！')
        setAddDialogOpen(false)
      },
      onError: (err) => toast.error(`创建失败: ${err.message}`),
    })
  }

  const handleUpdateLine = (data: ProductionLineUpdate) => {
    if (!selectedLine) return
    
    updateLine(
      { id: selectedLine.id, updates: data },
      {
        onSuccess: () => {
          toast.success('生产线更新成功！')
          setEditDialogOpen(false)
          setSelectedLine(undefined)
        },
        onError: (err) => toast.error(`更新失败: ${err.message}`),
      }
    )
  }

  const toggleMutation = useToggleProductionLineEnabled()
  
  const handleToggleEnabled = (line: ProductionLine, enabled: boolean) => {
    toggleMutation.mutate(
      { id: line.id, enabled },
      {
        onSuccess: () => toast.success(`生产线 ${line.name} ${enabled ? '已启用' : '已禁用'}`),
        onError: (err) => toast.error(`状态更新失败: ${err.message}`),
      }
    )
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (error) {
    return <div className="text-red-500 p-4">加载生产线失败: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">生产线列表</h2>
          <p className="text-sm text-muted-foreground">
            管理生产线配置和设备参数
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isDisabled}>
              <Plus className="mr-2 h-4 w-4" />
              添加生产线
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <ProductionLineForm 
              onSubmit={handleCreateLine}
              onClose={() => setAddDialogOpen(false)}
              isEdit={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 生产线表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>生产线名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>启用状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines?.items?.map((line: ProductionLine) => (
              <TableRow key={line.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {line.name}
                  </div>
                </TableCell>
                <TableCell>{line.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={line.enabled ?? false}
                      onCheckedChange={(enabled) => handleToggleEnabled(line, enabled)}
                      disabled={isDeleting || isDisabled}
                    />
                    <StatusBadge status={(line.enabled ?? false) ? '已启用' : '已禁用'} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog open={isEditDialogOpen && selectedLine?.id === line.id} onOpenChange={(open) => {
                      if (!open) {
                        setSelectedLine(undefined);
                        setEditDialogOpen(false);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedLine(line);
                          setEditDialogOpen(true);
                        }} disabled={isDisabled}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>编辑生产线: {selectedLine?.name}</DialogTitle>
                        </DialogHeader>
                        {selectedLine && (
                          <ProductionLineForm 
                            line={selectedLine}
                            onSubmit={handleUpdateLine}
                            onClose={() => {
                              setEditDialogOpen(false);
                              setSelectedLine(undefined);
                            }}
                            isEdit={true}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={isDisabled}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要删除吗?</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除 <strong>{line.name}</strong>。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(line)} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

      {lines?.items?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无生产线数据</p>
        </div>
      )}
    </div>
  )
}
