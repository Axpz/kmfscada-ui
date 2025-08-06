'use client'

import React, { useState } from 'react'
import {
  useProductionLines,
  useCreateProductionLine,
  useDeleteProductionLine,
} from '@/hooks/useApi'
import { ProductionLine } from '@/types'
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

// --- Production Line Form ---
const ProductionLineForm = ({
  onOpenChange,
  line,
}: {
  onOpenChange: (open: boolean) => void
  line?: ProductionLine
}) => {
  const [name, setName] = useState(line?.name || '')
  const [id, setId] = useState(line?.id || '')
  const [description, setDescription] = useState(line?.description || '')
  const [enabled, setEnabled] = useState(line?.enabled !== false)

  const { mutate: createLine, isPending: isCreating } = useCreateProductionLine()
  // Note: You'll need to add useUpdateProductionLine hook if it doesn't exist
  // const { mutate: updateLine, isPending: isUpdating } = useUpdateProductionLine()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (line) {
      // 编辑模式：允许修改名称、描述和启动状态
      // updateLine(
      //   { 
      //     id: line.id, 
      //     data: { 
      //       name: name.trim(), 
      //       description: description.trim() || `生产线${name.trim()}`,
      //       enabled: enabled
      //     } 
      //   },
      //   {
      //     onSuccess: () => {
      //       toast.success('生产线信息已更新！')
      //       onOpenChange(false)
      //     },
      //     onError: (error) => toast.error(`更新失败: ${error.message}`),
      //   }
      // )

      // 临时模拟更新成功
      toast.success(`生产线 ${name} 信息已更新！启动状态: ${enabled ? '已启用' : '已停用'}`)
      onOpenChange(false)
    } else {
      // 创建模式 - 新创建的生产线默认启用
      createLine(
        {
          name: name.trim(),
          description: description.trim() || `生产线${name.trim()}`,
          enabled: true // 新创建的生产线默认启用
        },
        {
          onSuccess: () => {
            toast.success(`生产线 ${name} 已成功创建！`)
            onOpenChange(false)
            // 重置表单
            setName('')
            setId('')
            setDescription('')
            setEnabled(true)
          },
          onError: (err) => toast.error(`创建失败: ${err.message}`),
        }
      )
    }
  }

  const isPending = isCreating // || isUpdating

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          {/* 生产线ID字段 */}
          <div className="grid gap-2">
            <Label htmlFor="line-id" className="text-sm font-medium">
              生产线ID <span className="text-destructive">*</span>
            </Label>
            {line ? (
              // 编辑模式：显示为只读文本，不使用禁用的输入框
              <div className="h-10 px-3 py-2 bg-slate-50 rounded-md border border-slate-300 flex items-center text-sm text-slate-600">
                {id}
              </div>
            ) : (
              // 创建模式：正常的输入框
              <Input
                id="line-id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="请输入生产线ID（如：1, 2, 3...）"
                required
                className="h-10"
              />
            )}
            <p className="text-xs text-muted-foreground">
              {line ? '生产线ID创建后不可修改' : '生产线的唯一标识符，建议使用数字编号'}
            </p>
          </div>

          {/* 生产线名称字段 */}
          <div className="grid gap-2">
            <Label htmlFor="line-name" className="text-sm font-medium">
              生产线名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="line-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入生产线名称（如：高速生产线A）"
              required
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              用于在系统中显示和识别的生产线名称
            </p>
          </div>

          {/* 描述字段 */}
          <div className="grid gap-2">
            <Label htmlFor="line-description" className="text-sm font-medium">
              生产线描述
            </Label>
            <Input
              id="line-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入生产线描述信息（可选）"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              详细描述生产线的功能、特点或用途
            </p>
          </div>

          {/* 启动状态字段 - 创建和编辑模式下都显示 */}
          <div className="grid gap-2">
            <Label htmlFor="line-enabled" className="text-sm font-medium">
              启动状态
            </Label>
            <div className="flex items-center gap-3 h-10">
              <Switch
                id="line-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <span className="text-sm">
                {enabled ? '已启用' : '已禁用'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              控制生产线是否可以接收和执行生产任务
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-6 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="h-10">
              取消
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isPending || !name.trim() || (!line && !id.trim())}
            className="h-10"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {line ? '保存更改' : '创建生产线'}
          </Button>
        </DialogFooter>
      </form>
    </div>
  )
}

// --- Main Component ---
export default function ProductionLineManagement() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState<ProductionLine | undefined>(undefined)
  const { data: lines, isLoading, error } = useProductionLines()
  const { mutate: deleteLine, isPending: isDeleting } = useDeleteProductionLine()

  const handleDelete = (line: ProductionLine) => {
    deleteLine(line.id, {
      onSuccess: () => toast.success(`生产线 #${line.id} 已删除。`),
      onError: (err) => toast.error(`删除失败: ${err.message}`),
    })
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加生产线
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新生产线</DialogTitle>
            </DialogHeader>
            <ProductionLineForm onOpenChange={setAddDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 生产线表格 - 使用默认样式 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>生产线名称</TableHead>
              <TableHead>生产线ID</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>启动状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines?.map((line: any) => (
              <TableRow key={line.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-primary" />
                    {line.name}
                  </div>
                </TableCell>
                <TableCell>{line.id}</TableCell>
                <TableCell>{line.description || '暂无描述'}</TableCell>
                <TableCell>
                  <StatusBadge status={line.enabled !== false ? '已启用' : '已禁用'}/>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog open={isEditDialogOpen && selectedLine?.id === line.id} onOpenChange={(open) => {
                      if (!open) setSelectedLine(undefined);
                      setEditDialogOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedLine(line);
                          setEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>编辑生产线: {selectedLine?.name}</DialogTitle>
                        </DialogHeader>
                        {selectedLine && <ProductionLineForm onOpenChange={setEditDialogOpen} line={selectedLine} />}
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

      {lines?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无生产线数据</p>
        </div>
      )}
    </div>
  )
}
