import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (record: T, index: number) => ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  emptyText?: string;
  className?: string;
  headerClassName?: string;
  onRowClick?: (record: T, index: number) => void;
  rowClassName?: (record: T, index: number) => string;
}

export default function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText = "暂无数据",
  className,
  headerClassName,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    if (rowKey && record[rowKey] !== undefined) {
      return String(record[rowKey]);
    }
    return String(index);
  };

  const alignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden border border-solar/20 bg-primary-800/50 backdrop-blur-md",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={cn(
                "bg-primary-700/60 border-b border-solar/20",
                headerClassName
              )}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm font-semibold text-solar/90 whitespace-nowrap",
                    alignClass(col.align),
                    col.className
                  )}
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-primary-50/50"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-solar/30 border-t-solar rounded-full animate-spin" />
                    <span>加载中...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-primary-50/50"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={cn(
                    "transition-all duration-200",
                    index % 2 === 0 ? "bg-primary-800/30" : "bg-primary-900/30",
                    "hover:bg-solar/10 hover:shadow-[inset_0_0_20px_rgba(255,140,0,0.05)]",
                    onRowClick && "cursor-pointer",
                    rowClassName?.(record, index)
                  )}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm text-primary-50/80 border-b border-primary-50/5 whitespace-nowrap",
                        alignClass(col.align),
                        col.className
                      )}
                      style={{ width: col.width }}
                    >
                      {col.render
                        ? col.render(record, index)
                        : col.dataIndex
                        ? String(record[col.dataIndex] ?? "")
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
