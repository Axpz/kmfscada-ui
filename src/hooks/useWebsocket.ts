import { useEffect, useState, useRef, useCallback } from 'react';
import { wsManager, ConnectionStatus, WebSocketMessage } from '@/lib/websocket/WebSocketManager';
import { Queue } from 'mnemonist';
import type { ProductionLineData, ChartDataPoint } from '@/types';

// 简单的节流函数：delay 内只执行一次
function throttle(func: Function, delay: number) {
  let lastTime = 0;
  return function(this: any, ...args: any[]) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}


interface WebSocketState {
  status: ConnectionStatus;
  isConnected: boolean;
  realtimeData: ProductionLineData | null;
  realtimeDataMap: Map<string, ProductionLineData | null>;
  chartDataArray:ChartDataPoint[]; 
}

export function useWebSocket(
    selectedLineId: string,
    messageType: string,
    url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
): WebSocketState {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [realtimeData, setRealtimeData] = useState<ProductionLineData | null>(null);
  const [chartDataArray, setChartDataArray] = useState<ChartDataPoint[]>([]);

  // 创建节流版本的更新函数
  const throttledSetRealtimeData = useCallback(
    throttle((data: ProductionLineData) => {
      setRealtimeData(data);
    }, 1000), // 1秒节流
    []
  );

  const dataQueuesRef = useRef<Map<string, Queue<ProductionLineData>>>(new Map());
  const realtimeDataMapRef = useRef<Map<string, ProductionLineData | null>>(new Map());

  useEffect(() => {
    // 1. 在组件挂载时连接 WebSocket
    wsManager.connect(url);

    // 2. 订阅连接状态变化
    const unsubscribeStatus = wsManager.onStatusChange(newStatus => {
      setStatus(newStatus);
    });

    // 3. 订阅指定类型的消息
    const unsubscribeMessage = wsManager.subscribe(messageType, (message) => {
      if (message && message.data) {
        try {
          const { data } = message;
          const { line_id: lineId } = data;
          
          realtimeDataMapRef.current.set(lineId, data);
          
          let queue = dataQueuesRef.current.get(lineId);
          if (!queue) {
            queue = new Queue<ProductionLineData>();
            dataQueuesRef.current.set(lineId, queue);
          }
          
          queue.enqueue(data);
          if (queue.size > 60) {
            queue.dequeue();
          }

          if (lineId != selectedLineId && selectedLineId != '*') {
            return;
          }

          // 使用节流更新，减少重渲染频率
          throttledSetRealtimeData(data);
          
          const chartDataArray: ChartDataPoint[] = Array.from(queue).map(item => {
            return {
              timestamp: new Date(item.timestamp).getTime(),
              current_length: item.current_length.value,
              diameter: item.diameter.value,
              temp_body_zone1: item.temp_body_zone1.value,
              temp_body_zone2: item.temp_body_zone2.value,
              temp_body_zone3: item.temp_body_zone3.value,
              temp_body_zone4: item.temp_body_zone4.value,
              temp_flange_zone1: item.temp_flange_zone1.value,
              temp_flange_zone2: item.temp_flange_zone2.value,
              temp_mold_zone1: item.temp_mold_zone1.value,
              temp_mold_zone2: item.temp_mold_zone2.value,
              current_body_zone1: item.current_body_zone1.value,
              current_body_zone2: item.current_body_zone2.value,
              current_body_zone3: item.current_body_zone3.value,
              current_body_zone4: item.current_body_zone4.value,
              current_flange_zone1: item.current_flange_zone1.value,
              current_flange_zone2: item.current_flange_zone2.value,
              current_mold_zone1: item.current_mold_zone1.value,
              current_mold_zone2: item.current_mold_zone2.value,
              motor_screw_speed: item.motor_screw_speed.value,
              motor_screw_torque: item.motor_screw_torque.value,
              motor_current: item.motor_current.value,
              motor_traction_speed: item.motor_traction_speed.value,
              motor_vacuum_speed: item.motor_vacuum_speed.value,
              winder_speed: item.winder_speed.value,
              winder_torque: item.winder_torque.value,
              winder_layer_count: item.winder_layer_count.value,
              winder_tube_speed: item.winder_tube_speed.value,
              winder_tube_count: item.winder_tube_count.value,
            };
          });

          setChartDataArray(chartDataArray);
        } catch (error) {
          console.error('处理实时数据时出错:', error);
        }
      }
    });

    // 4. 返回的清理函数，在组件卸载时执行
    return () => {
      console.log('Component unmounting, disconnecting WebSocket...');
      unsubscribeStatus();
      unsubscribeMessage();

      wsManager.disconnect();
    };
  }, [url, messageType, selectedLineId]);

  return {
    status,
    realtimeData,
    realtimeDataMap: realtimeDataMapRef.current,
    isConnected: status === 'connected',
    chartDataArray,
  };
}