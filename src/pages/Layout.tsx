import { useEffect, useMemo, useState } from 'react';
import {
  Sun,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Zap,
  Thermometer,
  Gauge,
  Droplets,
  Eye,
  Layers,
  TrendingUp,
  FileText,
  Wrench,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import type { StringGroup, Inverter } from '@/mock/data';

type ViewMode = 'status' | 'efficiency';

interface PanelWithStatus extends StringGroup {
  status: 'normal' | 'warning' | 'fault' | 'offline';
}

const STATUS_COLORS: Record<string, string> = {
  normal: '#00C853',
  warning: '#FFD600',
  fault: '#FF3D00',
  offline: '#4A5568',
};

const STATUS_LABELS: Record<string, string> = {
  normal: '正常',
  warning: '警告',
  fault: '故障',
  offline: '离线',
};

const getEfficiencyColor = (efficiency: number): string => {
  if (efficiency < 85) return '#FF3D00';
  if (efficiency < 92) return '#FFD600';
  return '#00C853';
};

const ARRAY_IDS = ['A1', 'A2', 'A3', 'A4'];

function derivePanelStatus(panel: StringGroup, inverter?: Inverter): PanelWithStatus['status'] {
  if (inverter?.status === 'fault') return 'fault';
  if (panel.needsCleaning) return 'warning';
  return 'normal';
}

function generateHistoryTrend(baseEfficiency: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    hour: `${i * 2}:00`,
    efficiency: Math.max(70, Math.min(99, baseEfficiency + (Math.random() - 0.5) * 8)),
  }));
}

