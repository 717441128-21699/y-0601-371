import { useEffect, useState, useMemo } from 'react';
import { Zap, Sun, Battery, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import { squareArrays } from '@/mock/data';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import type { Inverter, StringGroup, StorageBattery } from '@/mock/data';

type TabKey = 'inverters' | 'panels' | 'batteries';
type StatusFilter = 'all' | 'normal' | 'warning' | 'fault' | 'offline';

const TABS: { key: TabKey; label: string; icon: typeof Zap }[] = [
  { key: 'inverters', label: '逆变器列表', icon: Zap },
  { key: 'panels', label: '组件组串列表', icon: Sun },
  { key: 'batteries', label: '储能电池列表', icon: Battery },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'normal', label: '正常' },
  { key: 'warning', label: '警告' },
  { key: 'fault', label: '故障' },
  { key: 'offline', label: '离线' },
];

const getArrayName = (arrayId: string): string => {
  const arr = squareArrays.find((a) => a.id === arrayId);
  return arr?.name ?? arrayId;
};

const getInverterName = (inverterId: string, inverters: Inverter[]): string => {
  const inv = inverters.find((i) => i.id === inverterId);
  return inv?.name ?? inverterId;
};

const daysSince = (dateStr: string): number => {
  const date = new Date(dateStr);
  const now = new Date('2026-06-12T10:30:00');
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const mapBatteryStatus = (
  status: StorageBattery['status']
): 'normal' | 'warning' | 'fault' | 'offline' => {
  switch (status) {
    case 'charging':
    case 'discharging':
      return 'normal';
    case 'idle':
      return 'warning';
    default:
      return 'normal';
  }
};

const inferPanelStatus = (
  panel: StringGroup
): 'normal' | 'warning' | 'fault' | 'offline' => {
  if (panel.currentPower <= 0) return 'fault';
  if (panel.needsCleaning || panel.efficiency < 87) return 'warning';
  return 'normal';
};

function InverterEfficiencyBar({ value }: { value: number }) {
  const color = value >= 95 ? 'bg-energy' : value >= 90 ? 'bg-solar' : 'bg-warning';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-[60px] h-2 rounded-full bg-primary-50/20 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-sm font-mono text-primary-50/90 shrink-0">{value.toFixed(1)}%</span>
    </div>
  );
}

