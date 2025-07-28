'use client'

import ManagementLayout from '@/components/layout/ManagementLayout'
import UserManagement from '@/components/UserManagement'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const UserManagementPage = () => {
  return (
    <ManagementLayout 
      title="用户管理" 
      description="管理系统用户账户、角色权限和访问控制"
    >
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <UserManagement />
      </Suspense>
    </ManagementLayout>
  )
}

export default UserManagementPage
