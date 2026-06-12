import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/dashboard": "监控大屏",
  "/scheduling": "发电调度",
  "/devices": "设备运维",
  "/workorders": "工单管理",
  "/inventory": "库存管理",
  "/statistics": "统计报表",
  "/layout": "电站布局",
};

export default function Header() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitle = pageTitles[location.pathname] || "系统首页";
  const alarmCount = 3;

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const weekDay = weekDays[date.getDay()];
    return `${year}-${month}-${day} ${weekDay}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-primary-800/80 backdrop-blur-xl border-b border-solar/20">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-solar text-glow-solar tracking-wide">
          {pageTitle}
        </h1>
        <div className="h-6 w-px bg-solar/20" />
        <div className="flex items-center gap-2 text-primary-50/60">
          <Clock className="w-4 h-4 text-solar/70" />
          <span className="text-sm font-mono">{formatDate(currentTime)}</span>
          <span className="text-sm font-mono text-solar tracking-wider">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className={cn(
            "relative w-10 h-10 rounded-lg flex items-center justify-center",
            "bg-primary-700/50 border border-solar/20 hover:border-alarm/50",
            "transition-all duration-300 group"
          )}
        >
          <Bell className="w-5 h-5 text-primary-50/70 group-hover:text-alarm transition-colors" />
          {alarmCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-alarm text-white text-xs font-bold flex items-center justify-center shadow-glow-alarm animate-pulse">
              {alarmCount > 99 ? "99+" : alarmCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-solar/20" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-solar flex items-center justify-center shadow-glow-solar">
            <User className="w-5 h-5 text-primary-900" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary-50">
              管理员
            </span>
            <span className="text-xs text-primary-50/50">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
