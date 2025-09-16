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

// 视频流选择器组件
const VideoStreamSelector = ({
  streams,
  selectedStreamUrl,
  onStreamChange,
}: {
  streams: EzvizStream[];
  selectedStreamUrl: string;
  onStreamChange: (streamUrl: string) => void;
}) => (
  <div className="flex items-center gap-3 mb-4">
    <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
      视频流
    </Label>
    <Select value={selectedStreamUrl} onValueChange={onStreamChange}>
      <SelectTrigger className="w-48 h-8">
        <SelectValue placeholder="选择视频流" />
      </SelectTrigger>
      <SelectContent>
        {streams.map((stream) => (
          <SelectItem key={stream.id} value={stream.url}>
            摄像头 {stream.channelNo} - {stream.deviceSerial}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// 视频播放器组件
const VideoPlayer = ({ streamUrl }: { streamUrl: string }) => {
  if (!streamUrl) {
    return (
      <div className="flex flex-col justify-center items-center h-[450px] bg-black rounded-lg">
        <Cctv className="h-16 w-16 mb-4 opacity-50 text-white" />
        <h3 className="text-lg font-semibold mb-2 text-white">请选择视频流</h3>
        <p className="text-sm text-center max-w-md opacity-75 text-white">
          从上方下拉菜单中选择要播放的视频流
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[450px] w-full bg-black rounded-lg overflow-hidden">
      <video
        key={streamUrl}
        src={streamUrl}
        autoPlay
        muted
        controls
        playsInline
        className="w-full h-full object-contain"
        onError={(e) => console.error("视频流播放失败:", streamUrl, e)}
        onLoadStart={() => console.log("开始加载视频流:", streamUrl)}
        onCanPlay={() => console.log("视频流可以播放:", streamUrl)}
      />
      
      {/* 直播状态指示器 */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        直播中
      </div>
    </div>
  );
};


// 主摄像头组件
const CameraStream = () => {
  const { data: videoStreamsResponse, isLoading, error } = useVideoStreams({
    protocol: 2, // HLS协议
    quality: 1   // 高清
  });

  const [selectedStreamUrl, setSelectedStreamUrl] = useState<string>("");
  const streams = videoStreamsResponse?.items || [];

  // 自动选择第一个视频流
  useEffect(() => {
    if (!selectedStreamUrl && streams.length > 0 && streams[0]) {
      setSelectedStreamUrl(streams[0].url);
    }
  }, [streams, selectedStreamUrl]);

  // 加载状态
  if (isLoading) {
    return (
      <ChartCard
        title="摄像头监控"
        subtitle="实时摄像头数据流监控和分析"
        icon={Cctv}
        iconColor="text-green-500"
      >
        <div className="flex justify-center items-center h-[450px]">
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
        <div className="flex justify-center items-center h-[450px]">
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
          selectedStreamUrl={selectedStreamUrl}
          onStreamChange={setSelectedStreamUrl}
        />
        <VideoPlayer streamUrl={selectedStreamUrl} />
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
          <p className="text-muted-foreground">实时摄像头数据流监控</p>
        </div>
      )}
      <CameraStream />
    </div>
  );
}