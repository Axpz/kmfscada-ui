'use client'

import React, { useState } from 'react'
import { useUsers } from '../hooks'
import type { User } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Loader2, Users, AlertCircle, Edit, Trash2, Plus, Search, Settings } from 'lucide-react'

// User Form Component
const UserForm = ({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user?: User | null
  onSave: (userData: any) => void
  onCancel: () => void 
}) => {
  const [username, setUsername] = useState(user?.user_metadata?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState(user?.role || '操作员')
  const [status, setStatus] = useState(user?.confirmed_at ? '活跃' : '禁用')
  const [localError, setLocalError] = useState('')

  const handleSubmit = () => {
    if (!username || !email || !role || !status) {
      setLocalError('所有字段都是必填项。')
      return
    }
    onSave({ id: user?.id || null, username, email, role, status })
    setLocalError('')
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{user ? "编辑用户" : "添加用户"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="form-username" className="block text-sm font-medium mb-1 text-foreground">
              用户名:
            </label>
            <Input 
              id="form-username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor="form-email" className="block text-sm font-medium mb-1 text-foreground">
              邮箱:
            </label>
            <Input 
              id="form-email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor="form-role" className="block text-sm font-medium mb-1 text-foreground">
              角色:
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="管理员">管理员</SelectItem>
                <SelectItem value="操作员">操作员</SelectItem>
                <SelectItem value="访客">访客</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="form-status" className="block text-sm font-medium mb-1 text-foreground">
              状态:
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="活跃">活跃</SelectItem>
                <SelectItem value="禁用">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {localError && <p className="text-red-500 text-sm">{localError}</p>}
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={handleSubmit}>
              {user ? "保存更改" : "添加用户"}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UserManagement() {
  const { data: usersResponse, isLoading, error } = useUsers()
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const users: User[] = usersResponse?.users || []
  const errorMessage = error?.message || usersResponse?.error

  // Mock users for demonstration
  const mockUsers = [
    { id: 'U001', email: 'admin@example.com', user_metadata: { username: 'admin' }, role: '管理员', confirmed_at: new Date().toISOString(), created_at: new Date().toISOString(), last_sign_in_at: new Date().toISOString() },
    { id: 'U002', email: 'user1@example.com', user_metadata: { username: 'user1' }, role: '操作员', confirmed_at: new Date().toISOString(), created_at: new Date().toISOString(), last_sign_in_at: new Date().toISOString() },
    { id: 'U003', email: 'viewer@example.com', user_metadata: { username: 'viewer' }, role: '访客', confirmed_at: null, created_at: new Date().toISOString(), last_sign_in_at: null },
  ]

  const displayUsers = users.length > 0 ? users : mockUsers

  const filteredUsers = displayUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.user_metadata?.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleAddUserClick = () => {
    setEditingUser(null)
    setShowUserForm(true)
    setFormMessage(null)
  }

  const handleEditUserClick = (user: User) => {
    setEditingUser(user)
    setShowUserForm(true)
    setFormMessage(null)
  }

  const handleDeleteUser = (userId: string, username: string) => {
    setFormMessage(null)
    if (window.confirm(`确定要删除用户 "${username}" 吗？`)) {
      // 这里应该调用实际的删除 API，现在只是模拟
      console.log(`Deleting user with ID: ${userId}`)
      setFormMessage({ type: 'success', text: `用户 "${username}" 已删除。` })
    } else {
      setFormMessage({ type: 'error', text: `用户 "${username}" 删除操作已取消。` })
    }
    setTimeout(() => setFormMessage(null), 3000)
  }

  const handleSaveUser = (userData: any) => {
    if (userData.id) {
      setFormMessage({ type: 'success', text: `用户 "${userData.username}" 已更新。` })
    } else {
      setFormMessage({ type: 'success', text: `用户 "${userData.username}" 已添加。` })
    }
    setShowUserForm(false)
    setEditingUser(null)
    setTimeout(() => setFormMessage(null), 3000)
  }

  const handleCancelForm = () => {
    setShowUserForm(false)
    setEditingUser(null)
    setFormMessage(null)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              系统管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">加载用户数据中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (errorMessage && users.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              系统管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">系统管理</h1>
          <p className="text-muted-foreground">用户权限与系统配置管理</p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">管理模式</span>
        </div>
      </div>

      {formMessage && (
        <div className={`p-3 mb-4 rounded-md border ${
          formMessage.type === 'success' 
            ? 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800' 
            : 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          {formMessage.text}
        </div>
      )}

      {showUserForm ? (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={handleCancelForm}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                筛选条件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索用户..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有角色</SelectItem>
                    <SelectItem value="管理员">管理员</SelectItem>
                    <SelectItem value="操作员">操作员</SelectItem>
                    <SelectItem value="访客">访客</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddUserClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加用户
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                用户列表
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                共 {filteredUsers.length} 个用户
              </p>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">没有找到匹配的用户</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>最后登录</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {user.email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {user.user_metadata?.username || user.email.split('@')[0]}
                                </p>
                                <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === '管理员' ? 'default' : 'secondary'}>
                              {user.role || '用户'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{new Date(user.created_at).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(user.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.last_sign_in_at ? (
                              <div className="text-sm">
                                <p>{new Date(user.last_sign_in_at).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(user.last_sign_in_at).toLocaleTimeString()}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">从未登录</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.confirmed_at ? 'default' : 'destructive'}>
                              {user.confirmed_at ? '活跃' : '待激活'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditUserClick(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteUser(user.id, user.user_metadata?.username || user.email)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 