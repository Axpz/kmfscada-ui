# FastAPI WebSocket 最佳实践示例
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List
import uuid

app = FastAPI(title="SCADA WebSocket API")

# CORS 配置 - 生产环境需要限制域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 连接管理器
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.client_info: Dict[str, dict] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.client_info[client_id] = {
            "connected_at": datetime.now(),
            "last_heartbeat": datetime.now(),
            "subscriptions": set()
        }
        logging.info(f"Client {client_id} connected. Total: {len(self.active_connections)}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            del self.client_info[client_id]
            logging.info(f"Client {client_id} disconnected. Total: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps(message))
            except Exception as e:
                logging.error(f"Failed to send message to {client_id}: {e}")
                self.disconnect(client_id)

    async def broadcast(self, message: dict):
        disconnected_clients = []
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logging.error(f"Failed to broadcast to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # 清理断开的连接
        for client_id in disconnected_clients:
            self.disconnect(client_id)

manager = ConnectionManager()

# 模拟生产数据生成器
async def generate_production_data():
    """模拟生产数据生成"""
    import random
    
    while True:
        for line_id in range(1, 9):  # 8条生产线
            data = {
                "type": "production_data",
                "timestamp": datetime.now().isoformat(),
                "data": {
                    "production_line_id": str(line_id),
                    "production_batch_number": f"BATCH-{line_id}-{random.randint(100, 999)}",
                    "material_batch_number": f"MAT-{random.randint(1000, 9999)}",
                    
                    # 温度数据
                    "body_temperatures": [
                        round(180 + random.uniform(-10, 20), 1) for _ in range(4)
                    ],
                    "flange_temperatures": [
                        round(160 + random.uniform(-5, 15), 1) for _ in range(2)
                    ],
                    "mold_temperatures": [
                        round(200 + random.uniform(-15, 25), 1) for _ in range(2)
                    ],
                    
                    # 电机数据
                    "screw_motor_speed": round(50 + random.uniform(0, 100), 1),
                    "traction_motor_speed": round(5 + random.uniform(0, 15), 1),
                    "main_spindle_current": round(15 + random.uniform(0, 10), 1),
                    
                    # 质量数据
                    "real_time_diameter": round(20 + random.uniform(-2, 3), 3),
                    "total_length_produced": round(1000 + random.uniform(0, 5000), 1),
                    
                    # 化学数据
                    "fluoride_ion_concentration": round(0.5 + random.uniform(0, 2), 2),
                }
            }
            
            await manager.broadcast(data)
            await asyncio.sleep(0.1)  # 避免消息过于密集
        
        await asyncio.sleep(2)  # 每2秒发送一轮数据

# 启动后台任务
@app.on_event("startup")
async def startup_event():
    # 启动数据生成器
    asyncio.create_task(generate_production_data())
    logging.info("Production data generator started")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    
    try:
        await manager.connect(websocket, client_id)
        
        # 发送欢迎消息
        welcome_message = {
            "type": "welcome",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "client_id": client_id,
                "server_version": "1.0.0",
                "message": "Connected to SCADA WebSocket Server"
            }
        }
        await manager.send_personal_message(welcome_message, client_id)
        
        while True:
            # 接收客户端消息
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 处理不同类型的消息
            await handle_client_message(message, client_id)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logging.error(f"WebSocket error for client {client_id}: {e}")
        manager.disconnect(client_id)

async def handle_client_message(message: dict, client_id: str):
    """处理客户端消息"""
    message_type = message.get("type")
    
    if message_type == "heartbeat":
        # 更新心跳时间
        if client_id in manager.client_info:
            manager.client_info[client_id]["last_heartbeat"] = datetime.now()
        
        # 回复心跳确认
        response = {
            "type": "heartbeat_ack",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "client_id": client_id,
                "server_time": datetime.now().isoformat()
            }
        }
        await manager.send_personal_message(response, client_id)
    
    elif message_type == "request_data":
        # 处理数据请求
        line_id = message.get("data", {}).get("line_id", "1")
        # 发送特定生产线数据...
        
    elif message_type == "acknowledge_alarm":
        # 处理告警确认
        alarm_id = message.get("data", {}).get("alarm_id")
        logging.info(f"Alarm {alarm_id} acknowledged by client {client_id}")
        
        response = {
            "type": "alarm_acknowledged",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "alarm_id": alarm_id,
                "acknowledged_by": client_id,
                "acknowledged_at": datetime.now().isoformat()
            }
        }
        await manager.broadcast(response)

# 健康检查端点
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_connections": len(manager.active_connections)
    }

# WebSocket 状态端点
@app.get("/ws/status")
async def websocket_status():
    return {
        "active_connections": len(manager.active_connections),
        "clients": [
            {
                "client_id": client_id,
                "connected_at": info["connected_at"].isoformat(),
                "last_heartbeat": info["last_heartbeat"].isoformat()
            }
            for client_id, info in manager.client_info.items()
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )