# 报警规则模块重构总结

## 🎯 重构目标

将报警规则模块重构为使用现代最佳实践，包括：
- 使用 React Query (TanStack Query) 进行状态管理
- 创建通用的 API 客户端
- 分离关注点，提高代码可维护性
- 遵循 TypeScript 最佳实践

## 🔄 重构内容

### 1. api-client.ts - 通用 API 客户端

**特性：**
- 统一的错误处理 (`ApiError` 类)
- 支持查询参数和请求体
- 类型安全的 HTTP 方法
- 自动 JSON 解析
- 网络错误处理

**方法：**
- `get<T>()` - GET 请求
- `post<T>()` - POST 请求
- `put<T>()` - PUT 请求
- `patch<T>()` - PATCH 请求
- `delete<T>()` - DELETE 请求

### 2. api-alarm-rules.ts - 报警规则 API 模块

**功能：**
- 完整的 CRUD 操作
- 支持分页和过滤
- 批量操作支持
- 类型安全的 API 接口

**主要函数：**
- `getAlarmRules()` - 获取所有规则
- `getAlarmRulesList()` - 获取规则列表（支持分页）
- `createAlarmRule()` - 创建规则
- `updateAlarmRule()` - 更新规则
- `deleteAlarmRule()` - 删除规则
- `toggleAlarmRule()` - 切换规则状态

### 3. api.ts - 统一导出模块

**作用：**
- 集中管理所有 API 导出
- 提供类型重导出
- 简化导入语句

### 4. useAlarmRules.ts - React Query Hooks

**查询 Hooks：**
- `useAlarmRules()` - 获取所有规则
- `useAlarmRulesList()` - 获取规则列表
- `useAlarmRuleById()` - 根据 ID 获取规则
- `useAlarmRulesByLine()` - 根据生产线获取规则
- `useAvailableParameters()` - 获取可用参数
- `useProductionLineIds()` - 获取生产线 ID

**变更 Hooks：**
- `useCreateAlarmRule()` - 创建规则
- `useUpdateAlarmRule()` - 更新规则
- `useDeleteAlarmRule()` - 删除规则
- `useToggleAlarmRule()` - 切换规则状态
- `useBatchUpdateAlarmRules()` - 批量更新
- `useBatchDeleteAlarmRules()` - 批量删除

## 🚀 最佳实践特性

### React Query 配置
- **查询键管理**: 使用常量管理查询键，支持嵌套和过滤
- **缓存策略**: 配置 `staleTime` 和 `gcTime` 优化性能
- **自动失效**: 变更后自动使相关查询失效
- **错误处理**: 统一的错误处理和用户提示

### 类型安全
- 完整的 TypeScript 类型定义
- 泛型支持，确保类型安全
- 接口分离，提高代码可读性

### 性能优化
- 智能缓存策略
- 避免不必要的重新渲染
- 支持条件查询（`enabled` 参数）

### 错误处理
- 统一的错误类型 (`ApiError`)
- 用户友好的错误消息
- 网络错误和 HTTP 错误分离

## 📁 文件结构

```
src/lib/
├── api-client.ts          # 通用 API 客户端
├── api-alarm-rules.ts     # 报警规则 API 函数
├── api.ts                 # 统一导出模块
└── hooks/
    └── useAlarmRules.ts   # React Query Hooks
```

## 🔧 使用方法

### 在组件中使用

```tsx
import { useAlarmRules, useCreateAlarmRule } from '@/hooks/useAlarmRules'

export default function AlarmRulesComponent() {
  const { data: rules, isLoading, error } = useAlarmRules()
  const createMutation = useCreateAlarmRule()

  const handleCreate = (data: AlarmRuleCreate) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        // 成功处理
      }
    })
  }

  // ... 组件逻辑
}
```

### 直接使用 API 函数

```tsx
import { createAlarmRule } from '@/lib/api-alarm-rules'

const handleCreate = async (data: AlarmRuleCreate) => {
  try {
    const newRule = await createAlarmRule(data)
    // 处理成功
  } catch (error) {
    // 处理错误
  }
}
```

## ✅ 重构优势

1. **性能提升**: React Query 的智能缓存和后台更新
2. **代码质量**: 类型安全、错误处理、关注点分离
3. **可维护性**: 模块化设计、清晰的 API 接口
4. **开发体验**: 自动类型推断、智能提示
5. **扩展性**: 易于添加新功能和 API 端点

## 🔮 未来改进

- 添加请求/响应拦截器
- 实现请求去重和防抖
- 添加离线支持和同步
- 实现更复杂的缓存策略
- 添加性能监控和指标

## 📚 相关文档

- [React Query 官方文档](https://tanstack.com/query/latest)
- [TypeScript 最佳实践](https://www.typescriptlang.org/docs/)
- [Next.js API 路由](https://nextjs.org/docs/api-routes/introduction)
