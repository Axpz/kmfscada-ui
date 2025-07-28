import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  // 获取用户名首字母作为头像
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  // 角色显示映射
  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'superadmin': '超级管理员',
      'admin': '管理员',
      'user': '普通用户'
    };
    return roleMap[role] || role;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt={user.email || 'User'} />
            <AvatarFallback>{getInitials(user.email || 'User')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || 'user@example.com'}
            </p>
            {role && (
              <p className="text-xs leading-none text-muted-foreground">
                {getRoleDisplay(role)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>个人资料</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}