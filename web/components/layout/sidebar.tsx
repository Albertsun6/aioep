"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranch,
  Table2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sdlc", label: "SDLC 看板", icon: GitBranch },
  { href: "/gap-fit", label: "Gap-Fit 工作台", icon: Table2 },
];

interface SidebarProps {
  onToggleChat: () => void;
  collapsed: boolean;
  onToggleCollapsed: (collapsed: boolean) => void;
  visible?: boolean;
  isMobile?: boolean;
}

export default function Sidebar({
  onToggleChat,
  collapsed,
  onToggleCollapsed,
  visible = true,
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--border)] bg-[var(--card)] transition-all duration-300",
        collapsed ? "w-16" : "w-56",
        isMobile && !visible && "-translate-x-full",
        isMobile && visible && "translate-x-0 shadow-2xl"
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-xs font-bold text-white">
              A
            </div>
            <span className="text-sm font-semibold">AIOEP</span>
          </Link>
        )}
        <button
          onClick={() => onToggleCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
        >
          {isMobile ? (
            <X size={16} />
          ) : collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onToggleCollapsed(true)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <div className="my-2 border-t border-[var(--border)]" />

        <button
          onClick={onToggleChat}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
        >
          <MessageSquare size={18} className="shrink-0" />
          {!collapsed && <span>AI 助手</span>}
        </button>
      </nav>

      {/* Footer info */}
      {!collapsed && (
        <div className="shrink-0 border-t border-[var(--border)] p-4">
          <div className="rounded-md bg-[var(--secondary)] p-3 text-xs text-[var(--muted-foreground)]">
            <div className="font-medium text-[var(--foreground)]">
              ERP 管理系统
            </div>
            <div className="mt-0.5">Phase 2 进行中</div>
          </div>
        </div>
      )}
    </aside>
  );
}
