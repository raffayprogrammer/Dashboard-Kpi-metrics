"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { KpiGrid } from "./KpiGrid";
import { DailySendsChart } from "./DailySendsChart";
import { ReplyIntentDonut } from "./ReplyIntentDonut";
import { StepDropoffChart } from "./StepDropoffChart";
import { AbPerformanceChart } from "./AbPerformanceChart";
import { SegmentTable } from "./SegmentTable";
import { RecentRepliesFeed } from "./RecentRepliesFeed";
import { AiPersonalisationStats } from "./AiPersonalisationStats";
import type { DashboardData } from "@/lib/types";

interface DashboardProps {
  initialData: DashboardData;
}

export function Dashboard({ initialData }: DashboardProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  // Avoid an SSR/hydration mismatch on the "Last updated" timestamp by
  // setting it only after mount.
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [
        overview,
        dailySends,
        stepDropoff,
        segmentPerformance,
        abPerformance,
        aiApproval,
        stuckLeads,
        replyIntentBreakdown,
        recentReplies,
      ] = await Promise.all([
        fetch("/api/metrics/overview", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/daily-sends", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/step-dropoff", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/segment-performance", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/ab-performance", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/ai-approval", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/stuck-leads", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/reply-intent-breakdown", { cache: "no-store" }).then((r) =>
          r.json(),
        ),
        fetch("/api/metrics/recent-replies", { cache: "no-store" }).then((r) => r.json()),
      ]);

      setData({
        overview,
        dailySends,
        stepDropoff,
        segmentPerformance,
        abPerformance,
        aiApproval,
        stuckLeads,
        replyIntentBreakdown,
        recentReplies,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader lastUpdated={lastUpdated} onRefresh={refresh} refreshing={refreshing} />

      <section className="mb-6">
        <KpiGrid
          overview={data.overview}
          aiApproval={data.aiApproval}
          stuckLeads={data.stuckLeads}
          loading={refreshing}
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailySendsChart data={data.dailySends} loading={refreshing} />
        </div>
        <div>
          <ReplyIntentDonut data={data.replyIntentBreakdown} loading={refreshing} />
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StepDropoffChart data={data.stepDropoff} loading={refreshing} />
        <AbPerformanceChart data={data.abPerformance} loading={refreshing} />
      </section>

      <section className="mb-6">
        <SegmentTable data={data.segmentPerformance} loading={refreshing} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentRepliesFeed data={data.recentReplies} loading={refreshing} />
        </div>
        <div>
          <AiPersonalisationStats data={data.aiApproval} loading={refreshing} />
        </div>
      </section>
    </div>
  );
}
