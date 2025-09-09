# Providers 架构说明

本目录包含了应用程序的全局状态管理提供者，遵循 Next.js 和 React 的最佳实践。

## 架构设计

### Provider 嵌套顺序

根据依赖关系和功能优先级，Provider 的嵌套顺序为：

```tsx
<ThemeProvider>          // 1. 主题系统 - 最外层，影响整个应用样式
  <QueryProvider>        // 2. 数据获取 - 提供缓存和网络请求管理
    <RealtimeProvider>   // 3. 实时数据 - 依赖 QueryProvider 的基础设施
      <AuthProvider>     // 4. 用户认证 - 最内层，可能需要实时数据支持
        {children}       // 5. 应用内容
      </AuthProvider>
    </RealtimeProvider>
  </QueryProvider>
</ThemeProvider>
```

### 设计原则

1. **依赖最少的在外层**: ThemeProvider 不依赖其他服务
2. **基础设施在中层**: QueryProvider 为数据管理提供基础
3. **业务逻辑在内层**: RealtimeProvider 和 AuthProvider 包含具体业务逻辑

## 组件说明

### RealtimeProvider

实时数据的全局状态管理器，包含：

- **数据服务**: 自动初始化 WebSocket 连接和数据服务
- **错误处理**: 内置错误边界，优雅处理运行时错误
- **全局访问**: 任何子组件都可以通过 hooks 访问实时数据

特性：
- ✅ 自动连接管理
- ✅ 错误边界保护
- ✅ 开发模式调试支持
- ✅ TypeScript 类型安全

### RealtimeErrorBoundary

专门处理实时数据相关错误的边界组件：

- **错误捕获**: 捕获 RealtimeDataProvider 内的所有错误
- **用户友好**: 提供清晰的错误信息和恢复选项
- **开发支持**: 开发模式下显示详细错误信息

## 使用方式

### 在组件中使用实时数据

```tsx
import { useRealtimeDataContext } from '@/contexts/RealtimeDataContext'

function MyComponent() {
  const { isConnected, serviceStats } = useRealtimeDataContext()
  
  return (
    <div>
      {isConnected ? '已连接' : '连接中...'}
    </div>
  )
}
```

### 使用专用 hooks

```tsx
import { useMultiLineRealtimeData } from '@/hooks/useRealtimeData'

function ProductionMonitor() {
  const lineIds = ['1', '2', '3']
  const { latestMap, loading } = useMultiLineRealtimeData(lineIds)
  
  // 使用实时数据...
}
```

## 最佳实践

### 1. Provider 顺序

- 将依赖最少的 Provider 放在最外层
- 确保子 Provider 可以访问父 Provider 的功能
- 避免循环依赖

### 2. 错误处理

- 每个重要的 Provider 都应该有对应的 ErrorBoundary
- 提供用户友好的错误恢复机制
- 在开发模式下提供详细的调试信息

### 3. 性能优化

- 使用 React.memo 优化不必要的重新渲染
- 合理使用 useMemo 和 useCallback
- 避免在 Provider 中进行重复的计算

### 4. 类型安全

- 所有 Provider 都应该有完整的 TypeScript 类型定义
- 使用泛型提供更好的类型推断
- 导出必要的类型定义供消费者使用

## 文件结构

```
providers/
├── index.ts                    # 统一导出
├── QueryProvider.tsx           # React Query 配置
├── theme-provider.tsx          # 主题管理
├── RealtimeProvider.tsx        # 实时数据提供者
├── RealtimeErrorBoundary.tsx   # 实时数据错误边界
└── README.md                   # 本文档
```

## 扩展指南

### 添加新的 Provider

1. 在 `providers/` 目录下创建新的 Provider 组件
2. 在 `providers/index.ts` 中添加导出
3. 在 `app/layout.tsx` 中按照依赖关系添加到适当位置
4. 添加相应的错误边界（如果需要）
5. 更新本文档

### 修改 Provider 顺序

修改顺序时需要考虑：
- 依赖关系：子 Provider 是否需要访问父 Provider 的功能
- 性能影响：是否会导致不必要的重新渲染
- 错误传播：错误是否会正确地被捕获和处理
