import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Zap,
  Gauge,
  Activity,
  Sun,
  FileText,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import StatCard from '@/components/ui/StatCard';
import DataTable, { Column } from '@/components/ui/DataTable';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import type { StatisticsData } from '@/../shared/types';

type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year';
type ArrayFilter = 'all' | 'A1' | 'A2' | 'A3' | 'A4';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季' },
  { value: 'year', label: '本年' },
];

const arrayOptions: { value: ArrayFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'A3', label: 'A3' },
  { value: 'A4', label: 'A4' },
];

const ARRAY_COLORS: Record<string, string> = {
  A1: '#FF8C00',
  A2: '#00C853',
  A3: '#00B0FF',
  A4: '#B388FF',
};

function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  return num.toFixed(decimals);
}

function formatDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export default function Statistics() {
  const { statisticsData, fetchStatistics } = useAppStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [arrayFilter, setArrayFilter] = useState<ArrayFilter>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const filteredData = useMemo(() => {
    let result = [...statisticsData];
    if (arrayFilter !== 'all') {
      result = result.filter((s) => s.arrayId === arrayFilter);
    }
    return result;
  }, [statisticsData, arrayFilter]);

  const summaryStats = useMemo(() => {
    const totalGen = filteredData.reduce((sum, s) => sum + s.totalGeneration, 0);
    const totalHours = filteredData.reduce((sum, s) => sum + s.equivalentHours, 0);
    const avgAvailability =
      filteredData.length > 0
        ? filteredData.reduce((sum, s) => sum + s.availability, 0) / filteredData.length
        : 0;
    const peakPower = filteredData.reduce(
      (max, s) => Math.max(max, s.peakPower),
      0
    );
    return { totalGen, totalHours, avgAvailability, peakPower };
  }, [filteredData]);

  const barChartData = useMemo(() => {
    const periodMap = new Map<string, Record<string, string | number>>();
    filteredData.forEach((s) => {
      const key = s.period;
      if (!periodMap.has(key)) {
        periodMap.set(key, { period: key });
      }
      const entry = periodMap.get(key)!;
      if (s.arrayId) {
        entry[s.arrayId] = s.totalGeneration;
      }
    });
    return Array.from(periodMap.values()).sort((a, b) =>
      String(a.period).localeCompare(String(b.period))
    );
  }, [filteredData]);

  const lineChartData = useMemo(() => {
    const days = 30;
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now.getTime() - (days - 1 - i) * 86400000);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const baseAvailability = 95 + Math.sin(i / 3) * 2;
      const arrayAvailabilities: Record<string, number> = {};
      (['A1', 'A2', 'A3', 'A4'] as const).forEach((arrId) => {
        if (arrayFilter === 'all' || arrayFilter === arrId) {
          const variation = (Math.sin(i / 5 + arrId.charCodeAt(1)) * 1.5);
          arrayAvailabilities[arrId] = Math.round((baseAvailability + variation) * 10) / 10;
        }
      });
      return {
        date: dateStr,
        ...arrayAvailabilities,
      };
    });
  }, [arrayFilter]);

  const tableColumns: Column<StatisticsData>[] = [
    {
      key: 'arrayName',
      title: '方阵',
      dataIndex: 'arrayName',
      render: (record) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: record.arrayId ? ARRAY_COLORS[record.arrayId] : '#FF8C00' }}
          />
          <span className="font-medium text-primary-50/90">{record.arrayName}</span>
        </div>
      ),
    },
    {
      key: 'period',
      title: '统计周期',
      dataIndex: 'period',
      align: 'center',
    },
    {
      key: 'totalGeneration',
      title: '发电量(kWh)',
      dataIndex: 'totalGeneration',
      align: 'right',
      render: (record) => (
        <span className="text-energy font-mono">{formatNumber(record.totalGeneration, 2)}</span>
      ),
    },
    {
      key: 'equivalentHours',
      title: '等效小时(h)',
      dataIndex: 'equivalentHours',
      align: 'right',
      render: (record) => (
        <span className="text-solar font-mono">{formatNumber(record.equivalentHours, 1)}</span>
      ),
    },
    {
      key: 'availability',
      title: '可用率(%)',
      dataIndex: 'availability',
      align: 'right',
      render: (record) => {
        const isHigh = record.availability >= 95;
        return (
          <span
            className={cn(
              'font-mono font-medium',
              isHigh ? 'text-success' : 'text-warning'
            )}
          >
            {record.availability.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'peakPower',
      title: '峰值功率(kW)',
      dataIndex: 'peakPower',
      align: 'right',
      render: (record) => (
        <span className="text-primary-50 font-mono">{formatNumber(record.peakPower, 1)}</span>
      ),
    },
  ];

  const handleExportPDF = async () => {
    if (!contentRef.current || exporting) return;
    setExporting(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: '#0A1628',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      const fileName = `太阳能电站运营报告_${formatDateYYYYMMDD(new Date())}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('导出PDF失败:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-50 text-glow-solar flex items-center gap-3">
            <FileText className="w-7 h-7 text-solar" />
            统计报表
          </h1>
          <p className="text-sm text-primary-50/50 mt-1">太阳能电站运营数据分析与统计</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300',
            'bg-gradient-solar text-primary-900 hover:shadow-glow-solar',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-900/30 border-t-primary-900 rounded-full animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              导出PDF报告
            </>
          )}
        </button>
      </div>

      <div ref={contentRef} className="space-y-6">
        <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
          <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-20 pointer-events-none" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-50/70">时间段：</span>
              <div className="flex gap-1">
                {timeRangeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeRange(opt.value)}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
                      timeRange === opt.value
                        ? 'bg-solar text-primary-900 shadow-glow-solar'
                        : 'bg-primary-50/10 text-primary-50/70 hover:bg-primary-50/20 hover:text-primary-50'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-50/70">方阵：</span>
              <div className="flex gap-1">
                {arrayOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setArrayFilter(opt.value)}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
                      arrayFilter === opt.value
                        ? 'bg-energy text-primary-900 shadow-glow-energy'
                        : 'bg-primary-50/10 text-primary-50/70 hover:bg-primary-50/20 hover:text-primary-50'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="总发电量"
            value={formatNumber(summaryStats.totalGen, 2)}
            unit="kWh"
            icon={<Zap className="w-6 h-6" />}
            color="energy"
            trend={5.2}
            trendLabel="较上周期"
          />
          <StatCard
            title="等效利用小时"
            value={formatNumber(summaryStats.totalHours, 1)}
            unit="h"
            icon={<Sun className="w-6 h-6" />}
            color="solar"
            trend={2.1}
            trendLabel="较上周期"
          />
          <StatCard
            title="设备可用率"
            value={summaryStats.avgAvailability.toFixed(1)}
            unit="%"
            icon={<Activity className="w-6 h-6" />}
            color="success"
            trend={0.5}
            trendLabel="较上周期"
          />
          <StatCard
            title="峰值功率"
            value={formatNumber(summaryStats.peakPower, 1)}
            unit="kW"
            icon={<Gauge className="w-6 h-6" />}
            color="info"
            trend={3.8}
            trendLabel="较上周期"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
            <div className="absolute inset-0 rounded-xl bg-gradient-radial-energy opacity-20 pointer-events-none" />
            <div className="relative">
              <h3 className="text-sm font-medium text-primary-50/60 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-energy" />
                各方阵月度发电量对比
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barA1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF8C00" stopOpacity={1} />
                        <stop offset="100%" stopColor="#FF8C00" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="barA2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00C853" stopOpacity={1} />
                        <stop offset="100%" stopColor="#00C853" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="barA3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00B0FF" stopOpacity={1} />
                        <stop offset="100%" stopColor="#00B0FF" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="barA4" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B388FF" stopOpacity={1} />
                        <stop offset="100%" stopColor="#B388FF" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A3A5C" vertical={false} />
                    <XAxis
                      dataKey="period"
                      stroke="#1A3A5C"
                      tick={{ fill: '#1A3A5C', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#1A3A5C"
                      tick={{ fill: '#1A3A5C', fontSize: 12 }}
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A1628',
                        border: '1px solid #1A3A5C',
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)',
                      }}
                      formatter={(value: number, name: string) => [
                        `${formatNumber(value, 2)} kWh`,
                        `方阵${name}`,
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ color: '#1A3A5C', fontSize: 12 }}
                      formatter={(value) => `方阵${value}`}
                    />
                    {arrayFilter === 'all' || arrayFilter === 'A1' ? (
                      <Bar dataKey="A1" fill="url(#barA1)" radius={[4, 4, 0, 0]} />
                    ) : null}
                    {arrayFilter === 'all' || arrayFilter === 'A2' ? (
                      <Bar dataKey="A2" fill="url(#barA2)" radius={[4, 4, 0, 0]} />
                    ) : null}
                    {arrayFilter === 'all' || arrayFilter === 'A3' ? (
                      <Bar dataKey="A3" fill="url(#barA3)" radius={[4, 4, 0, 0]} />
                    ) : null}
                    {arrayFilter === 'all' || arrayFilter === 'A4' ? (
                      <Bar dataKey="A4" fill="url(#barA4)" radius={[4, 4, 0, 0]} />
                    ) : null}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
            <div className="absolute inset-0 rounded-xl bg-gradient-radial-success opacity-20 pointer-events-none" />
            <div className="relative">
              <h3 className="text-sm font-medium text-primary-50/60 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-success" />
                近30天设备可用率趋势
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A3A5C" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#1A3A5C"
                      tick={{ fill: '#1A3A5C', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#1A3A5C"
                      tick={{ fill: '#1A3A5C', fontSize: 12 }}
                      domain={[85, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A1628',
                        border: '1px solid #1A3A5C',
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)',
                      }}
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        `方阵${name}`,
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ color: '#1A3A5C', fontSize: 12 }}
                      formatter={(value) => `方阵${value}`}
                    />
                    {arrayFilter === 'all' || arrayFilter === 'A1' ? (
                      <Line
                        type="monotone"
                        dataKey="A1"
                        stroke={ARRAY_COLORS.A1}
                        strokeWidth={2}
                        dot={{ r: 3, fill: ARRAY_COLORS.A1 }}
                        activeDot={{ r: 5 }}
                      />
                    ) : null}
                    {arrayFilter === 'all' || arrayFilter === 'A2' ? (
                      <Line
                        type="monotone"
                        dataKey="A2"
                        stroke={ARRAY_COLORS.A2}
                        strokeWidth={2}
                        dot={{ r: 3, fill: ARRAY_COLORS.A2 }}
                        activeDot={{ r: 5 }}
                      />
                    ) : null}
                    {arrayFilter === 'all' || arrayFilter === 'A3' ? (
                      <Line
                        type="monotone"
                        dataKey="A3"
                        stroke={ARRAY_COLORS.A3}
                        strokeWidth={2}
                        dot={{ r: 3, fill: ARRAY_COLORS.A3 }}
                        activeDot={{ r: 5 }}
                      />
                    ) : null}
                    {arrayFilter === 'all' || arrayFilter === 'A4' ? (
                      <Line
                        type="monotone"
                        dataKey="A4"
                        stroke={ARRAY_COLORS.A4}
                        strokeWidth={2}
                        dot={{ r: 3, fill: ARRAY_COLORS.A4 }}
                        activeDot={{ r: 5 }}
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5">
          <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-10 pointer-events-none" />
          <div className="relative">
            <h3 className="text-sm font-medium text-primary-50/60 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-solar" />
              详细统计数据
            </h3>
            <DataTable
              columns={tableColumns}
              data={filteredData}
              rowKey={(record) => `${record.arrayId}-${record.period}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
