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
 *                              生产与设备 (Production & Equipment)
 * =================================================================================
 */

/**
 * 生产线信息
 */
export interface ProductionLine {
  id: string; // 通常是 1-8 的数字或 UUID
  name: string; // 例如 "生产线1"
  description?: string;
}

/**
 * 单个时间点从设备采集的所有生产数据
 * 这是数据库中时序数据表的核心结构
 */
export interface ProductionDataPoint {
  id?: string; // 数据库中的唯一ID
  timestamp: string; // 数据采集时间戳 (ISO 8601 格式)
  
  // 生产标识
  production_line_id: string; // 流水线编号
  production_batch_number: string; // 生产批号
  material_batch_number: string; // 物料批次号

  // 温度数据 (°C)
  body_temperatures: number[]; // 机身温度 (4个区)
  flange_temperatures: number[]; // 法兰温度 (最多2个区)
  mold_temperatures: number[]; // 模具温度 (2个区)

  // 速度数据
  screw_motor_speed: number; // 螺杆电机转速 (rpm)
  traction_motor_speed: number; // 牵引机速度 (m/min)

  // 测量与汇总数据
  real_time_diameter: number; // 实时测量直径 (mm)
  total_length_produced: number; // 当前批次生产长度汇总 (m)

  // 其他数据
  fluoride_ion_concentration: number; // 氟离子浓度 (ppm)
  main_spindle_current: number; // 主轴电流 (A)
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
  id: string;
  timestamp: string;
  production_line_id: string;
  message: string; // 例如 "实时直径超出上限"
  current_value: number;
  acknowledged: boolean; // 是否已确认
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
 * 数据导出任务的配置
 */
export interface DataExportConfig {
  start_time: string;
  end_time: string;
  format: 'csv' | 'xlsx';
  // 选择要导出的数据字段
  fields: (keyof Omit<ProductionDataPoint, 'id' | 'timestamp' | 'production_line_id'>)[];
}

/**
 * 导出任务状态
 */
export type ExportTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * 导出任务
 */
export interface ExportTask {
  id: string;
  filename: string;
  status: ExportTaskStatus;
  created_at: string;
  createdAt: string; // 兼容性字段
  download_url?: string;
  downloadUrl?: string; // 兼容性字段
  error_message?: string;
  config: DataExportConfig;
}

/**
 * 生产数据（用于表单）
 */
export interface ProductionData {
  production_line_id: string;
  production_batch_number: string;
  material_batch_number: string;
  body_temperatures: number[];
  flange_temperatures: number[];
  mold_temperatures: number[];
  screw_motor_speed: number;
  traction_motor_speed: number;
  real_time_diameter: number;
  total_length_produced: number;
  fluoride_ion_concentration: number;
  main_spindle_current: number;
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
 * 生产线数据（用于实时监控）
 */
/**
 * 生产线数据状态
 */
export type ProductionLineStatus = 'running' | 'stopped' | 'maintenance' | 'alarm';

/**
 * 生产线数据（用于实时监控）
 */
export interface ProductionLineData {
  id: string;
  name: string;
  status: ProductionLineStatus;
  bodyTemperatures: {
    zone1: number;
    zone2: number;
    zone3: number;
    zone4: number;
  };
  flangeTemperatures: {
    zone1: number;
    zone2: number;
  };
  moldTemperatures: {
    zone1: number;
    zone2: number;
  };
  motorSpeeds: {
    screw: number;
    traction: number;
  };
  measurements: {
    diameter: number;
    length: number;
  };
  chemistry: {
    fluoride: number;
  };
  electrical: {
    current: number;
  };
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