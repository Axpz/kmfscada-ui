'use client'

import ManagementLayout from '@/components/layout/ManagementLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Mail, 
  Server,
  Clock,
  Save
} from 'lucide-react'

const SystemSettingsPage = () => {
  return (
    <ManagementLayout 
      title="系统设置" 
      description="配置系统参数、通知设置和安全选项"
    >
      <div className="space-y-6">
        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              系统信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>系统版本</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">v2.1.0</Badge>
                  <span className="text-sm text-muted-foreground">最新版本</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>运行时间</Label>
                <p className="text-sm">15天 8小时 32分钟</p>
              </div>
              <div className="space-y-2">
                <Label>数据库状态</Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">正常运行</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>最后备份</Label>
                <p className="text-sm">2025-01-26 02:00:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据库设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              数据库设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backup-interval">自动备份间隔（小时）</Label>
                <Input id="backup-interval" type="number" defaultValue="24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention-days">数据保留天数</Label>
                <Input id="retention-days" type="number" defaultValue="90" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-backup" defaultChecked />
              <Label htmlFor="auto-backup">启用自动备份</Label>
            </div>
          </CardContent>
        </Card>

        {/* 安全设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              安全设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">会话超时（分钟）</Label>
                <Input id="session-timeout" type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">最大登录尝试次数</Label>
                <Input id="max-login-attempts" type="number" defaultValue="5" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch id="force-https" defaultChecked />
                <Label htmlFor="force-https">强制 HTTPS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" />
                <Label htmlFor="two-factor">启用双因素认证</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="audit-log" defaultChecked />
                <Label htmlFor="audit-log">启用审计日志</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              通知设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP 服务器</Label>
              <Input id="smtp-server" placeholder="smtp.example.com" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-port">端口</Label>
                <Input id="smtp-port" type="number" defaultValue="587" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">用户名</Label>
                <Input id="smtp-user" placeholder="user@example.com" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch id="email-alerts" defaultChecked />
                <Label htmlFor="email-alerts">启用邮件告警</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="system-notifications" defaultChecked />
                <Label htmlFor="system-notifications">系统通知</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            保存设置
          </Button>
        </div>
      </div>
    </ManagementLayout>
  )
}

export default SystemSettingsPage