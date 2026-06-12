import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  Settings,
  FileText,
  Package,
  BarChart3,
  Map,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "监控大屏", icon: LayoutDashboard },
  { path: "/scheduling", label: "发电调度", icon: Zap },
  { path: "/devices", label: "设备运维", icon: Settings },
  { path: "/workorders", label: "工单管理", icon: FileText },
  { path: "/inventory", label: "库存管理", icon: Package },
  { path: "/statistics", label: "统计报表", icon: BarChart3 },
  { path: "/layout", label: "电站布局", icon: Map },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-primary-800/95 backdrop-blur-xl border-r border-solar/20 transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-solar/20">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-gradient-solar flex items-center justify-center shadow-glow-solar shrink-0">
            <Sun className="w-6 h-6 text-primary-900" />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-solar font-bold text-lg tracking-wider">
                SolarOps
              </span>
              <span className="text-primary-50 text-xs opacity-60">
                智能光伏运维平台
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-50/60 hover:text-solar hover:bg-solar/10 transition-all duration-300 shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300",
                "hover:bg-solar/10 hover:shadow-[0_0_15px_rgba(255,140,0,0.15)]",
                isActive
                  ? "bg-gradient-to-r from-solar/20 to-transparent text-solar shadow-glow-solar/50 border-l-2 border-solar"
                  : "text-primary-50/70 hover:text-solar",
                collapsed && "justify-center"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-all duration-300",
                    isActive && "drop-shadow-[0_0_8px_rgba(255,140,0,0.8)]"
                  )}
                />
                {!collapsed && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {isActive && !collapsed && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-solar animate-pulse shadow-glow-solar" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-solar/20">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-primary-50/70 hover:text-alarm hover:bg-alarm/10 transition-all duration-300",
            "hover:shadow-[0_0_15px_rgba(255,61,0,0.15)]",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="font-medium text-sm whitespace-nowrap">
              退出登录
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
