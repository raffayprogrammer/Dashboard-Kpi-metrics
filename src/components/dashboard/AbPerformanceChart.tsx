"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { INDUSTRY_AVG_REPLY_RATE, PALETTE } from "@/lib/colors";
import type { AbPerformance } from "@/lib/types";

interface AbPerformanceChartProps {
  data: AbPerformance[];
  loading: boolean;
}

const VARIANT_LABEL: Record<string, string> = { A: "Variant A", B: "Variant B" };

export function AbPerformanceChart({ data, loading }: AbPerformanceChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>A/B Variant Performance</CardTitle>
        <p className="text-xs text-text-muted">
          Reply rate vs. industry avg ({INDUSTRY_AVG_REPLY_RATE}%)
        </p>
      </CardHeader>
      <CardContent className="h-[280px]">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.map((d) => ({
                ...d,
                label: VARIANT_LABEL[d.variant] ?? `Variant ${d.variant}`,
              }))}
              layout="vertical"
              margin={{ left: 8 }}
            >
              <CartesianGrid stroke={PALETTE.cardBorder} horizontal={false} />
              <XAxis
                type="number"
                unit="%"
                stroke={PALETTE.textMuted}
                tick={{ fill: PALETTE.textSecondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                stroke={PALETTE.textMuted}
                tick={{ fill: PALETTE.textPrimary, fontSize: 13 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: PALETTE.card,
                  border: `1px solid ${PALETTE.cardBorder}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                formatter={(value) => [`${value}%`, "Reply rate"]}
              />
              <ReferenceLine
                x={INDUSTRY_AVG_REPLY_RATE}
                stroke={PALETTE.amber}
                strokeDasharray="4 4"
                label={{
                  value: `Industry avg ${INDUSTRY_AVG_REPLY_RATE}%`,
                  position: "top",
                  fill: PALETTE.amber,
                  fontSize: 11,
                }}
              />
              <Bar dataKey="reply_rate_pct" fill={PALETTE.blue} radius={[0, 4, 4, 0]} barSize={28} />
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
      <p className="text-sm text-text-secondary">No A/B variant data yet</p>
      <p className="text-xs text-text-muted">No contacts have a variant set</p>
    </div>
  );
}
