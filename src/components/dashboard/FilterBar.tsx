"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardFilters {
  from: string;
  to: string;
  segment: string;
}

interface FilterBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/metrics/segments")
      .then((r) => r.json())
      .then((d) => setSegments(d.segments ?? []))
      .catch(() => {});
  }, []);

  const update = (key: keyof DashboardFilters, val: string) =>
    onChange({ ...filters, [key]: val });

  const hasFilters = filters.from || filters.to || filters.segment;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium text-text-secondary">Filter:</span>

      <input
        type="date"
        value={filters.from}
        onChange={(e) => update("from", e.target.value)}
        className="rounded-md border border-border bg-bg-surface px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue"
      />

      <span className="text-xs text-text-muted">to</span>

      <input
        type="date"
        value={filters.to}
        onChange={(e) => update("to", e.target.value)}
        className="rounded-md border border-border bg-bg-surface px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue"
      />

      <select
        value={filters.segment}
        onChange={(e) => update("segment", e.target.value)}
        className="rounded-md border border-border bg-bg-surface px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue"
      >
        <option value="">All segments</option>
        {segments.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange({ from: "", to: "", segment: "" })}
          className="h-7 px-2 text-xs"
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
