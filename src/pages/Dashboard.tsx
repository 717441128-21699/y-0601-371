import { useEffect, useState } from 'react';
import {
  Zap,
  Sun,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  AlertTriangle,
  AlertCircle,
  Info,
  Activity,
  Battery,
  LayoutDashboard,
  CheckCircle2,
  Shield,
  ZapOff,
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StatCard from '@/components/ui/StatCard';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const COLORS = {
  normal: '#00C853',
  warning: '#FFD600',
  fault: '#FF3D00',
  charging: '#00C853',
  discharging: '#FF8C00',
  idle: '#1A3A5C',
};

const alarmLevelConfig = {
  critical: {
    color: 'text-alarm',
    bg: 'bg-alarm/10',
    border: 'border-alarm/40',
    dot: 'bg-alarm',
    icon: AlertCircle,
    pulse: 'animate-pulse',
  },
  warning: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/40',
    dot: 'bg-warning',
    icon: AlertTriangle,
    pulse: '',
  },
  info: {
    color: 'text-primary-50',
    bg: 'bg-primary-50/10',
    border: 'border-primary-50/40',
    dot: 'bg-primary-50',
    icon: Info,
    pulse: '',
  },
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  return num.toFixed(decimals);
}

export default function Dashboard() {
  const {
    realtimeWeather,
    realtimeGeneration,
    trendData,
    inverters,
    panels,
    batteries,
    alarmList,
    statisticsData,
    fetchWeather,
    fetchGeneration,
    fetchTrend,
    fetchDevices,
    fetchAlarms,
    fetchStatistics,
    resolveAlarm,
  } = useAppStore();

  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
    fetchGeneration();
    fetchTrend();
    fetchDevices();
    fetchAlarms();
    fetchStatistics();

    const interval = setInterval(() => {
      fetchWeather();
      fetchGeneration();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchWeather, fetchGeneration, fetchTrend, fetchDevices, fetchAlarms, fetchStatistics]);

  const totalEquivalentHours = statisticsData.reduce((sum, s) => sum + s.equivalentHours, 0);
  const avgAvailability =
    statisticsData.length > 0
      ? statisticsData.reduce((sum, s) => sum + s.availability, 0) / statisticsData.length
      : 0;

  const inverterStats = {
    normal: inverters.filter((i) => i.status === 'normal').length,
    warning: inverters.filter((i) => i.status === 'warning').length,
    fault: inverters.filter((i) => i.status === 'fault').length,
  };

  const panelStats = {
    normal: panels.filter((p) => !p.needsCleaning).length,
    warning: panels.filter((p) => p.needsCleaning).length,
    fault: 0,
  };

  const batteryStats = {
    normal: batteries.filter((b) => b.status === 'charging' || b.status === 'discharging').length,
    warning: batteries.filter((b) => b.status === 'idle').length,
    fault: 0,
  };

  const createPieData = (stats: { normal: number; warning: number; fault: number }) => [
    { name: '正常', value: stats.normal, color: COLORS.normal },
    { name: '警告', value: stats.warning, color: COLORS.warning },
    { name: '故障', value: stats.fault, color: COLORS.fault },
  ];

  const sortedAlarms = [...alarmList]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总发电量"
          value={formatNumber(realtimeGeneration?.totalGeneration ?? 0, 2)}
          unit="kWh"
          icon={<Zap className="w-6 h-6" />}
          color="energy"
          trend={3.2}
          trendLabel="较昨日"
        />
        <StatCard
          title="实时功率"
          value={formatNumber(realtimeGeneration?.realTimePower ?? 0, 1)}
          unit="kW"
          icon={<Activity className="w-6 h-6" />}
          color="solar"
          trend={1.5}
          trendLabel="较昨日"
        />
        <StatCard
          title="等效利用小时"
          value={formatNumber(totalEquivalentHours, 1)}
          unit="h"
          icon={<Gauge className="w-6 h-6" />}
          color="info"
          trend={-0.8}
          trendLabel="较上月"
        />
        <StatCard
          title="设备可用率"
          value={formatNumber(avgAvailability, 1)}
          unit="%"
          icon={<LayoutDashboard className="w-6 h-6" />}
          color="success"
          trend={0.3}
          trendLabel="较上月"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5 hover:border-primary-50/60 transition-all duration-300">
          <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-30 pointer-events-none" />
          <div className="relative">
            <h3 className="text-sm font-medium text-primary-50/60 mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4 text-solar" />
              气象数据
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-solar/15 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-solar" />
                  </div>
                  <span className="text-sm text-primary-50/70">光照辐射度</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-solar text-glow-solar">
                    {realtimeWeather?.irradiance ?? '--'}
                  </span>
                  <span className="text-xs text-primary-50/50 ml-1">W/m²</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-alarm/15 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-alarm" />
                  </div>
                  <span className="text-sm text-primary-50/70">环境温度</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-alarm">
                    {realtimeWeather?.temperature ?? '--'}
                  </span>
                  <span className="text-xs text-primary-50/50 ml-1">℃</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50/15 flex items-center justify-center">
                    <Wind className="w-5 h-5 text-primary-50" />
                  </div>
                  <span className="text-sm text-primary-50/70">风速</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-primary-50">
                    {realtimeWeather?.windSpeed ?? '--'}
                  </span>
                  <span className="text-xs text-primary-50/50 ml-1">m/s</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50/15 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-primary-50" />
                  </div>
                  <span className="text-sm text-primary-50/70">湿度</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-primary-50">
                    {realtimeWeather?.humidity ?? '--'}
                  </span>
                  <span className="text-xs text-primary-50/50 ml-1">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-warning" />
                  </div>
                  <span className="text-sm text-primary-50/70">组件温度</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-warning">
                    {realtimeWeather?.panelTemperature ?? '--'}
                  </span>
                  <span className="text-xs text-primary-50/50 ml-1">℃</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5 hover:border-primary-50/60 transition-all duration-300">
          <div className="absolute inset-0 rounded-xl bg-gradient-radial-energy opacity-20 pointer-events-none" />
          <div className="relative">
            <h3 className="text-sm font-medium text-primary-50/60 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-energy" />
              24小时发电趋势 & 光照辐射
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C853" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#00C853" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="irradianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF8C00" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FF8C00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A3A5C" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#1A3A5C"
                    tick={{ fill: '#1A3A5C', fontSize: 12 }}
                    tickFormatter={(h) => `${h}:00`}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#00C853"
                    tick={{ fill: '#00C853', fontSize: 12 }}
                    tickFormatter={(v) => `${v}`}
                    label={{ value: '功率(kW)', angle: -90, position: 'insideLeft', fill: '#00C853', fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#FF8C00"
                    tick={{ fill: '#FF8C00', fontSize: 12 }}
                    label={{ value: '辐射(W/m²)', angle: 90, position: 'insideRight', fill: '#FF8C00', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1628',
                      border: '1px solid #1A3A5C',
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)',
                    }}
                    labelFormatter={(h) => `${h}:00`}
                    formatter={(value: number, name: string) => [
                      name === 'power' ? `${value} kW` : `${value} W/m²`,
                      name === 'power' ? '发电功率' : '光照辐射',
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ color: '#1A3A5C', fontSize: 12 }}
                    formatter={(value) => (value === 'power' ? '发电功率' : '光照辐射')}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="power"
                    stroke="#00C853"
                    strokeWidth={2}
                    fill="url(#powerGradient)"
                    name="power"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="irradiance"
                    stroke="#FF8C00"
                    strokeWidth={2}
                    fill="url(#irradianceGradient)"
                    name="irradiance"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5 hover:border-primary-50/60 transition-all duration-300">
          <div className="absolute inset-0 rounded-xl bg-gradient-radial-warning opacity-20 pointer-events-none" />
          <div className="relative">
            <h3 className="text-sm font-medium text-primary-50/60 mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-warning" />
              设备状态总览
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary-50/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-solar" />
                    <span className="text-sm text-primary-50/80">逆变器</span>
                  </div>
                  <span className="text-xs text-primary-50/50">
                    {inverterStats.normal + inverterStats.warning + inverterStats.fault} 台
                  </span>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={createPieData(inverterStats)}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {createPieData(inverterStats).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary-50/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-energy" />
                    <span className="text-sm text-primary-50/80">组串</span>
                  </div>
                  <span className="text-xs text-primary-50/50">
                    {panelStats.normal + panelStats.warning + panelStats.fault} 组
                  </span>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={createPieData(panelStats)}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {createPieData(panelStats).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary-50/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-primary-50" />
                    <span className="text-sm text-primary-50/80">储能电池</span>
                  </div>
                  <span className="text-xs text-primary-50/50">
                    {batteryStats.normal + batteryStats.warning + batteryStats.fault} 组
                  </span>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={createPieData(batteryStats)}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {createPieData(batteryStats).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.normal }} />
                  <span className="text-primary-50/60">正常</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.warning }} />
                  <span className="text-primary-50/60">警告</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.fault }} />
                  <span className="text-primary-50/60">故障</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5 hover:border-primary-50/60 transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-gradient-radial-alarm opacity-20 pointer-events-none" />
        <div className="relative">
          <h3 className="text-sm font-medium text-primary-50/60 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-alarm" />
            实时报警
            <span className="ml-2 px-2 py-0.5 rounded-full bg-alarm/20 text-alarm text-xs">
              {alarmList.filter((a) => !a.resolved).length} 未处理
            </span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-success/15 text-success text-xs">
              {alarmList.filter((a) => a.resolved).length} 已处理
            </span>
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-alarm via-warning to-primary-50/30" />
            <div className="space-y-3">
              {sortedAlarms.map((alarm) => {
                const config = alarmLevelConfig[alarm.level];
                const LevelIcon = config.icon;
                return (
                  <div
                    key={alarm.id}
                    className={cn(
                      'relative pl-10 pr-4 py-3 rounded-lg border transition-all duration-300',
                      config.bg,
                      config.border,
                      alarm.resolved && 'opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center',
                        config.bg,
                        config.pulse
                      )}
                    >
                      <LevelIcon className={cn('w-3 h-3', config.color)} />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded', config.bg, config.color)}>
                            {alarm.level === 'critical' ? '严重' : alarm.level === 'warning' ? '警告' : '信息'}
                          </span>
                          <span className="text-sm font-medium text-primary-50/90 truncate">
                            {alarm.deviceName}
                          </span>
                          {alarm.resolved && (
                            <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              已处理
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-primary-50/60 truncate">{alarm.message}</p>
                        {alarm.actions && alarm.actions.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {alarm.actions.map((action, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  'flex items-start gap-2 p-2 rounded border',
                                  action.type === 'manual_confirm'
                                    ? 'bg-primary-50/5 border-primary-50/10'
                                    : 'bg-primary-50/5 border-primary-50/10'
                                )}
                              >
                                {action.type === 'power_reduction' && (
                                  <ZapOff className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                                )}
                                {action.type === 'backup_switch' && (
                                  <Shield className="w-3.5 h-3.5 text-energy shrink-0 mt-0.5" />
                                )}
                                {action.type === 'manual_confirm' && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-50/60 shrink-0 mt-0.5" />
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    {action.type === 'power_reduction' && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning">自动降功率</span>
                                    )}
                                    {action.type === 'backup_switch' && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-energy/20 text-energy">切换备用支路</span>
                                    )}
                                    {action.type === 'manual_confirm' && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50/10 text-primary-50/60">人工确认</span>
                                    )}
                                  </div>
                                  <p className={cn(
                                    'text-xs mt-1',
                                    action.type === 'manual_confirm' ? 'text-primary-50/50' : 'text-primary-50/70'
                                  )}>{action.description}</p>
                                  <p className="text-[10px] text-primary-50/40 font-mono mt-0.5">
                                    {formatTime(action.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs text-primary-50/40 font-mono whitespace-nowrap">
                          {formatTime(alarm.timestamp)}
                        </span>
                        {!alarm.resolved && (
                          <button
                            onClick={async () => {
                              setResolvingId(alarm.id);
                              await resolveAlarm(alarm.id);
                              setResolvingId(null);
                            }}
                            disabled={resolvingId === alarm.id}
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                              resolvingId === alarm.id
                                ? 'bg-primary-50/10 text-primary-50/40 cursor-not-allowed'
                                : 'bg-energy/15 border border-energy/30 text-energy hover:bg-energy/25 hover:shadow-[0_0_8px_rgba(0,200,83,0.2)]'
                            )}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {resolvingId === alarm.id ? '处理中...' : '处理'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
