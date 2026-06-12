import { useEffect, useState, useMemo } from 'react';
import {
  Wrench,
  Sparkles,
  Shield,
  Plus,
  User,
  Users,
  Clock,
  X,
  CheckCircle2,
  Send,
  Filter,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import type { WorkOrder } from '@/../shared/types';

type WorkOrderType = 'maintenance' | 'cleaning' | 'repair';
type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'completed';
type FilterType = 'all' | WorkOrderType;

const typeConfig: Record<WorkOrderType, {
  label: string;
  icon: typeof Wrench;
  color: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  maintenance: {
    label: '维保',
    icon: Shield,
    color: 'text-solar',
    bg: 'bg-solar/15',
    border: 'border-solar/40',
    glow: 'shadow-[0_0_12px_rgba(255,140,0,0.4)]',
  },
  cleaning: {
    label: '清洗',
    icon: Sparkles,
    color: 'text-primary-50',
    bg: 'bg-primary-50/15',
    border: 'border-primary-50/40',
    glow: 'shadow-[0_0_12px_rgba(26,58,92,0.6)]',
  },
  repair: {
    label: '维修',
    icon: Wrench,
    color: 'text-alarm',
    bg: 'bg-alarm/15',
    border: 'border-alarm/40',
    glow: 'shadow-[0_0_12px_rgba(255,61,0,0.4)]',
  },
};

const statusColumns: { key: WorkOrderStatus; label: string; color: string; accent: string }[] = [
  { key: 'pending', label: '待分配', color: 'border-warning/40 bg-warning/5', accent: 'text-warning' },
  { key: 'assigned', label: '已分配', color: 'border-solar/40 bg-solar/5', accent: 'text-solar' },
  { key: 'processing', label: '处理中', color: 'border-solar/40 bg-solar/5', accent: 'text-solar' },
  { key: 'completed', label: '已完成', color: 'border-energy/40 bg-energy/5', accent: 'text-energy' },
];

const mockOperators = ['李师傅', '王师傅', '赵师傅', '张师傅', '陈师傅'];
const mockTeams = ['运维一组', '运维二组', '运维三组', '应急抢修组'];

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateText(text: string, maxLen: number = 50): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

interface WorkOrderCardProps {
  order: WorkOrder;
  onClick: () => void;
}

function WorkOrderCard({ order, onClick }: WorkOrderCardProps) {
  const tConfig = typeConfig[order.type];
  const TypeIcon = tConfig.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative p-4 rounded-xl border backdrop-blur-sm cursor-pointer',
        'bg-primary-50/5 border-primary-50/30',
        'hover:border-solar/50 hover:bg-primary-50/10 transition-all duration-300',
        'hover:shadow-[0_0_20px_rgba(255,140,0,0.15)]'
      )}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-300" />
      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center border',
              tConfig.bg, tConfig.border
            )}>
              <TypeIcon className={cn('w-4 h-4', tConfig.color)} />
            </div>
            <div>
              <span className="text-xs font-mono text-primary-50/60">{order.id}</span>
              <div className="text-sm font-medium text-primary-50/90 truncate max-w-[160px]">
                {order.deviceName}
              </div>
            </div>
          </div>
          <StatusBadge status={order.status} showDot />
        </div>

        <p className="text-sm text-primary-50/60 leading-relaxed">
          {truncateText(order.description, 60)}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-primary-50/20">
          <div className="flex items-center gap-1.5 text-xs text-primary-50/50">
            {order.assignee ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>{order.assignee}</span>
                {order.team && (
                  <>
                    <span className="text-primary-50/30">|</span>
                    <Users className="w-3.5 h-3.5" />
                    <span>{order.team}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-warning/70">未分配</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-primary-50/40">
            <Clock className="w-3 h-3" />
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-primary-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-xl border border-primary-50/40 bg-primary-500/95 backdrop-blur-xl shadow-[0_0_40px_rgba(255,140,0,0.15)]">
        <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-20 pointer-events-none" />
        <div className="relative flex items-center justify-between p-4 border-b border-primary-50/30">
          <h3 className="text-base font-semibold text-primary-50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-solar" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-primary-50/50 hover:text-primary-50 hover:bg-primary-50/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="relative p-5">{children}</div>
      </div>
    </div>
  );
}

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  order: WorkOrder | null;
  onConfirm: (assignee: string, team?: string) => void;
}

