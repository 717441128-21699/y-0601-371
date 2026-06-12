export type InverterStatus = 'normal' | 'warning' | 'fault';
export type AlarmLevel = 'critical' | 'warning' | 'info';
export type ScheduleStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'completed';
export type MaintenanceStatus = 'pending' | 'assigned' | 'processing' | 'completed';
export type SparePartCategory = '光伏组件' | '逆变器' | '储能电池' | '汇流箱' | '监控设备' | '电缆配件';

export interface SquareArray {
  id: string;
  name: string;
  capacity: number;
  panels: number;
  area: number;
  orientation: string;
  tiltAngle: number;
  installationDate: string;
  inverterId: string[];
  currentPower: number;
  dailyGeneration: number;
  totalGeneration: number;
  efficiency: number;
  temperature: number;
}

export interface Inverter {
  id: string;
  name: string;
  model: string;
  squareArrayId: string;
  ratedPower: number;
  currentPower: number;
  voltage: number;
  current: number;
  temperature: number;
  status: InverterStatus;
  efficiency: number;
  totalGeneration: number;
  dailyGeneration: number;
  lastMaintenance: string;
  alarmCount: number;
}

export interface StringGroup {
  id: string;
  name: string;
  squareArrayId: string;
  inverterId: string;
  panelsCount: number;
  ratedPower: number;
  currentPower: number;
  voltage: number;
  current: number;
  efficiency: number;
  temperature: number;
  needsCleaning: boolean;
  lastCleaned: string;
  irradiance: number;
}

export interface StorageBattery {
  id: string;
  name: string;
  model: string;
  capacity: number;
  soc: number;
  voltage: number;
  current: number;
  temperature: number;
  status: 'charging' | 'discharging' | 'idle';
  chargeRate: number;
  dischargeRate: number;
  cycleCount: number;
  health: number;
}

export interface TrendData {
  hour: number;
  power: number;
  irradiance: number;
}

