import type { FitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const badgeConfig: Record<FitStatus, { bg: string; text: string; label: string }> = {
  Fit: { bg: "bg-green-100", text: "text-green-700", label: "Fit" },
  Partial: { bg: "bg-amber-100", text: "text-amber-700", label: "Partial" },
  Gap: { bg: "bg-red-100", text: "text-red-700", label: "Gap" },
  OOS: { bg: "bg-gray-100", text: "text-gray-500", label: "OOS" },
};

export default function FitStatusBadge({ status }: { status: FitStatus }) {
  const config = badgeConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", config.bg, config.text)}>
      {config.label}
    </span>
  );
}
