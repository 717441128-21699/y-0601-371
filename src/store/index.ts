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
  CleaningTask,
  PartUsage,
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

export interface DispatchParams {
  cleaningThreshold: number;
  inverterEfficiencyDrop: number;
  minSoc: number;
  maxSoc: number;
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

interface AlarmAction {
  type: 'power_reduction' | 'backup_switch';
  description: string;
  timestamp: string;
}

interface AppState {
  user: User | null;
  realtimeWeather: WeatherData | null;
  realtimeGeneration: GenerationData | null;
  trendData: TrendData[];
  inverters: DeviceState['inverters'];
  panels: DeviceState['panels'];
  batteries: DeviceState['batteries'];
  alarmList: (Alarm & { actions?: AlarmAction[] })[];
  scheduleList: SchedulePlan[];
  workOrderList: WorkOrder[];
  spareParts: SparePart[];
  stockRecords: StockRecord[];
  statisticsData: StatisticsData[];
  dispatchParams: DispatchParams;

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
  updateDispatchParams: (params: DispatchParams) => Promise<void>;

  fetchWorkOrders: () => Promise<void>;
  createWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt'>) => Promise<void>;
  assignWorkOrder: (id: string, assignee: string, team?: string) => Promise<void>;
  completeWorkOrder: (id: string, partsUsed: PartUsage[]) => Promise<void>;

  fetchInventory: () => Promise<void>;
  fetchStockRecords: () => Promise<void>;
  stockIn: (partId: string, quantity: number, operator: string) => Promise<void>;
  stockOut: (partId: string, quantity: number, operator: string, workOrderId?: string) => Promise<boolean>;

  fetchStatistics: () => Promise<void>;
}

const initialAlarms: (Alarm & { actions?: AlarmAction[] })[] = mockAlarms.map((a) => {
  const actions: AlarmAction[] = [];
  if (a.level === 'critical' && !a.resolved) {
    if (a.sourceType === '逆变器' && (a.description.includes('温度') || a.description.includes('过载'))) {
      actions.push({
        type: 'power_reduction',
        description: '系统已自动降低该逆变器输出功率至80%以控制温度',
        timestamp: a.timestamp,
      });
    }
    if (a.sourceType === '组串' && a.description.includes('电流异常')) {
      actions.push({
        type: 'backup_switch',
        description: '系统已自动切换至备用支路，维持发电连续性',
        timestamp: a.timestamp,
      });
    }
  }
  return {
    id: a.id,
    timestamp: a.timestamp,
    level: a.level,
    deviceId: a.source,
    deviceType: (a.sourceType === '逆变器' ? 'inverter' : a.sourceType === '组串' ? 'panel' : 'battery') as 'inverter' | 'panel' | 'battery',
    deviceName: a.title,
    message: a.description,
    resolved: a.resolved,
    actions: actions.length > 0 ? actions : undefined,
  };
});

const buildCleaningTasks = (params: DispatchParams): CleaningTask[] => {
  const tasks: CleaningTask[] = [];
  const arrayPanelMap: Record<string, { id: string; efficiency: number }[]> = {};
  mockPanels.forEach((p) => {
    const arrId = p.squareArrayId;
    if (!arrayPanelMap[arrId]) arrayPanelMap[arrId] = [];
    arrayPanelMap[arrId].push({ id: p.id, efficiency: p.efficiency });
  });

  Object.entries(arrayPanelMap).forEach(([arrId, panels]) => {
    const lowEffPanels = panels.filter((p) => p.efficiency < (100 - params.cleaningThreshold));
    if (lowEffPanels.length > 0) {
      const avgDrop = lowEffPanels.reduce((sum, p) => sum + (100 - p.efficiency), 0) / lowEffPanels.length;
      tasks.push({
        arrayId: arrId,
        panelStringIds: lowEffPanels.map((p) => p.id),
        reason: `${lowEffPanels.length}组组串发电效率低于${100 - params.cleaningThreshold}%阈值，需执行清洗`,
        efficiencyDrop: Math.round(avgDrop * 10) / 10,
      });
    }
  });

  return tasks;
};

const buildSchedulesWithParams = (params: DispatchParams): SchedulePlan[] => {
  const cleaningTasks = buildCleaningTasks(params);

  return mockSchedules.map((s) => ({
    id: s.id,
    date: s.date,
    status: s.status,
    predictedGeneration: s.scheduledGeneration,
    arrayPlans: squareArrays.map((arr) => ({
      arrayId: arr.id,
      arrayName: arr.name,
      targetPower: Math.round(s.targetPower / 4),
      efficiencyThreshold: 100 - params.inverterEfficiencyDrop,
    })),
    cleaningTasks: cleaningTasks.filter((t) =>
      squareArrays.some((arr) => arr.id === t.arrayId)
    ),
    batteryPlan: {
      minSoc: params.minSoc,
      maxSoc: params.maxSoc,
      chargeFrom: '10:00',
      chargeTo: '15:00',
    },
    approver: s.approver,
    approvedAt: s.approvedAt,
    comment: s.remark,
    createdAt: s.createdAt,
  }));
};

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
  dispatchParams: {
    cleaningThreshold: 10,
    inverterEfficiencyDrop: 5,
    minSoc: 20,
    maxSoc: 95,
  },

