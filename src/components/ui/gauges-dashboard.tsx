'use client'

import React from 'react'
import { ConfigurableGauge, GaugeConfig } from './gauge-configurable'
import { cn } from '@/lib/utils'
import { SensorValue } from '@/types'

interface GaugesDashboardProps {
  screwSpeed?: SensorValue
  tractionSpeed?: SensorValue
  spindleCurrent?: SensorValue
  motorTorque?: SensorValue
  vacuumSpeed?: SensorValue

  winderSpeed?: SensorValue
  winderTorque?: SensorValue
  winderTubeSpeed?: SensorValue
  winderLayerCount?: SensorValue
  winderTubeCount?: SensorValue
  className?: string
}

// Configuration for each gauge
const gaugeConfigs: Record<string, GaugeConfig> = {
  screwSpeed: {
    title: '主机当前速度',
    unit: ' HZ',
    max: 100,
    min: 0,
    color: '#3b82f6', // Blue
    decimalPlaces: 2
  },
  motorTorque: {
    title: '主机当前扭力',
    unit: ' %',
    max: 100,
    min: 0,
    color: '#a855f7',
    decimalPlaces: 1
  },
  tractionSpeed: {
    title: '牵引当前速度',
    unit: ' RMP',
    max: 200,
    min: 0,
    color: '#06b6d4',
    decimalPlaces: 0
  },
  vacuumSpeed: {
    title: '真空当前速度',
    unit: ' HZ',
    max: 100,
    min: 0,
    color: '#2dd4bf',
    decimalPlaces: 2
  },
  spindleCurrent: {
    title: '主机当前电流',
    unit: ' A',
    max: 10,
    min: 0,
    color: '#7c3aed', // Green
    decimalPlaces: 2
  },
  
  winderSpeed: {
    title: '当前收卷速度',
    unit: ' HZ',
    max: 200,
    min: 0,
    color: '#3b82f6', // Purple
    decimalPlaces: 2
  },
  winderTorque: {
    title: '当前收卷扭力',
    unit: ' %',
    max: 100,
    min: 0,
    color: '#a855f7', 
    decimalPlaces: 2
  },
  winderTubeSpeed: {
    title: '当前排管速度',
    unit: ' RMP',
    max: 100,
    min: 0,
    color: '#06b6d4', 
    decimalPlaces: 2
  },
  winderLayerCount: {
    title: '当前排管层数',
    unit: ' 层',
    max: 100,
    min: 0,
    color: '#2dd4bf', // Purple
    decimalPlaces: 2
  },
  winderTubeCount: {
    title: '当前排管根数',
    unit: ' P',
    max: 100,
    min: 0,
    color: '#7c3aed', // Purple
    decimalPlaces: 2
  },
}

/**
 * Dashboard component that displays four gauges for different machine metrics
 * - 螺杆转速 (Screw Speed)
 * - 牵引速度 (Traction Speed) 
 * - 主轴电流 (Spindle Current)
 * - 电机扭矩 (Motor Torque)
 * - 真空速度 (Vacuum Speed)
 */
export const GaugesDashboard: React.FC<GaugesDashboardProps> = ({
  screwSpeed,
  tractionSpeed,
  spindleCurrent,
  motorTorque,
  vacuumSpeed,
  winderSpeed,
  winderTorque,
  winderTubeSpeed,
  winderLayerCount,
  winderTubeCount,
  className
}) => {
  return (
    <div className={cn('grid grid-cols-3 gap-6 p-4 justify-center',
      'md:grid-cols-5',
      className
    )}>
      {motorTorque && <ConfigurableGauge
        sensor={motorTorque}
        config={gaugeConfigs.motorTorque!}
      />}

      {screwSpeed && <ConfigurableGauge
        sensor={screwSpeed}
        config={gaugeConfigs.screwSpeed!}
      />}
      
      {tractionSpeed && <ConfigurableGauge
        sensor={tractionSpeed}
        config={gaugeConfigs.tractionSpeed!}
      />}

      {vacuumSpeed && <ConfigurableGauge
        sensor={vacuumSpeed}
        config={gaugeConfigs.vacuumSpeed!}
      />}
      
      {spindleCurrent && <ConfigurableGauge
        sensor={spindleCurrent}
        config={gaugeConfigs.spindleCurrent!}
      />}

      {winderTorque && <ConfigurableGauge
        sensor={winderTorque}
        config={gaugeConfigs.winderTorque!}
      />}

      {winderSpeed && <ConfigurableGauge
        sensor={winderSpeed}
        config={gaugeConfigs.winderSpeed!}
      />}
      

      
      
      {winderTubeSpeed && <ConfigurableGauge
        sensor={winderTubeSpeed}
        config={gaugeConfigs.winderTubeSpeed!}
      />}
      
      
      {winderLayerCount && <ConfigurableGauge
        sensor={winderLayerCount}
        config={gaugeConfigs.winderLayerCount!}
      />}
      
      
      {winderTubeCount && <ConfigurableGauge
        sensor={winderTubeCount}
        config={gaugeConfigs.winderTubeCount!}
      />}
    </div>
  )
}

// Default export for consistency
export default GaugesDashboard
