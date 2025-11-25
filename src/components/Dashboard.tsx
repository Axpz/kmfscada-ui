"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAvailableProductionLines } from "@/hooks/useProductionLines";
import { ProductionLineData, ChartDataPoint, SensorValue } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertCircle,
  Activity,
  Thermometer,
  Gauge,
  Factory,
  Ruler,
  Camera,
  Cog,
  Cctv,
  Settings,
  Package,
  Droplet,
  WifiOff,
  Zap,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GaugesDashboard } from "@/components/ui/gauges-dashboard";
import { useWebSocket } from "@/hooks/useWebsocket";
import { getProductionStatus } from "@/lib/utils";
import { SensorValueView } from "./ui/sensor-value-view";
import { useVideoStreams } from "@/hooks/useVideo";
import type { EzvizStream } from "@/lib/api-video";
import EZCameraPlayer from './EZCameraPlayer';

interface CameraData {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "warning";
  resolution: string;
  fps: number;
  lastUpdate: string;
  streamUrl: string;
  videoUrl?: string;
}

// 温度监控面板
const TemperaturePanel = React.memo(
  ({
    realTimeData,
    chartData,
  }: {
    realTimeData: ProductionLineData;
    chartData: ChartDataPoint[];
  }) => {
    if (!realTimeData) return null;

    // 调试信息
    console.log("TemperaturePanel - chartData:", chartData);
    console.log("TemperaturePanel - chartData length:", chartData?.length);

    // 定义温度线的配置 - 使用 useMemo 避免重复创建
    const temperatureLines = useMemo(
      () => [
        { key: "temp_body_zone1", color: "#3b82f6", name: "机筒1" },
        { key: "temp_body_zone2", color: "#60a5fa", name: "机身2" },
        { key: "temp_body_zone3", color: "#93c5fd", name: "机身3" },
        { key: "temp_body_zone4", color: "#bfdbfe", name: "机身4" },
        { key: "temp_flange_zone1", color: "#06b6d4", name: "法兰1" },
        { key: "temp_flange_zone2", color: "#22d3ee", name: "法兰2" },
        { key: "temp_mold_zone1", color: "#7c3aed", name: "模具1" },
        { key: "temp_mold_zone2", color: "#8b5cf6", name: "模具2" },
      ],
      []
    );

    // 自定义 Tooltip 内容组件
    const CustomTooltip = ({ active, payload, label }: any) => {
      console.log("CustomTooltip:", { active, payload, label });

      if (!active || !payload || !payload.length) {
        return null;
      }

      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-xs max-w-xs">
          <div className="font-medium text-xs mb-1">
            {new Date(label).toLocaleTimeString("zh-CN")}
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const line = temperatureLines.find(
                (l) => l.key === entry.dataKey
              );
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{line?.name || entry.dataKey}:</span>
                  <span className="font-medium">
                    {Number(entry.value).toFixed(1)}°C
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-md">
            <Thermometer className="h-5 w-5 text-muted-foreground" />
            温度 / 电流
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-0 text-sm">
          {/* 实时温度数值 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center text-sm p-2 bg-muted/30 rounded">
              <div>
                <SensorValueView
                  sensor={realTimeData.temp_body_zone1}
                  unit=" °C"
                  className="text-blue-500"
                />
              </div>
              <div>
                <SensorValueView
                  sensor={realTimeData.current_body_zone1}
                  unit=" A"
                  className="text-blue-500"
                />
              </div>
              <div className="text-xs text-muted-foreground">机筒1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div>
                <SensorValueView
                  sensor={realTimeData.temp_body_zone2}
                  unit=" °C"
                  className="text-blue-400"
                />
              </div>
              <div>
                <SensorValueView
                  sensor={realTimeData.current_body_zone2}
                  unit=" A"
                  className="text-blue-400"
                />
              </div>
              <div className="text-xs text-muted-foreground">机身2</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div>
                <SensorValueView
                  sensor={realTimeData.temp_body_zone3}
                  unit=" °C"
                  className="text-blue-300"
                />
              </div>
              <div>
                <SensorValueView
                  sensor={realTimeData.current_body_zone3}
                  unit=" A"
                  className="text-blue-300"
                />
              </div>
              <div className="text-xs text-muted-foreground">机身3</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div>
                <SensorValueView
                  sensor={realTimeData.temp_body_zone4}
                  unit=" °C"
                  className="text-blue-200"
                />
              </div>
              <div>
                <SensorValueView
                  sensor={realTimeData.current_body_zone4}
                  unit=" A"
                  className="text-blue-200"
                />
              </div>
              <div className="text-xs text-muted-foreground">机身4</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <div>
                <SensorValueView
                  sensor={realTimeData.temp_flange_zone1}
                  unit=" °C"
                  className="text-cyan-500"
                />
              </div>
              <div>
                <SensorValueView
                  sensor={realTimeData.current_flange_zone1}
                  unit=" A"
                  className="text-cyan-500"
                />
              </div>
              <div className="text-xs text-muted-foreground">法兰1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div>
                <SensorValueView
                  sensor={realTimeData.temp_flange_zone2}
                  unit=" °C"
                  className="text-cyan-400"
                />
              </div>
              <div>
                <SensorValueView
                  sensor={realTimeData.current_flange_zone2}
                  unit=" A"
                  className="text-cyan-400"
                />
              </div>
              <div className="text-xs text-muted-foreground">法兰2</div>
            </div>

            <div className="text-center p-2 bg-muted/30 rounded">
              <div>
                <SensorValueView
                  sensor={realTimeData.temp_mold_zone1}
                  unit=" °C"
                  className="text-violet-600"
                />
              </div>
              <div>
                <SensorValueView
                  sensor={realTimeData.current_mold_zone1}
                  unit=" A"
                  className="text-violet-600"
                />
              </div>
              <div className="text-xs text-muted-foreground">模具1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div>
                <SensorValueView
                  sensor={realTimeData.temp_mold_zone2}
                  unit=" °C"
                  className="text-violet-500"
                />
              </div>
              <div>
                <SensorValueView
                  sensor={realTimeData.current_mold_zone2}
                  unit=" A"
                  className="text-violet-500"
                />
              </div>
              <div className="text-xs text-muted-foreground">模具2</div>
            </div>
          </div>

          {/* 温度趋势图 */}
          <div className="h-40 w-full relative">
            {chartData && chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    key={`temp-chart-${realTimeData.line_id}`}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="timestamp"
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                      type="number"
                      scale="time"
                      domain={["dataMin", "dataMax"]}
                    />
                    <YAxis
                      tick={{ fontSize: 9 }}
                      tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      width={35}
                      domain={["auto", "auto"]}
                    />
                    {/* 使用自定义 Tooltip */}
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "rgba(255, 255, 255, 0.1)",
                        strokeWidth: 1,
                      }}
                      position={{ x: 0, y: -30 }}
                      allowEscapeViewBox={{ x: false, y: true }}
                    />
                    {temperatureLines.map((line) => (
                      <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.color}
                        strokeWidth={1.5}
                        dot={false}
                        connectNulls
                        isAnimationActive={false}
                      />
                    ))}
                  </RechartsLineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无温度数据</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

const CurrentPanel = React.memo(
  ({
    realTimeData,
    chartData,
  }: {
    realTimeData: ProductionLineData;
    chartData: ChartDataPoint[];
  }) => {
    if (!realTimeData) return null;

    // 定义电流线的配置 - 使用 useMemo 避免重复创建
    const currentLines = useMemo(
      () => [
        { key: "current_body_zone1", color: "#3b82f6" },
        { key: "current_body_zone2", color: "#60a5fa" },
        { key: "current_body_zone3", color: "#93c5fd" },
        { key: "current_body_zone4", color: "#bfdbfe" },
        { key: "current_flange_zone1", color: "#06b6d4" },
        { key: "current_flange_zone2", color: "#22d3ee" },
        { key: "current_mold_zone1", color: "#7c3aed" },
        { key: "current_mold_zone2", color: "#8b5cf6" },
      ],
      []
    );

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-md">
            <Zap className="h-5 w-5 text-muted-foreground" />
            电流 监控
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-0">
          {/* 实时温度数值 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_body_zone1}
                unit="A"
                className="text-blue-500"
              />
              <div className="text-xs text-muted-foreground">机筒1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_body_zone2}
                unit="A"
                className="text-blue-400"
              />
              <div className="text-xs text-muted-foreground">机身2</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_body_zone3}
                unit="A"
                className="text-blue-300"
              />
              <div className="text-xs text-muted-foreground">机身3</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_body_zone4}
                unit="A"
                className="text-blue-200"
              />
              <div className="text-xs text-muted-foreground">机身4</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_flange_zone1}
                unit="A"
                className="text-cyan-500"
              />
              <div className="text-xs text-muted-foreground">法兰1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_flange_zone2}
                unit="A"
                className="text-cyan-400"
              />
              <div className="text-xs text-muted-foreground">法兰2</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_mold_zone1}
                unit="A"
                className="text-violet-600"
              />
              <div className="text-xs text-muted-foreground">模具1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_mold_zone2}
                unit="A"
                className="text-violet-500"
              />
              <div className="text-xs text-muted-foreground">模具2</div>
            </div>
          </div>

          {/* 电流趋势图 */}
          <div className="h-40 w-full">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  key={`current-chart-${realTimeData.line_id}`}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="timestamp"
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis
                    tick={{ fontSize: 9 }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    width={35}
                    domain={[0, 20]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "9px",
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleTimeString()
                    }
                  />
                  {currentLines.map((line) => (
                    <Line
                      key={line.key}
                      type="monotone"
                      dataKey={line.key}
                      stroke={line.color}
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无电流数据</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

const WinderPanel = React.memo(
  ({
    realTimeData,
    chartData,
  }: {
    realTimeData: ProductionLineData;
    chartData: ChartDataPoint[];
  }) => {
    if (!realTimeData) return null;

    // 定义电流线的配置 - 使用 useMemo 避免重复创建
    const currentLines = useMemo(
      () => [
        { key: "current_body_zone1", color: "#3b82f6" },
        { key: "current_body_zone2", color: "#60a5fa" },
        { key: "current_body_zone3", color: "#93c5fd" },
        { key: "current_body_zone4", color: "#bfdbfe" },
        { key: "current_flange_zone1", color: "#06b6d4" },
        { key: "current_flange_zone2", color: "#22d3ee" },
        { key: "current_mold_zone1", color: "#7c3aed" },
        { key: "current_mold_zone2", color: "#8b5cf6" },
      ],
      []
    );

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-md">
            <Zap className="h-5 w-5 text-muted-foreground" />
            电流 监控
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-0">
          {/* 实时温度数值 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_body_zone1}
                unit="A"
                className="text-blue-500"
              />
              <div className="text-xs text-muted-foreground">机筒1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_body_zone2}
                unit="A"
                className="text-blue-400"
              />
              <div className="text-xs text-muted-foreground">机身2</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_body_zone3}
                unit="A"
                className="text-blue-300"
              />
              <div className="text-xs text-muted-foreground">机身3</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_body_zone4}
                unit="A"
                className="text-blue-200"
              />
              <div className="text-xs text-muted-foreground">机身4</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_flange_zone1}
                unit="A"
                className="text-cyan-500"
              />
              <div className="text-xs text-muted-foreground">法兰1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_flange_zone2}
                unit="A"
                className="text-cyan-400"
              />
              <div className="text-xs text-muted-foreground">法兰2</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_mold_zone1}
                unit="A"
                className="text-violet-600"
              />
              <div className="text-xs text-muted-foreground">模具1</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView
                sensor={realTimeData.current_mold_zone2}
                unit="A"
                className="text-violet-500"
              />
              <div className="text-xs text-muted-foreground">模具2</div>
            </div>
          </div>

          {/* 电流趋势图 */}
          <div className="h-40 w-full">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  key={`current-chart-${realTimeData.line_id}`}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="timestamp"
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis
                    tick={{ fontSize: 9 }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    width={35}
                    domain={[0, 20]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "9px",
                      color: "hsl(var(--foreground))",
                      maxWidth: "220px",
                      maxHeight: "80px",
                      zIndex: 9999,
                      padding: "4px",
                      lineHeight: "1.0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    allowEscapeViewBox={{ x: false, y: false }}
                    offset={10}
                    formatter={(value: any, name: string) => {
                      const shortName = name
                        .replace("temp_body_zone", "B")
                        .replace("temp_flange_zone", "F")
                        .replace("temp_mold_zone", "M");
                      return [`${Number(value).toFixed(1)}°C`, shortName];
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleTimeString()
                    }
                  />
                  {currentLines.map((line) => (
                    <Line
                      key={line.key}
                      type="monotone"
                      dataKey={line.key}
                      stroke={line.color}
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无电流数据</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

// 电机监控面板 - 使用三个独立的ECharts仪表盘
const MotorPanel = React.memo(
  ({ realTimeData }: { realTimeData: ProductionLineData }) => {
    const latest = realTimeData;
    if (!latest) return null;

    return (
      <div className="space-y-4">
        {/* 四个仪表盘并排显示 */}
        <GaugesDashboard
          motorTorque={latest.motor_screw_torque}
          screwSpeed={latest.motor_screw_speed}
          tractionSpeed={latest.motor_traction_speed}
          spindleCurrent={latest.motor_current}
          vacuumSpeed={latest.motor_vacuum_speed}
          className="justify-items-center text-sm"
        />
      </div>
    );
  }
);

// 电机监控面板 - 使用三个独立的ECharts仪表盘
const WinderMotorPanel = React.memo(
  ({ realTimeData }: { realTimeData: ProductionLineData }) => {
    const latest = realTimeData;
    if (!latest) return null;

    return (
      <div className="space-y-4">
        {/* 四个仪表盘并排显示 */}
        <GaugesDashboard
          winderTorque={latest.winder_torque}
          winderSpeed={latest.winder_speed}
          winderTubeSpeed={latest.winder_tube_speed}
          winderLayerCount={latest.winder_layer_count}
          winderTubeCount={latest.winder_tube_count}
          className="justify-items-center text-sm"
        />
      </div>
    );
  }
);

// 质量监控面板 - 显示实时直径和生产长度
const QualityPanel = React.memo(
  ({
    realTimeData,
    chartData,
  }: {
    realTimeData: ProductionLineData;
    chartData: ChartDataPoint[];
  }) => {
    const diameterChartData = useMemo(() => {
      return chartData.map((point, index) => ({
        index,
        实时直径: point.diameter,
      }));
    }, [chartData]);

    const lengthChartData = useMemo(() => {
      return chartData.map((point, index) => ({
        index,
        生产长度: point.current_length,
      }));
    }, [chartData]);

    // 直径 Tooltip
    const DiameterTooltip = ({ active, payload }: any) => {
      if (!active || !payload || !payload.length) return null;
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-xs max-w-xs">
          <div className="font-medium text-xs mb-1">实时直径</div>
          <div className="text-xs">
            <span className="font-medium">
              {Number(payload[0].value).toFixed(3)} mm
            </span>
          </div>
        </div>
      );
    };

    // 长度 Tooltip
    const LengthTooltip = ({ active, payload }: any) => {
      if (!active || !payload || !payload.length) return null;
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md text-xs max-w-xs">
          <div className="font-medium text-xs mb-1">生产长度</div>
          <div className="text-xs">
            <span className="font-medium">
              {Number(payload[0].value).toFixed(1)} m
            </span>
          </div>
        </div>
      );
    };

    if (!realTimeData) return null;

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-md">
            <Settings className="h-5 w-5 text-muted-foreground" />
            质量监控
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-0">
          {/* 实时数值显示 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView sensor={realTimeData.diameter} unit="mm" />
              <div className="text-xs text-muted-foreground">实时直径 mm</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <SensorValueView sensor={realTimeData.current_length} unit="m" />
              <div className="text-xs text-muted-foreground">生产长度 m</div>
            </div>
          </div>

          {/* 实时直径趋势图 */}
          <div className="space-y-2">
            <div className="h-32 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={diameterChartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="index"
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9 }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    width={35}
                    domain={["dataMin - 0.01", "dataMax + 0.01"]}
                  />
                  <Tooltip
                    content={<DiameterTooltip />}
                    cursor={{
                      stroke: "rgba(255, 255, 255, 0.1)",
                      strokeWidth: 1,
                    }}
                    allowEscapeViewBox={{ x: false, y: true }}
                  />
                  <Line
                    type="monotone"
                    dataKey="实时直径"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 生产长度趋势图 */}
          <div className="space-y-2">
            {/* <h4 className="text-sm font-medium text-muted-foreground">生产长度趋势 (最近1分钟)</h4> */}
            <div className="h-32 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={lengthChartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="index"
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9 }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    width={35}
                    domain={["dataMin - 5", "dataMax + 5"]}
                  />
                  <Tooltip
                    content={<LengthTooltip />}
                    cursor={{
                      stroke: "rgba(255, 255, 255, 0.1)",
                      strokeWidth: 1,
                    }}
                    allowEscapeViewBox={{ x: false, y: true }}
                  />
                  <Line
                    type="monotone"
                    dataKey="生产长度"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Enhanced Camera Monitor with EZUIKit Player
function CameraMonitor({ devID, url, accessToken, name }: { devID: string, url: string, accessToken: string, name?: string }) {
  return (
    <Card className="w-full flex flex-col min-h-[280px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Cctv className="h-5 w-5 text-muted-foreground" />
              {name || "萤石云摄像头"}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              在线
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <div className="relative w-full h-full">
          <EZCameraPlayer devID={devID} url={url} accessToken={accessToken} />
        </div>
      </CardContent>
    </Card>
  );
}

const ProductionLineDetail = React.memo(
  ({
    realTimeData,
    chartData,
  }: {
    realTimeData: ProductionLineData;
    chartData: ChartDataPoint[];
  }) => {
    return (
      <div className="h-full flex flex-col space-y-4">
        {/* 电机监控面板 - 三个仪表盘 */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-md">
              <Gauge className="h-5 w-5" />
              主机监控
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <MotorPanel realTimeData={realTimeData} />
          </CardContent>
        </Card>

        {realTimeData.winder_torque &&
          realTimeData.winder_speed &&
          realTimeData.winder_layer_count &&
          realTimeData.winder_tube_count && (
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-md">
                  <Gauge className="h-5 w-5" />
                  收卷机监控
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-0">
                <WinderMotorPanel realTimeData={realTimeData} />
              </CardContent>
            </Card>
          )}

        {/* 温度监控面板 - 填充剩余空间 */}
        <div className="flex-1 grid md:grid-cols-2 gap-4 min-h-0">
          <TemperaturePanel realTimeData={realTimeData} chartData={chartData} />
          {/* <CurrentPanel realTimeData={realTimeData} chartData={chartData} /> */}
          <QualityPanel realTimeData={realTimeData} chartData={chartData} />
        </div>
      </div>
    );
  }
);

export default function Dashboard() {
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [lineIds, setLineIds] = useState<string[]>([]);
  const [productionData, setProductionData] = useState<ProductionLineData | null>(null);
  const [chartDataArray, setChartDataArray] = useState<ChartDataPoint[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(true);

  const {
    isConnected,
    realtimeData,
    chartDataArray: wsChartDataArray,
    fluoride,
  } = useWebSocket(selectedLineId, "production_data");

  const { data: productionLines } = useAvailableProductionLines();
  useEffect(() => {
    if (productionLines?.items) {
      const lineIds = productionLines.items.map((line) => line.name);
      setLineIds(lineIds);
      if (!selectedLineId && lineIds.length > 0) {
        setSelectedLineId(lineIds[0] || "");
      }
    }
  }, [productionLines]);

  useEffect(() => {
    const sensorValue: SensorValue = {
      value: NaN,
      alarm: false,
      alarmCode: "",
      alarmMessage: ""
    };
    setProductionData({
      timestamp: "",
      line_id: "",
      component_id: "",
      batch_product_number: "",
      current_length: sensorValue,
      target_length: sensorValue,
      diameter: sensorValue,
      fluoride_concentration: sensorValue,
      temp_body_zone1: sensorValue,
      temp_body_zone2: sensorValue,
      temp_body_zone3: sensorValue,
      temp_body_zone4: sensorValue,
      temp_flange_zone1: sensorValue,
      temp_flange_zone2: sensorValue,
      temp_mold_zone1: sensorValue,
      temp_mold_zone2: sensorValue,
      current_body_zone1: sensorValue,
      current_body_zone2: sensorValue,
      current_body_zone3: sensorValue,
      current_body_zone4: sensorValue,
      current_flange_zone1: sensorValue,
      current_flange_zone2: sensorValue,
      current_mold_zone1: sensorValue,
      current_mold_zone2: sensorValue,
      motor_screw_speed: sensorValue,
      motor_screw_torque: sensorValue,
      motor_current: sensorValue,
      motor_traction_speed: sensorValue,
      motor_vacuum_speed: sensorValue,
      winder_speed: sensorValue,
      winder_torque: sensorValue,
      winder_layer_count: sensorValue,
      winder_tube_speed: sensorValue,
      winder_tube_count: sensorValue,
    });
    setChartDataArray([]);
  }, [selectedLineId]);

  useEffect(() => {
    if (realtimeData) {
      setProductionData(realtimeData);
      setChartDataArray(wsChartDataArray);
      if (realtimeData.timestamp === "") {
        setIsOffline(true);
      } else {
        setIsOffline(false);
      }
    }
  }, [realtimeData, wsChartDataArray]);

  console.log("=== Dashboard Debug ===");
  console.log("lineIds:", lineIds);
  console.log("selectedLineId:", selectedLineId);
  console.log("chartDataArray:", chartDataArray);
  console.log("productionData:", productionData);
  console.log("isConnected:", isConnected);

  const videoStreams = useVideoStreams();

  // Video carousel state - 4 streams per group, switch every 3 seconds
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // Group video streams into chunks of 4
  const videoGroups = useMemo(() => {
    if (!videoStreams?.data?.items) return [];
    const items = videoStreams.data.items;
    const groups = [];
    for (let i = 0; i < items.length; i += 4) {
      groups.push(items.slice(i, i + 4));
    }
    return groups;
  }, [videoStreams?.data?.items]);

  // Auto-switch groups every 3 seconds
  useEffect(() => {
    if (videoGroups.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentGroupIndex((prev) => (prev + 1) % videoGroups.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [videoGroups.length]);

  // Get current group of streams to display
  const currentVideoGroup = videoGroups[currentGroupIndex] || [];

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-[calc(100vh-120px)]">
      {/* Main content area - 3/4 width */}
      <div className="w-full md:w-3/4 flex flex-col space-y-4 overflow-hidden">
        {/* Header - 固定不滚动 */}
        <div className="flex-shrink-0 flex flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="hidden md:block text-md font-bold">实时数据</h1>
            <Select value={selectedLineId} onValueChange={setSelectedLineId}>
              <SelectTrigger className="w-48 focus:outline-none focus:ring-0">
                <SelectValue placeholder="生产线" />
              </SelectTrigger>
              <SelectContent>
                {lineIds.map((lineId) => (
                  <SelectItem key={lineId} value={lineId}>
                    生产线 {lineId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 px-4 h-10 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1">
                <span className="hidden md:inline text-sm font-medium">
                  氟离子浓度
                </span>
                <Droplet className="size-4" />
              </div>
              <div className="flex items-center gap-1">
                <SensorValueView
                  sensor={fluoride}
                  precision={2}
                  unit=" ppm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 生产信息 KPI */}
        {/* {productionData && ( */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">产品批号</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-bold text-blue-600 break-all">
                {productionData?.batch_product_number}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">物料编号</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-bold text-blue-600 break-all">
                {productionData?.batch_product_number?.substring(1, 5)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">生产进度</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-bold text-blue-600">
                <span className="text-green-600">
                  {isNaN(productionData?.current_length.value ?? NaN) ? '- ' : productionData?.current_length.value.toFixed(0)}
                </span>
                /
                <span className="text-blue-600">
                  {isNaN(productionData?.target_length.value ?? NaN) ? ' -' : productionData?.target_length.value.toFixed(0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">运行状态</CardTitle>
              {isOffline ? (
                <WifiOff className="h-4 w-4 text-red-500" />
              ) : (
                <Cog
                  className={`h-4 w-4 ${(productionData?.motor_screw_speed.value ?? 0) > 0.1
                    ? "text-green-500 animate-[spin_3s_linear_infinite]"
                    : "text-gray-500"
                    }`}
                />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-md font-bold ${(productionData?.motor_screw_speed.value ?? 0) > 0.1
                  ? "text-green-600"
                  : "text-gray-600"
                  }`}
              >
                {getProductionStatus(productionData?.timestamp === "" ? undefined : productionData?.motor_screw_speed)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* )} */}

        {/* 生产线数据 - 完全隐藏滚动条 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {productionData ? (
            <div className="flex-1 flex flex-col">
              {/* 生产线数据 - 填充剩余空间 */}
              <div className="flex-1">
                <ProductionLineDetail
                  realTimeData={productionData}
                  chartData={chartDataArray}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  请检查设备或重新选择生产线
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar area - 1/4 width */}
      <div className="w-full md:w-1/4 flex flex-col overflow-hidden">
        <div className="flex flex-col gap-4 h-full">
          {/* Video carousel header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Cctv className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">视频监控</span>
              {videoGroups.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  ({currentGroupIndex + 1}/{videoGroups.length})
                </span>
              )}
            </div>
            {videoGroups.length > 1 && (
              <div className="flex items-center gap-1">
                {videoGroups.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentGroupIndex ? 'bg-blue-500 scale-110' : 'bg-muted'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Video streams grid */}
          <div className="grid grid-rows-4 gap-4 flex-1 overflow-hidden">
            <div className="contents animate-in fade-in duration-500">
              {currentVideoGroup.map((stream, index) => (
                <CameraMonitor
                  key={`${stream.deviceSerial}-${stream.channelNo}`}
                  devID={`${stream.deviceSerial}-${stream.channelNo}`}
                  url={stream.url}
                  name={stream.name || `摄像头 ${stream.deviceSerial}`}
                  accessToken={stream.accessToken}
                />
              ))}

              {/* Fill empty slots if less than 4 streams in current group */}
              {Array.from({ length: 4 - currentVideoGroup.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-muted/30 rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">暂无视频</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
