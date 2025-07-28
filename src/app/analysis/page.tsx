import { redirect } from 'next/navigation'

export default function AnalysisPage() {
  // 服务端重定向到可视化中心的统计分析页面
  redirect('/visualization/analysis')
}
