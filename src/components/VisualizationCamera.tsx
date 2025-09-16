"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartCard } from "@/components/ui/chart-card";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  AlertCircle,
  Camera,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useVideoStreams } from "@/hooks/useVideo";
import type { EzvizStream } from "@/lib/api-video";

// 简化的视频流选择器组件
const VideoStreamSelector = ({
  streams,
  selectedStreamUrl,
  onStreamChange,
  isFullscreen = false,
}: {
  streams: EzvizStream[];
  selectedStreamUrl: string;
  onStreamChange: (streamUrl: string) => void;
  isFullscreen?: boolean;
}) => {
  return (
    <div className="flex items-center gap-3">
      <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        视频流
      </Label>
      <Select value={selectedStreamUrl} onValueChange={onStreamChange}>
        <SelectTrigger className={`${isFullscreen ? "w-64" : "w-48"} h-8`}>
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
};

// 简化的视频播放器组件
const VideoPlayer = ({
  streamUrl,
  isFullscreen = false,
}: {
  streamUrl: string;
  isFullscreen?: boolean;
}) => {
  if (!streamUrl) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-black rounded-lg">
        <Camera
          className={`${
            isFullscreen ? "h-24 w-24" : "h-16 w-16"
          } mb-4 opacity-50 text-white`}
        />
        <h3
          className={`${
            isFullscreen ? "text-2xl" : "text-lg"
          } font-semibold mb-2 text-white`}
        >
          请选择视频流
        </h3>
        <p
          className={`${
            isFullscreen ? "text-lg" : "text-sm"
          } text-center max-w-md opacity-75 text-white`}
        >
          从上方下拉菜单中选择要播放的视频流
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black rounded-lg overflow-hidden">
      <video
        key={streamUrl} // 强制重新渲染当流URL改变时
        src={streamUrl}
        autoPlay
        muted
        controls
        playsInline
        className="w-full h-full object-contain"
        onError={(e) => {
          console.error("视频流播放失败:", streamUrl, e);
        }}
        onLoadStart={() => {
          console.log("开始加载视频流:", streamUrl);
        }}
        onCanPlay={() => {
          console.log("视频流可以播放:", streamUrl);
        }}
      />
      
      {/* 播放状态指示器 */}
      <div
        className={`absolute ${
          isFullscreen ? "top-6 left-6" : "top-4 left-4"
        } bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2`}
      >
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        直播中{isFullscreen ? " - 全屏模式" : ""}
      </div>
    </div>
  );
};

// 控制面板组件
const ControlPanel = ({
  streams,
  selectedStreamUrl,
  onStreamChange,
  onToggleFullscreen,
  isFullscreen = false,
}: {
  streams: EzvizStream[];
  selectedStreamUrl: string;
  onStreamChange: (streamUrl: string) => void;
  onToggleFullscreen: () => void;
  isFullscreen?: boolean;
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <VideoStreamSelector
        streams={streams}
        selectedStreamUrl={selectedStreamUrl}
        onStreamChange={onStreamChange}
        isFullscreen={isFullscreen}
      />
      
      <div className="flex items-center gap-2 ml-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleFullscreen}
          className="h-8"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3 h-3 mr-1" />
              退出全屏
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3 mr-1" />
              全屏播放
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// 主摄像头组件
const CameraStream = () => {
  // 获取HLS视频流数据，使用HLS协议和高清质量
  const { data: videoStreamsResponse, isLoading, error } = useVideoStreams({
    protocol: 2, // HLS协议
    quality: 1   // 高清
  });

  const [selectedStreamUrl, setSelectedStreamUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const streams = videoStreamsResponse?.items || [];

  // 设置默认选中第一个视频流
  useEffect(() => {
    if (!selectedStreamUrl && streams.length > 0 && streams[0]) {
      setSelectedStreamUrl(streams[0].url);
    }
  }, [streams, selectedStreamUrl]);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // ESC键退出全屏
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  // 加载状态
  if (isLoading) {
    return (
      <ChartCard
        title="摄像头监控"
        subtitle="实时摄像头数据流监控和分析"
        icon={Camera}
        iconColor="text-green-500"
        actions={false}
      >
        <div className="flex justify-center items-center h-[500px]">
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
        icon={Camera}
        iconColor="text-green-500"
        actions={false}
      >
        <div className="flex justify-center items-center h-[500px]">
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

  // 全屏模式
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* 全屏头部 */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-background shadow-sm">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-green-500" />
            <div>
              <h1 className="text-xl font-semibold">摄像头监控</h1>
              <p className="text-sm text-muted-foreground">
                实时摄像头数据流监控和分析
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title="退出全屏 (ESC)"
            className="hover:bg-muted"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* 全屏控制面板 */}
        <div className="flex-shrink-0 p-4 border-b bg-muted/30">
          <ControlPanel
            streams={streams}
            selectedStreamUrl={selectedStreamUrl}
            onStreamChange={setSelectedStreamUrl}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={true}
          />
        </div>

        {/* 全屏视频播放区域 */}
        <div className="flex-1 min-h-0 p-4">
          <VideoPlayer
            streamUrl={selectedStreamUrl}
            isFullscreen={true}
          />
        </div>
      </div>
    );
  }

  // 正常模式
  return (
    <ChartCard
      title="摄像头监控"
      subtitle="实时摄像头数据流监控和分析"
      icon={Camera}
      iconColor="text-green-500"
      actions={false}
    >
      <div className="flex flex-col h-[500px]">
        {/* 控制面板 */}
        <div className="flex-shrink-0 mb-6">
          <ControlPanel
            streams={streams}
            selectedStreamUrl={selectedStreamUrl}
            onStreamChange={setSelectedStreamUrl}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={false}
          />
        </div>

        {/* 视频播放区域 */}
        <div className="flex-1 min-h-0 w-full">
          <VideoPlayer
            streamUrl={selectedStreamUrl}
            isFullscreen={false}
          />
        </div>
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
            <Camera className="h-8 w-8" />
            摄像头监控
          </h1>
          <p className="text-muted-foreground">实时摄像头数据流监控</p>
        </div>
      )}

      <CameraStream />
    </div>
  );
}