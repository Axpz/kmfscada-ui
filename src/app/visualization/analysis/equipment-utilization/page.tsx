"use client";

import VisualizationLayout from "@/components/layout/VisualizationLayout";
import EquipmentUtilizationAnalysis from "@/components/EquipmentUtilizationAnalysis";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const EquipmentUtilizationPage = () => {
  return (
    <VisualizationLayout
      title="设备利用率分析"
      description="分析设备运行状态，优化生产效率"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <div className="space-y-6">
          {/* 页面头部 */}
          <div>
            <h2 className="text-lg font-semibold">设备利用率分析</h2>
          </div>

          {/* 主要内容 */}
          <EquipmentUtilizationAnalysis />
        </div>
      </Suspense>
    </VisualizationLayout>
  );
};

export default EquipmentUtilizationPage;
