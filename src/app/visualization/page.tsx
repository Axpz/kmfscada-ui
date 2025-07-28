import { redirect } from 'next/navigation'

export default function VisualizationPage() {
  // 服务端重定向到可视化概览页面
  redirect('/visualization/overview')
}