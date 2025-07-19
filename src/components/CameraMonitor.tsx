"use client"

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Video, VideoOff, Camera, Settings, AlertCircle, Maximize2, Minimize2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface CameraMonitorProps {
  title?: string;
  className?: string;
}

const CameraMonitor: React.FC<CameraMonitorProps> = ({ 
  title = "摄像头监控", 
  className = "" 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 获取可用的摄像头设备
  const getCameraDevices = useCallback(async () => {
    try {
      console.log('开始检测摄像头设备...');
      
      // 检查浏览器是否支持MediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setError('您的浏览器不支持摄像头功能');
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('所有设备:', devices);
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('摄像头设备:', videoDevices);
      
      setDevices(videoDevices);
      
      if (videoDevices.length === 0) {
        setError('未检测到摄像头设备，请检查设备连接或尝试授权摄像头权限');
        return;
      }
      
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0]?.deviceId || '');
        console.log('自动选择设备:', videoDevices[0]?.label || videoDevices[0]?.deviceId);
      }
    } catch (err) {
      console.error('获取摄像头设备失败:', err);
      setError('无法获取摄像头设备列表，请检查浏览器权限设置');
    }
  }, [selectedDevice]);

  // 启动摄像头
  const startCamera = useCallback(async () => {
    if (!selectedDevice) {
      setError('请先选择摄像头设备');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };

      // 只有在选择了设备时才添加deviceId约束
      if (selectedDevice) {
        (constraints.video as MediaTrackConstraints).deviceId = { exact: selectedDevice };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error('启动摄像头失败:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('摄像头访问被拒绝，请允许浏览器访问摄像头');
        } else if (err.name === 'NotFoundError') {
          setError('未找到摄像头设备');
        } else if (err.name === 'NotReadableError') {
          setError('摄像头被其他应用程序占用');
        } else {
          setError(`启动摄像头失败: ${err.message}`);
        }
      } else {
        setError('启动摄像头时发生未知错误');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevice]);

  // 停止摄像头
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  // 切换摄像头状态
  const toggleCamera = useCallback(() => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera]);

  // 切换全屏状态
  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      // 进入全屏
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).mozRequestFullScreen) {
        (videoRef.current as any).mozRequestFullScreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, toggleFullscreen]);

  // 初始化摄像头权限
  const initializeCameraPermission = useCallback(async () => {
    try {
      console.log('请求摄像头权限...');
      // 请求摄像头权限来触发设备检测
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // 立即停止流
      console.log('摄像头权限已获取');
      // 权限获取后重新检测设备
      getCameraDevices();
    } catch (err) {
      console.error('获取摄像头权限失败:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('摄像头访问被拒绝，请允许浏览器访问摄像头后点击刷新按钮');
      } else {
        setError('无法获取摄像头权限，请检查设备连接');
      }
    }
  }, [getCameraDevices]);

  // 组件挂载时初始化
  useEffect(() => {
    initializeCameraPermission();
  }, [initializeCameraPermission]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className={`bg-gray-800 border border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-blue-200 flex items-center">
          <Camera className="mr-2" size={20} strokeWidth={1.5} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 设备选择 */}
        <div className="flex items-center space-x-2">
          <Settings className="text-gray-400" size={16} />
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isActive}
          >
            {devices.length === 0 ? (
              <option value="">未检测到摄像头设备</option>
            ) : (
              devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `摄像头-- ${device.deviceId.slice(0, 8)}...`}
                </option>
              ))
            )}
          </select>
          <Button
            onClick={() => {
              setError(null);
              getCameraDevices();
            }}
            disabled={isActive}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            刷新
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert className="bg-red-900/30 border-red-700">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* 视频容器 */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* 加载状态 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* 未启动状态 */}
          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-gray-400">
                <VideoOff className="mx-auto mb-2" size={48} />
                <p className="text-sm">摄像头未启动</p>
              </div>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="absolute bottom-2 right-2 flex space-x-2">
            {/* 全屏按钮 */}
            {isActive && (
              <Button
                onClick={toggleFullscreen}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="mr-1" size={16} />
                    退出全屏
                  </>
                ) : (
                  <>
                    <Maximize2 className="mr-1" size={16} />
                    全屏
                  </>
                )}
              </Button>
            )}
            
            {/* 摄像头控制按钮 */}
            <Button
              onClick={toggleCamera}
              disabled={isLoading}
              variant={isActive ? "destructive" : "default"}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isActive ? (
                <>
                  <VideoOff className="mr-1" size={16} />
                  停止
                </>
              ) : (
                <>
                  <Video className="mr-1" size={16} />
                  启动
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 调试信息 */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>状态: {isActive ? '运行中' : '已停止'}</span>
            <span>设备: {devices.length} 个可用</span>
          </div>
          {isActive && (
            <div className="flex justify-between">
              <span>全屏: {isFullscreen ? '是' : '否'}</span>
              <span>快捷键: ESC退出全屏</span>
            </div>
          )}
          {devices.length === 0 && (
            <div className="text-yellow-400">
              💡 提示: 如果未检测到设备，请尝试：
              <ul className="list-disc list-inside mt-1 ml-2">
                <li>允许浏览器访问摄像头</li>
                <li>检查摄像头是否被其他应用占用</li>
                <li>点击"刷新"按钮重新检测</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraMonitor; 