export interface Alarm {
  id: string;
  level: AlarmLevel;
  title: string;
  description: string;
  source: string;
  sourceType: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface DispatchSchedule {
  id: string;
  date: string;
  title: string;
  targetPower: number;
  scheduledGeneration: number;
  storageCharge: number;
  storageDischarge: number;
  status: ScheduleStatus;
  creator: string;
  approver?: string;
  createdAt: string;
  approvedAt?: string;
  remark?: string;
}

export interface MaintenanceOrder {
  id: string;
  title: string;
  description: string;
  type: '日常巡检' | '故障维修' | '清洁维护' | '设备更换';
  priority: 'high' | 'medium' | 'low';
  status: MaintenanceStatus;
  assignee?: string;
  location: string;
  squareArrayId?: string;
  equipmentId?: string;
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  remark?: string;
}

export interface SparePart {
  id: string;
  name: string;
  code: string;
  category: SparePartCategory;
  model: string;
  unit: string;
  stock: number;
  safetyStock: number;
  location: string;
  supplier: string;
  lastUpdated: string;
  belowSafety: boolean;
}

export interface InventoryRecord {
  id: string;
  sparePartId: string;
  sparePartName: string;
  type: 'in' | 'out';
  quantity: number;
  unitPrice: number;
  operator: string;
  timestamp: string;
  remark?: string;
  source?: string;
  destination?: string;
}

export interface MonthlyStatistics {
  id: string;
  squareArrayId: string;
  squareArrayName: string;
  year: number;
  month: number;
  totalGeneration: number;
  targetGeneration: number;
  completionRate: number;
  averageEfficiency: number;
  peakPower: number;
  irradianceHours: number;
  downtimeHours: number;
  revenue: number;
  carbonReduction: number;
}

const now = new Date('2026-06-12T10:30:00');
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const formatDateTime = (d: Date) => d.toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

export const squareArrays: SquareArray[] = [
  {
    id: 'A1',
    name: '方阵A1',
    capacity: 2500,
    panels: 8334,
    area: 12500,
    orientation: '正南',
    tiltAngle: 28,
    installationDate: '2024-03-15',
    inverterId: ['INV-001', 'INV-002'],
    currentPower: 1876.5,
    dailyGeneration: 12840.6,
    totalGeneration: 2856780,
    efficiency: 92.3,
    temperature: 42.5,
  },
  {
    id: 'A2',
    name: '方阵A2',
    capacity: 2500,
    panels: 8334,
    area: 12500,
    orientation: '正南',
    tiltAngle: 28,
    installationDate: '2024-03-20',
    inverterId: ['INV-003', 'INV-004'],
    currentPower: 1752.3,
    dailyGeneration: 11987.2,
    totalGeneration: 2745320,
    efficiency: 88.7,
    temperature: 44.1,
  },
  {
    id: 'A3',
    name: '方阵A3',
    capacity: 2500,
    panels: 8334,
    area: 12500,
    orientation: '正南偏东5°',
    tiltAngle: 26,
    installationDate: '2024-04-10',
    inverterId: ['INV-005', 'INV-006'],
    currentPower: 1920.8,
    dailyGeneration: 13125.4,
    totalGeneration: 2920450,
    efficiency: 94.1,
    temperature: 41.8,
  },
  {
    id: 'A4',
    name: '方阵A4',
    capacity: 2500,
    panels: 8334,
    area: 12500,
    orientation: '正南偏西5°',
    tiltAngle: 26,
    installationDate: '2024-04-15',
    inverterId: ['INV-007', 'INV-008'],
    currentPower: 1698.6,
    dailyGeneration: 10862.8,
    totalGeneration: 2634890,
    efficiency: 85.2,
    temperature: 47.3,
  },
];

export const inverters: Inverter[] = [
  {
    id: 'INV-001',
    name: '1号逆变器',
    model: 'SG-125HX',
    squareArrayId: 'A1',
    ratedPower: 1250,
    currentPower: 942.3,
    voltage: 728.5,
    current: 1293.6,
    temperature: 45.2,
    status: 'normal',
    efficiency: 98.2,
    totalGeneration: 1432560,
    dailyGeneration: 6450.3,
    lastMaintenance: formatDate(daysAgo(15)),
    alarmCount: 0,
  },
  {
    id: 'INV-002',
    name: '2号逆变器',
    model: 'SG-125HX',
    squareArrayId: 'A1',
    ratedPower: 1250,
    currentPower: 934.2,
    voltage: 726.8,
    current: 1285.4,
    temperature: 44.8,
    status: 'normal',
    efficiency: 97.9,
    totalGeneration: 1424220,
    dailyGeneration: 6390.3,
    lastMaintenance: formatDate(daysAgo(15)),
    alarmCount: 0,
  },
  {
    id: 'INV-003',
    name: '3号逆变器',
    model: 'SG-125HX',
    squareArrayId: 'A2',
    ratedPower: 1250,
    currentPower: 885.6,
    voltage: 718.2,
    current: 1233.1,
    temperature: 46.5,
    status: 'normal',
    efficiency: 96.8,
    totalGeneration: 1378200,
    dailyGeneration: 6025.8,
    lastMaintenance: formatDate(daysAgo(20)),
    alarmCount: 1,
  },
  {
    id: 'INV-004',
    name: '4号逆变器',
    model: 'SG-125HX',
    squareArrayId: 'A2',
    ratedPower: 1250,
    currentPower: 866.7,
    voltage: 712.4,
    current: 1216.5,
    temperature: 52.1,
    status: 'warning',
    efficiency: 94.3,
    totalGeneration: 1367120,
    dailyGeneration: 5961.4,
    lastMaintenance: formatDate(daysAgo(20)),
    alarmCount: 3,
  },
  {
    id: 'INV-005',
    name: '5号逆变器',
    model: 'SG-125HX',
    squareArrayId: 'A3',
    ratedPower: 1250,
    currentPower: 965.4,
    voltage: 732.1,
    current: 1318.7,
    temperature: 43.9,
    status: 'normal',
    efficiency: 98.5,
    totalGeneration: 1465600,
    dailyGeneration: 6580.2,
    lastMaintenance: formatDate(daysAgo(8)),
    alarmCount: 0,
  },
  {
    id: 'INV-006',
    name: '6号逆变器',
    model: 'SG-125HX',
    squareArrayId: 'A3',
    ratedPower: 1250,
    currentPower: 955.4,
    voltage: 730.5,
    current: 1307.9,
    temperature: 44.3,
    status: 'normal',
    efficiency: 98.1,
    totalGeneration: 1454850,
    dailyGeneration: 6545.2,
    lastMaintenance: formatDate(daysAgo(8)),
    alarmCount: 0,
  },
  {
    id: 'INV-007',
    name: '7号逆变器',
    model: 'SG-125HX',
    squareArrayId: 'A4',
    ratedPower: 1250,
    currentPower: 0,
    voltage: 0,
    current: 0,
    temperature: 28.6,
    status: 'fault',
    efficiency: 0,
    totalGeneration: 1318600,
    dailyGeneration: 2150.6,
    lastMaintenance: formatDate(daysAgo(30)),
    alarmCount: 5,
  },
  {
    id: 'INV-008',
    name: '8号逆变器',
    model: 'SG-125HX',
    squareArrayId: 'A4',
    ratedPower: 1250,
    currentPower: 856.8,
    voltage: 708.3,
    current: 1209.6,
    temperature: 48.7,
    status: 'normal',
    efficiency: 95.1,
    totalGeneration: 1316290,
    dailyGeneration: 5712.2,
    lastMaintenance: formatDate(daysAgo(25)),
    alarmCount: 2,
  },
];

const stringGroupData: { id: string; name: string; squareArrayId: string; inverterId: string; needsCleaning: boolean; efficiency: number }[] = [];
const cleanIndices = [5, 18, 29];
const efficiencyByClean = (clean: boolean): number => {
  if (clean) return 85 + Math.random() * 3;
  return 88 + Math.random() * 10;
};

let idx = 0;
for (let a = 0; a < 4; a++) {
  const arrayId = `A${a + 1}`;
  for (let i = 0; i < 2; i++) {
    const invId = `INV-00${a * 2 + i + 1}`;
    for (let s = 0; s < 4; s++) {
      const strIdx = idx;
      const needsCleaning = cleanIndices.includes(strIdx);
      const eff = efficiencyByClean(needsCleaning);
      stringGroupData.push({
        id: `STR-${String(strIdx + 1).padStart(3, '0')}`,
        name: `组串${arrayId}-${i * 4 + s + 1}`,
        squareArrayId: arrayId,
        inverterId: invId,
        needsCleaning,
        efficiency: Math.round(eff * 10) / 10,
      });
      idx++;
    }
  }
}

export const stringGroups: StringGroup[] = stringGroupData.map((s, i) => ({
  ...s,
  panelsCount: 26,
  ratedPower: 780,
  currentPower: Math.round(780 * s.efficiency / 100 * (0.85 + Math.random() * 0.15) * 10) / 10,
  voltage: Math.round((680 + Math.random() * 60) * 10) / 10,
  current: Math.round((8.5 + Math.random() * 1.5) * 100) / 100,
  temperature: Math.round((40 + Math.random() * 10) * 10) / 10,
  lastCleaned: s.needsCleaning ? formatDate(daysAgo(60 + Math.floor(Math.random() * 30))) : formatDate(daysAgo(5 + Math.floor(Math.random() * 10))),
  irradiance: Math.round(750 + Math.random() * 200),
}));

export const storageBatteries: StorageBattery[] = [
  {
    id: 'BAT-001',
    name: '储能电池组1',
    model: 'TES-500kWh',
    capacity: 500,
    soc: 92.5,
    voltage: 820.3,
    current: -85.6,
    temperature: 28.4,
    status: 'discharging',
    chargeRate: 0,
    dischargeRate: 70.2,
    cycleCount: 287,
    health: 97.8,
  },
  {
    id: 'BAT-002',
    name: '储能电池组2',
    model: 'TES-500kWh',
    capacity: 500,
    soc: 78.3,
    voltage: 795.6,
    current: 0,
    temperature: 27.9,
    status: 'idle',
    chargeRate: 0,
    dischargeRate: 0,
    cycleCount: 265,
    health: 98.2,
  },
  {
    id: 'BAT-003',
    name: '储能电池组3',
    model: 'TES-500kWh',
    capacity: 500,
    soc: 45.8,
    voltage: 732.1,
    current: 102.4,
    temperature: 29.6,
    status: 'charging',
    chargeRate: 75.0,
    dischargeRate: 0,
    cycleCount: 312,
    health: 96.5,
  },
  {
    id: 'BAT-004',
    name: '储能电池组4',
    model: 'TES-500kWh',
    capacity: 500,
    soc: 32.1,
    voltage: 708.5,
    current: 108.7,
    temperature: 30.2,
    status: 'charging',
    chargeRate: 77.0,
    dischargeRate: 0,
    cycleCount: 298,
    health: 97.1,
  },
];

export const trendData: TrendData[] = Array.from({ length: 24 }, (_, h) => {
  const isDay = h >= 6 && h <= 18;
  const peakHour = 12;
  const distance = Math.abs(h - peakHour);
  const irradiance = isDay ? Math.max(0, 1000 - distance * distance * 15) * (0.95 + Math.random() * 0.1) : 0;
  const power = irradiance > 0 ? (irradiance / 1000) * 7500 * (0.9 + Math.random() * 0.1) : 0;
  return {
    hour: h,
    power: Math.round(power * 10) / 10,
    irradiance: Math.round(irradiance),
  };
});

export const alarms: Alarm[] = [
  {
    id: 'ALM-001',
    level: 'critical',
    title: '逆变器故障停机',
    description: '7号逆变器发生严重故障，已自动停机，请立即检查IGBT模块和直流输入',
    source: 'INV-007',
    sourceType: '逆变器',
    timestamp: formatDateTime(hoursAgo(2)),
    acknowledged: true,
    resolved: false,
  },
  {
    id: 'ALM-002',
    level: 'critical',
    title: '组串输出异常偏低',
    description: '方阵A4多组组串输出功率低于正常值70%，疑似大面积遮蔽或组件损坏',
    source: 'A4',
    sourceType: '方阵',
    timestamp: formatDateTime(hoursAgo(4)),
    acknowledged: false,
    resolved: false,
  },
  {
    id: 'ALM-003',
    level: 'warning',
    title: '逆变器温度过高',
    description: '4号逆变器散热器温度达到52.1℃，超过预警阈值50℃，请检查散热系统',
    source: 'INV-004',
    sourceType: '逆变器',
    timestamp: formatDateTime(hoursAgo(1)),
    acknowledged: true,
    resolved: false,
  },
  {
    id: 'ALM-004',
    level: 'warning',
    title: '组件组串需要清洁',
    description: '检测到3组组串发电效率持续低于87%，建议安排清洁维护',
    source: 'MULTI',
    sourceType: '组串',
    timestamp: formatDateTime(hoursAgo(8)),
    acknowledged: true,
    resolved: false,
  },
  {
    id: 'ALM-005',
    level: 'warning',
    title: '储能电池SOC偏低',
    description: '3号、4号储能电池组SOC低于50%，请关注充电进度',
    source: 'BAT-003',
    sourceType: '储能',
    timestamp: formatDateTime(hoursAgo(3)),
    acknowledged: false,
    resolved: false,
  },
  {
    id: 'ALM-006',
    level: 'warning',
    title: '备件库存不足',
    description: 'IGBT模块、组串连接器库存已低于安全库存，请及时补充',
    source: 'INV',
    sourceType: '库存',
    timestamp: formatDateTime(hoursAgo(12)),
    acknowledged: true,
    resolved: false,
  },
  {
    id: 'ALM-007',
    level: 'info',
    title: '日常巡检提醒',
    description: '今日已完成方阵A1、A2日常巡检，设备运行正常',
    source: 'SYS',
    sourceType: '系统',
    timestamp: formatDateTime(hoursAgo(6)),
    acknowledged: true,
    resolved: true,
  },
  {
    id: 'ALM-008',
    level: 'info',
    title: '调度方案已执行',
    description: '6月11日调度方案已按计划完成执行，完成率98.5%',
    source: 'SYS',
    sourceType: '系统',
    timestamp: formatDateTime(hoursAgo(20)),
    acknowledged: true,
    resolved: true,
  },
  {
    id: 'ALM-009',
    level: 'info',
    title: '维保工单已完成',
    description: '5号逆变器例行维保工单已完成，设备状态良好',
    source: 'WO-2026-0034',
    sourceType: '工单',
    timestamp: formatDateTime(hoursAgo(10)),
    acknowledged: true,
    resolved: true,
  },
];

export const dispatchSchedules: DispatchSchedule[] = [
  {
    id: 'DS-2026-0606',
    date: formatDate(daysAgo(6)),
    title: '6月6日发电调度方案',
    targetPower: 7200,
    scheduledGeneration: 52800,
    storageCharge: 1200,
    storageDischarge: 950,
    status: 'completed',
    creator: '张工',
    approver: '李主任',
    createdAt: formatDateTime(daysAgo(7)),
    approvedAt: formatDateTime(daysAgo(7)),
    remark: '正常发电日',
  },
  {
    id: 'DS-2026-0607',
    date: formatDate(daysAgo(5)),
    title: '6月7日发电调度方案',
    targetPower: 7100,
    scheduledGeneration: 51500,
    storageCharge: 1100,
    storageDischarge: 880,
    status: 'approved',
    creator: '张工',
    approver: '李主任',
    createdAt: formatDateTime(daysAgo(6)),
    approvedAt: formatDateTime(daysAgo(6)),
  },
  {
    id: 'DS-2026-0608',
    date: formatDate(daysAgo(4)),
    title: '6月8日发电调度方案',
    targetPower: 6800,
    scheduledGeneration: 48200,
    storageCharge: 950,
    storageDischarge: 1200,
    status: 'rejected',
    creator: '王工',
    createdAt: formatDateTime(daysAgo(5)),
    remark: '储能放电计划超出安全阈值，请调整',
  },
  {
    id: 'DS-2026-0609',
    date: formatDate(daysAgo(3)),
    title: '6月9日发电调度方案',
    targetPower: 7300,
    scheduledGeneration: 54000,
    storageCharge: 1300,
    storageDischarge: 1000,
    status: 'executing',
    creator: '张工',
    approver: '李主任',
    createdAt: formatDateTime(daysAgo(4)),
    approvedAt: formatDateTime(daysAgo(4)),
  },
  {
    id: 'DS-2026-0610',
    date: formatDate(daysAgo(2)),
    title: '6月10日发电调度方案',
    targetPower: 7000,
    scheduledGeneration: 50800,
    storageCharge: 1150,
    storageDischarge: 920,
    status: 'approved',
    creator: '张工',
    approver: '李主任',
    createdAt: formatDateTime(daysAgo(3)),
    approvedAt: formatDateTime(daysAgo(3)),
  },
  {
    id: 'DS-2026-0611',
    date: formatDate(daysAgo(1)),
    title: '6月11日发电调度方案',
    targetPower: 7150,
    scheduledGeneration: 52000,
    storageCharge: 1200,
    storageDischarge: 980,
    status: 'pending',
    creator: '王工',
    createdAt: formatDateTime(daysAgo(2)),
  },
  {
    id: 'DS-2026-0612',
    date: formatDate(now),
    title: '6月12日发电调度方案',
    targetPower: 7250,
    scheduledGeneration: 53500,
    storageCharge: 1250,
    storageDischarge: 1050,
    status: 'pending',
    creator: '张工',
    createdAt: formatDateTime(daysAgo(1)),
  },
];

export const maintenanceOrders: MaintenanceOrder[] = [
  {
    id: 'WO-2026-0045',
    title: '7号逆变器故障紧急维修',
    description: 'IGBT模块烧毁，需要更换并检查驱动板',
    type: '故障维修',
    priority: 'high',
    status: 'processing',
    assignee: '李师傅',
    location: '方阵A4机房',
    squareArrayId: 'A4',
    equipmentId: 'INV-007',
    createdAt: formatDateTime(hoursAgo(3)),
    assignedAt: formatDateTime(hoursAgo(2.5)),
    startedAt: formatDateTime(hoursAgo(2)),
    remark: '已领取IGBT模块备件',
  },
  {
    id: 'WO-2026-0046',
    title: '方阵A4组串清洁',
    description: '3组组串效率偏低，需要高压水清洗',
    type: '清洁维护',
    priority: 'medium',
    status: 'assigned',
    assignee: '王师傅',
    location: '方阵A4区域',
    squareArrayId: 'A4',
    createdAt: formatDateTime(hoursAgo(8)),
    assignedAt: formatDateTime(hoursAgo(6)),
  },
  {
    id: 'WO-2026-0047',
    title: '4号逆变器散热系统检查',
    description: '温度偏高，检查风扇和散热通道',
    type: '故障维修',
    priority: 'medium',
    status: 'assigned',
    assignee: '赵师傅',
    location: '方阵A2机房',
    squareArrayId: 'A2',
    equipmentId: 'INV-004',
    createdAt: formatDateTime(hoursAgo(2)),
    assignedAt: formatDateTime(hoursAgo(1)),
  },
  {
    id: 'WO-2026-0048',
    title: '6月中旬日常巡检(方阵A1)',
    description: '按计划检查组件、支架、汇流箱、接地系统',
    type: '日常巡检',
    priority: 'low',
    status: 'pending',
    location: '方阵A1区域',
    squareArrayId: 'A1',
    createdAt: formatDateTime(hoursAgo(1)),
  },
  {
    id: 'WO-2026-0049',
    title: '6月中旬日常巡检(方阵A2)',
    description: '按计划检查组件、支架、汇流箱、接地系统',
    type: '日常巡检',
    priority: 'low',
    status: 'pending',
    location: '方阵A2区域',
    squareArrayId: 'A2',
    createdAt: formatDateTime(hoursAgo(1)),
  },
  {
    id: 'WO-2026-0050',
    title: '汇流箱4-2接线端子更换',
    description: '发现端子氧化，需要更换并重新压接',
    type: '设备更换',
    priority: 'high',
    status: 'processing',
    assignee: '李师傅',
    location: '方阵A4汇流箱区',
    squareArrayId: 'A4',
    equipmentId: 'CB-042',
    createdAt: formatDateTime(daysAgo(1)),
    assignedAt: formatDateTime(daysAgo(1)),
    startedAt: formatDateTime(hoursAgo(4)),
  },
  {
    id: 'WO-2026-0038',
    title: '5号逆变器例行维保',
    description: '季度维护：清洁滤网、紧固连接、校准传感器',
    type: '日常巡检',
    priority: 'low',
    status: 'completed',
    assignee: '赵师傅',
    location: '方阵A3机房',
    squareArrayId: 'A3',
    equipmentId: 'INV-005',
    createdAt: formatDateTime(daysAgo(3)),
    assignedAt: formatDateTime(daysAgo(3)),
    startedAt: formatDateTime(daysAgo(2)),
    completedAt: formatDateTime(hoursAgo(28)),
    remark: '各项指标正常',
  },
  {
    id: 'WO-2026-0039',
    title: '6号逆变器例行维保',
    description: '季度维护：清洁滤网、紧固连接、校准传感器',
    type: '日常巡检',
    priority: 'low',
    status: 'completed',
    assignee: '赵师傅',
    location: '方阵A3机房',
    squareArrayId: 'A3',
    equipmentId: 'INV-006',
    createdAt: formatDateTime(daysAgo(3)),
    assignedAt: formatDateTime(daysAgo(3)),
    startedAt: formatDateTime(daysAgo(2)),
    completedAt: formatDateTime(hoursAgo(26)),
    remark: '各项指标正常',
  },
  {
    id: 'WO-2026-0040',
    title: '方阵A3组串清洁',
    description: '月度清洁，共32组',
    type: '清洁维护',
    priority: 'medium',
    status: 'completed',
    assignee: '王师傅',
    location: '方阵A3区域',
    squareArrayId: 'A3',
    createdAt: formatDateTime(daysAgo(5)),
    assignedAt: formatDateTime(daysAgo(5)),
    startedAt: formatDateTime(daysAgo(4)),
    completedAt: formatDateTime(daysAgo(3)),
    remark: '清洁后效率平均提升2.1%',
  },
  {
    id: 'WO-2026-0041',
    title: '储能柜滤网更换',
    description: '储能电池柜1-4号防尘滤网更换',
    type: '设备更换',
    priority: 'low',
    status: 'completed',
    assignee: '李师傅',
    location: '储能机房',
    createdAt: formatDateTime(daysAgo(4)),
    assignedAt: formatDateTime(daysAgo(4)),
    startedAt: formatDateTime(daysAgo(3)),
    completedAt: formatDateTime(daysAgo(3)),
  },
  {
    id: 'WO-2026-0051',
    title: '6月中旬日常巡检(方阵A3)',
    description: '按计划检查组件、支架、汇流箱、接地系统',
    type: '日常巡检',
    priority: 'low',
    status: 'pending',
    location: '方阵A3区域',
    squareArrayId: 'A3',
    createdAt: formatDateTime(hoursAgo(30)),
  },
  {
    id: 'WO-2026-0052',
    title: '监控设备固件升级',
    description: '全站数据采集器固件升级至v2.8.1',
    type: '设备更换',
    priority: 'medium',
    status: 'processing',
    assignee: '王师傅',
    location: '中央控制室',
    createdAt: formatDateTime(daysAgo(1)),
    assignedAt: formatDateTime(hoursAgo(20)),
    startedAt: formatDateTime(hoursAgo(5)),
  },
];

const sparePartsList: { name: string; code: string; category: SparePartCategory; model: string; unit: string; stock: number; safetyStock: number }[] = [
  { name: '单晶光伏组件', code: 'SP-PV-001', category: '光伏组件', model: 'JKM550M-72HL4', unit: '块', stock: 125, safetyStock: 50 },
  { name: '组串式逆变器', code: 'SP-INV-001', category: '逆变器', model: 'SG-125HX', unit: '台', stock: 3, safetyStock: 2 },
  { name: 'IGBT功率模块', code: 'SP-INV-002', category: '逆变器', model: 'FF450R12ME4', unit: '个', stock: 2, safetyStock: 5 },
  { name: '逆变器散热风扇', code: 'SP-INV-003', category: '逆变器', model: 'FB050-4EK', unit: '个', stock: 18, safetyStock: 10 },
  { name: '磷酸铁锂电芯', code: 'SP-BAT-001', category: '储能电池', model: 'LF280K', unit: '只', stock: 48, safetyStock: 20 },
  { name: 'BMS管理模块', code: 'SP-BAT-002', category: '储能电池', model: 'BMU-16S', unit: '块', stock: 4, safetyStock: 3 },
  { name: '直流汇流箱', code: 'SP-CB-001', category: '汇流箱', model: 'CB-16/1', unit: '台', stock: 6, safetyStock: 2 },
  { name: '组串连接器', code: 'SP-CB-002', category: '汇流箱', model: 'MC4-Evo2', unit: '对', stock: 8, safetyStock: 30 },
  { name: '数据采集器', code: 'SP-MON-001', category: '监控设备', model: 'DL-300', unit: '台', stock: 5, safetyStock: 2 },
  { name: '气象站传感器', code: 'SP-MON-002', category: '监控设备', model: 'WS-500', unit: '套', stock: 2, safetyStock: 1 },
  { name: '直流电缆4mm²', code: 'SP-CBL-001', category: '电缆配件', model: 'PV1-F 1×4', unit: '米', stock: 2500, safetyStock: 500 },
  { name: '交流电缆35mm²', code: 'SP-CBL-002', category: '电缆配件', model: 'YJV 3×35', unit: '米', stock: 850, safetyStock: 200 },
  { name: '铜鼻子端子', code: 'SP-CBL-003', category: '电缆配件', model: 'DT-35', unit: '个', stock: 150, safetyStock: 100 },
  { name: '防水接线盒', code: 'SP-CBL-004', category: '电缆配件', model: 'IP65-100×100', unit: '个', stock: 65, safetyStock: 20 },
  { name: '光伏专用熔断器', code: 'SP-CB-003', category: '汇流箱', model: 'PV-15A 1000VDC', unit: '只', stock: 56, safetyStock: 30 },
];

export const spareParts: SparePart[] = sparePartsList.map((sp) => ({
  ...sp,
  id: sp.code,
  location: `仓库${sp.category.charAt(0)}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
  supplier: ['阳光电源', '晶科能源', '宁德时代', '华为数字能源', '施耐德'][Math.floor(Math.random() * 5)],
  lastUpdated: formatDateTime(daysAgo(Math.floor(Math.random() * 7))),
  belowSafety: sp.stock < sp.safetyStock,
}));

const inventoryRecordsRaw: { sparePartId: string; sparePartName: string; type: 'in' | 'out'; quantity: number; unitPrice: number; operator: string; hoursAgo: number; remark: string; source?: string; destination?: string }[] = [
  { sparePartId: 'SP-PV-001', sparePartName: '单晶光伏组件', type: 'in', quantity: 50, unitPrice: 980, operator: '仓管员-陈', hoursAgo: 36, remark: '采购入库', source: '晶科能源' },
  { sparePartId: 'SP-PV-001', sparePartName: '单晶光伏组件', type: 'out', quantity: 8, unitPrice: 980, operator: '仓管员-陈', hoursAgo: 12, remark: '方阵A4更换损坏组件', destination: 'WO-2026-0045' },
  { sparePartId: 'SP-INV-002', sparePartName: 'IGBT功率模块', type: 'in', quantity: 3, unitPrice: 2850, operator: '仓管员-陈', hoursAgo: 48, remark: '采购入库', source: '英飞凌' },
  { sparePartId: 'SP-INV-002', sparePartName: 'IGBT功率模块', type: 'out', quantity: 1, unitPrice: 2850, operator: '仓管员-陈', hoursAgo: 2, remark: '7号逆变器维修', destination: 'WO-2026-0045' },
  { sparePartId: 'SP-INV-003', sparePartName: '逆变器散热风扇', type: 'out', quantity: 2, unitPrice: 280, operator: '仓管员-刘', hoursAgo: 5, remark: '4号逆变器维修', destination: 'WO-2026-0047' },
  { sparePartId: 'SP-BAT-001', sparePartName: '磷酸铁锂电芯', type: 'in', quantity: 30, unitPrice: 620, operator: '仓管员-陈', hoursAgo: 72, remark: '采购入库', source: '宁德时代' },
  { sparePartId: 'SP-BAT-002', sparePartName: 'BMS管理模块', type: 'out', quantity: 1, unitPrice: 3800, operator: '仓管员-刘', hoursAgo: 20, remark: '3号储能柜维护', destination: '储能机房' },
  { sparePartId: 'SP-CB-002', sparePartName: '组串连接器', type: 'in', quantity: 50, unitPrice: 38, operator: '仓管员-陈', hoursAgo: 60, remark: '采购入库', source: '史陶比尔' },
  { sparePartId: 'SP-CB-002', sparePartName: '组串连接器', type: 'out', quantity: 12, unitPrice: 38, operator: '仓管员-刘', hoursAgo: 4, remark: '汇流箱端子更换', destination: 'WO-2026-0050' },
  { sparePartId: 'SP-MON-001', sparePartName: '数据采集器', type: 'in', quantity: 2, unitPrice: 4500, operator: '仓管员-陈', hoursAgo: 96, remark: '采购入库', source: '华为数字能源' },
  { sparePartId: 'SP-MON-002', sparePartName: '气象站传感器', type: 'out', quantity: 1, unitPrice: 8200, operator: '仓管员-刘', hoursAgo: 30, remark: '气象站更换', destination: '气象站' },
  { sparePartId: 'SP-CBL-001', sparePartName: '直流电缆4mm²', type: 'out', quantity: 200, unitPrice: 6.8, operator: '仓管员-陈', hoursAgo: 8, remark: '方阵A4组串更换', destination: 'WO-2026-0045' },
  { sparePartId: 'SP-CBL-002', sparePartName: '交流电缆35mm²', type: 'in', quantity: 500, unitPrice: 45, operator: '仓管员-陈', hoursAgo: 120, remark: '采购入库', source: '远东电缆' },
  { sparePartId: 'SP-CBL-002', sparePartName: '交流电缆35mm²', type: 'out', quantity: 80, unitPrice: 45, operator: '仓管员-刘', hoursAgo: 14, remark: '汇流箱接线改造', destination: '方阵A4' },
  { sparePartId: 'SP-CBL-003', sparePartName: '铜鼻子端子', type: 'out', quantity: 30, unitPrice: 3.5, operator: '仓管员-刘', hoursAgo: 4, remark: '汇流箱接线', destination: 'WO-2026-0050' },
  { sparePartId: 'SP-CBL-004', sparePartName: '防水接线盒', type: 'in', quantity: 30, unitPrice: 48, operator: '仓管员-陈', hoursAgo: 84, remark: '采购入库', source: '施耐德' },
  { sparePartId: 'SP-CBL-004', sparePartName: '防水接线盒', type: 'out', quantity: 5, unitPrice: 48, operator: '仓管员-陈', hoursAgo: 18, remark: '组串接线维修', destination: '方阵A2' },
  { sparePartId: 'SP-CB-003', sparePartName: '光伏专用熔断器', type: 'out', quantity: 8, unitPrice: 65, operator: '仓管员-刘', hoursAgo: 26, remark: '日常更换', destination: '方阵A3' },
  { sparePartId: 'SP-INV-001', sparePartName: '组串式逆变器', type: 'in', quantity: 1, unitPrice: 85000, operator: '仓管员-陈', hoursAgo: 144, remark: '备用机采购入库', source: '阳光电源' },
  { sparePartId: 'SP-CB-001', sparePartName: '直流汇流箱', type: 'out', quantity: 1, unitPrice: 3200, operator: '仓管员-陈', hoursAgo: 50, remark: '方阵A2汇流箱更换', destination: '方阵A2' },
];

export const inventoryRecords: InventoryRecord[] = inventoryRecordsRaw
  .sort((a, b) => a.hoursAgo - b.hoursAgo)
  .map((r, i) => ({
    id: `IR-${String(i + 1).padStart(4, '0')}`,
    sparePartId: r.sparePartId,
    sparePartName: r.sparePartName,
    type: r.type,
    quantity: r.quantity,
    unitPrice: r.unitPrice,
    operator: r.operator,
    timestamp: formatDateTime(hoursAgo(r.hoursAgo)),
    remark: r.remark,
    source: r.source,
    destination: r.destination,
  }));

export const monthlyStatistics: MonthlyStatistics[] = [
  {
    id: 'MS-2026-05-A1',
    squareArrayId: 'A1',
    squareArrayName: '方阵A1',
    year: 2026,
    month: 5,
    totalGeneration: 356840,
    targetGeneration: 345000,
    completionRate: 103.4,
    averageEfficiency: 92.8,
    peakPower: 2380,
    irradianceHours: 162.5,
    downtimeHours: 2.5,
    revenue: 285472,
    carbonReduction: 298.3,
  },
  {
    id: 'MS-2026-05-A2',
    squareArrayId: 'A2',
    squareArrayName: '方阵A2',
    year: 2026,
    month: 5,
    totalGeneration: 342180,
    targetGeneration: 345000,
    completionRate: 99.2,
    averageEfficiency: 89.2,
    peakPower: 2295,
    irradianceHours: 160.8,
    downtimeHours: 6.8,
    revenue: 273744,
    carbonReduction: 286.0,
  },
  {
    id: 'MS-2026-05-A3',
    squareArrayId: 'A3',
    squareArrayName: '方阵A3',
    year: 2026,
    month: 5,
    totalGeneration: 368920,
    targetGeneration: 345000,
    completionRate: 106.9,
    averageEfficiency: 95.1,
    peakPower: 2425,
    irradianceHours: 164.2,
    downtimeHours: 0.8,
    revenue: 295136,
    carbonReduction: 308.4,
  },
  {
    id: 'MS-2026-05-A4',
    squareArrayId: 'A4',
    squareArrayName: '方阵A4',
    year: 2026,
    month: 5,
    totalGeneration: 328650,
    targetGeneration: 345000,
    completionRate: 95.3,
    averageEfficiency: 86.4,
    peakPower: 2180,
    irradianceHours: 158.6,
    downtimeHours: 12.4,
    revenue: 262920,
    carbonReduction: 274.7,
  },
  {
    id: 'MS-2026-06-A1',
    squareArrayId: 'A1',
    squareArrayName: '方阵A1',
    year: 2026,
    month: 6,
    totalGeneration: 142860,
    targetGeneration: 148000,
    completionRate: 96.5,
    averageEfficiency: 92.1,
    peakPower: 2356,
    irradianceHours: 64.8,
    downtimeHours: 1.2,
    revenue: 114288,
    carbonReduction: 119.4,
  },
  {
    id: 'MS-2026-06-A2',
    squareArrayId: 'A2',
    squareArrayName: '方阵A2',
    year: 2026,
    month: 6,
    totalGeneration: 137820,
    targetGeneration: 148000,
    completionRate: 93.1,
    averageEfficiency: 88.5,
    peakPower: 2268,
    irradianceHours: 63.5,
    downtimeHours: 3.6,
    revenue: 110256,
    carbonReduction: 115.2,
  },
  {
    id: 'MS-2026-06-A3',
    squareArrayId: 'A3',
    squareArrayName: '方阵A3',
    year: 2026,
    month: 6,
    totalGeneration: 148250,
    targetGeneration: 148000,
    completionRate: 100.2,
    averageEfficiency: 94.6,
    peakPower: 2402,
    irradianceHours: 65.8,
    downtimeHours: 0.4,
    revenue: 118600,
    carbonReduction: 123.9,
  },
  {
    id: 'MS-2026-06-A4',
    squareArrayId: 'A4',
    squareArrayName: '方阵A4',
    year: 2026,
    month: 6,
    totalGeneration: 125680,
    targetGeneration: 148000,
    completionRate: 84.9,
    averageEfficiency: 83.8,
    peakPower: 2056,
    irradianceHours: 61.2,
    downtimeHours: 18.5,
    revenue: 100544,
    carbonReduction: 105.0,
  },
];
