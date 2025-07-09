# SCADA Frontend UI

基于 Next.js 15+ App Router 的工业监控和数据采集系统前端。

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
make dev

# 构建生产版本
make build

# 构建 Docker 镜像
make docker
```

## 🛠️ 技术栈

- **框架**: Next.js 15+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Query + Context API
- **认证**: Supabase Auth
- **UI 组件**: Radix UI + 自定义组件
- **图标**: Lucide React
- **表单**: React Hook Form + Zod

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── Dashboard.tsx     # 仪表板
│   ├── LoginForm.tsx     # 登录表单
│   └── UserManagement.tsx # 用户管理
├── hooks/                # 自定义 Hooks
├── lib/                  # 工具库和配置
├── types/                # TypeScript 类型
├── contexts/             # React Context
└── providers/            # React Providers
```

## 📋 开发规范

### 文件命名
- **组件**: PascalCase (`Dashboard.tsx`)
- **UI 组件**: kebab-case (`button.tsx`)
- **Hooks**: camelCase (`useAuth.ts`)
- **工具**: camelCase (`utils.ts`)

### 导入规范
```tsx
// ✅ 使用相对路径和索引文件
import { Dashboard } from '../components'
import { useAuth } from '../hooks'
import { Button } from './ui/button'
```

## 🔧 环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 可用命令

```bash
make dev      # 启动开发服务器
make build    # 构建生产版本
make docker   # 构建 Docker 镜像
make clean    # 清理构建缓存
```
