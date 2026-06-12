import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatColor = "solar" | "energy" | "alarm" | "warning" | "success" | "info";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: StatColor;
  className?: string;
}

const colorStyles: Record<StatColor, {
  bg: string;
  border: string;
  text: string;
  glow: string;
  textGlow: string;
  iconBg: string;
  iconColor: string;
}> = {
  solar: {
    bg: "bg-solar/5",
    border: "border-solar/30 hover:border-solar/60",
    text: "text-solar",
    glow: "hover:shadow-glow-solar",
    textGlow: "text-glow-solar",
    iconBg: "bg-solar/15",
    iconColor: "text-solar",
  },
  energy: {
    bg: "bg-energy/5",
    border: "border-energy/30 hover:border-energy/60",
    text: "text-energy",
    glow: "hover:shadow-glow-energy",
    textGlow: "text-glow-energy",
    iconBg: "bg-energy/15",
    iconColor: "text-energy",
  },
  alarm: {
    bg: "bg-alarm/5",
    border: "border-alarm/30 hover:border-alarm/60",
    text: "text-alarm",
    glow: "hover:shadow-glow-alarm",
    textGlow: "text-glow-alarm",
    iconBg: "bg-alarm/15",
    iconColor: "text-alarm",
  },
  warning: {
    bg: "bg-warning/5",
    border: "border-warning/30 hover:border-warning/60",
    text: "text-warning",
    glow: "hover:shadow-glow-warning",
    textGlow: "text-glow-warning",
    iconBg: "bg-warning/15",
    iconColor: "text-warning",
  },
  success: {
    bg: "bg-success/5",
    border: "border-success/30 hover:border-success/60",
    text: "text-success",
    glow: "hover:shadow-glow-success",
    textGlow: "text-glow-success",
    iconBg: "bg-success/15",
    iconColor: "text-success",
  },
  info: {
    bg: "bg-primary-50/5",
    border: "border-primary-50/30 hover:border-primary-50/60",
    text: "text-primary-50",
    glow: "hover:shadow-glow-primary",
    textGlow: "",
    iconBg: "bg-primary-50/15",
    iconColor: "text-primary-50",
  },
};

export default function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  color = "solar",
  className,
}: StatCardProps) {
  const styles = colorStyles[color];
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        "relative p-5 rounded-xl backdrop-blur-md border transition-all duration-300",
        styles.bg,
        styles.border,
        styles.glow,
        className
      )}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-radial-solar opacity-30 pointer-events-none" />

      <div className="relative flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-primary-50/60 mb-1">
            {title}
          </h3>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-3xl font-bold font-mono tracking-tight",
                styles.text,
                styles.textGlow
              )}
            >
              {value}
            </span>
            {unit && (
              <span className="text-sm text-primary-50/50 font-medium">
                {unit}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              styles.iconBg
            )}
          >
            <div className={styles.iconColor}>{icon}</div>
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="relative flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
              isPositive
                ? "bg-energy/15 text-energy"
                : "bg-alarm/15 text-alarm"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
          {trendLabel && (
            <span className="text-xs text-primary-50/50">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
