export interface User {
  id: string;
  username: string;
  role: 'admin' | 'manager' | 'operator';
  name: string;
}

export interface WeatherData {
  timestamp: string;
  irradiance: number;
  temperature: number;
  windSpeed: number;
  humidity: number;
  panelTemperature: number;
}

export interface GenerationData {
  timestamp: string;
  totalGeneration: number;
  realTimePower: number;
  dailyGeneration: number;
}

export interface TrendDataPoint {
  timestamp: string;
  power: number;
  generation: number;
}

export interface Inverter {
  id: string;
  name: string;
  arrayId: string;
  status: 'normal' | 'warning' | 'fault' | 'offline';
  conversionEfficiency: number;
  temperature: number;
  inputVoltage: number;
  outputCurrent: number;
  outputPower: number;
  totalRunningHours: number;
  faultRate: number;
}

export interface PanelString {
  id: string;
  name: string;
  arrayId: string;
  inverterId: string;
  status: 'normal' | 'warning' | 'fault' | 'offline';
  current: number;
  voltage: number;
  power: number;
  efficiency: number;
  cleaningCycle: number;
  needsCleaning: boolean;
}

export interface Battery {
  id: string;
  name: string;
  status: 'normal' | 'charging' | 'discharging' | 'fault';
  soc: number;
  voltage: number;
  current: number;
  temperature: number;
  capacity: number;
}

export interface Alarm {
  id: string;
  timestamp: string;
  level: 'critical' | 'warning' | 'info';
  deviceId: string;
  deviceType: 'inverter' | 'panel' | 'battery';
  deviceName: string;
  message: string;
  resolved: boolean;
}

export interface SchedulePlan {
  id: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed';
  predictedGeneration: number;
  arrayPlans: ArrayPlan[];
  cleaningTasks: CleaningTask[];
  batteryPlan: BatteryPlan;
  approver?: string;
  approvedAt?: string;
  comment?: string;
  createdAt: string;
}

export interface ArrayPlan {
  arrayId: string;
  arrayName: string;
  targetPower: number;
  efficiencyThreshold: number;
}

export interface CleaningTask {
  arrayId: string;
  panelStringIds: string[];
  reason: string;
  efficiencyDrop: number;
}

export interface BatteryPlan {
  minSoc: number;
  maxSoc: number;
  chargeFrom: string;
  chargeTo: string;
}

export interface WorkOrder {
  id: string;
  type: 'maintenance' | 'cleaning' | 'repair';
  status: 'pending' | 'assigned' | 'processing' | 'completed';
  deviceId: string;
  deviceType: 'inverter' | 'panel' | 'battery';
  deviceName: string;
  description: string;
  assignee?: string;
  team?: string;
  partsUsed: PartUsage[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface PartUsage {
  partId: string;
  partName: string;
  quantity: number;
}

export interface SparePart {
  id: string;
  name: string;
  category: string;
  stock: number;
  safeStock: number;
  unit: string;
  lastUpdated: string;
}

export interface StockRecord {
  id: string;
  partId: string;
  partName: string;
  type: 'in' | 'out';
  quantity: number;
  workOrderId?: string;
  operator: string;
  timestamp: string;
}

export interface StatisticsData {
  arrayId?: string;
  arrayName?: string;
  period: string;
  totalGeneration: number;
  equivalentHours: number;
  availability: number;
  peakPower: number;
}
