import { useEffect, useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  User,
  FileText,
  TrendingDown,
  PackageCheck,
  PackageMinus,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import type { SparePart, StockRecord } from '@/../shared/types';

type TabType = 'stock' | 'records';

const CATEGORIES = ['全部', '光伏组件', '逆变器', '储能电池', '汇流箱', '监控设备', '电缆配件'];

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStockProgressColor(stock: number, safeStock: number): string {
  const ratio = stock / safeStock;
  if (ratio <= 0.5) return 'bg-alarm';
  if (ratio <= 1) return 'bg-warning';
  return 'bg-energy';
}

function getStockProgressWidth(stock: number, safeStock: number): number {
  const max = Math.max(stock, safeStock * 2);
  return Math.min(100, (stock / max) * 100);
}

interface SparePartCardProps {
  part: SparePart;
  onStockIn: (part: SparePart) => void;
  onStockOut: (part: SparePart) => void;
}

function SparePartCard({ part, onStockIn, onStockOut }: SparePartCardProps) {
  const isLowStock = part.stock < part.safeStock;
  const progressColor = getStockProgressColor(part.stock, part.safeStock);
  const progressWidth = getStockProgressWidth(part.stock, part.safeStock);

  return (
    <div
      className={cn(
        'group relative rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-300',
        'bg-primary-50/5 border-primary-50/30',
        'hover:border-solar/50 hover:bg-primary-50/10',
        'hover:shadow-[0_0_20px_rgba(255,140,0,0.15)]',
        isLowStock && 'border-alarm/40 hover:border-alarm/60'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-300',
          isLowStock ? 'bg-gradient-radial-alarm' : 'bg-gradient-radial-solar'
        )}
      />
      <div className="relative p-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center border shrink-0',
                isLowStock ? 'bg-alarm/15 border-alarm/40' : 'bg-solar/15 border-solar/40'
              )}
            >
              <Package
                className={cn(
                  'w-5 h-5',
                  isLowStock ? 'text-alarm' : 'text-solar'
                )}
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-primary-50/90 truncate">
                {part.name}
              </div>
              <div className="text-xs text-primary-50/50 mt-0.5">{part.category}</div>
            </div>
          </div>
          {isLowStock && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-alarm/15 border border-alarm/40 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-alarm" />
              <span className="text-xs font-medium text-alarm">预警</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-primary-50">
                {part.stock}
              </span>
              <span className="text-sm text-primary-50/50 ml-1">{part.unit}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-primary-50/40">安全库存</span>
              <div className="text-sm font-mono text-primary-50/70">
                {part.safeStock} {part.unit}
              </div>
            </div>
          </div>

          <div className="relative h-2 rounded-full bg-primary-50/10 overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                progressColor,
                isLowStock && 'animate-pulse'
              )}
              style={{ width: `${progressWidth}%` }}
            />
            <div
              className="absolute inset-y-0 w-px bg-primary-50/30"
              style={{ left: `${(part.safeStock / Math.max(part.stock, part.safeStock * 2)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-primary-50/40">
            <span>0</span>
            <span>安全线</span>
            <span>{Math.max(part.stock, part.safeStock * 2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-primary-50/40 pt-2 border-t border-primary-50/20">
          <Clock className="w-3 h-3" />
          <span>最后更新: {formatDateTime(part.lastUpdated)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onStockIn(part)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              bg-energy/10 border border-energy/30 text-energy
              hover:bg-energy/20 hover:border-energy/50 transition-all duration-200"
          >
            <ArrowDownCircle className="w-4 h-4" />
            入库
          </button>
          <button
            onClick={() => onStockOut(part)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              bg-solar/10 border border-solar/30 text-solar
              hover:bg-solar/20 hover:border-solar/50 transition-all duration-200"
          >
            <ArrowUpCircle className="w-4 h-4" />
            出库
          </button>
        </div>
      </div>
    </div>
  );
}

interface WarningItemProps {
  part: SparePart;
}

function WarningItem({ part }: WarningItemProps) {
  const shortage = part.safeStock - part.stock;
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-alarm/5 border border-alarm/20 hover:bg-alarm/10 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-md bg-alarm/15 flex items-center justify-center shrink-0">
          <TrendingDown className="w-3.5 h-3.5 text-alarm animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-primary-50/90 truncate">{part.name}</div>
          <div className="text-xs text-primary-50/40">{part.category}</div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="text-xs font-mono text-alarm">
          {part.stock}/{part.safeStock} {part.unit}
        </div>
        <div className="text-xs text-alarm/70">缺 {shortage} {part.unit}</div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { spareParts, stockRecords, stockIn, stockOut, user, fetchInventory, fetchStockRecords } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('stock');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const [stockInModal, setStockInModal] = useState<{ part: SparePart; quantity: string } | null>(null);
  const [stockOutModal, setStockOutModal] = useState<{ part: SparePart; quantity: string; error: string } | null>(null);

  useEffect(() => {
    fetchInventory();
    fetchStockRecords();
  }, [fetchInventory, fetchStockRecords]);

  const lowStockParts = useMemo(
    () => spareParts.filter((p) => p.stock < p.safeStock),
    [spareParts]
  );

  const filteredParts = useMemo(() => {
    return spareParts.filter((p) => {
      const matchKeyword =
        !searchKeyword ||
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.category.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchCategory = selectedCategory === '全部' || p.category === selectedCategory;
      return matchKeyword && matchCategory;
    });
  }, [spareParts, searchKeyword, selectedCategory]);

  const filteredRecords = useMemo(() => {
    return stockRecords.filter((r) => {
      const matchKeyword =
        !searchKeyword ||
        r.partName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.operator.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchKeyword;
    });
  }, [stockRecords, searchKeyword]);

  const handleStockIn = (part: SparePart) => {
    setStockInModal({ part, quantity: '' });
  };

  const handleStockOut = (part: SparePart) => {
    setStockOutModal({ part, quantity: '', error: '' });
  };

  const confirmStockIn = async () => {
    if (!stockInModal) return;
    const qty = parseInt(stockInModal.quantity, 10);
    if (!qty || qty <= 0) return;
    await stockIn(stockInModal.part.id, qty, user?.name || '未知');
    setStockInModal(null);
  };

  const confirmStockOut = async () => {
    if (!stockOutModal) return;
    const qty = parseInt(stockOutModal.quantity, 10);
    if (!qty || qty <= 0) return;
    if (qty > stockOutModal.part.stock) {
      setStockOutModal((prev) => prev ? { ...prev, error: '库存不足，无法出库' } : prev);
      return;
    }
    const success = await stockOut(stockOutModal.part.id, qty, user?.name || '未知');
    if (success) {
      setStockOutModal(null);
    }
  };

  const recordColumns: Column<StockRecord>[] = [
    {
      key: 'timestamp',
      title: '时间',
      width: 160,
      render: (record) => (
        <div className="flex items-center gap-1.5 text-xs text-primary-50/70 font-mono">
          <Clock className="w-3.5 h-3.5 text-primary-50/40" />
          {formatDateTime(record.timestamp)}
        </div>
      ),
    },
    {
      key: 'partName',
      title: '备件名称',
      render: (record) => (
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-solar/60" />
          <span className="text-sm text-primary-50/90">{record.partName}</span>
        </div>
      ),
    },
    {
      key: 'type',
      title: '操作类型',
      width: 100,
      align: 'center',
      render: (record) =>
        record.type === 'in' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
            bg-energy/15 border border-energy/40 text-energy">
            <PackageCheck className="w-3 h-3" />
            入库
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
            bg-solar/15 border border-solar/40 text-solar">
            <PackageMinus className="w-3 h-3" />
            出库
          </span>
        ),
    },
    {
      key: 'quantity',
      title: '数量',
      width: 100,
      align: 'right',
      render: (record) => (
        <span
          className={cn(
            'text-sm font-mono font-semibold',
            record.type === 'in' ? 'text-energy' : 'text-solar'
          )}
        >
          {record.type === 'in' ? '+' : '-'}{record.quantity}
        </span>
      ),
    },
    {
      key: 'workOrderId',
      title: '关联工单',
      width: 140,
      render: (record) =>
        record.workOrderId ? (
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary-50/40" />
            <span className="text-xs font-mono text-primary-50/70 hover:text-solar cursor-pointer transition-colors">
              {record.workOrderId}
            </span>
            <ChevronRight className="w-3 h-3 text-primary-50/30" />
          </div>
        ) : (
          <span className="text-xs text-primary-50/30">-</span>
        ),
    },
    {
      key: 'operator',
      title: '操作人员',
      render: (record) => (
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-primary-50/40" />
          <span className="text-sm text-primary-50/80">{record.operator}</span>
        </div>
      ),
    },
  ];

  const tabs: { key: TabType; label: string; icon: typeof Package }[] = [
    { key: 'stock', label: '备件库存', icon: Package },
    { key: 'records', label: '出入库记录', icon: FileText },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-50 flex items-center gap-2">
          <Package className="w-7 h-7 text-solar" />
          库存管理
        </h1>
        <p className="text-sm text-primary-50/50 mt-1">
          管理光伏电站备件库存，实时监控库存水平和出入库记录
        </p>
      </div>

      {lowStockParts.length > 0 && (
        <div className="relative rounded-xl border border-alarm/40 bg-alarm/5 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial-alarm opacity-20 pointer-events-none" />
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-alarm/15 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-alarm" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-alarm">库存预警</h3>
                  <p className="text-xs text-primary-50/50">
                    以下备件库存已低于安全库存，请及时补充
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-alarm/15 border border-alarm/40 text-alarm text-sm font-bold font-mono animate-pulse">
                {lowStockParts.length} 项预警
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {lowStockParts.map((part) => (
                <WarningItem key={part.id} part={part} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-50/40" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={activeTab === 'stock' ? '搜索备件名称、类别...' : '搜索备件名称、操作人员...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-primary-50/10 border border-primary-50/30
              text-sm text-primary-50 placeholder:text-primary-50/30
              focus:outline-none focus:border-solar/50 transition-colors"
          />
        </div>
        {activeTab === 'stock' && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-primary-50/50" />
            <span className="text-xs text-primary-50/50">类别：</span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                    active
                      ? 'bg-solar/15 border-solar/40 text-solar'
                      : 'bg-primary-50/5 border-primary-50/20 text-primary-50/60 hover:border-primary-50/40 hover:text-primary-50'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-lg bg-primary-50/5 border border-primary-50/20 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-solar/15 text-solar shadow-[inset_0_0_10px_rgba(255,140,0,0.1)]'
                  : 'text-primary-50/50 hover:text-primary-50 hover:bg-primary-50/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'stock' && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs font-mono',
                    active ? 'bg-solar/20 text-solar' : 'bg-primary-50/10 text-primary-50/50'
                  )}
                >
                  {filteredParts.length}
                </span>
              )}
              {tab.key === 'records' && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs font-mono',
                    active ? 'bg-solar/20 text-solar' : 'bg-primary-50/10 text-primary-50/50'
                  )}
                >
                  {filteredRecords.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'stock' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredParts.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-primary-50/30">
              <Package className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">未找到匹配的备件</p>
            </div>
          ) : (
            filteredParts.map((part) => (
              <SparePartCard
                key={part.id}
                part={part}
                onStockIn={handleStockIn}
                onStockOut={handleStockOut}
              />
            ))
          )}
        </div>
      ) : (
        <DataTable<StockRecord>
          columns={recordColumns}
          data={filteredRecords}
          rowKey="id"
          emptyText="暂无出入库记录"
        />
      )}

      {stockInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setStockInModal(null)}>
          <div className="w-full max-w-md rounded-xl border border-primary-50/30 bg-primary-950/95 backdrop-blur-md p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-energy/15 border border-energy/40 flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-energy" />
              </div>
              <h2 className="text-lg font-semibold text-primary-50">备件入库</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary-50/5 border border-primary-50/20">
                <span className="text-sm text-primary-50/60">备件名称</span>
                <span className="text-sm font-medium text-primary-50/90">{stockInModal.part.name}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary-50/5 border border-primary-50/20">
                <span className="text-sm text-primary-50/60">当前库存</span>
                <span className="text-sm font-mono font-semibold text-primary-50">{stockInModal.part.stock} {stockInModal.part.unit}</span>
              </div>
              <div>
                <label className="block text-sm text-primary-50/60 mb-1.5">入库数量</label>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={stockInModal.quantity}
                  onChange={(e) => setStockInModal((prev) => prev ? { ...prev, quantity: e.target.value } : prev)}
                  className="w-full px-3 py-2.5 rounded-lg bg-primary-50/10 border border-primary-50/30
                    text-sm text-primary-50 placeholder:text-primary-50/30
                    focus:outline-none focus:border-energy/50 transition-colors"
                  placeholder="请输入入库数量"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStockInModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-50/10 border border-primary-50/20
                  text-primary-50/70 hover:bg-primary-50/15 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmStockIn}
                disabled={!stockInModal.quantity || parseInt(stockInModal.quantity, 10) <= 0}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-energy/15 border border-energy/40
                  text-energy hover:bg-energy/25 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                确认入库
              </button>
            </div>
          </div>
        </div>
      )}

      {stockOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setStockOutModal(null)}>
          <div className="w-full max-w-md rounded-xl border border-primary-50/30 bg-primary-950/95 backdrop-blur-md p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-solar/15 border border-solar/40 flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-solar" />
              </div>
              <h2 className="text-lg font-semibold text-primary-50">备件出库</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary-50/5 border border-primary-50/20">
                <span className="text-sm text-primary-50/60">备件名称</span>
                <span className="text-sm font-medium text-primary-50/90">{stockOutModal.part.name}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary-50/5 border border-primary-50/20">
                <span className="text-sm text-primary-50/60">当前库存</span>
                <span className="text-sm font-mono font-semibold text-primary-50">{stockOutModal.part.stock} {stockOutModal.part.unit}</span>
              </div>
              <div>
                <label className="block text-sm text-primary-50/60 mb-1.5">出库数量</label>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={stockOutModal.quantity}
                  onChange={(e) => setStockOutModal((prev) => prev ? { ...prev, quantity: e.target.value, error: '' } : prev)}
                  className="w-full px-3 py-2.5 rounded-lg bg-primary-50/10 border border-primary-50/30
                    text-sm text-primary-50 placeholder:text-primary-50/30
                    focus:outline-none focus:border-solar/50 transition-colors"
                  placeholder="请输入出库数量"
                />
              </div>
              {stockOutModal.error && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-alarm/10 border border-alarm/30">
                  <AlertTriangle className="w-4 h-4 text-alarm shrink-0" />
                  <span className="text-sm text-alarm">{stockOutModal.error}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStockOutModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-50/10 border border-primary-50/20
                  text-primary-50/70 hover:bg-primary-50/15 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmStockOut}
                disabled={!stockOutModal.quantity || parseInt(stockOutModal.quantity, 10) <= 0}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-solar/15 border border-solar/40
                  text-solar hover:bg-solar/25 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                确认出库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
