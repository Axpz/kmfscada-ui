'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useProductionData } from '@/hooks/useApi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChartCard } from '@/components/ui/chart-card'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
    AlertCircle,
    Camera,
    Play,
    Square,
    RotateCcw,
    Maximize2,
    Minimize2,
    Settings,
} from 'lucide-react'

// 类型定义
interface ProductionLine {
    production_line_id: string
    name?: string
}

interface CameraDevice {
    deviceId: string
    label: string
}

// 分辨率配置
const RESOLUTION_OPTIONS = {
    '480p': { width: 640, height: 480, label: '480p' },
    '720p': { width: 1280, height: 720, label: '720p' },
    '1080p': { width: 1920, height: 1080, label: '1080p' },
} as const

type ResolutionKey = keyof typeof RESOLUTION_OPTIONS

// 自定义Hook：摄像头设备管理
const useCameraDevices = () => {
    const [devices, setDevices] = useState<CameraDevice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refreshDevices = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            // 请求权限
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            stream.getTracks().forEach(track => track.stop())
            
            // 获取设备列表
            const deviceList = await navigator.mediaDevices.enumerateDevices()
            const videoDevices = deviceList
                .filter(device => device.kind === 'videoinput')
                .map((device, index) => ({
                    deviceId: device.deviceId,
                    label: device.label || `摄像头 ${index + 1}`
                }))
            
            setDevices(videoDevices)
        } catch (err: any) {
            console.error('获取摄像头设备失败:', err)
            setError(err.name === 'NotAllowedError' ? '摄像头权限被拒绝' : '无法获取摄像头设备')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshDevices()
    }, [refreshDevices])

    return { devices, isLoading, error, refreshDevices }
}

// 自定义Hook：摄像头流管理
const useCameraStream = (selectedCamera: string, resolution: ResolutionKey) => {
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const getVideoConstraints = useCallback((): MediaStreamConstraints => {
        const resolutionConfig = RESOLUTION_OPTIONS[resolution]
        return {
            video: {
                deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
                width: { ideal: resolutionConfig.width },
                height: { ideal: resolutionConfig.height },
                frameRate: { ideal: 30 }
            },
            audio: false
        }
    }, [selectedCamera, resolution])

    const startCamera = useCallback(async () => {
        if (!selectedCamera) {
            setError('请先选择摄像头设备')
            return
        }

        try {
            setError(null)
            const constraints = getVideoConstraints()
            const stream = await navigator.mediaDevices.getUserMedia(constraints)

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                setIsStreaming(true)
            }
        } catch (err: any) {
            console.error('启动摄像头失败:', err)
            const errorMessages: Record<string, string> = {
                'NotAllowedError': '摄像头访问被拒绝',
                'NotFoundError': '未找到摄像头设备',
                'NotReadableError': '摄像头被其他应用占用',
                'OverconstrainedError': '摄像头不支持当前分辨率'
            }
            setError(errorMessages[err.name] || `启动摄像头失败: ${err.message}`)
        }
    }, [selectedCamera, getVideoConstraints])

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setIsStreaming(false)
        setError(null)
    }, [])

    const restartCamera = useCallback(async () => {
        stopCamera()
        await new Promise(resolve => setTimeout(resolve, 500))
        await startCamera()
    }, [stopCamera, startCamera])

    // 清理资源
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [stopCamera])

    return {
        isStreaming,
        error,
        videoRef,
        startCamera,
        stopCamera,
        restartCamera
    }
}

