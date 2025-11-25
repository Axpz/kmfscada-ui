"use client";

import { useEffect, useRef } from "react";

interface EZCameraPlayerProps {
  className?: string;
  devID?: string;
  url?: string;
  accessToken?: string;
}

export default function EZCameraPlayer({
  className = "",
  devID = "",
  url = "",
  accessToken = "",
}: EZCameraPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const hasPausedOnceRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !url || !accessToken) return;

    let destroyed = false;

    const loadPlayer = async () => {
      try {
        const EZUIKit = (await import("ezuikit-js")).default;

        if (destroyed) return;

        const container = containerRef.current!;
        const { width, height } = container.getBoundingClientRect();

        playerRef.current = new EZUIKit.EZUIKitPlayer({
          id: container.id,
          url,
          accessToken,
          width: width || 400,
          height: height || 300,
          template: "security",
          audio: 0,
          handleSuccess: async () => {
            try {
              if (!hasPausedOnceRef.current) {
                try {
                  await playerRef.current?.pause();
                  hasPausedOnceRef.current = true;
                } catch (e) {
                  console.warn("首次停止播放失败:", e);
                }
              } else {
                console.log("播放器再次加载，不再自动停止");
              }
            } catch (e) {
              console.warn("停止播放失败:", e);
            }
          },
        });
      } catch (error) {
        console.error("播放器初始化失败:", error);
      }
    };

    loadPlayer();

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try {
          playerRef.current.stop();
        } catch (e) {
          console.error("销毁播放器失败:", e);
        }
        playerRef.current = null;
      }
    };
  }, [url, accessToken]);

  return (
    <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden ${className}`}>
      <div
        id={devID}
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}