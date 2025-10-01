"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartCard } from "@/components/ui/chart-card";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AlertCircle, Cctv } from "lucide-react";
import { useVideoStreams } from "@/hooks/useVideo";
import type { EzvizStream } from "@/lib/api-video";
import EZCameraPlayer from './EZCameraPlayer';

// 视频流选择器组件
const VideoStreamSelector = ({
  streams,
  selectedStreamId,
  onStreamChange,
}: {
  streams: EzvizStream[];
  selectedStreamId: string;
  onStreamChange: (streamId: string) => void;
}) => (
  <div className="flex items-center gap-3 mb-4">
    <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
      摄像头
    </Label>
    <Select value={selectedStreamId} onValueChange={onStreamChange}>
      <SelectTrigger className="w-64 h-8">
        <SelectValue placeholder="选择摄像头" />
      </SelectTrigger>
      <SelectContent>
        {streams.map((stream) => (
          <SelectItem key={`${stream.deviceSerial}-${stream.channelNo}`} value={`${stream.deviceSerial}-${stream.channelNo}`}>
            {stream.name || `摄像头 ${stream.deviceSerial}-${stream.channelNo}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// 视频播放器组件 - 使用EZCameraPlayer
const VideoPlayer = ({ stream }: { stream: EzvizStream | undefined }) => {
  if (!stream) {
    return (
      <div className="flex flex-col justify-center items-center w-full bg-black rounded-lg" style={{ aspectRatio: '16/9' }}>
        <Cctv className="h-16 w-16 mb-4 opacity-50 text-white" />
        <h3 className="text-lg font-semibold mb-2 text-white">请选择摄像头</h3>
        <p className="text-sm text-center max-w-md opacity-75 text-white">
          从上方下拉菜单中选择要播放的摄像头
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
      <EZCameraPlayer
        key={`${stream.deviceSerial}-${stream.channelNo}`}
        devID={`${stream.deviceSerial}-${stream.channelNo}`}
        url={stream.url}
        accessToken={stream.accessToken}
        className="w-full h-full"
      />

      {/* 摄像头名称和状态指示器 */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 z-10">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        {stream.name || "直播中"}
      </div>
    </div>
  );
};


// 主摄像头组件
const CameraStream = () => {
  const { data: videoStreamsResponse, isLoading, error } = useVideoStreams();

  const [selectedStreamId, setSelectedStreamId] = useState<string>("");
  const streams = videoStreamsResponse?.items || [];

  // 获取当前选中的流信息
  const selectedStream = streams.find(stream => `${stream.deviceSerial}-${stream.channelNo}` === selectedStreamId);

  // 自动选择第一个视频流
  useEffect(() => {
    if (!selectedStreamId && streams.length > 0 && streams[0]) {
      setSelectedStreamId(`${streams[0].deviceSerial}-${streams[0].channelNo}`);
    }
  }, [streams, selectedStreamId]);

  // 加载状态
  if (isLoading) {
    return (
      <ChartCard
        title="摄像头监控"
        subtitle="实时摄像头数据流监控和分析"
        icon={Cctv}
        iconColor="text-green-500"
      >
        <div className="flex justify-center items-center w-full" style={{ aspectRatio: '16/9' }}>
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground mt-2">加载视频流...</p>
          </div>
        </div>
      </ChartCard>
    );
  }

  // 错误状态
  if (error) {
    return (
      <ChartCard
        title="摄像头监控"
        subtitle="实时摄像头数据流监控和分析"
        icon={Cctv}
        iconColor="text-green-500"
        actions={false}
      >
        <div className="flex justify-center items-center w-full" style={{ aspectRatio: '16/9' }}>
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              加载视频流失败: {(error as Error)?.message || "未知错误"}
            </AlertDescription>
          </Alert>
        </div>
      </ChartCard>
    );
  }

  // 无数据状态
  if (streams.length === 0) {
    return (
      <ChartCard
        title="摄像头监控"
        subtitle="实时摄像头数据流监控和分析"
        icon={Cctv}
        iconColor="text-green-500"
        actions={false}
      >
        <div className="flex justify-center items-center w-full" style={{ aspectRatio: '16/9' }}>
          <div className="text-center">
            <Cctv className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">暂无可用摄像头</h3>
            <p className="text-sm text-muted-foreground">
              当前没有可用的视频流，请检查设备连接状态
            </p>
          </div>
        </div>
      </ChartCard>
    );
  }

  // 正常状态 - ChartCard自动处理全屏功能
  return (
    <ChartCard
      title="摄像头监控"
      subtitle="实时摄像头数据流监控和分析"
      icon={Cctv}
      iconColor="text-green-500"
    >
      <div className="space-y-4">
        <VideoStreamSelector
          streams={streams}
          selectedStreamId={selectedStreamId}
          onStreamChange={setSelectedStreamId}
        />
        <VideoPlayer stream={selectedStream} />
      </div>
    </ChartCard>
  );
};

// 主组件
interface VisualizationCameraProps {
  showTitle?: boolean;
}

export default function VisualizationCamera({
  showTitle = false,
}: VisualizationCameraProps) {
  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Cctv className="h-8 w-8" />
            摄像头监控
          </h1>
        </div>
      )}
      <CameraStream />
    </div>
  );
}