export default function Layout() {
  const { inverters, panels, fetchDevices, workOrderList, fetchWorkOrders } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('status');
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchDevices();
    fetchWorkOrders();
  }, [fetchDevices, fetchWorkOrders]);

  const panelsWithStatus: PanelWithStatus[] = useMemo(() => {
    const inverterMap = new Map(inverters.map((inv) => [inv.id, inv]));
    return panels.map((p) => ({
      ...p,
      status: derivePanelStatus(p, inverterMap.get(p.inverterId)),
    }));
  }, [panels, inverters]);

  const stats = useMemo(() => {
    type DeviceLike = { status: 'normal' | 'warning' | 'fault' | 'offline' };
    const allDevices: DeviceLike[] = [...panelsWithStatus, ...inverters];
    const normal = allDevices.filter((d) => d.status === 'normal').length;
    const warning = allDevices.filter((d) => d.status === 'warning').length;
    const fault = allDevices.filter((d) => d.status === 'fault').length;
    const avgEfficiency =
      panelsWithStatus.length > 0
        ? panelsWithStatus.reduce((sum, p) => sum + p.efficiency, 0) / panelsWithStatus.length
        : 0;
    return { normal, warning, fault, avgEfficiency };
  }, [panelsWithStatus, inverters]);

  const selectedPanelData = useMemo(() => {
    if (!selectedPanel) return null;
    const panel = panelsWithStatus.find((p) => p.id === selectedPanel);
    if (!panel) return null;
    const inverter = inverters.find((inv) => inv.id === panel.inverterId);
    const relatedOrders = workOrderList.filter(
      (wo) => wo.deviceId === panel.id || wo.deviceId === panel.inverterId || wo.deviceId === panel.squareArrayId
    );
    const trendData = generateHistoryTrend(panel.efficiency);
    return { panel, inverter, relatedOrders, trendData };
  }, [selectedPanel, panelsWithStatus, inverters, workOrderList]);

  const getPanelColor = (panel: PanelWithStatus): string => {
    if (viewMode === 'status') {
      return STATUS_COLORS[panel.status];
    }
    return getEfficiencyColor(panel.efficiency);
  };

  const renderArray = (arrayId: string, col: number, row: number) => {
    const arrayPanels = panelsWithStatus.filter((p) => p.squareArrayId === arrayId);
    const baseX = 40 + col * 340;
    const baseY = 60 + row * 260;

    return (
      <g key={arrayId}>
        <rect
          x={baseX}
          y={baseY}
          width={320}
          height={230}
          rx={8}
          fill="rgba(26, 58, 92, 0.3)"
          stroke="#1A3A5C"
          strokeWidth={1.5}
        />
        <text
          x={baseX + 16}
          y={baseY + 24}
          fill="#1A3A5C"
          fontSize={13}
          fontWeight={600}
          fontFamily="system-ui"
        >
          方阵{arrayId}
        </text>
        <text
          x={baseX + 304}
          y={baseY + 24}
          fill="#1A3A5C"
          fontSize={11}
          textAnchor="end"
          fontFamily="JetBrains Mono, monospace"
        >
          {arrayPanels.filter((p) => p.status === 'normal').length}/{arrayPanels.length} 正常
        </text>

        {arrayPanels.map((panel, idx) => {
          const panelCol = idx % 4;
          const panelRow = Math.floor(idx / 4);
          const px = baseX + 16 + panelCol * 74;
          const py = baseY + 44 + panelRow * 90;
          const isHovered = hoveredPanel === panel.id;
          const isSelected = selectedPanel === panel.id;
          const color = getPanelColor(panel);

          return (
            <g
              key={panel.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                setHoveredPanel(panel.id);
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredPanel(null)}
              onClick={() => setSelectedPanel(panel.id === selectedPanel ? null : panel.id)}
            >
              {isSelected && (
                <rect
                  x={px - 4}
                  y={py - 4}
                  width={68}
                  height={84}
                  rx={6}
                  fill="none"
                  stroke="#FF8C00"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
              )}
              <rect
                x={px}
                y={py}
                width={60}
                height={76}
                rx={4}
                fill={color}
                fillOpacity={isHovered || isSelected ? 0.85 : 0.65}
                stroke={isHovered || isSelected ? '#FF8C00' : color}
                strokeWidth={isHovered || isSelected ? 2 : 1}
                style={{ transition: 'all 0.2s ease' }}
              />
              <g opacity={0.9}>
                {[0, 1, 2].map((r) =>
                  [0, 1, 2, 3, 4].map((c) => (
                    <rect
                      key={`${r}-${c}`}
                      x={px + 5 + c * 10}
                      y={py + 8 + r * 16}
                      width={8}
                      height={12}
                      rx={1}
                      fill="rgba(10, 22, 40, 0.45)"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={0.5}
                    />
                  ))
                )}
              </g>
              <text
                x={px + 30}
                y={py + 70}
                fill="rgba(255,255,255,0.9)"
                fontSize={9}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                {panel.name.split('-')[1]}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-solar" />
          <h1 className="text-2xl font-bold text-primary-50">电站布局可视化</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="正常设备"
          value={stats.normal}
          unit="台"
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="警告设备"
          value={stats.warning}
          unit="台"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="故障设备"
          value={stats.fault}
          unit="台"
          icon={<AlertCircle className="w-6 h-6" />}
          color="alarm"
        />
        <StatCard
          title="平均发电效率"
          value={stats.avgEfficiency.toFixed(1)}
          unit="%"
          icon={<Gauge className="w-6 h-6" />}
          color="energy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
            <h3 className="text-sm font-medium text-primary-50/60 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary-50" />
              查看模式
            </h3>
            <div className="space-y-2">
              {[
                { id: 'status' as ViewMode, label: '设备状态', icon: <AlertCircle className="w-4 h-4" /> },
                { id: 'efficiency' as ViewMode, label: '发电效率', icon: <TrendingUp className="w-4 h-4" /> },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300',
                    viewMode === mode.id
                      ? 'bg-solar/15 border-solar/50 text-solar shadow-glow-solar'
                      : 'bg-primary-50/10 border-primary-50/30 text-primary-50/70 hover:border-primary-50/50 hover:text-primary-50'
                  )}
                >
                  {mode.icon}
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
            <h3 className="text-sm font-medium text-primary-50/60 mb-4">设备状态图例</h3>
            <div className="space-y-3">
              {(['normal', 'warning', 'fault', 'offline'] as const).map((status) => (
                <div key={status} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: STATUS_COLORS[status], boxShadow: `0 0 8px ${STATUS_COLORS[status]}60` }}
                  />
                  <span className="text-sm text-primary-50/80">{STATUS_LABELS[status]}</span>
                </div>
              ))}
            </div>
          </div>

          {viewMode === 'efficiency' && (
            <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
              <h3 className="text-sm font-medium text-primary-50/60 mb-4">发电效率热力图</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#FF3D00', boxShadow: '0 0 8px rgba(255,61,0,0.4)' }}
                  />
                  <span className="text-sm text-primary-50/80">{'< 85% 低效'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#FFD600', boxShadow: '0 0 8px rgba(255,214,0,0.4)' }}
                  />
                  <span className="text-sm text-primary-50/80">85% - 92% 正常</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#00C853', boxShadow: '0 0 8px rgba(0,200,83,0.4)' }}
                  />
                  <span className="text-sm text-primary-50/80">{'≥ 92% 高效'}</span>
                </div>
                <div className="mt-4 h-3 rounded-full overflow-hidden"
                  style={{ background: 'linear-gradient(90deg, #FF3D00 0%, #FFD600 50%, #00C853 100%)' }}
                />
                <div className="flex justify-between text-xs text-primary-50/50 font-mono">
                  <span>70%</span>
                  <span>85%</span>
                  <span>92%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5 min-h-[600px]">
          <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-10 pointer-events-none" />
          <div className="relative h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-primary-50/60 flex items-center gap-2">
                <Sun className="w-4 h-4 text-solar" />
                方阵布局视图
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-50/10 text-primary-50/60 text-xs">
                  {viewMode === 'status' ? '设备状态模式' : '发电效率模式'}
                </span>
              </h3>
            </div>
            <div className="flex-1 relative overflow-auto">
              <svg viewBox="0 0 760 600" className="w-full h-full" style={{ minHeight: '520px' }}>
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A3A5C" strokeWidth="0.3" opacity="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {ARRAY_IDS.map((id, idx) => renderArray(id, idx % 2, Math.floor(idx / 2)))}
              </svg>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {selectedPanelData ? (
            <>
              <div className="relative p-5 rounded-xl backdrop-blur-md border border-solar/40 bg-solar/5">
                <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-20 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-solar flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      组串详情
                    </h3>
                    <button
                      onClick={() => setSelectedPanel(null)}
                      className="text-primary-50/50 hover:text-primary-50/80 text-xs"
                    >
                      关闭
                    </button>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-primary-50">{selectedPanelData.panel.name}</span>
                      <StatusBadge status={selectedPanelData.panel.status} />
                    </div>
                    <p className="text-xs text-primary-50/50">ID: {selectedPanelData.panel.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-primary-50/10">
                      <div className="flex items-center gap-2 text-primary-50/50 text-xs mb-1">
                        <Zap className="w-3 h-3" />
                        功率
                      </div>
                      <div className="text-lg font-mono font-bold text-solar">
                        {selectedPanelData.panel.currentPower.toFixed(1)}
                        <span className="text-xs text-primary-50/50 ml-1">kW</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-50/10">
                      <div className="flex items-center gap-2 text-primary-50/50 text-xs mb-1">
                        <TrendingUp className="w-3 h-3" />
                        效率
                      </div>
                      <div className="text-lg font-mono font-bold text-energy">
                        {selectedPanelData.panel.efficiency.toFixed(1)}
                        <span className="text-xs text-primary-50/50 ml-1">%</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-50/10">
                      <div className="flex items-center gap-2 text-primary-50/50 text-xs mb-1">
                        <Zap className="w-3 h-3" />
                        电流
                      </div>
                      <div className="text-lg font-mono font-bold text-primary-50">
                        {selectedPanelData.panel.current.toFixed(2)}
                        <span className="text-xs text-primary-50/50 ml-1">A</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-50/10">
                      <div className="flex items-center gap-2 text-primary-50/50 text-xs mb-1">
                        <Zap className="w-3 h-3" />
                        电压
                      </div>
                      <div className="text-lg font-mono font-bold text-primary-50">
                        {selectedPanelData.panel.voltage.toFixed(1)}
                        <span className="text-xs text-primary-50/50 ml-1">V</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-50/10">
                      <div className="flex items-center gap-2 text-primary-50/50 text-xs mb-1">
                        <Thermometer className="w-3 h-3" />
                        温度
                      </div>
                      <div className="text-lg font-mono font-bold text-warning">
                        {selectedPanelData.panel.temperature.toFixed(1)}
                        <span className="text-xs text-primary-50/50 ml-1">℃</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-50/10">
                      <div className="flex items-center gap-2 text-primary-50/50 text-xs mb-1">
                        <Droplets className="w-3 h-3" />
                        清洗状态
                      </div>
                      <div className={cn(
                        'text-sm font-bold',
                        selectedPanelData.panel.needsCleaning ? 'text-warning' : 'text-energy'
                      )}>
                        {selectedPanelData.panel.needsCleaning ? '需清洗' : '正常'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPanelData.inverter && (
                <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
                  <h3 className="text-sm font-medium text-primary-50/60 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-energy" />
                    关联逆变器
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-50/70">{selectedPanelData.inverter.name}</span>
                      <StatusBadge status={selectedPanelData.inverter.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-primary-50/50">型号: <span className="text-primary-50/80 font-mono">{selectedPanelData.inverter.model}</span></div>
                      <div className="text-primary-50/50">效率: <span className="text-energy font-mono">{selectedPanelData.inverter.efficiency}%</span></div>
                      <div className="text-primary-50/50">功率: <span className="text-primary-50/80 font-mono">{selectedPanelData.inverter.currentPower.toFixed(1)} kW</span></div>
                      <div className="text-primary-50/50">温度: <span className="text-warning font-mono">{selectedPanelData.inverter.temperature.toFixed(1)}℃</span></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
                <h3 className="text-sm font-medium text-primary-50/60 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-solar" />
                  效率趋势 (24h)
                </h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedPanelData.trendData}>
                      <defs>
                        <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#FF3D00" />
                          <stop offset="50%" stopColor="#FFD600" />
                          <stop offset="100%" stopColor="#00C853" />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" tick={{ fill: '#1A3A5C', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[70, 100]} tick={{ fill: '#1A3A5C', fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0A1628',
                          border: '1px solid #1A3A5C',
                          borderRadius: '6px',
                          fontSize: '11px',
                        }}
                        labelStyle={{ color: '#1A3A5C' }}
                        itemStyle={{ color: '#00C853' }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, '效率']}
                      />
                      <Line type="monotone" dataKey="efficiency" stroke="url(#trendStroke)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
                <h3 className="text-sm font-medium text-primary-50/60 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-warning" />
                  关联工单
                  {selectedPanelData.relatedOrders.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs">
                      {selectedPanelData.relatedOrders.length}
                    </span>
                  )}
                </h3>
                {selectedPanelData.relatedOrders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPanelData.relatedOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="p-2 rounded-lg bg-primary-50/10 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-primary-50/90 font-medium truncate">{order.deviceName}</span>
                          <StatusBadge status={order.status as 'pending' | 'assigned' | 'processing' | 'completed'} showDot={false} className="text-[10px] px-1.5 py-0.5" />
                        </div>
                        <p className="text-primary-50/50 truncate">{order.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-primary-50/40 text-center py-4">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    暂无关联工单
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5 h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-primary-50/10 flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-primary-50/30" />
              </div>
              <p className="text-sm text-primary-50/50 text-center">
                点击组串查看详细信息
              </p>
            </div>
          )}
        </div>
      </div>

      {hoveredPanel && (() => {
        const panel = panelsWithStatus.find((p) => p.id === hoveredPanel);
        if (!panel) return null;
        return (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPos.x + 16,
              top: tooltipPos.y + 16,
            }}
          >
            <div className="p-3 rounded-lg border border-primary-50/40 bg-primary-50/95 backdrop-blur-md shadow-xl min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-primary-50">{panel.name}</span>
                <StatusBadge status={panel.status} showDot={true} className="text-[10px] px-1.5 py-0.5" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-primary-50/50">功率</span>
                  <span className="text-solar font-mono font-medium">{panel.currentPower.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-50/50">效率</span>
                  <span className={cn(
                    'font-mono font-medium',
                    panel.efficiency >= 92 ? 'text-energy' : panel.efficiency >= 85 ? 'text-warning' : 'text-alarm'
                  )}>
                    {panel.efficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-50/50">电流</span>
                  <span className="text-primary-50/80 font-mono">{panel.current.toFixed(2)} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-50/50">电压</span>
                  <span className="text-primary-50/80 font-mono">{panel.voltage.toFixed(1)} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-50/50">温度</span>
                  <span className="text-warning font-mono">{panel.temperature.toFixed(1)} ℃</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-50/50">清洗状态</span>
                  <span className={cn(
                    'font-medium',
                    panel.needsCleaning ? 'text-warning' : 'text-energy'
                  )}>
                    {panel.needsCleaning ? '需清洗' : '正常'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