function SocProgressBar({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 70) return 'bg-energy shadow-[0_0_8px_rgba(0,200,83,0.5)]';
    if (value >= 40) return 'bg-solar shadow-[0_0_8px_rgba(255,140,0,0.5)]';
    return 'bg-alarm shadow-[0_0_8px_rgba(255,61,0,0.5)]';
  };
  const getTextColor = () => {
    if (value >= 70) return 'text-energy';
    if (value >= 40) return 'text-solar';
    return 'text-alarm';
  };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-[80px] h-3 rounded-full bg-primary-50/20 overflow-hidden relative">
        <div
          className={cn('h-full rounded-full transition-all duration-700', getColor())}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      </div>
      <span className={cn('text-sm font-bold font-mono shrink-0 w-12 text-right', getTextColor())}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export default function Devices() {
  const { inverters, panels, batteries, fetchDevices } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('inverters');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const filteredInverters = useMemo(() => {
    if (statusFilter === 'all') return inverters;
    return inverters.filter((i) => i.status === statusFilter);
  }, [inverters, statusFilter]);

  const filteredPanels = useMemo(() => {
    if (statusFilter === 'all') return panels;
    return panels.filter((p) => inferPanelStatus(p) === statusFilter);
  }, [panels, statusFilter]);

  const filteredBatteries = useMemo(() => {
    if (statusFilter === 'all') return batteries;
    return batteries.filter((b) => mapBatteryStatus(b.status) === statusFilter);
  }, [batteries, statusFilter]);

  const inverterColumns: Column<Inverter>[] = [
    { key: 'name', title: '逆变器名称', dataIndex: 'name', className: 'font-medium text-solar/90' },
    {
      key: 'arrayId',
      title: '所属方阵',
      render: (r) => <span className="text-primary-50/80">{getArrayName(r.squareArrayId)}</span>,
    },
    {
      key: 'status',
      title: '状态',
      render: (r) => <StatusBadge status={r.status as 'normal' | 'warning' | 'fault' | 'offline'} />,
    },
    {
      key: 'efficiency',
      title: '转换效率(%)',
      render: (r) => <InverterEfficiencyBar value={r.efficiency} />,
    },
    {
      key: 'temperature',
      title: '温度(℃)',
      align: 'right',
      render: (r) => (
        <span
          className={cn(
            'font-mono',
            r.temperature >= 50 ? 'text-alarm' : r.temperature >= 45 ? 'text-warning' : 'text-primary-50/90'
          )}
        >
          {r.temperature.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'voltage',
      title: '输入电压(V)',
      align: 'right',
      render: (r) => <span className="font-mono text-primary-50/90">{r.voltage.toFixed(1)}</span>,
    },
    {
      key: 'current',
      title: '输出电流(A)',
      align: 'right',
      render: (r) => <span className="font-mono text-primary-50/90">{r.current.toFixed(1)}</span>,
    },
    {
      key: 'currentPower',
      title: '输出功率(kW)',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-energy font-medium">{r.currentPower.toFixed(1)}</span>
      ),
    },
    {
      key: 'totalRunningHours',
      title: '累计运行时长(h)',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-primary-50/90">
          {Math.floor(r.totalGeneration / 8).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'faultRate',
      title: '故障率(%)',
      align: 'right',
      render: (r) => {
        const rate = (r.alarmCount / 30) * 100;
        return (
          <span
            className={cn(
              'font-mono',
              rate > 10 ? 'text-alarm' : rate > 5 ? 'text-warning' : 'text-energy'
            )}
          >
            {rate.toFixed(2)}
          </span>
        );
      },
    },
  ];

  const panelColumns: Column<StringGroup>[] = [
    { key: 'name', title: '组串名称', dataIndex: 'name', className: 'font-medium text-solar/90' },
    {
      key: 'arrayId',
      title: '所属方阵',
      render: (r) => <span className="text-primary-50/80">{getArrayName(r.squareArrayId)}</span>,
    },
    {
      key: 'inverterId',
      title: '所属逆变器',
      render: (r) => (
        <span className="text-primary-50/80">{getInverterName(r.inverterId, inverters)}</span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (r) => <StatusBadge status={inferPanelStatus(r)} />,
    },
    {
      key: 'current',
      title: '电流(A)',
      align: 'right',
      render: (r) => <span className="font-mono text-primary-50/90">{r.current.toFixed(2)}</span>,
    },
    {
      key: 'voltage',
      title: '电压(V)',
      align: 'right',
      render: (r) => <span className="font-mono text-primary-50/90">{r.voltage.toFixed(1)}</span>,
    },
    {
      key: 'power',
      title: '功率(kW)',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-energy font-medium">{r.currentPower.toFixed(1)}</span>
      ),
    },
    {
      key: 'efficiency',
      title: '发电效率(%)',
      align: 'right',
      render: (r) => (
        <span
          className={cn(
            'font-mono',
            r.efficiency >= 92 ? 'text-energy' : r.efficiency >= 87 ? 'text-solar' : 'text-warning'
          )}
        >
          {r.efficiency.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'lastCleaned',
      title: '距上次清洗(天)',
      align: 'right',
      render: (r) => {
        const days = daysSince(r.lastCleaned);
        return (
          <span
            className={cn(
              'font-mono',
              days > 45 ? 'text-alarm' : days > 30 ? 'text-warning' : 'text-primary-50/90'
            )}
          >
            {days}
          </span>
        );
      },
    },
    {
      key: 'needsCleaning',
      title: '是否需清洗',
      render: (r) => (
        <StatusBadge
          status={r.needsCleaning ? 'warning' : 'normal'}
          text={r.needsCleaning ? '需清洗' : '正常'}
        />
      ),
    },
  ];

  const batteryColumns: Column<StorageBattery>[] = [
    { key: 'name', title: '电池名称', dataIndex: 'name', className: 'font-medium text-solar/90' },
    {
      key: 'status',
      title: '状态',
      render: (r) => {
        const mapped = mapBatteryStatus(r.status);
        const labelMap: Record<StorageBattery['status'], string> = {
          charging: '充电中',
          discharging: '放电中',
          idle: '待机',
        };
        return <StatusBadge status={mapped} text={labelMap[r.status]} />;
      },
    },
    {
      key: 'soc',
      title: 'SOC(%)',
      render: (r) => <SocProgressBar value={r.soc} />,
    },
    {
      key: 'voltage',
      title: '电压(V)',
      align: 'right',
      render: (r) => <span className="font-mono text-primary-50/90">{r.voltage.toFixed(1)}</span>,
    },
    {
      key: 'current',
      title: '电流(A)',
      align: 'right',
      render: (r) => (
        <span
          className={cn(
            'font-mono',
            r.current > 0 ? 'text-energy' : r.current < 0 ? 'text-solar' : 'text-primary-50/60'
          )}
        >
          {r.current > 0 ? '+' : ''}
          {r.current.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'temperature',
      title: '温度(℃)',
      align: 'right',
      render: (r) => (
        <span
          className={cn(
            'font-mono',
            r.temperature >= 35 ? 'text-alarm' : r.temperature >= 30 ? 'text-warning' : 'text-primary-50/90'
          )}
        >
          {r.temperature.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'capacity',
      title: '容量(kWh)',
      align: 'right',
      render: (r) => <span className="font-mono text-energy font-medium">{r.capacity}</span>,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-50 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-solar to-energy rounded-full" />
            设备运维管理
          </h1>
          <p className="text-sm text-primary-50/50 mt-1 ml-4">
            实时监控逆变器、组件组串、储能电池的运行状态
          </p>
        </div>
      </div>

      <div className="relative p-1 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
        <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-10 pointer-events-none" />
        <div className="relative flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count =
              tab.key === 'inverters'
                ? inverters.length
                : tab.key === 'panels'
                ? panels.length
                : batteries.length;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setStatusFilter('all');
                }}
                className={cn(
                  'flex-1 min-w-[160px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-solar/20 to-energy/20 text-solar border border-solar/40 shadow-[0_0_15px_rgba(255,140,0,0.2)]'
                    : 'text-primary-50/60 hover:text-primary-50/90 hover:bg-primary-50/10 border border-transparent'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive && 'text-glow-solar')} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-mono',
                    isActive ? 'bg-solar/20 text-solar' : 'bg-primary-50/10 text-primary-50/50'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-primary-50/60">
          <Filter className="w-4 h-4" />
          <span>状态筛选：</span>
        </div>
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusFilter === filter.key;
          const getCount = () => {
            if (filter.key === 'all') {
              if (activeTab === 'inverters') return inverters.length;
              if (activeTab === 'panels') return panels.length;
              return batteries.length;
            }
            if (activeTab === 'inverters') {
              return inverters.filter((i) => i.status === filter.key).length;
            }
            if (activeTab === 'panels') {
              return panels.filter((p) => inferPanelStatus(p) === filter.key).length;
            }
            return batteries.filter((b) => mapBatteryStatus(b.status) === filter.key).length;
          };
          return (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border',
                isActive
                  ? 'bg-solar/20 border-solar/40 text-solar'
                  : 'bg-primary-50/5 border-primary-50/20 text-primary-50/60 hover:text-primary-50/90 hover:border-primary-50/40'
              )}
            >
              {filter.key !== 'all' && (
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    filter.key === 'normal' && 'bg-energy',
                    filter.key === 'warning' && 'bg-warning',
                    filter.key === 'fault' && 'bg-alarm',
                    filter.key === 'offline' && 'bg-primary-50/40'
                  )}
                />
              )}
              {filter.label}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-mono',
                  isActive ? 'bg-solar/30 text-solar' : 'bg-primary-50/10 text-primary-50/50'
                )}
              >
                {getCount()}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'inverters' && (
        <DataTable
          columns={inverterColumns}
          data={filteredInverters}
          rowKey="id"
          emptyText={
            statusFilter === 'all'
              ? '暂无逆变器数据'
              : `暂无${STATUS_FILTERS.find((f) => f.key === statusFilter)?.label}状态的逆变器`
          }
        />
      )}
      {activeTab === 'panels' && (
        <DataTable
          columns={panelColumns}
          data={filteredPanels}
          rowKey="id"
          emptyText={
            statusFilter === 'all'
              ? '暂无组件组串数据'
              : `暂无${STATUS_FILTERS.find((f) => f.key === statusFilter)?.label}状态的组串`
          }
        />
      )}
      {activeTab === 'batteries' && (
        <DataTable
          columns={batteryColumns}
          data={filteredBatteries}
          rowKey="id"
          emptyText={
            statusFilter === 'all'
              ? '暂无储能电池数据'
              : `暂无${STATUS_FILTERS.find((f) => f.key === statusFilter)?.label}状态的电池`
          }
        />
      )}
    </div>
  );
}
