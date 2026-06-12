import { create } from 'zustand';
import type {
  User,
  WeatherData,
  GenerationData,
  Alarm,
  AlarmAction,
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

interface AppState {
  _initialized: {
    devices: boolean;
    alarms: boolean;
    schedules: boolean;
    workorders: boolean;
    inventory: boolean;
    stockrecords: boolean;
    statistics: boolean;
    trend: boolean;
  };

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
  dispatchParams: DispatchParams;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  fetchWeather: () => Promise<void>;
  fetchGeneration: () => Promise<void>;
  fetchTrend: () => Promise<void>;

  fetchDevices: () => Promise<void>;

  fetchAlarms: () => Promise<void>;
  resolveAlarm: (id: string, options?: { note?: string; createWorkOrder?: boolean; handler?: string }) => Promise<void>;

  fetchSchedules: () => Promise<void>;
  approveSchedule: (id: string, approver: string, remark?: string) => Promise<void>;
  rejectSchedule: (id: string, approver: string, remark?: string) => Promise<void>;
  updateDispatchParams: (params: DispatchParams) => Promise<void>;

  fetchWorkOrders: () => Promise<void>;
  createWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt'>) => Promise<void>;
  assignWorkOrder: (id: string, assignee: string, team?: string) => Promise<void>;
  completeWorkOrder: (id: string, partsUsed: PartUsage[]) => Promise<boolean>;

  fetchInventory: () => Promise<void>;
  fetchStockRecords: () => Promise<void>;
  stockIn: (partId: string, quantity: number, operator: string) => Promise<void>;
  stockOut: (partId: string, quantity: number, operator: string, workOrderId?: string) => Promise<boolean>;

  fetchStatistics: () => Promise<void>;
}

const buildAlarmActions = (a: typeof mockAlarms[number]): AlarmAction[] => {
  if (a.level !== 'critical' || a.resolved) return [];
  const actions: AlarmAction[] = [];
  const t = a.timestamp;

  if (a.sourceType === '逆变器') {
    if (a.title.includes('故障') || a.title.includes('停机')) {
      actions.push({
        type: 'shutdown',
        description: '系统检测到IGBT过流，已自动触发停机保护，断开直流与交流侧连接',
        timestamp: t,
      });
      actions.push({
        type: 'backup_switch',
        description: '已自动切换该方阵负载至备用逆变器INV-S02，发电影响最小化',
        timestamp: t,
      });
    } else if (a.title.includes('温度') || a.description.includes('温度')) {
      actions.push({
        type: 'power_reduction',
        description: '散热器温度超过阈值，系统已自动降功率至80%运行，启用辅助散热',
        timestamp: t,
      });
    } else if (a.title.includes('过载') || a.description.includes('过载')) {
      actions.push({
        type: 'power_reduction',
        description: '检测到输出过载，已将输出功率限制在额定值100%以内',
        timestamp: t,
      });
    } else {
      actions.push({
        type: 'power_reduction',
        description: '逆变器异常，系统已自动降功率至60%并持续监测',
        timestamp: t,
      });
    }
  } else if (a.sourceType === '组串' || a.sourceType === '方阵') {
    if (a.title.includes('电流') || a.description.includes('电流异常')) {
      actions.push({
        type: 'backup_switch',
        description: '组串电流异常，已自动切换至备用支路，维持发电连续性',
        timestamp: t,
      });
    } else if (a.title.includes('输出') || a.title.includes('偏低') || a.title.includes('异常')) {
      actions.push({
        type: 'shutdown',
        description: '疑似组件故障或大面积遮蔽，已隔离异常组串防止影响相邻方阵',
        timestamp: t,
      });
      actions.push({
        type: 'power_reduction',
        description: '已将相邻正常组串输出功率微调至安全区间，待排查后恢复',
        timestamp: t,
      });
    } else {
      actions.push({
        type: 'backup_switch',
        description: '组串异常，已自动切换至备用支路',
        timestamp: t,
      });
    }
  } else if (a.sourceType === '储能') {
    actions.push({
      type: 'power_reduction',
      description: '储能系统SOC异常，已暂停充放电并启动自检测流程',
      timestamp: t,
    });
  } else {
    actions.push({
      type: 'power_reduction',
      description: '系统异常，已自动降低整体输出功率，等待进一步处置',
      timestamp: t,
    });
  }
  return actions;
};

const initialAlarms: Alarm[] = mockAlarms.map((a) => {
  const actions = buildAlarmActions(a);
  const deviceType: 'inverter' | 'panel' | 'battery' =
    a.sourceType === '逆变器' ? 'inverter' :
    a.sourceType === '组串' || a.sourceType === '方阵' ? 'panel' :
    a.sourceType === '储能' ? 'battery' : 'inverter';
  return {
    id: a.id,
    timestamp: a.timestamp,
    level: a.level,
    deviceId: a.source,
    deviceType,
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

const buildScheduleById = (
  s: typeof mockSchedules[number],
  params: DispatchParams,
  preserveFrom?: SchedulePlan
): SchedulePlan => {
  const cleaningTasks = buildCleaningTasks(params);
  const base: SchedulePlan = {
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
  };

  if (preserveFrom && preserveFrom.status !== 'pending') {
    return {
      ...base,
      id: preserveFrom.id,
      status: preserveFrom.status,
      approver: preserveFrom.approver,
      approvedAt: preserveFrom.approvedAt,
      comment: preserveFrom.comment,
    };
  }

  if (preserveFrom) {
    return {
      ...base,
      id: preserveFrom.id,
    };
  }

  return base;
};

const buildSchedulesWithParams = (
  params: DispatchParams,
  existingSchedules: SchedulePlan[] = []
): SchedulePlan[] => {
  return mockSchedules.map((s) => {
    const existing = existingSchedules.find((es) => es.id === s.id);
    return buildScheduleById(s, params, existing);
  });
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

const INITIAL_FLAGS = {
  devices: false,
  alarms: false,
  schedules: false,
  workorders: false,
  inventory: false,
  stockrecords: false,
  statistics: false,
  trend: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  _initialized: { ...INITIAL_FLAGS },
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
      _initialized: { ...INITIAL_FLAGS },
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
    if (get()._initialized.trend) return;
    set({ trendData: [...mockTrendData], _initialized: { ...get()._initialized, trend: true } });
  },

  fetchDevices: async () => {
    await delay();
    if (get()._initialized.devices) return;
    set({
      inverters: [...mockInverters],
      panels: [...mockPanels],
      batteries: [...mockBatteries],
      _initialized: { ...get()._initialized, devices: true },
    });
  },

  fetchAlarms: async () => {
    await delay();
    if (get()._initialized.alarms) return;
    set({ alarmList: [...initialAlarms], _initialized: { ...get()._initialized, alarms: true } });
  },

  resolveAlarm: async (id: string, options = {}) => {
    const { note, createWorkOrder, handler } = options;
    await delay();
    const now = new Date().toISOString();
    const state = get();
    const alarm = state.alarmList.find((a) => a.id === id);
    if (!alarm) return;

    const manualNote = note && note.trim() ? note.trim() : null;

    let newWorkOrders: WorkOrder[] = state.workOrderList;
    let relatedWorkOrderId: string | undefined;
    let relatedWorkOrderTitle: string | undefined;

    if (createWorkOrder) {
      const nextNum = String(newWorkOrders.length + 1).padStart(4, '0');
      const woId = `WO-${new Date().getFullYear()}-${nextNum}`;
      const woType: 'repair' | 'maintenance' = alarm.deviceType === 'panel' ? 'repair' : 'repair';
      relatedWorkOrderId = woId;
      relatedWorkOrderTitle = `维修工单：${alarm.deviceName}`;
      const newWo: WorkOrder = {
        id: woId,
        type: woType,
        status: 'pending',
        deviceId: alarm.deviceId,
        deviceType: alarm.deviceType,
        deviceName: alarm.deviceName,
        description: `报警ID ${alarm.id}：${alarm.message}${manualNote ? `\n处理说明：${manualNote}` : ''}`,
        assignee: handler,
        partsUsed: [],
        createdAt: now,
        relatedAlarmId: alarm.id,
        relatedAlarmTitle: alarm.deviceName,
        handlerNote: manualNote || undefined,
      };
      newWorkOrders = [newWo, ...newWorkOrders];
    }

    const manualDesc = manualNote
      ? `运维人员${handler ? `（${handler}）` : ''}已确认处置结果：${manualNote}，报警已关闭`
      : `运维人员${handler ? `（${handler}）` : ''}已确认处置结果，报警已关闭`;

    set({
      alarmList: state.alarmList.map((a) =>
        a.id === id
          ? {
              ...a,
              resolved: true,
              handler,
              handlerNote: manualNote || undefined,
              relatedWorkOrderId,
              relatedWorkOrderTitle,
              actions: [
                ...(a.actions || []),
                {
                  type: 'manual_confirm' as const,
                  description: manualDesc,
                  timestamp: now,
                },
              ],
            }
          : a
      ),
      workOrderList: newWorkOrders,
      _initialized: {
        ...state._initialized,
        alarms: true,
        workorders: true,
      },
    });
  },

  fetchSchedules: async () => {
    await delay();
    const state = get();
    const params = state.dispatchParams;
    if (state._initialized.schedules) {
      set({
        scheduleList: buildSchedulesWithParams(params, state.scheduleList),
      });
      return;
    }
    set({
      scheduleList: buildSchedulesWithParams(params, []),
      _initialized: { ...state._initialized, schedules: true },
    });
  },

  updateDispatchParams: async (params: DispatchParams) => {
    await delay();
    const state = get();
    set({
      dispatchParams: params,
      scheduleList: buildSchedulesWithParams(params, state.scheduleList),
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
      _initialized: { ...state._initialized, schedules: true },
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
      _initialized: { ...state._initialized, schedules: true },
    }));
  },

  fetchWorkOrders: async () => {
    await delay();
    if (get()._initialized.workorders) return;
    set({
      workOrderList: [...initialWorkOrders],
      _initialized: { ...get()._initialized, workorders: true },
    });
  },

  createWorkOrder: async (order) => {
    await delay();
    const now = new Date().toISOString();
    const state = get();
    const nextId = `WO-${new Date().getFullYear()}-${String(state.workOrderList.length + 1).padStart(4, '0')}`;
    const newOrder: WorkOrder = {
      ...order,
      id: nextId,
      createdAt: now,
    };
    set({
      workOrderList: [newOrder, ...state.workOrderList],
      _initialized: { ...state._initialized, workorders: true },
    });
  },

  assignWorkOrder: async (id: string, assignee: string, team?: string) => {
    await delay();
    set((state) => ({
      workOrderList: state.workOrderList.map((wo) =>
        wo.id === id
          ? { ...wo, status: 'assigned' as const, assignee, team }
          : wo
      ),
      _initialized: { ...state._initialized, workorders: true },
    }));
  },

  completeWorkOrder: async (id: string, partsUsed: PartUsage[]): Promise<boolean> => {
    await delay();
    const now = new Date().toISOString();
    const state = get();

    if (partsUsed.length > 0) {
      for (const pu of partsUsed) {
        const part = state.spareParts.find((p) => p.id === pu.partId);
        if (!part || part.stock < pu.quantity) {
          return false;
        }
      }
    }

    let updatedParts = [...state.spareParts];
    const newRecords: StockRecord[] = [];

    if (partsUsed.length > 0) {
      for (const pu of partsUsed) {
        const partIdx = updatedParts.findIndex((p) => p.id === pu.partId);
        if (partIdx >= 0) {
          updatedParts[partIdx] = {
            ...updatedParts[partIdx],
            stock: updatedParts[partIdx].stock - pu.quantity,
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
      _initialized: {
        ...state._initialized,
        workorders: true,
        inventory: true,
        stockrecords: true,
      },
    });

    return true;
  },

  fetchInventory: async () => {
    await delay();
    if (get()._initialized.inventory) return;
    set({
      spareParts: [...initialSpareParts],
      _initialized: { ...get()._initialized, inventory: true },
    });
  },

  fetchStockRecords: async () => {
    await delay();
    if (get()._initialized.stockrecords) return;
    set({
      stockRecords: [...initialStockRecords],
      _initialized: { ...get()._initialized, stockrecords: true },
    });
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
      _initialized: {
        ...state._initialized,
        inventory: true,
        stockrecords: true,
      },
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
      _initialized: {
        ...state._initialized,
        inventory: true,
        stockrecords: true,
      },
    });

    return true;
  },

  fetchStatistics: async () => {
    await delay();
    if (get()._initialized.statistics) return;
    set({
      statisticsData: [...initialStatistics],
      _initialized: { ...get()._initialized, statistics: true },
    });
  },
}));
