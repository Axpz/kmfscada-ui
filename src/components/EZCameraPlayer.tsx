"use client";

import { useCallback, useRef, useEffect, useState } from "react";

interface EZCameraPlayerProps {
  className?: string;
  devID?: string;
  url?: string;
  accessToken?: string;
}

export default function EZCameraPlayer({ className = "", devID = "", url = "", accessToken = "" }: EZCameraPlayerProps) {
  const player = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  const initPlayer = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const container = document.getElementById(devID);
    if (!container) return;

    try {
      const EZUIKit = (await import("ezuikit-js")).default;

      if (player.current) {
        player.current.destroy();
        player.current = null;
      }

      const containerRect = container.getBoundingClientRect();
      const width = containerRect.width || container.offsetWidth || 400;
      const height = containerRect.height || container.offsetHeight || 300;

      player.current = new EZUIKit.EZUIKitPlayer({
        id: devID,
        url: url,
        accessToken: accessToken,
        width: width,
        height: height,
        template: "security",
        audio: 0,
      });

    } catch (error) {
      console.error('播放器初始化失败:', error);
    }
  }, [devID, url, accessToken]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const timer = setTimeout(initPlayer, 500);

    return () => {
      clearTimeout(timer);
      if (player.current) {
        try {
          player.current.destroy();
          player.current = null;
        } catch (error) {
          console.error('销毁播放器失败:', error);
        }
      }
    };
  }, [isClient, initPlayer]);

  if (!isClient) {
    return (
      <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">加载播放器...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden ${className}`}>
      <div
        id={devID}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}