// 控制面板组件
const CameraControls = ({
    productionLines,
    isLoadingLines,
    selectedLineId,
    setSelectedLineId,
    devices,
    selectedCamera,
    setSelectedCamera,
    resolution,
    setResolution,
    isStreaming,
    onStart,
    onStop,
    onRestart,
    onRefreshDevices,
    onToggleFullscreen,
    isFullscreen = false
}: {
    productionLines: ProductionLine[]
    isLoadingLines: boolean
    selectedLineId: string
    setSelectedLineId: (id: string) => void
    devices: CameraDevice[]
    selectedCamera: string
    setSelectedCamera: (id: string) => void
    resolution: ResolutionKey
    setResolution: (res: ResolutionKey) => void
    isStreaming: boolean
    onStart: () => void
    onStop: () => void
    onRestart: () => void
    onRefreshDevices: () => void
    onToggleFullscreen?: () => void
    isFullscreen?: boolean
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
            {/* 选择器组 */}
            <div className="flex flex-wrap items-center gap-3 min-w-0">
                {/* 生产线选择器 */}
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        生产线
                    </Label>
                    {isLoadingLines ? (
                        <LoadingSpinner />
                    ) : (
                        <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                            <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="选择" />
                            </SelectTrigger>
                            <SelectContent>
                                {productionLines.map(line => (
                                    <SelectItem key={line.production_line_id} value={line.production_line_id}>
                                        #{line.production_line_id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* 摄像头选择器 */}
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        摄像头
                    </Label>
                    <div className="flex items-center gap-1">
                        <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                            <SelectTrigger className={`${isFullscreen ? 'w-40' : 'w-32'} h-8`}>
                                <SelectValue placeholder="选择摄像头" />
                            </SelectTrigger>
                            <SelectContent>
                                {devices.map(device => (
                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                        {device.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefreshDevices}
                            title="刷新设备列表"
                            className="h-8 w-8 p-0"
                        >
                            <Settings className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* 分辨率选择器 */}
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        分辨率
                    </Label>
                    <Select value={resolution} onValueChange={(value: ResolutionKey) => setResolution(value)}>
                        <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(RESOLUTION_OPTIONS).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center gap-2 ml-auto">
                {!isStreaming ? (
                    <Button
                        size="sm"
                        onClick={onStart}
                        disabled={!selectedCamera}
                        className="h-8"
                    >
                        <Play className="w-3 h-3 mr-1" />
                        开始
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onStop}
                        className="h-8"
                    >
                        <Square className="w-3 h-3 mr-1" />
                        停止
                    </Button>
                )}

                <Button
                    size="sm"
                    variant="outline"
                    onClick={onRestart}
                    disabled={!isStreaming}
                    className="h-8"
                >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    重启
                </Button>

                {onToggleFullscreen && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onToggleFullscreen}
                        className="h-8"
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="w-3 h-3 mr-1" />
                                退出
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-3 h-3 mr-1" />
                                全屏
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}

// 视频显示组件
const VideoDisplay = ({
    videoRef,
    isStreaming,
    error,
    isFullscreen = false
}: {
    videoRef: React.RefObject<HTMLVideoElement>
    isStreaming: boolean
    error: string | null
    isFullscreen?: boolean
}) => {
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="relative h-full w-full bg-black rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
            />

            {!isStreaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
                    <Camera className={`${isFullscreen ? 'h-24 w-24' : 'h-16 w-16'} mb-4 opacity-50`} />
                    <h3 className={`${isFullscreen ? 'text-2xl' : 'text-lg'} font-semibold mb-2`}>
                        摄像头未启动
                    </h3>
                    <p className={`${isFullscreen ? 'text-lg' : 'text-sm'} text-center max-w-md opacity-75`}>
                        选择摄像头和分辨率，然后点击"开始"按钮启动实时监控
                    </p>
                </div>
            )}

            {isStreaming && (
                <div className={`absolute ${isFullscreen ? 'top-6 left-6' : 'top-4 left-4'} bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2`}>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    实时监控中{isFullscreen ? ' - 全屏模式' : ''}
                </div>
            )}
        </div>
    )
}

// 主摄像头组件
const CameraStream = ({
    productionLines,
    isLoadingLines,
}: {
    productionLines: ProductionLine[]
    isLoadingLines: boolean
}) => {
    // 状态管理
    const [selectedLineId, setSelectedLineId] = useState<string>('')
    const [selectedCamera, setSelectedCamera] = useState<string>('')
    const [resolution, setResolution] = useState<ResolutionKey>('720p')
    const [isFullscreen, setIsFullscreen] = useState(false)

    // 自定义Hooks
    const { devices, isLoading: isLoadingDevices, error: deviceError, refreshDevices } = useCameraDevices()
    const { isStreaming, error: streamError, videoRef, startCamera, stopCamera, restartCamera } = useCameraStream(selectedCamera, resolution)

    // 设置默认值
    useEffect(() => {
        if (!selectedLineId && productionLines.length > 0) {
            setSelectedLineId(productionLines[0]?.production_line_id || '1')
        }
    }, [productionLines, selectedLineId])

    useEffect(() => {
        if (!selectedCamera && devices.length > 0) {
            setSelectedCamera(devices[0]?.deviceId || '')
        }
    }, [devices, selectedCamera])

    // 全屏切换
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen)
    }, [isFullscreen])

    // ESC键退出全屏
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
        }

        if (isFullscreen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isFullscreen])

    const error = deviceError || streamError

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-background flex flex-col">
                {/* 全屏头部 */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-background shadow-sm">
                    <div className="flex items-center gap-3">
                        <Camera className="h-6 w-6 text-green-500" />
                        <div>
                            <h1 className="text-xl font-semibold">摄像头监控</h1>
                            <p className="text-sm text-muted-foreground">实时摄像头数据流监控和分析</p>
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
                    <CameraControls
                        productionLines={productionLines}
                        isLoadingLines={isLoadingLines}
                        selectedLineId={selectedLineId}
                        setSelectedLineId={setSelectedLineId}
                        devices={devices}
                        selectedCamera={selectedCamera}
                        setSelectedCamera={setSelectedCamera}
                        resolution={resolution}
                        setResolution={setResolution}
                        isStreaming={isStreaming}
                        onStart={startCamera}
                        onStop={stopCamera}
                        onRestart={restartCamera}
                        onRefreshDevices={refreshDevices}
                        isFullscreen={true}
                    />
                </div>

                {/* 全屏视频显示区域 */}
                <div className="flex-1 min-h-0 p-4">
                    <VideoDisplay
                        videoRef={videoRef}
                        isStreaming={isStreaming}
                        error={error}
                        isFullscreen={true}
                    />
                </div>
            </div>
        )
    }

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
                    <CameraControls
                        productionLines={productionLines}
                        isLoadingLines={isLoadingLines}
                        selectedLineId={selectedLineId}
                        setSelectedLineId={setSelectedLineId}
                        devices={devices}
                        selectedCamera={selectedCamera}
                        setSelectedCamera={setSelectedCamera}
                        resolution={resolution}
                        setResolution={setResolution}
                        isStreaming={isStreaming}
                        onStart={startCamera}
                        onStop={stopCamera}
                        onRestart={restartCamera}
                        onRefreshDevices={refreshDevices}
                        onToggleFullscreen={toggleFullscreen}
                        isFullscreen={false}
                    />
                </div>

                {/* 视频显示区域 */}
                <div className="flex-1 min-h-0 w-full">
                    <VideoDisplay
                        videoRef={videoRef}
                        isStreaming={isStreaming}
                        error={error}
                        isFullscreen={false}
                    />
                </div>
            </div>
        </ChartCard>
    )
}

// 主组件
interface VisualizationCameraProps {
    showTitle?: boolean
}

export default function VisualizationCamera({ showTitle = false }: VisualizationCameraProps) {
    const { data: productionLines, isLoading: isLoadingLines } = useProductionData()

    return (
        <div className="space-y-6">
            {showTitle && (
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Camera className="h-8 w-8" />
                        摄像头监控
                    </h1>
                    <p className="text-muted-foreground">
                        实时摄像头数据流监控和分析。
                    </p>
                </div>
            )}

            <CameraStream
                productionLines={productionLines || []}
                isLoadingLines={isLoadingLines}
            />
        </div>
    )
}