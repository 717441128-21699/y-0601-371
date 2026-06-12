import { useState, useEffect } from 'react';
import {
  Zap,
  Settings2,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Sun,
  Droplets,
  Battery,
  Gauge,
  Calendar,
  Clock,
} from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppStore } from '@/store';
import type { SchedulePlan } from '@/../shared/types';
import { cn } from '@/lib/utils';

interface DispatchParams {
  cleaningThreshold: number;
  inverterEfficiencyDrop: number;
  minSoc: number;
  maxSoc: number;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Scheduling() {
  const {
    user,
    scheduleList,
    fetchSchedules,
    approveSchedule,
    rejectSchedule,
  } = useAppStore();

  const [params, setParams] = useState<DispatchParams>({
    cleaningThreshold: 10,
    inverterEfficiencyDrop: 5,
    minSoc: 20,
    maxSoc: 95,
  });

  const [tempParams, setTempParams] = useState<DispatchParams>(params);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<SchedulePlan | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalRemark, setApprovalRemark] = useState('');
  const [rejectRemark, setRejectRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSaveParams = () => {
    setParams({ ...tempParams });
  };

  const handleViewDetail = (schedule: SchedulePlan) => {
    setSelectedSchedule(schedule);
    setShowDrawer(true);
  };

  const handleOpenApprove = () => {
    setApprovalRemark('');
    setShowApproveModal(true);
  };

  const handleOpenReject = () => {
    setRejectRemark('');
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSchedule || !user) return;
    setActionLoading(true);
    try {
      await approveSchedule(selectedSchedule.id, user.name, approvalRemark);
      setShowApproveModal(false);
      setShowDrawer(false);
      setSelectedSchedule(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSchedule || !user) return;
    setActionLoading(true);
    try {
      await rejectSchedule(selectedSchedule.id, user.name, rejectRemark);
      setShowRejectModal(false);
      setShowDrawer(false);
      setSelectedSchedule(null);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<SchedulePlan>[] = [
    {
      key: 'date',
      title: '日期',
      dataIndex: 'date',
      render: (record) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-solar/60" />
          <span className="font-mono">{formatDate(record.date)}</span>
        </div>
      ),
    },
    {
      key: 'predictedGeneration',
      title: '预测发电量(kWh)',
      align: 'right',
      render: (record) => (
        <span className="font-mono text-solar font-medium">
          {record.predictedGeneration.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (record) => <StatusBadge status={record.status} />,
    },
    {
      key: 'arrayCount',
      title: '方阵数量',
      align: 'center',
      render: (record) => (
        <span className="font-mono">{record.arrayPlans.length}</span>
      ),
    },
    {
      key: 'cleaningTasks',
      title: '清洗任务数',
      align: 'center',
      render: (record) => (
        <span className={cn(
          'font-mono',
          record.cleaningTasks.length > 0 ? 'text-warning' : 'text-primary-50/60'
        )}>
          {record.cleaningTasks.length}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: '创建时间',
      render: (record) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-50/40" />
          <span className="font-mono text-xs text-primary-50/60">
            {formatDateTime(record.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      align: 'center',
      width: 120,
      render: (record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(record);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-solar/30 text-solar hover:bg-solar/15 hover:shadow-[0_0_12px_rgba(255,140,0,0.25)] transition-all duration-300"
        >
          <Eye className="w-3.5 h-3.5" />
          详情
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-solar flex items-center justify-center shadow-glow-solar">
            <Zap className="w-6 h-6 text-primary-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-50">
              发电调度管理
            </h1>
            <p className="text-sm text-primary-50/50 mt-0.5">
              智能优化发电方案，提升电站整体收益
            </p>
          </div>
        </div>
      </div>

      <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5 hover:border-solar/40 transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-15 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <Settings2 className="w-5 h-5 text-solar" />
            <h2 className="text-sm font-semibold text-primary-50/90">调度参数配置</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-warning/15 flex items-center justify-center">
                  <Droplets className="w-4.5 h-4.5 text-warning" />
                </div>
                <span className="text-sm text-primary-50/70">组件清洗阈值</span>
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  value={tempParams.cleaningThreshold}
                  onChange={(e) => setTempParams({ ...tempParams, cleaningThreshold: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-primary-900/80 border border-primary-50/20 rounded-lg text-xl font-bold font-mono text-warning focus:border-warning/50 focus:outline-none focus:shadow-[0_0_10px_rgba(255,214,0,0.15)] transition-all duration-300"
                  min={0}
                  max={100}
                />
                <span className="text-lg text-primary-50/50 pb-2">%</span>
              </div>
              <p className="text-xs text-primary-50/40 mt-2">当前生效: {params.cleaningThreshold}%</p>
            </div>

            <div className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-alarm/15 flex items-center justify-center">
                  <Gauge className="w-4.5 h-4.5 text-alarm" />
                </div>
                <span className="text-sm text-primary-50/70">逆变器效率下降阈值</span>
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  value={tempParams.inverterEfficiencyDrop}
                  onChange={(e) => setTempParams({ ...tempParams, inverterEfficiencyDrop: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-primary-900/80 border border-primary-50/20 rounded-lg text-xl font-bold font-mono text-alarm focus:border-alarm/50 focus:outline-none focus:shadow-[0_0_10px_rgba(255,61,0,0.15)] transition-all duration-300"
                  min={0}
                  max={100}
                />
                <span className="text-lg text-primary-50/50 pb-2">%</span>
              </div>
              <p className="text-xs text-primary-50/40 mt-2">当前生效: {params.inverterEfficiencyDrop}%</p>
            </div>

            <div className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-solar/15 flex items-center justify-center">
                  <Battery className="w-4.5 h-4.5 text-solar" />
                </div>
                <span className="text-sm text-primary-50/70">储能最小SOC</span>
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  value={tempParams.minSoc}
                  onChange={(e) => setTempParams({ ...tempParams, minSoc: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-primary-900/80 border border-primary-50/20 rounded-lg text-xl font-bold font-mono text-solar focus:border-solar/50 focus:outline-none focus:shadow-[0_0_10px_rgba(255,140,0,0.15)] transition-all duration-300"
                  min={0}
                  max={100}
                />
                <span className="text-lg text-primary-50/50 pb-2">%</span>
              </div>
              <p className="text-xs text-primary-50/40 mt-2">当前生效: {params.minSoc}%</p>
            </div>

            <div className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-energy/15 flex items-center justify-center">
                  <Battery className="w-4.5 h-4.5 text-energy" />
                </div>
                <span className="text-sm text-primary-50/70">储能最大SOC</span>
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  value={tempParams.maxSoc}
                  onChange={(e) => setTempParams({ ...tempParams, maxSoc: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-primary-900/80 border border-primary-50/20 rounded-lg text-xl font-bold font-mono text-energy focus:border-energy/50 focus:outline-none focus:shadow-[0_0_10px_rgba(0,200,83,0.15)] transition-all duration-300"
                  min={0}
                  max={100}
                />
                <span className="text-lg text-primary-50/50 pb-2">%</span>
              </div>
              <p className="text-xs text-primary-50/40 mt-2">当前生效: {params.maxSoc}%</p>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              onClick={handleSaveParams}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-solar text-primary-900 font-semibold text-sm hover:shadow-glow-solar transition-all duration-300"
            >
              <Save className="w-4 h-4" />
              保存参数
            </button>
          </div>
        </div>
      </div>

      <div className="relative p-5 rounded-xl backdrop-blur-md border border-primary-50/30 bg-primary-50/5 hover:border-energy/40 transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-gradient-radial-energy opacity-10 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <Sun className="w-5 h-5 text-energy" />
            <h2 className="text-sm font-semibold text-primary-50/90">调度方案列表</h2>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-energy/15 text-energy text-xs font-medium">
              共 {scheduleList.length} 条
            </span>
          </div>
          <DataTable
            columns={columns}
            data={scheduleList}
            rowKey="id"
          />
        </div>
      </div>

      {showDrawer && selectedSchedule && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setShowDrawer(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-primary-800/98 backdrop-blur-xl border-l border-solar/20 z-50 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-primary-800/95 backdrop-blur-xl border-b border-solar/20 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-primary-50">调度方案详情</h3>
                <p className="text-xs text-primary-50/50 mt-0.5">
                  {formatDate(selectedSchedule.date)} 调度方案
                </p>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-primary-50/60 hover:text-solar hover:bg-solar/10 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10">
                  <p className="text-xs text-primary-50/50 mb-1.5">预测发电量</p>
                  <p className="text-2xl font-bold font-mono text-solar text-glow-solar">
                    {selectedSchedule.predictedGeneration.toLocaleString()}
                    <span className="text-sm font-normal text-primary-50/50 ml-1">kWh</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10">
                  <p className="text-xs text-primary-50/50 mb-1.5">状态</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedSchedule.status} />
                  </div>
                </div>
              </div>

              {selectedSchedule.approver && (
                <div className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-primary-50/50 mb-1">审批人</p>
                      <p className="text-sm text-primary-50/90 font-medium">{selectedSchedule.approver}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-50/50 mb-1">审批时间</p>
                      <p className="text-sm text-primary-50/90 font-mono">
                        {selectedSchedule.approvedAt ? formatDateTime(selectedSchedule.approvedAt) : '-'}
                      </p>
                    </div>
                  </div>
                  {selectedSchedule.comment && (
                    <div className="mt-3 pt-3 border-t border-primary-50/10">
                      <p className="text-xs text-primary-50/50 mb-1">审批意见</p>
                      <p className="text-sm text-primary-50/80">{selectedSchedule.comment}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-primary-50/90 mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-solar" />
                  各方阵调度计划
                </h4>
                <div className="space-y-3">
                  {selectedSchedule.arrayPlans.map((plan) => (
                    <div
                      key={plan.arrayId}
                      className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10 hover:border-solar/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-primary-50/90">{plan.arrayName}</span>
                        <span className="px-2 py-0.5 rounded bg-solar/15 text-solar text-xs font-mono">
                          {plan.arrayId}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-primary-50/50 mb-1">目标功率</p>
                          <p className="text-lg font-bold font-mono text-energy">
                            {plan.targetPower}
                            <span className="text-xs font-normal text-primary-50/50 ml-1">kW</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-primary-50/50 mb-1">效率阈值</p>
                          <p className="text-lg font-bold font-mono text-warning">
                            {plan.efficiencyThreshold}
                            <span className="text-xs font-normal text-primary-50/50 ml-1">%</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-primary-50/90 mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-warning" />
                  清洗任务列表
                  {selectedSchedule.cleaningTasks.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs">
                      {selectedSchedule.cleaningTasks.length} 项
                    </span>
                  )}
                </h4>
                {selectedSchedule.cleaningTasks.length === 0 ? (
                  <div className="p-6 rounded-lg bg-primary-50/5 border border-primary-50/10 text-center">
                    <p className="text-sm text-primary-50/40">暂无清洗任务</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSchedule.cleaningTasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-warning/5 border border-warning/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-primary-50/90">{task.reason}</p>
                          <span className="px-2 py-0.5 rounded bg-alarm/15 text-alarm text-xs font-mono font-bold">
                            -{task.efficiencyDrop}%
                          </span>
                        </div>
                        <p className="text-xs text-primary-50/50">
                          涉及方阵: {task.arrayId} | 组串数: {task.panelStringIds.length}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-primary-50/90 mb-3 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-energy" />
                  电池充放电计划
                </h4>
                <div className="p-4 rounded-lg bg-primary-50/10 border border-primary-50/10">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-primary-50/50">SOC 运行范围</span>
                      <span className="text-sm font-mono text-energy font-medium">
                        {selectedSchedule.batteryPlan.minSoc}% ~ {selectedSchedule.batteryPlan.maxSoc}%
                      </span>
                    </div>
                    <div className="relative h-3 rounded-full bg-primary-900/80 overflow-hidden">
                      <div
                        className="absolute inset-y-0 bg-gradient-to-r from-solar to-energy rounded-full"
                        style={{
                          left: `${selectedSchedule.batteryPlan.minSoc}%`,
                          right: `${100 - selectedSchedule.batteryPlan.maxSoc}%`,
                        }}
                      />
                      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
                        {Array.from({ length: 11 }, (_, i) => (
                          <div
                            key={i}
                            className="w-px h-1.5 bg-primary-50/30"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-primary-50/40 font-mono">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-primary-50/10">
                    <div>
                      <p className="text-xs text-primary-50/50 mb-1">充电开始</p>
                      <p className="text-base font-bold font-mono text-solar">
                        {selectedSchedule.batteryPlan.chargeFrom}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-50/50 mb-1">充电结束</p>
                      <p className="text-base font-bold font-mono text-energy">
                        {selectedSchedule.batteryPlan.chargeTo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedSchedule.status === 'pending' && (
                <div className="pt-4 border-t border-primary-50/10 flex gap-3">
                  <button
                    onClick={handleOpenApprove}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-energy text-primary-900 font-semibold text-sm hover:shadow-glow-energy transition-all duration-300"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    审批通过
                  </button>
                  <button
                    onClick={handleOpenReject}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-alarm text-white font-semibold text-sm hover:shadow-glow-alarm transition-all duration-300"
                  >
                    <XCircle className="w-4 h-4" />
                    驳回
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showApproveModal && selectedSchedule && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => !actionLoading && setShowApproveModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-primary-800/98 backdrop-blur-xl rounded-xl border border-energy/30 shadow-glow-energy/30 z-[70] overflow-hidden">
            <div className="px-6 py-4 border-b border-energy/20 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-energy" />
              <h3 className="text-base font-bold text-primary-50">审批通过</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-primary-50/70 mb-4">
                确定要通过 <span className="text-solar font-medium">{formatDate(selectedSchedule.date)}</span> 的调度方案吗？
              </p>
              <div>
                <label className="text-xs text-primary-50/60 mb-2 block">审批意见（可选）</label>
                <textarea
                  value={approvalRemark}
                  onChange={(e) => setApprovalRemark(e.target.value)}
                  placeholder="请输入审批意见..."
                  rows={3}
                  className="w-full px-4 py-3 bg-primary-900/80 border border-primary-50/20 rounded-lg text-sm text-primary-50 placeholder:text-primary-50/30 focus:border-energy/50 focus:outline-none focus:shadow-[0_0_10px_rgba(0,200,83,0.15)] transition-all duration-300 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-primary-50/10 flex justify-end gap-3 bg-primary-900/50">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg border border-primary-50/30 text-primary-50/70 text-sm font-medium hover:bg-primary-50/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                取消
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg bg-gradient-energy text-primary-900 text-sm font-semibold hover:shadow-glow-energy disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {actionLoading ? '处理中...' : '确认通过'}
              </button>
            </div>
          </div>
        </>
      )}

      {showRejectModal && selectedSchedule && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => !actionLoading && setShowRejectModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-primary-800/98 backdrop-blur-xl rounded-xl border border-alarm/30 shadow-glow-alarm/30 z-[70] overflow-hidden">
            <div className="px-6 py-4 border-b border-alarm/20 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-alarm" />
              <h3 className="text-base font-bold text-primary-50">驳回方案</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-primary-50/70 mb-4">
                确定要驳回 <span className="text-solar font-medium">{formatDate(selectedSchedule.date)}</span> 的调度方案吗？
              </p>
              <div>
                <label className="text-xs text-primary-50/60 mb-2 block">驳回原因 <span className="text-alarm">*</span></label>
                <textarea
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="请输入驳回原因..."
                  rows={3}
                  className="w-full px-4 py-3 bg-primary-900/80 border border-primary-50/20 rounded-lg text-sm text-primary-50 placeholder:text-primary-50/30 focus:border-alarm/50 focus:outline-none focus:shadow-[0_0_10px_rgba(255,61,0,0.15)] transition-all duration-300 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-primary-50/10 flex justify-end gap-3 bg-primary-900/50">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg border border-primary-50/30 text-primary-50/70 text-sm font-medium hover:bg-primary-50/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectRemark.trim()}
                className="px-5 py-2 rounded-lg bg-gradient-alarm text-white text-sm font-semibold hover:shadow-glow-alarm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {actionLoading ? '处理中...' : '确认驳回'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
