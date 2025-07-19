'use client'

import React, { useState, useEffect, useCallback } from 'react'
import CameraMonitor from '../../components/CameraMonitor'
import { Maximize2, Minimize2 } from 'lucide-react'

export default function CameraTestPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 切换页面全屏状态
  const togglePageFullscreen = useCallback(() => {
    if (!isFullscreen) {
      // 进入全屏
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        (document.documentElement as any).mozRequestFullScreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen();
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
        togglePageFullscreen();
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
  }, [isFullscreen, togglePageFullscreen]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 ${isFullscreen ? 'p-4' : 'p-8'}`}>
      <div className={`${isFullscreen ? 'max-w-full' : 'max-w-6xl'} mx-auto`}>
        {/* 页面全屏按钮 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`font-bold text-blue-300 ${isFullscreen ? 'text-4xl' : 'text-3xl'}`}>
            摄像头功能测试
          </h1>
          <button
            onClick={togglePageFullscreen}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={20} />
                <span>退出全屏</span>
              </>
            ) : (
              <>
                <Maximize2 size={20} />
                <span>页面全屏</span>
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CameraMonitor title="测试摄像头 1" />
          <CameraMonitor title="测试摄像头 2" />
        </div>
        
        {/* 页面状态指示器 */}
        {/* {isFullscreen && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm z-50">
            页面全屏模式 - 按ESC退出
          </div>
        )} */}
        
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-blue-200 mb-4">使用说明</h2>
          <ul className="text-gray-300 space-y-2">
            <li>• 点击右上角"页面全屏"按钮可以全屏显示整个页面</li>
            <li>• 页面全屏模式下按ESC键或点击"退出全屏"按钮退出</li>
            <li>• 点击"启动"按钮开始摄像头</li>
            <li>• 首次使用时会请求摄像头权限，请允许访问</li>
            <li>• 可以从下拉菜单选择不同的摄像头设备</li>
            <li>• 点击"停止"按钮关闭摄像头</li>
            <li>• 摄像头启动后可以点击"全屏"按钮进入摄像头全屏模式</li>
            <li>• 摄像头全屏模式下按ESC键或点击"退出全屏"按钮退出</li>
            <li>• 如果遇到错误，请检查浏览器权限设置</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 