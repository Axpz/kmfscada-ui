/**
 * =================================================================================
 *                              用户与权限 (User & Auth)
 * =================================================================================
 */

/**
 * 定义系统中的用户角色
 * - `superadmin`: 超级管理员，拥有所有权限，包括用户管理。
 * - `admin`: 管理员，可查看数据并下载，但不能管理用户。
 * - `user`: 普通用户，仅能查看数据。
 */
export type Role = 'superadmin' | 'admin' | 'user';

/**
 * 用户账户信息
 */
export interface User {
  id: string;
  username: string; // 登录用户名
  email?: string; // 可选的联系邮箱
  role: Role; // 用户角色
  created_at: string;
  last_sign_in_at?: string;
}

/**
 * =================================================================================
 *                                报警 (Alarms)
 * =================================================================================
 */

/**
 * 实时直径数据的报警配置
 */
export interface DiameterAlarmConfig {
  production_line_id: string;
  upper_limit: number; // 告警上限 (mm)
  lower_limit: number; // 告警下限 (mm)
  enabled: boolean;
}

/**
 * 报警记录
 */
export interface AlarmRecord {
  id: number;
  timestamp: string;
  line_id: string;
  parameter_name: string;
  parameter_value: number;
  alarm_message: string;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  alarm_rule_id?: number;
  created_at: string;
  updated_at: string;
}

export interface AlarmRecordAcknowledge {
  acknowledged_by: string;
}

export interface AlarmRecordFilter {
  line_id?: string;
  parameter_name?: string;
  alarm_message?: string;
  is_acknowledged?: boolean;
  start_time?: string;
  end_time?: string;
  page?: number;
  size?: number;
}

export interface AlarmRecordListResponse {
  items: AlarmRecord[];
  total: number;
  page: number;
  size: number;
}


/**
 * =================================================================================
 *                              统计与导出 (Analytics & Export)
 * =================================================================================
 */

/**
 * 设备稼动率统计
 */
export interface EquipmentUtilization {
  production_line_id: string;
  total_run_time_seconds: number;
  total_time_seconds: number;
  utilization_rate: number; // 稼动率 (0-1)
}

/**
 * 实时监控数据
 */
export interface RealtimeMonitorData {
  timestamp: string;
  production_line_id: string;
  temperature: number;
  pressure: number;
  flow_rate: number;
  status: 'running' | 'stopped' | 'maintenance' | 'alarm';
}

/**
 * =================================================================================
 *                              API 与通用类型 (API & Common)
 * =================================================================================
 */

/**
 * 通用的 API 响应结构
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * API 错误响应结构
 */
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

/**
 * 用于 shadcn/ui Select 或其他组件的选项格式
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**

 * 异步操作的加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * =================================================================================
 *                              安全审计 (Security Audit)
 * =================================================================================
 */

/**
 * 登录记录
 */
export interface LoginRecord {
  id: string;
  user_name: string;
  ip_address: string;
  location: string;
  device_info: string;
  timestamp: string;
}

/**
 * 用户操作日志
 */
export interface OperationLog {
  id: string;
  timestamp: string;
  user_name: string;
  operation_type: string;
  operation_location: string;
  operation_result: 'success' | 'failure';
}

export type ProductionLineStatus = 'running' | 'idle' | 'offline';

/**
 * 生产线信息
 */
export interface ProductionLine {
  id: number;
  name: string;
  description?: string;
  enabled?: boolean;
  status?: ProductionLineStatus;
}

export interface SensorValue {
  value: number;
  alarm: boolean;
  alarmCode: string;
  alarmMessage: string;
}

export interface ProductionLineData {
  // === 核心维度：标识数据来源和时间 ===
  timestamp: string               // 时间戳 (ISO 8601 格式)
  line_id: string                 // 生产线ID
  component_id: string            // 组件ID，如 'winder' 或 'motor'
  
  // === 生产业务数据 ===
  batch_product_number: string    // 生产批号
  current_length: SensorValue          // 生产长度 (米)
  target_length: SensorValue           // 目标生产长度 (米)
  diameter: SensorValue                // 实时直径 (mm)
  fluoride_concentration: SensorValue  // 氟离子浓度 (mg/L)

  // === 温度传感器组 (°C) ===
  temp_body_zone1: SensorValue
  temp_body_zone2: SensorValue
  temp_body_zone3: SensorValue
  temp_body_zone4: SensorValue
  temp_flange_zone1: SensorValue
  temp_flange_zone2: SensorValue
  temp_mold_zone1: SensorValue
  temp_mold_zone2: SensorValue

  // === 电流传感器组 (A) ===
  current_body_zone1: SensorValue
  current_body_zone2: SensorValue
  current_body_zone3: SensorValue
  current_body_zone4: SensorValue
  current_flange_zone1: SensorValue
  current_flange_zone2: SensorValue
  current_mold_zone1: SensorValue
  current_mold_zone2: SensorValue

  // === 电机参数 ===
  motor_screw_speed: SensorValue       // 螺杆转速 (rpm)
  motor_screw_torque: SensorValue      // 螺杆扭矩
  motor_current: SensorValue           // 电机电流 (A)
  motor_traction_speed: SensorValue    // 牵引速度 (m/min)
  motor_vacuum_speed: SensorValue      // 真空速度

  // === 收卷机 ===
  winder_speed: SensorValue            // 收卷速度
  winder_torque: SensorValue           // 收卷扭矩
  winder_layer_count: SensorValue      // 收卷层数
  winder_tube_speed: SensorValue       // 收卷管速度
  winder_tube_count: SensorValue       // 收卷管数量
}

export interface ChartDataPoint {
  timestamp: number;
  [key: string]: number | string;
}