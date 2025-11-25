"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';
import UserMenu from './UserMenu';
import { cn } from '@/lib/utils';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Role } from '@/types';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AlarmNotification } from '@/components/ui/alarm-notification';

// 主导航链接配置
const mainNavLinks = [
  { href: '/dashboard', label: '数据看板' },
  // { href: '/workshop', label: '车间大屏' },
  { href: '/visualization', label: '可视化中心' },
  { href: '/alarms/history', label: '告警中心'},
  { href: '/export', label: '数据导出', requiredRole: ['super_admin'] as Role[] },
  { href: '/management/lines', label: '系统管理'}, 
];

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
  showMobileMenu?: boolean;
}

export default function Header({ onMenuClick, sidebarOpen = false, showMobileMenu = true }: HeaderProps) {
  const { hasRole } = useSupabaseAuth();
  const pathname = usePathname();

  // 根据用户权限过滤主导航项
  const getFilteredMainNavLinks = () => {
    return mainNavLinks.filter(link => {
      if (link.requiredRole) {
        return hasRole(link.requiredRole);
      }
      return true;
    });
  };

  const filteredMainNavLinks = getFilteredMainNavLinks();
  
  // 检查当前路径是否匹配导航项
  const isLinkActive = (href: string) => {
    console.log("href", href)
    if (href === '/management/lines') {
      return pathname.startsWith('/management');
    }
    if (href === '/visualization') {
      return pathname.startsWith('/visualization');
    }
    if (href === '/alarms') {
      return pathname.startsWith('/alarms');
    }
    if (href === '/export') {
      return pathname.startsWith('/export');
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-1 sm:px-2 md:px-6 lg:px-8 xl:px-12 2xl:px-16 transition-all duration-300 ease-in-out">
        {/* Mobile Menu Button */}
        {showMobileMenu && (
          <div className="md:hidden mr-4">
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        )}

        {/* Desktop Logo */}
        <div className="mr-6 hidden md:flex">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden flex-1 flex justify-center">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-2 ml-6">
          {filteredMainNavLinks.map((link) => {
            const isActive = isLinkActive(link.href);
            return (
              <Button
                key={link.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <Link href={link.href}>
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Alarm Notification, Theme Toggle and User Menu */}
        <div className="flex items-center space-x-2">
          <AlarmNotification />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}