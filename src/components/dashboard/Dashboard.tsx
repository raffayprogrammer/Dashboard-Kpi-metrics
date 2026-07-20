"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { FilterBar, type DashboardFilters } from "./FilterBar";
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
  isMockData: boolean;
}

const EMPTY_FILTERS: DashboardFilters = { from: "", to: "", segment: "" };

function buildQs(filters: DashboardFilters): string {
  const p = new URLSearchParams();
  if (filters.from) p.set("from", filters.from);
  if (filters.to) p.set("to", filters.to);
  if (filters.segment) p.set("segment", filters.segment);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export function Dashboard({ initialData, isMockData }: DashboardProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);
  // Avoid an SSR/hydration mismatch on the "Last updated" timestamp by
  // setting it only after mount.
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  const refresh = useCallback(async (activeFilters: DashboardFilters = EMPTY_FILTERS) => {
    setRefreshing(true);
    const qs = buildQs(activeFilters);
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
        clickMetrics,
        openMetrics,
        bounceMetrics,
      ] = await Promise.all([
        fetch(`/api/metrics/overview${qs}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/metrics/daily-sends${qs}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/metrics/step-dropoff${qs}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/metrics/segment-performance${qs}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/metrics/ab-performance${qs}`, { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/ai-approval", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/stuck-leads", { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/metrics/reply-intent-breakdown${qs}`, { cache: "no-store" }).then((r) =>
          r.json(),
        ),
        fetch(`/api/metrics/recent-replies${qs}`, { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/clicks", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/opens", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/metrics/bounces", { cache: "no-store" }).then((r) => r.json()),
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
        clickMetrics,
        openMetrics,
        bounceMetrics,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Re-fetch whenever filters change (skip the very first render — initialData already loaded)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    refresh(filters);
  }, [filters, refresh]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader lastUpdated={lastUpdated} onRefresh={() => refresh(filters)} refreshing={refreshing} />
      <FilterBar filters={filters} onChange={setFilters} />

      {isMockData && (
        <div className="mb-6 rounded-lg border border-accent-amber/20 bg-accent-amber/10 px-4 py-2 text-sm text-accent-amber">
          Showing sample data — set <code className="font-mono">DATABASE_URL</code> to see
          live numbers.
        </div>
      )}

      <section className="mb-6">
        <KpiGrid
          overview={data.overview}
          aiApproval={data.aiApproval}
          stuckLeads={data.stuckLeads}
          clickMetrics={data.clickMetrics}
          openMetrics={data.openMetrics}
          bounceMetrics={data.bounceMetrics}
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