  login: async (username: string, password: string) => {
    await delay(500);
    if (password !== '123456') return false;
    const found = mockUsers.find((u) => u.username === username);
    if (!found) return false;
    set({ user: found });
    return true;
  },

  logout: () => {
    set({
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
    });
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
    const now = new Date().toISOString();
    set((state) => ({
      alarmList: state.alarmList.map((a) =>
        a.id === id
          ? {
              ...a,
              resolved: true,
              actions: [
                ...(a.actions || []),
                {
                  type: 'power_reduction' as const,
                  description: '运维人员已确认处理，报警已关闭',
                  timestamp: now,
                },
              ],
            }
          : a
      ),
    }));
  },

  fetchSchedules: async () => {
    await delay();
    const params = get().dispatchParams;
    set({ scheduleList: buildSchedulesWithParams(params) });
  },

  updateDispatchParams: async (params: DispatchParams) => {
    await delay();
    set({
      dispatchParams: params,
      scheduleList: buildSchedulesWithParams(params),
    });
  },

  approveSchedule: async (id: string, approver: string, remark?: string) => {
    await delay();
    const now = new Date().toISOString();
    set((state) => ({
      scheduleList: state.scheduleList.map((s) =>
        s.id === id
          ? { ...s, status: 'approved' as const, approver, approvedAt: now, comment: remark || s.comment }
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
          ? { ...s, status: 'rejected' as const, approver, approvedAt: now, comment: remark || s.comment }
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
    set((state) => ({
      workOrderList: state.workOrderList.map((wo) =>
        wo.id === id
          ? { ...wo, status: 'assigned' as const, assignee, team }
          : wo
      ),
    }));
  },

  completeWorkOrder: async (id: string, partsUsed: PartUsage[]) => {
    await delay();
    const now = new Date().toISOString();
    const state = get();

    let updatedParts = [...state.spareParts];
    const newRecords: StockRecord[] = [];

    if (partsUsed.length > 0) {
      for (const pu of partsUsed) {
        const partIdx = updatedParts.findIndex((p) => p.id === pu.partId);
        if (partIdx >= 0) {
          updatedParts[partIdx] = {
            ...updatedParts[partIdx],
            stock: Math.max(0, updatedParts[partIdx].stock - pu.quantity),
            lastUpdated: now,
          };
          newRecords.push({
            id: `SR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            partId: pu.partId,
            partName: pu.partName,
            type: 'out',
            quantity: pu.quantity,
            workOrderId: id,
            operator: state.workOrderList.find((wo) => wo.id === id)?.assignee || '系统',
            timestamp: now,
          });
        }
      }
    }

    set({
      workOrderList: state.workOrderList.map((wo) =>
        wo.id === id
          ? { ...wo, status: 'completed' as const, completedAt: now, startedAt: wo.startedAt || now, partsUsed }
          : wo
      ),
      spareParts: updatedParts,
      stockRecords: [...newRecords, ...state.stockRecords],
    });
  },

  fetchInventory: async () => {
    await delay();
    set({ spareParts: [...initialSpareParts] });
  },

  fetchStockRecords: async () => {
    await delay();
    set({ stockRecords: [...initialStockRecords] });
  },

  stockIn: async (partId: string, quantity: number, operator: string) => {
    await delay();
    const now = new Date().toISOString();
    const state = get();
    const part = state.spareParts.find((p) => p.id === partId);
    if (!part) return;

    const updatedParts = state.spareParts.map((p) =>
      p.id === partId ? { ...p, stock: p.stock + quantity, lastUpdated: now } : p
    );

    const newRecord: StockRecord = {
      id: `SR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      partId,
      partName: part.name,
      type: 'in',
      quantity,
      operator,
      timestamp: now,
    };

    set({
      spareParts: updatedParts,
      stockRecords: [newRecord, ...state.stockRecords],
    });
  },

  stockOut: async (partId: string, quantity: number, operator: string, workOrderId?: string) => {
    await delay();
    const state = get();
    const part = state.spareParts.find((p) => p.id === partId);
    if (!part) return false;
    if (part.stock < quantity) return false;

    const now = new Date().toISOString();
    const updatedParts = state.spareParts.map((p) =>
      p.id === partId ? { ...p, stock: p.stock - quantity, lastUpdated: now } : p
    );

    const newRecord: StockRecord = {
      id: `SR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      partId,
      partName: part.name,
      type: 'out',
      quantity,
      workOrderId,
      operator,
      timestamp: now,
    };

    set({
      spareParts: updatedParts,
      stockRecords: [newRecord, ...state.stockRecords],
    });

    return true;
  },

  fetchStatistics: async () => {
    await delay();
    set({ statisticsData: [...initialStatistics] });
  },
}));
