'use client'

import React, { useState } from 'react'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/useApi'
import { User, Role } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import {
  Loader2,
  Users,
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'

// --- Sub-components ---

const UserForm = ({
  onOpenChange,
  user,
}: {
  onOpenChange: (open: boolean) => void
  user?: User
}) => {
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(user?.role || 'user')

  const { mutate: createUser, isPending: isCreating } = useCreateUser()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      // 编辑模式：允许修改所有字段（除了密码）
      updateUser(
        {
          id: user.id,
          data: {
            username: username.trim(),
            email: email.trim(),
            role
          }
        },
        {
          onSuccess: () => {
            toast.success('用户信息已更新！')
            onOpenChange(false)
          },
          onError: (error) => toast.error(`更新失败: ${error.message}`),
        }
      )
    } else {
      // 创建模式
      createUser(
        {
          username: username.trim(),
          email: email.trim(),
          password,
          role
        },
        {
          onSuccess: () => {
            toast.success('用户已成功创建！')
            onOpenChange(false)
            // 重置表单
            setUsername('')
            setEmail('')
            setPassword('')
            setRole('user')
          },
          onError: (error) => toast.error(`创建失败: ${error.message}`),
        }
      )
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          {/* 用户名字段 */}
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-sm font-medium">
              用户名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              用户名用于登录系统，建议使用英文字母和数字
            </p>
          </div>

          {/* 邮箱字段 */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium">
              邮箱地址 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱地址"
              required
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              用于接收系统通知和密码重置
            </p>
          </div>

          {/* 密码字段 - 仅创建时显示 */}
          {!user && (
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                初始密码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入初始密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                密码长度至少6位，建议包含字母和数字
              </p>
            </div>
          )}

          {/* 角色选择 */}
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-sm font-medium">
              用户角色 <span className="text-destructive">*</span>
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)} required>
              <SelectTrigger id="role" className="h-10">
                <SelectValue placeholder="请选择用户角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">普通用户</span>
                    <span className="text-xs text-muted-foreground">基础功能访问权限</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">管理员</span>
                    <span className="text-xs text-muted-foreground">系统管理和配置权限</span>
                  </div>
                </SelectItem>
                <SelectItem value="superadmin">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">超级管理员</span>
                    <span className="text-xs text-muted-foreground">完整系统控制权限</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              不同角色拥有不同的系统访问权限
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
            disabled={isPending || !username.trim() || !email.trim() || (!user && !password)}
            className="h-10"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? '保存更改' : '创建用户'}
          </Button>
        </DialogFooter>
      </form>
    </div>
  )
}

// --- Main Component ---

export default function UserManagement() {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)

  const { data: users, isLoading, error } = useUsers()
  const { mutate: deleteUser } = useDeleteUser()

  const handleDelete = (userId: string) => {
    deleteUser(userId, {
      onSuccess: () => toast.success('用户已成功删除！'),
      onError: (error) => toast.error(`删除失败: ${error.message}`),
    })
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
        <h2 className="mt-4 text-xl font-semibold text-destructive">加载用户失败</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">用户列表</h2>
          <p className="text-sm text-muted-foreground">
            管理系统用户账户和权限设置
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              创建用户
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新用户</DialogTitle>
            </DialogHeader>
            <UserForm onOpenChange={setCreateDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 用户表格 - 使用默认样式 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead className="hidden md:table-cell">邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead className="hidden lg:table-cell">创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell>
                  <StatusBadge status={user.role.toString()} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {dayjs(user.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                      if (!open) setSelectedUser(undefined);
                      setEditDialogOpen(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedUser(user);
                          setEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>编辑用户: {selectedUser?.username}</DialogTitle>
                        </DialogHeader>
                        {selectedUser && <UserForm onOpenChange={setEditDialogOpen} user={selectedUser} />}
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
                            此操作无法撤销。这将永久删除用户 <strong>{user.username}</strong> 的账户。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)}>
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

      {users?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无用户数据</p>
        </div>
      )}
    </div>
  )
}
