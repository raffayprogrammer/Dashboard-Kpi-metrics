"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PALETTE } from "@/lib/colors";
import { formatChartDate } from "@/lib/utils";
import type { DailySend } from "@/lib/types";

interface DailySendsChartProps {
  data: DailySend[];
  loading: boolean;
}

export function DailySendsChart({ data, loading }: DailySendsChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Daily Send Volume</CardTitle>
        <p className="text-xs text-text-muted">Last 30 days</p>
      </CardHeader>
      <CardContent className="h-[280px]">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.map((d) => ({ ...d, label: formatChartDate(d.send_date) }))}
            >
              <defs>
                <linearGradient id="sendsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE.blue} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={PALETTE.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
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
                labelStyle={{ color: PALETTE.textPrimary }}
                itemStyle={{ color: PALETTE.blue }}
              />
              <Area
                type="monotone"
                dataKey="emails_sent"
                stroke={PALETTE.blue}
                strokeWidth={2}
                fill="url(#sendsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm text-text-secondary">No send data yet</p>
      <p className="text-xs text-text-muted">
        Sends will appear here once the sequence starts running.
      </p>
    </div>
  );
}
