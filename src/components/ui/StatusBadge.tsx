import { cn } from "@/lib/utils";

type StatusType =
  | "normal"
  | "warning"
  | "fault"
  | "offline"
  | "pending"
  | "approved"
  | "rejected"
  | "executing"
  | "completed"
  | "assigned"
  | "processing"
  | "critical"
  | "info";

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<StatusType, {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
  pulse?: boolean;
}> = {
  normal: {
    bg: "bg-energy/15",
    border: "border-energy/40",
    text: "text-energy",
    dot: "bg-energy shadow-[0_0_8px_rgba(0,200,83,0.8)]",
    label: "正常",
  },
  warning: {
    bg: "bg-warning/15",
    border: "border-warning/40",
    text: "text-warning",
    dot: "bg-warning shadow-[0_0_8px_rgba(255,214,0,0.8)]",
    label: "警告",
    pulse: true,
  },
  fault: {
    bg: "bg-alarm/15",
    border: "border-alarm/40",
    text: "text-alarm",
    dot: "bg-alarm shadow-[0_0_8px_rgba(255,61,0,0.8)]",
    label: "故障",
    pulse: true,
  },
  offline: {
    bg: "bg-primary-50/10",
    border: "border-primary-50/30",
    text: "text-primary-50/60",
    dot: "bg-primary-50/40",
    label: "离线",
  },
  pending: {
    bg: "bg-warning/15",
    border: "border-warning/40",
    text: "text-warning",
    dot: "bg-warning shadow-[0_0_8px_rgba(255,214,0,0.8)]",
    label: "待审批",
  },
  approved: {
    bg: "bg-success/15",
    border: "border-success/40",
    text: "text-success",
    dot: "bg-success shadow-[0_0_8px_rgba(0,230,118,0.8)]",
    label: "已批准",
  },
  rejected: {
    bg: "bg-alarm/15",
    border: "border-alarm/40",
    text: "text-alarm",
    dot: "bg-alarm shadow-[0_0_8px_rgba(255,61,0,0.8)]",
    label: "已拒绝",
  },
  executing: {
    bg: "bg-solar/15",
    border: "border-solar/40",
    text: "text-solar",
    dot: "bg-solar shadow-[0_0_8px_rgba(255,140,0,0.8)]",
    label: "执行中",
    pulse: true,
  },
  completed: {
    bg: "bg-energy/15",
    border: "border-energy/40",
    text: "text-energy",
    dot: "bg-energy shadow-[0_0_8px_rgba(0,200,83,0.8)]",
    label: "已完成",
  },
  assigned: {
    bg: "bg-solar/15",
    border: "border-solar/40",
    text: "text-solar",
    dot: "bg-solar shadow-[0_0_8px_rgba(255,140,0,0.8)]",
    label: "已派单",
  },
  processing: {
    bg: "bg-solar/15",
    border: "border-solar/40",
    text: "text-solar",
    dot: "bg-solar shadow-[0_0_8px_rgba(255,140,0,0.8)]",
    label: "处理中",
    pulse: true,
  },
  critical: {
    bg: "bg-alarm/20",
    border: "border-alarm/60",
    text: "text-alarm",
    dot: "bg-alarm shadow-[0_0_10px_rgba(255,61,0,1)]",
    label: "严重",
    pulse: true,
  },
  info: {
    bg: "bg-primary-50/10",
    border: "border-primary-50/30",
    text: "text-primary-50/80",
    dot: "bg-primary-50/60",
    label: "信息",
  },
};

export default function StatusBadge({
  status,
  text,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayText = text || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-sm",
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            config.dot,
            config.pulse && "animate-pulse"
          )}
        />
      )}
      {displayText}
    </span>
  );
}
