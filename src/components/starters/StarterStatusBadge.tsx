import { StarterStatus } from "@/types/starter";

interface StarterStatusBadgeProps {
  status: StarterStatus;
}

const statusConfig: Record<
  StarterStatus,
  { label: string; className: string }
> = {
  HEALTHY: {
    label: "Saudável",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ATTENTION: {
    label: "Atenção",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  NEW: {
    label: "Novo",
    className: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
};

export function StarterStatusBadge({ status }: StarterStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.NEW;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
