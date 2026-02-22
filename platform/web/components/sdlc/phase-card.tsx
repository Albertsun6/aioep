"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/types";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  Package,
  Flag,
} from "lucide-react";

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-500",
    border: "border-green-200 dark:border-green-900",
    bg: "bg-green-50 dark:bg-green-950/30",
    barBg: "bg-green-500",
    label: "已完成",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  },
  "in-progress": {
    icon: Clock,
    color: "text-blue-500",
    border: "border-blue-200 dark:border-blue-900",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    barBg: "bg-blue-500",
    label: "进行中",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  },
  pending: {
    icon: Circle,
    color: "text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    bg: "bg-gray-50 dark:bg-gray-800/30",
    barBg: "bg-gray-300",
    label: "待开始",
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400",
  },
};

export default function PhaseCard({ phase }: { phase: Phase }) {
  const [expanded, setExpanded] = useState(phase.status === "in-progress");
  const config = statusConfig[phase.status];
  const Icon = config.icon;

  const gatesPassed = phase.gateChecks.filter((g) => g.passed === true).length;
  const gatesTotal = phase.gateChecks.length;
  const deliverablesCompleted = phase.deliverables.filter(
    (d) => d.completed
  ).length;

  return (
    <div
      className={cn("rounded-xl border bg-[var(--card)] transition-all", config.border)}
    >
      {/* Header - responsive: stack on small screens */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-4 p-4 text-left sm:items-center sm:p-5"
      >
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl",
            config.bg
          )}
        >
          <Icon size={20} className={config.color} />
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-base font-semibold sm:text-lg">
              {phase.name}
            </span>
            <span className="text-xs text-[var(--muted-foreground)] sm:text-sm">
              {phase.subtitle}
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", config.badge)}>
              {config.label}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
            <span>{phase.duration}</span>
            <span>
              门禁 {gatesPassed}/{gatesTotal}
            </span>
            <span>
              交付物 {deliverablesCompleted}/{phase.deliverables.length}
            </span>
          </div>
          {/* Progress bar inline on mobile */}
          <div className="mt-2 flex items-center gap-2 sm:hidden">
            <div className="h-1.5 flex-1 rounded-full bg-[var(--secondary)]">
              <div
                className={cn("h-1.5 rounded-full transition-all", config.barBg)}
                style={{ width: `${phase.progress}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums">
              {phase.progress}%
            </span>
          </div>
        </div>

        {/* Progress + chevron (desktop only) */}
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-[var(--secondary)]">
              <div
                className={cn("h-2 rounded-full transition-all", config.barBg)}
                style={{ width: `${phase.progress}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums">
              {phase.progress}%
            </span>
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--muted-foreground)]" />
          )}
        </div>

        {/* Chevron only on mobile */}
        <div className="flex shrink-0 items-center sm:hidden">
          {expanded ? (
            <ChevronUp size={16} className="text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--muted-foreground)]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="space-y-5 border-t border-[var(--border)] p-4 sm:space-y-6 sm:p-5">
          {/* Milestones */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-sm font-medium sm:mb-3">
              <Flag size={14} className="text-[var(--primary)]" />
              里程碑
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {phase.milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg bg-[var(--secondary)] px-3 py-2"
                >
                  {m.completed ? (
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-green-500"
                    />
                  ) : (
                    <Circle size={14} className="shrink-0 text-gray-400" />
                  )}
                  <span className="text-xs leading-relaxed">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-sm font-medium sm:mb-3">
              <Package size={14} className="text-[var(--primary)]" />
              交付物
            </h3>
            <div className="space-y-1.5">
              {phase.deliverables.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-2 text-xs sm:items-center"
                >
                  {d.completed ? (
                    <CheckCircle2
                      size={12}
                      className="mt-0.5 shrink-0 text-green-500 sm:mt-0"
                    />
                  ) : (
                    <Circle
                      size={12}
                      className="mt-0.5 shrink-0 text-gray-400 sm:mt-0"
                    />
                  )}
                  <span
                    className={cn(
                      "flex-1",
                      d.completed ? "" : "text-[var(--muted-foreground)]"
                    )}
                  >
                    {d.name}
                  </span>
                  {d.path && (
                    <code className="hidden rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)] sm:inline-block">
                      {d.path}
                    </code>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gate Checks */}
          <div>
            <h3 className="mb-2.5 flex items-center gap-2 text-sm font-medium sm:mb-3">
              <Shield size={14} className="text-[var(--primary)]" />
              门禁检查
            </h3>
            <div className="space-y-2">
              {phase.gateChecks.map((g) => (
                <div
                  key={g.id}
                  className="rounded-lg border border-[var(--border)] p-3"
                >
                  <div className="flex items-start gap-2">
                    {g.passed === true && (
                      <CheckCircle2
                        size={14}
                        className="mt-0.5 shrink-0 text-green-500"
                      />
                    )}
                    {g.passed === false && (
                      <Circle
                        size={14}
                        className="mt-0.5 shrink-0 text-red-500"
                      />
                    )}
                    {g.passed === null && (
                      <Circle
                        size={14}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium leading-relaxed">
                        {g.description}
                      </span>
                      <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                        标准: {g.standard}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
