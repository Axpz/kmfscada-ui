import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useRouter } from 'next/navigation';
import { useUpdateUser } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 用户个人资料编辑Dialog组件
const UserProfileDialog = ({ 
  user, 
  isOpen, 
  onOpenChange 
}: { 
  user: any; 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const { updateProfile, isUpdating, signOut} = useSupabaseAuth();

  // 验证函数
  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return '用户名长度至少3位';
    }
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
      return '用户名不能包含特殊字符';
    }
    return null;
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '请输入有效的邮箱地址';
    }
    return null;
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      return '密码长度至少6位';
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
      return '密码需包含至少一个字母和一个数字';
    }
    return null;
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== newPassword) {
      return '两次输入的密码不一致';
    }
    return null;
  };

  // 获取验证错误
  const usernameError = username ? validateUsername(username) : null;
  const emailError = email ? validateEmail(email) : null;
  const newPasswordError = newPassword ? validatePassword(newPassword) : null;
  const confirmPasswordError = confirmPassword ? validateConfirmPassword(confirmPassword) : null;

  // 检查表单是否有效
  const isFormValid = 
    username.trim() && !usernameError &&
    email.trim() && !emailError &&
    (!showPasswordFields || (
      currentPassword.trim() &&
      newPassword.trim() && !newPasswordError &&
      confirmPassword.trim() && !confirmPasswordError
    ));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: any = {
      username: username.trim(),
    };

    // 如果用户要修改密码，添加密码相关字段
    if (showPasswordFields) {
      updateData.current_password = currentPassword;
      updateData.new_password = newPassword;
    }
    
    updateProfile(
      {
        username: username.trim(),
        password: currentPassword,
        new_password: newPassword,
      },
      {
        onSuccess: async () => {
          toast.success('个人资料已更新！请重新登录！');
          // 重置密码字段
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowPasswordFields(false);
          onOpenChange(false);
          await new Promise(resolve => setTimeout(resolve, 2000));  
          signOut();
        },
        onError: (error) => {
          toast.error(`更新失败: ${error.message}`);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
        </DialogHeader>
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
                className={`h-10 ${usernameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {usernameError ? (
                <p className="text-xs text-destructive">
                  {usernameError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  长度至少3位，不包含特殊字符
                </p>
              )}
            </div>

            {/* 密码修改部分 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">密码修改</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPasswordFields(!showPasswordFields);
                    if (showPasswordFields) {
                      // 如果隐藏密码字段，清空密码输入
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }
                  }}
                  className="h-8"
                >
                  {showPasswordFields ? '取消修改' : '修改密码'}
                </Button>
              </div>

              {showPasswordFields && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* 当前密码 */}
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      当前密码 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="请输入当前密码"
                      required
                      className="h-10"
                    />
                  </div>

                  {/* 新密码 */}
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      新密码 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="请输入新密码"
                      required
                      className={`h-10 ${newPasswordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {newPasswordError ? (
                      <p className="text-xs text-destructive">
                        {newPasswordError}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        密码长度至少6位，需包含至少一个字母和一个数字
                      </p>
                    )}
                  </div>

                  {/* 确认新密码 */}
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      确认新密码 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="请再次输入新密码"
                      required
                      className={`h-10 ${confirmPasswordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {confirmPasswordError && (
                      <p className="text-xs text-destructive">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !isFormValid}
              className="h-10"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存更改
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function UserMenu() {
  const { user, hasRole, signOut } = useSupabaseAuth();
  const router = useRouter();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleUserProfile = () => {
    setIsProfileDialogOpen(true);
  };

  if (!user) {
    return null;
  }

  // 获取用户名首字母作为头像
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  // 角色显示映射
  const getRoleDisplay = () => {
    if (hasRole('super_admin')) return '超级管理员';
    if (hasRole('admin')) return '管理员';
    return '普通用户';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user.email || 'User'} />
              <AvatarFallback>{getInitials(user.email || 'User')}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.user_metadata?.username || user.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {getRoleDisplay()}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='hover cursor-pointer' onClick={handleUserProfile}>
            <Settings className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='hover cursor-pointer' onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileDialog 
        user={user}
        isOpen={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
      />
    </>
  );
}