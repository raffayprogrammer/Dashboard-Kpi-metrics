"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PALETTE, REPLY_INTENT_COLOR, REPLY_INTENT_LABEL } from "@/lib/colors";
import type { ReplyIntentBreakdown } from "@/lib/types";

interface ReplyIntentDonutProps {
  data: ReplyIntentBreakdown[];
  loading: boolean;
}

export function ReplyIntentDonut({ data, loading }: ReplyIntentDonutProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Reply Intent Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[280px] flex-col">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 || total === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="intent"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell
                        key={entry.intent}
                        fill={REPLY_INTENT_COLOR[entry.intent] ?? PALETTE.textMuted}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: PALETTE.card,
                      border: `1px solid ${PALETTE.cardBorder}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [
                      value,
                      REPLY_INTENT_LABEL[String(name)] ?? String(name),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 flex-1 space-y-1.5 overflow-y-auto text-xs">
              {data.map((d) => (
                <li key={d.intent} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: REPLY_INTENT_COLOR[d.intent] ?? PALETTE.textMuted,
                      }}
                    />
                    {REPLY_INTENT_LABEL[d.intent] ?? d.intent}
                  </span>
                  <span className="text-text-primary">
                    {d.count} ({total > 0 ? ((d.count / total) * 100).toFixed(1) : "0"}%)
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm text-text-secondary">No reply data yet</p>
      <p className="text-xs text-text-muted">Pending Phase 6 reply detection</p>
    </div>
  );
}