function AssignModal({ open, onClose, order, onConfirm }: AssignModalProps) {
  const [assignee, setAssignee] = useState('');
  const [team, setTeam] = useState('');

  useEffect(() => {
    if (open) {
      setAssignee(order?.assignee || '');
      setTeam(order?.team || '');
    }
  }, [open, order]);

  const handleConfirm = () => {
    if (!assignee.trim()) return;
    onConfirm(assignee, team || undefined);
  };

  return (
    <Modal open={open} onClose={onClose} title={`分配工单 - ${order?.id || ''}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-primary-50/60 mb-2">运维人员 *</label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-primary-50/10 border border-primary-50/30 text-sm text-primary-50 focus:outline-none focus:border-solar/50 transition-colors"
          >
            <option value="">请选择运维人员</option>
            {mockOperators.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-primary-50/60 mb-2">所属班组</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-primary-50/10 border border-primary-50/30 text-sm text-primary-50 focus:outline-none focus:border-solar/50 transition-colors"
          >
            <option value="">请选择班组（可选）</option>
            {mockTeams.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm text-primary-50/70 border border-primary-50/30 hover:bg-primary-50/10 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!assignee.trim()}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all',
              assignee.trim()
                ? 'bg-gradient-solar text-primary-900 hover:shadow-glow-solar'
                : 'bg-primary-50/10 text-primary-50/30 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
            确认分配
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface CompleteModalProps {
  open: boolean;
  onClose: () => void;
  order: WorkOrder | null;
  onConfirm: () => void;
}

function CompleteModal({ open, onClose, order, onConfirm }: CompleteModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={`完成工单 - ${order?.id || ''}`}>
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-energy/10 border border-energy/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-energy shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-energy">确认完成此工单？</p>
              <p className="text-xs text-primary-50/60 mt-1">
                {order?.deviceName} - {order?.description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm text-primary-50/70 border border-primary-50/30 hover:bg-primary-50/10 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-energy text-primary-900 hover:shadow-glow-energy transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            确认完成
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    deviceType: 'inverter' | 'panel' | 'battery';
    deviceId: string;
    type: WorkOrderType;
    description: string;
  }) => void;
}

function CreateModal({ open, onClose, onConfirm }: CreateModalProps) {
  const [deviceType, setDeviceType] = useState<'inverter' | 'panel' | 'battery'>('inverter');
  const [deviceId, setDeviceId] = useState('');
  const [type, setType] = useState<WorkOrderType>('maintenance');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setDeviceType('inverter');
      setDeviceId('');
      setType('maintenance');
      setDescription('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!deviceId.trim() || !description.trim()) return;
    onConfirm({ deviceType, deviceId: deviceId.trim(), type, description: description.trim() });
  };

  const isValid = deviceId.trim() && description.trim();

  return (
    <Modal open={open} onClose={onClose} title="新建工单">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-primary-50/60 mb-2">设备类型 *</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value as 'inverter' | 'panel' | 'battery')}
              className="w-full px-3 py-2.5 rounded-lg bg-primary-50/10 border border-primary-50/30 text-sm text-primary-50 focus:outline-none focus:border-solar/50 transition-colors"
            >
              <option value="inverter">逆变器</option>
              <option value="panel">组串</option>
              <option value="battery">储能电池</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-primary-50/60 mb-2">设备ID *</label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="如 INV-001"
              className="w-full px-3 py-2.5 rounded-lg bg-primary-50/10 border border-primary-50/30 text-sm text-primary-50 placeholder:text-primary-50/30 focus:outline-none focus:border-solar/50 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-primary-50/60 mb-2">工单类型 *</label>
          <div className="grid grid-cols-3 gap-2">
            {(['maintenance', 'cleaning', 'repair'] as WorkOrderType[]).map((t) => {
              const tc = typeConfig[t];
              const Icon = tc.icon;
              const active = type === t;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border transition-all',
                    active
                      ? `${tc.bg} ${tc.border} ${tc.color}`
                      : 'bg-primary-50/5 border-primary-50/20 text-primary-50/50 hover:border-primary-50/40'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-xs text-primary-50/60 mb-2">工单描述 *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="请输入工单详细描述..."
            className="w-full px-3 py-2.5 rounded-lg bg-primary-50/10 border border-primary-50/30 text-sm text-primary-50 placeholder:text-primary-50/30 focus:outline-none focus:border-solar/50 transition-colors resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm text-primary-50/70 border border-primary-50/30 hover:bg-primary-50/10 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all',
              isValid
                ? 'bg-gradient-solar text-primary-900 hover:shadow-glow-solar'
                : 'bg-primary-50/10 text-primary-50/30 cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
            创建工单
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function WorkOrders() {
  const {
    workOrderList,
    fetchWorkOrders,
    createWorkOrder,
    assignWorkOrder,
    completeWorkOrder,
  } = useAppStore();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const filteredOrders = useMemo(() => {
    if (filterType === 'all') return workOrderList;
    return workOrderList.filter((o) => o.type === filterType);
  }, [workOrderList, filterType]);

  const groupedOrders = useMemo(() => {
    const groups: Record<WorkOrderStatus, WorkOrder[]> = {
      pending: [],
      assigned: [],
      processing: [],
      completed: [],
    };
    filteredOrders.forEach((o) => {
      groups[o.status].push(o);
    });
    return groups;
  }, [filteredOrders]);

  const handleCardClick = (order: WorkOrder) => {
    setSelectedOrder(order);
    if (order.status === 'pending') {
      setAssignModalOpen(true);
    } else if (order.status === 'processing') {
      setCompleteModalOpen(true);
    }
  };

  const handleAssign = async (assignee: string, team?: string) => {
    if (!selectedOrder) return;
    await assignWorkOrder(selectedOrder.id, assignee, team);
    setAssignModalOpen(false);
    setSelectedOrder(null);
  };

  const handleComplete = async () => {
    if (!selectedOrder) return;
    await completeWorkOrder(selectedOrder.id);
    setCompleteModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCreate = async (data: {
    deviceType: 'inverter' | 'panel' | 'battery';
    deviceId: string;
    type: WorkOrderType;
    description: string;
  }) => {
    await createWorkOrder({
      type: data.type,
      status: 'pending',
      deviceId: data.deviceId,
      deviceType: data.deviceType,
      deviceName: data.deviceId,
      description: data.description,
      partsUsed: [],
    });
    setCreateModalOpen(false);
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'maintenance', label: '维保' },
    { key: 'cleaning', label: '清洗' },
    { key: 'repair', label: '维修' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-50 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-solar" />
            工单管理
          </h1>
          <p className="text-sm text-primary-50/50 mt-1">
            管理光伏电站运维工单，实时追踪工单处理进度
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-solar text-primary-900 font-medium hover:shadow-glow-solar transition-all"
        >
          <Plus className="w-4 h-4" />
          新建工单
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-primary-50/50" />
        <span className="text-xs text-primary-50/50">工单类型：</span>
        {filterOptions.map((opt) => {
          const active = filterType === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setFilterType(opt.key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                active
                  ? 'bg-solar/15 border-solar/40 text-solar'
                  : 'bg-primary-50/5 border-primary-50/20 text-primary-50/60 hover:border-primary-border-primary-50/40 hover:text-primary-50'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statusColumns.map((col) => (
          <div
            key={col.key}
            className={cn(
              'relative rounded-xl border backdrop-blur-sm p-4 min-h-[400px]',
              col.color
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full animate-pulse', col.accent.replace('text-', 'bg-'))} />
                <h3 className={cn('text-sm font-semibold', col.accent)}>
                  {col.label}
                </h3>
              </div>
              <span className={cn(
                'px-2 py-0.5 rounded-md text-xs font-mono font-medium',
                'bg-primary-50/10 border border-primary-50/20',
                col.accent
              )}>
                {groupedOrders[col.key].length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedOrders[col.key].length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-primary-50/30">
                  <FileText className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs">暂无工单</p>
                </div>
              ) : (
                groupedOrders[col.key].map((order) => (
                  <WorkOrderCard
                    key={order.id}
                    order={order}
                    onClick={() => handleCardClick(order)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <AssignModal
        open={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onConfirm={handleAssign}
      />

      <CompleteModal
        open={completeModalOpen}
        onClose={() => { setCompleteModalOpen(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onConfirm={handleComplete}
      />

      <CreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={handleCreate}
      />
    </div>
  );
}
