import { Card } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_DOT_COLOR, type StatusLevel } from "@/lib/colors";

interface KpiCardProps {
  label: string;
  value: string;
  definition?: string;
  accentColor?: string;
  status: StatusLevel;
  badge?: { text: string; variant: BadgeProps["variant"] };
  footnote?: string;
  loading?: boolean;
}

export function KpiCard({
  label,
  value,
  definition,
  accentColor,
  status,
  badge,
  footnote,
  loading,
}: KpiCardProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="mb-3 h-3 w-24" />
        <Skeleton className="mb-3 h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </Card>
    );
  }

  return (
    <Card className="relative p-5">
      <span
        className="absolute right-4 top-4 h-2 w-2 rounded-full"
        style={{ backgroundColor: STATUS_DOT_COLOR[status] }}
        title={`status: ${status}`}
      />
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      {definition && (
        <p className="mt-0.5 text-[10px] leading-tight text-text-muted">{definition}</p>
      )}
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="text-3xl font-semibold tracking-tight text-text-primary"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {value}
        </span>
        {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
      </div>
      {footnote && <p className="mt-2 text-xs text-text-muted">{footnote}</p>}
    </Card>
  );
}
