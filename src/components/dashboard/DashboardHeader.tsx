"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing: boolean;
}

export function DashboardHeader({ lastUpdated, onRefresh, refreshing }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Alfa Analytics</h1>
          <p className="text-sm text-text-secondary">Outreach Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
          </span>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
