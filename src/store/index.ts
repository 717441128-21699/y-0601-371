import { create } from 'zustand';
import type {
  User,
  WeatherData,
  GenerationData,
  Alarm,
  SchedulePlan,
  WorkOrder,
  SparePart,
  StockRecord,
  StatisticsData,
} from '@/../shared/types';
import type { TrendData } from '@/mock/data';
import {
  inverters as mockInverters,
  stringGroups as mockPanels,
  storageBatteries as mockBatteries,
  alarms as mockAlarms,
  dispatchSchedules as mockSchedules,
  maintenanceOrders as mockWorkOrders,
  spareParts as mockSpareParts,
  inventoryRecords as mockStockRecords,
  monthlyStatistics as mockStatistics,
  trendData as mockTrendData,
  squareArrays,
} from '@/mock/data';

interface DeviceState {
  inverters: typeof mockInverters;
  panels: typeof mockPanels;
  batteries: typeof mockBatteries;
}

const mockUsers: User[] = [
  { id: '1', username: 'admin', role: 'admin', name: '系统管理员' },
  { id: '2', username: 'manager', role: 'manager', name: '运维经理' },
  { id: '3', username: 'operator', role: 'operator', name: '现场操作员' },
];

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const computeRealtimeGeneration = (): GenerationData => {
  const now = new Date();
  const totalPower = squareArrays.reduce((sum, arr) => sum + arr.currentPower, 0);
  const dailyGen = squareArrays.reduce((sum, arr) => sum + arr.dailyGeneration, 0);
  const totalGen = squareArrays.reduce((sum, arr) => sum + arr.totalGeneration, 0);
  return {
    timestamp: now.toISOString(),
    totalGeneration: totalGen,
    realTimePower: totalPower,
    dailyGeneration: dailyGen,
  };
};

const computeRealtimeWeather = (): WeatherData => {
  const now = new Date();
  const avgTemp = squareArrays.reduce((sum, arr) => sum + arr.temperature, 0) / squareArrays.length;
  const avgIrradiance = mockPanels.reduce((sum, p) => sum + p.irradiance, 0) / mockPanels.length;
  return {
    timestamp: now.toISOString(),
    irradiance: Math.round(avgIrradiance),
    temperature: Math.round(avgTemp * 10) / 10,
    windSpeed: Math.round((2 + Math.random() * 4) * 10) / 10,
    humidity: Math.round(45 + Math.random() * 20),
    panelTemperature: Math.round((avgTemp + 3) * 10) / 10,
  };
};

interface AppState {
  user: User | null;
  realtimeWeather: WeatherData | null;
  realtimeGeneration: GenerationData | null;
  trendData: TrendData[];
  inverters: DeviceState['inverters'];
  panels: DeviceState['panels'];
  batteries: DeviceState['batteries'];
  alarmList: Alarm[];
  scheduleList: SchedulePlan[];
  workOrderList: WorkOrder[];
  spareParts: SparePart[];
  stockRecords: StockRecord[];
  statisticsData: StatisticsData[];

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  fetchWeather: () => Promise<void>;
  fetchGeneration: () => Promise<void>;
  fetchTrend: () => Promise<void>;

  fetchDevices: () => Promise<void>;

  fetchAlarms: () => Promise<void>;
  resolveAlarm: (id: string) => Promise<void>;

  fetchSchedules: () => Promise<void>;
  approveSchedule: (id: string, approver: string, remark?: string) => Promise<void>;
  rejectSchedule: (id: string, approver: string, remark?: string) => Promise<void>;

  fetchWorkOrders: () => Promise<void>;
  createWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt'>) => Promise<void>;
  assignWorkOrder: (id: string, assignee: string, team?: string) => Promise<void>;
  completeWorkOrder: (id: string) => Promise<void>;

  fetchInventory: () => Promise<void>;
  fetchStockRecords: () => Promise<void>;

  fetchStatistics: () => Promise<void>;
}

const initialAlarms: Alarm[] = mockAlarms.map((a) => ({
  id: a.id,
  timestamp: a.timestamp,
  level: a.level,
  deviceId: a.source,
  deviceType: (a.sourceType === '逆变器' ? 'inverter' : a.sourceType === '组串' ? 'panel' : 'battery') as 'inverter' | 'panel' | 'battery',
  deviceName: a.title,
  message: a.description,
  resolved: a.resolved,
}));

const initialSchedules: SchedulePlan[] = mockSchedules.map((s) => ({
  id: s.id,
  date: s.date,
  status: s.status,
  predictedGeneration: s.scheduledGeneration,
  arrayPlans: squareArrays.map((arr) => ({
    arrayId: arr.id,
    arrayName: arr.name,
    targetPower: Math.round(s.targetPower / 4),
    efficiencyThreshold: 85,
  })),
  cleaningTasks: [],
  batteryPlan: {
    minSoc: 20,
    maxSoc: 95,
    chargeFrom: '10:00',
    chargeTo: '15:00',
  },
  approver: s.approver,
  approvedAt: s.approvedAt,
  comment: s.remark,
  createdAt: s.createdAt,
}));

