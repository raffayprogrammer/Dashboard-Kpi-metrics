"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PALETTE } from "@/lib/colors";
import type { StepDropoff } from "@/lib/types";

interface StepDropoffChartProps {
  data: StepDropoff[];
  loading: boolean;
}

export function StepDropoffChart({ data, loading }: StepDropoffChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sequence Step Drop-off</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.map((d) => ({ ...d, label: `Step ${d.current_step}` }))}>
              <CartesianGrid stroke={PALETTE.cardBorder} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={PALETTE.textMuted}
                tick={{ fill: PALETTE.textSecondary, fontSize: 12 }}
                axisLine={{ stroke: PALETTE.cardBorder }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke={PALETTE.textMuted}
                tick={{ fill: PALETTE.textSecondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: PALETTE.card,
                  border: `1px solid ${PALETTE.cardBorder}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: PALETTE.textSecondary }} />
              <Bar dataKey="contacts" name="Contacts" fill={PALETTE.blue} radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="stopped_at_step"
                name="Stopped"
                fill={PALETTE.red}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm text-text-secondary">No sequence data yet</p>
      <p className="text-xs text-text-muted">sequence_enrollments is empty</p>
    </div>
  );
}
