"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import type { RecentReply } from "@/lib/types";

interface RecentRepliesFeedProps {
  data: RecentReply[];
  loading: boolean;
}

export function RecentRepliesFeed({ data, loading }: RecentRepliesFeedProps) {
  const positiveReplies = data.filter((r) => r.reply_intent === "positive");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Positive Replies</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : positiveReplies.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-3">
            {positiveReplies.map((reply) => (
              <li
                key={`${reply.email}-${reply.replied_at}`}
                className="rounded-lg border border-card-border bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {reply.first_name} · {reply.company_name}
                    </p>
                    <p className="text-xs text-text-muted">
                      Replied on step {reply.reply_step ?? "—"} ·{" "}
                      {formatRelativeTime(reply.replied_at)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-accent-green/20 bg-accent-green/10 px-2 py-0.5 text-xs font-medium text-accent-green">
                    Positive
                  </span>
                </div>
                {reply.reply_text && (
                  <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                    {reply.reply_text.slice(0, 100)}
                    {reply.reply_text.length > 100 ? "…" : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-card-border py-10 text-center">
      <p className="text-sm text-text-secondary">No replies yet</p>
      <p className="text-xs text-text-muted">
        Phase 6 reply detection needs to be active
      </p>
    </div>
  );
}
