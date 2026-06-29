"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getReplyRateColor, getReplyRateTier, getSegmentColor } from "@/lib/colors";
import { formatNumber } from "@/lib/utils";
import type { SegmentPerformance } from "@/lib/types";

interface SegmentTableProps {
  data: SegmentPerformance[];
  loading: boolean;
}

export function SegmentTable({ data, loading }: SegmentTableProps) {
  const maxRate = Math.max(1, ...data.map((d) => d.reply_rate_pct ?? 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segment Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>Total Sent</TableHead>
                <TableHead>Replied</TableHead>
                <TableHead>Reply Rate</TableHead>
                <TableHead>Positive Replies</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const tier = getReplyRateTier(row.reply_rate_pct);
                const color = getReplyRateColor(row.reply_rate_pct);
                const barWidth = row.reply_rate_pct
                  ? Math.max(4, (row.reply_rate_pct / maxRate) * 100)
                  : 0;
                return (
                  <TableRow key={row.segment ?? "unknown"}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getSegmentColor(row.segment) }}
                        />
                        {row.segment ?? "Unspecified"}
                      </span>
                    </TableCell>
                    <TableCell>{formatNumber(row.total_sent)}</TableCell>
                    <TableCell>{formatNumber(row.replied)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span style={{ color }}>
                          {row.reply_rate_pct !== null ? `${row.reply_rate_pct}%` : "—"}
                        </span>
                        <div className="h-1 w-20 rounded-full bg-white/5">
                          <div
                            className="h-1 rounded-full"
                            style={{ width: `${barWidth}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(row.positive)}</TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                        style={{
                          borderColor: `${tier.color}33`,
                          backgroundColor: `${tier.color}1a`,
                          color: tier.color,
                        }}
                      >
                        {tier.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
      <p className="text-sm text-text-secondary">No segment data yet</p>
      <p className="text-xs text-text-muted">
        No contacts have a segment set in personalization_payload
      </p>
    </div>
  );
}
