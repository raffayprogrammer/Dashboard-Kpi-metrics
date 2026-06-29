"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PALETTE } from "@/lib/colors";
import { formatNumber, formatPct } from "@/lib/utils";
import type { AiApproval } from "@/lib/types";

interface AiPersonalisationStatsProps {
  data: AiApproval;
  loading: boolean;
}

export function AiPersonalisationStats({ data, loading }: AiPersonalisationStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Personalisation Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : data.total_processed === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Approved", value: data.approved },
                      { name: "Skipped", value: data.skipped },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={64}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    <Cell fill={PALETTE.green} />
                    <Cell fill={PALETTE.textMuted} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex w-full justify-between text-xs text-text-secondary">
              <span>
                <span className="font-medium text-accent-green">
                  {formatNumber(data.approved)}
                </span>{" "}
                approved
              </span>
              <span>
                <span className="font-medium text-text-muted">
                  {formatNumber(data.skipped)}
                </span>{" "}
                skipped
              </span>
            </div>
            <div className="text-center">
              <p className="text-3xl font-semibold text-text-primary">
                {formatPct(data.approval_rate_pct)}
              </p>
              <p className="text-xs text-text-muted">LM Studio Qwen 3.5-9b</p>
            </div>
            <p className="text-xs text-text-muted">
              {formatNumber(data.total_processed)} total processed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
      <p className="text-sm text-text-secondary">No personalization data yet</p>
      <p className="text-xs text-text-muted">No contacts have a personalization_payload</p>
    </div>
  );
}
