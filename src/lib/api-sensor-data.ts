import { apiClient } from "./api-client";

// 传感器数据 API 端点
const SENSOR_ENDPOINT = "/sensor-data";

/**
 * =================================================================================
 *                              传感器数据 (Sensor Data)
 * =================================================================================
 */
/**
 * 传感器数据基础结构
 */
export interface SensorData {
  timestamp: string;
  line_id: string;
  component_id: string;

  // 生产业务数据
  batch_product_number?: string;
  current_length?: number;
  target_length?: number;
  diameter?: number;
  fluoride_concentration?: number;

  // 温度传感器组
  temp_body_zone1?: number;
  temp_body_zone2?: number;
  temp_body_zone3?: number;
  temp_body_zone4?: number;
  temp_flange_zone1?: number;
  temp_flange_zone2?: number;
  temp_mold_zone1?: number;
  temp_mold_zone2?: number;

  // 电流传感器组
  current_body_zone1?: number;
  current_body_zone2?: number;
  current_body_zone3?: number;
  current_body_zone4?: number;
  current_flange_zone1?: number;
  current_flange_zone2?: number;
  current_mold_zone1?: number;
  current_mold_zone2?: number;

  // 电机参数
  motor_screw_speed?: number;
  motor_screw_torque?: number;
  motor_current?: number;
  motor_traction_speed?: number;
  motor_vacuum_speed?: number;

  // 收卷机
  winder_speed?: number;
  winder_torque?: number;
  winder_layer_count?: number;
  winder_tube_speed?: number;
  winder_tube_count?: number;

  // 时间戳字段
  created_at?: string;
  updated_at?: string;
}

/**
 * 传感器数据过滤条件
 */
export interface SensorDataFilter {
  line_id: string;
  component_id?: string;
  start_time?: string;
  end_time?: string;
  parameter_name?: string;
  page?: number;
  size?: number;
}

/**
 * 传感器数据列表响应
 */
export interface SensorDataListResponse {
  items: SensorData[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取传感器数据列表
 * 支持分页、时间范围过滤、生产线和组件过滤
 *
 * @param filters 过滤条件
 * @returns 传感器数据列表响应
 */
export const getSensorData = async (
  filters: SensorDataFilter
): Promise<SensorDataListResponse> => {
  return apiClient.post<SensorDataListResponse>(
    `${SENSOR_ENDPOINT}/list`,
    filters
  );
};



/**
 * 获取设备利用率数据
 */

/**
 * 传感器数据列表响应
 */
export interface UtilizationResponse {
  line_id: string
  total_run_time_seconds: number
  total_idle_time_seconds: number
  total_offline_time_seconds: number
}

export const getUtilization = async (
  filters: SensorDataFilter
): Promise<UtilizationResponse> => {
  return apiClient.post<UtilizationResponse>(
    `${SENSOR_ENDPOINT}/utilization`,
    filters
  );
};

export interface SensorDataExportFilter {
  line_ids: string;
  start_time: string;
  end_time: string;
  parameter_names: string;
}

export const exportSensorData = async (
  filters: SensorDataExportFilter
): Promise<Blob> => {
  return apiClient.post<Blob>(
    `${SENSOR_ENDPOINT}/export`,
    filters
  );
};