const initialWorkOrders: WorkOrder[] = mockWorkOrders.map((wo) => ({
  id: wo.id,
  type: (wo.type === '故障维修' ? 'repair' : wo.type === '清洁维护' ? 'cleaning' : 'maintenance') as 'maintenance' | 'cleaning' | 'repair',
  status: wo.status,
  deviceId: wo.equipmentId || wo.squareArrayId || '',
  deviceType: 'inverter',
  deviceName: wo.title,
  description: wo.description,
  assignee: wo.assignee,
  createdAt: wo.createdAt,
  startedAt: wo.startedAt,
  completedAt: wo.completedAt,
  partsUsed: [],
}));

const initialSpareParts: SparePart[] = mockSpareParts.map((sp) => ({
  id: sp.id,
  name: sp.name,
  category: sp.category,
  stock: sp.stock,
  safeStock: sp.safetyStock,
  unit: sp.unit,
  lastUpdated: sp.lastUpdated,
}));

const initialStockRecords: StockRecord[] = mockStockRecords.map((r) => ({
  id: r.id,
  partId: r.sparePartId,
  partName: r.sparePartName,
  type: r.type,
  quantity: r.quantity,
  operator: r.operator,
  timestamp: r.timestamp,
}));

const initialStatistics: StatisticsData[] = mockStatistics.map((s) => ({
  arrayId: s.squareArrayId,
  arrayName: s.squareArrayName,
  period: `${s.year}-${String(s.month).padStart(2, '0')}`,
  totalGeneration: s.totalGeneration,
  equivalentHours: s.irradianceHours,
  availability: Math.round(((720 - s.downtimeHours) / 720) * 1000) / 10,
  peakPower: s.peakPower,
}));

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  realtimeWeather: null,
  realtimeGeneration: null,
  trendData: [],
  inverters: [],
  panels: [],
  batteries: [],
  alarmList: [],
  scheduleList: [],
  workOrderList: [],
  spareParts: [],
  stockRecords: [],
  statisticsData: [],

  login: async (username: string, password: string) => {
    await delay(500);
    if (password !== '123456') return false;
    const found = mockUsers.find((u) => u.username === username);
    if (!found) return false;
    set({ user: found });
    return true;
  },

  logout: () => {
    set({ user: null });
  },

  fetchWeather: async () => {
    await delay();
    set({ realtimeWeather: computeRealtimeWeather() });
  },

  fetchGeneration: async () => {
    await delay();
    set({ realtimeGeneration: computeRealtimeGeneration() });
  },

  fetchTrend: async () => {
    await delay();
    set({ trendData: [...mockTrendData] });
  },

  fetchDevices: async () => {
    await delay();
    set({
      inverters: [...mockInverters],
      panels: [...mockPanels],
      batteries: [...mockBatteries],
    });
  },

  fetchAlarms: async () => {
    await delay();
    set({ alarmList: [...initialAlarms] });
  },

  resolveAlarm: async (id: string) => {
    await delay();
    set((state) => ({
      alarmList: state.alarmList.map((a) =>
        a.id === id ? { ...a, resolved: true } : a
      ),
    }));
  },

  fetchSchedules: async () => {
    await delay();
    set({ scheduleList: [...initialSchedules] });
  },

  approveSchedule: async (id: string, approver: string, remark?: string) => {
    await delay();
    const now = new Date().toISOString();
    set((state) => ({
      scheduleList: state.scheduleList.map((s) =>
        s.id === id
          ? { ...s, status: 'approved', approver, approvedAt: now, comment: remark || s.comment }
          : s
      ),
    }));
  },

  rejectSchedule: async (id: string, approver: string, remark?: string) => {
    await delay();
    const now = new Date().toISOString();
    set((state) => ({
      scheduleList: state.scheduleList.map((s) =>
        s.id === id
          ? { ...s, status: 'rejected', approver, approvedAt: now, comment: remark || s.comment }
          : s
      ),
    }));
  },

  fetchWorkOrders: async () => {
    await delay();
    set({ workOrderList: [...initialWorkOrders] });
  },

  createWorkOrder: async (order) => {
    await delay();
    const now = new Date().toISOString();
    const nextId = `WO-${new Date().getFullYear()}-${String(get().workOrderList.length + 1).padStart(4, '0')}`;
    const newOrder: WorkOrder = {
      ...order,
      id: nextId,
      createdAt: now,
    };
    set((state) => ({
      workOrderList: [newOrder, ...state.workOrderList],
    }));
  },

  assignWorkOrder: async (id: string, assignee: string, team?: string) => {
    await delay();
    const now = new Date().toISOString();
    set((state) => ({
      workOrderList: state.workOrderList.map((wo) =>
        wo.id === id
          ? { ...wo, status: 'assigned', assignee, team, startedAt: wo.startedAt }
          : wo
      ),
    }));
  },

  completeWorkOrder: async (id: string) => {
    await delay();
    const now = new Date().toISOString();
    set((state) => ({
      workOrderList: state.workOrderList.map((wo) =>
        wo.id === id
          ? { ...wo, status: 'completed', completedAt: now, startedAt: wo.startedAt || now }
          : wo
      ),
    }));
  },

  fetchInventory: async () => {
    await delay();
    set({ spareParts: [...initialSpareParts] });
  },

  fetchStockRecords: async () => {
    await delay();
    set({ stockRecords: [...initialStockRecords] });
  },

  fetchStatistics: async () => {
    await delay();
    set({ statisticsData: [...initialStatistics] });
  },
}));
