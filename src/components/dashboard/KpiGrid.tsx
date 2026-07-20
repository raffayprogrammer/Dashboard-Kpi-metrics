import { KpiCard } from "./KpiCard";
import { INDUSTRY_AVG_REPLY_RATE, PALETTE } from "@/lib/colors";
import { formatNumber, formatPct } from "@/lib/utils";
import type {
  AiApproval,
  BounceMetrics,
  ClickMetrics,
  OpenMetrics,
  OverviewMetrics,
  StuckLeads,
} from "@/lib/types";

interface KpiGridProps {
  overview: OverviewMetrics;
  aiApproval: AiApproval;
  stuckLeads: StuckLeads;
  clickMetrics: ClickMetrics;
  openMetrics: OpenMetrics;
  bounceMetrics: BounceMetrics;
  loading: boolean;
}

export function KpiGrid({
  overview,
  aiApproval,
  stuckLeads,
  clickMetrics,
  openMetrics,
  bounceMetrics,
  loading,
}: KpiGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <KpiCard key={i} label="" value="" status="healthy" loading />
        ))}
      </div>
    );
  }

  const hasSends = overview.total_sent > 0;
  const repliesPendingPhase6 = hasSends && overview.total_replies === 0;
  const stuckCount = stuckLeads.stuck_count;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        label="Total Sent"
        definition="Unique contacts who received at least one email in the outreach sequence."
        value={formatNumber(overview.total_sent)}
        accentColor={PALETTE.blue}
        status={hasSends ? "healthy" : "concerning"}
        footnote="Industry avg: 3.43% reply"
      />

      <KpiCard
        label="Total Replies"
        definition="Contacts who replied to any email in the sequence, regardless of intent."
        value={formatNumber(overview.total_replies)}
        status={
          repliesPendingPhase6
            ? "concerning"
            : overview.reply_rate_pct !== null && overview.reply_rate_pct < 1
              ? "critical"
              : overview.reply_rate_pct !== null &&
                  overview.reply_rate_pct >= INDUSTRY_AVG_REPLY_RATE
                ? "healthy"
                : "concerning"
        }
        badge={
          repliesPendingPhase6
            ? { text: "Pending Phase 6", variant: "amber" }
            : { text: formatPct(overview.reply_rate_pct), variant: "blue" }
        }
      />

      <KpiCard
        label="Positive Replies"
        definition="Replies classified as interested, requesting a call, or asking for more info — warm leads."
        value={formatNumber(overview.positive_replies)}
        accentColor={PALETTE.green}
        status={overview.positive_replies > 0 ? "healthy" : "concerning"}
        footnote={
          overview.positive_rate_pct !== null
            ? `${formatPct(overview.positive_rate_pct)} of replies`
            : repliesPendingPhase6
              ? "Pending Phase 6"
              : undefined
        }
      />

      <KpiCard
        label="Unsubscribes"
        definition="Contacts who asked to be removed from outreach. They are stopped immediately and never emailed again."
        value={formatNumber(overview.unsubscribes)}
        accentColor={PALETTE.red}
        status={overview.unsubscribes === 0 ? "healthy" : "concerning"}
        footnote="stopped immediately"
      />

      <KpiCard
        label="Sequence Completions"
        definition="Contacts who completed all 5 steps of the email sequence without replying or unsubscribing."
        value={formatNumber(overview.completed_sequence)}
        status={overview.completed_sequence > 0 ? "healthy" : "concerning"}
        footnote="reached step 5"
      />

      <KpiCard
        label="AI Approval Rate"
        definition="% of contacts whose AI-generated personalized email was approved (send=true) vs skipped due to low confidence."
        value={formatPct(aiApproval.approval_rate_pct)}
        accentColor={PALETTE.amber}
        status={
          aiApproval.approval_rate_pct !== null && aiApproval.approval_rate_pct >= 50
            ? "healthy"
            : aiApproval.approval_rate_pct !== null && aiApproval.approval_rate_pct >= 20
              ? "concerning"
              : "critical"
        }
        footnote={`${formatNumber(aiApproval.approved)} approved / ${formatNumber(aiApproval.skipped)} skipped`}
      />

      <KpiCard
        label="Stuck Leads"
        definition="Valid contacts with an approved AI email who haven't been enrolled in the sequence yet — they need to be sent."
        value={formatNumber(stuckCount)}
        accentColor={stuckCount > 0 ? PALETTE.red : PALETTE.green}
        status={stuckCount > 0 ? "critical" : "healthy"}
        footnote={stuckCount > 0 ? "needs attention" : "all clear"}
      />

      <KpiCard
        label="Link Clicks"
        definition="Unique contacts who clicked a tracked link (website or portfolio) in any email. More reliable than opens."
        value={formatNumber(clickMetrics.unique_clickers)}
        accentColor={PALETTE.blue}
        status={clickMetrics.unique_clickers > 0 ? "healthy" : "concerning"}
        badge={
          clickMetrics.click_rate_pct !== null
            ? { text: formatPct(clickMetrics.click_rate_pct), variant: "blue" }
            : undefined
        }
        footnote={`${formatNumber(clickMetrics.click_count)} total clicks`}
      />

      <KpiCard
        label="Email Opens"
        definition="Unique contacts who opened at least one email. Caution: Apple Mail Privacy Protection auto-opens emails, inflating this number."
        value={formatNumber(openMetrics.unique_openers)}
        accentColor={PALETTE.amber}
        status={openMetrics.unique_openers > 0 ? "healthy" : "concerning"}
        badge={
          openMetrics.open_rate_pct !== null
            ? { text: formatPct(openMetrics.open_rate_pct), variant: "amber" }
            : undefined
        }
        footnote="rough estimate — Apple Mail inflates this"
      />

      <KpiCard
        label="Hard Bounces"
        definition="Emails permanently undeliverable — either the address doesn't exist (invalid) or our domain was blocked by their spam filter."
        value={formatNumber(bounceMetrics.total_bounce_count)}
        accentColor={bounceMetrics.total_bounce_count > 0 ? PALETTE.red : PALETTE.green}
        status={bounceMetrics.total_bounce_count > 0 ? "critical" : "healthy"}
        badge={
          bounceMetrics.spam_block_count > 0
            ? { text: `${bounceMetrics.spam_block_count} spam blocked`, variant: "red" }
            : undefined
        }
        footnote={`${formatNumber(bounceMetrics.invalid_address_count)} invalid addr · ${formatNumber(bounceMetrics.spam_block_count)} spam blocked`}
      />
    </div>
  );
}
