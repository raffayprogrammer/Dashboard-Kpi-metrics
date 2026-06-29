import { getPool } from "./db";
import { MOCK_DASHBOARD_DATA } from "./mockData";
import type {
  AbPerformance,
  AiApproval,
  DailySend,
  DashboardData,
  OverviewMetrics,
  RecentReply,
  ReplyIntentBreakdown,
  SegmentPerformance,
  StepDropoff,
  StuckLeads,
} from "./types";

// All queries below are READ ONLY and are used exactly as specified —
// do not rewrite them.

// Until DATABASE_URL is configured, every query below returns sample data
// so the dashboard is viewable immediately instead of erroring out.
export const isMockMode = () => !process.env.DATABASE_URL;

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.overview;
  const { rows } = await getPool().query<OverviewMetrics>(`
    SELECT
      COUNT(DISTINCT se.contact_id) AS total_sent,
      COUNT(DISTINCT CASE WHEN c.replied_at IS NOT NULL
        THEN c.contact_id END) AS total_replies,
      COUNT(DISTINCT CASE WHEN c.reply_intent = 'positive'
        THEN c.contact_id END) AS positive_replies,
      COUNT(DISTINCT CASE WHEN c.reply_intent = 'unsubscribe'
        THEN c.contact_id END) AS unsubscribes,
      COUNT(DISTINCT CASE WHEN se.current_step = 5 AND se.status = 'finished'
        THEN se.contact_id END) AS completed_sequence,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN c.replied_at IS NOT NULL
          THEN c.contact_id END)
        / NULLIF(COUNT(DISTINCT se.contact_id), 0), 2
      ) AS reply_rate_pct,
      ROUND(
        100.0 * COUNT(DISTINCT CASE WHEN c.reply_intent = 'positive'
          THEN c.contact_id END)
        / NULLIF(COUNT(DISTINCT CASE WHEN c.replied_at IS NOT NULL
          THEN c.contact_id END), 0), 2
      ) AS positive_rate_pct
    FROM sequence_enrollments se
    JOIN contacts c ON c.contact_id = se.contact_id;
  `);
  return rows[0];
}

export async function getDailySends(): Promise<DailySend[]> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.dailySends;
  const { rows } = await getPool().query<DailySend>(`
    SELECT
      DATE(last_sent_at) AS send_date,
      COUNT(*) AS emails_sent
    FROM sequence_enrollments
    WHERE last_sent_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(last_sent_at)
    ORDER BY send_date ASC;
  `);
  return rows;
}

export async function getStepDropoff(): Promise<StepDropoff[]> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.stepDropoff;
  const { rows } = await getPool().query<StepDropoff>(`
    SELECT
      current_step,
      COUNT(*) AS contacts,
      COUNT(CASE WHEN status = 'stopped' THEN 1 END) AS stopped_at_step
    FROM sequence_enrollments
    GROUP BY current_step
    ORDER BY current_step ASC;
  `);
  return rows;
}

export async function getSegmentPerformance(): Promise<SegmentPerformance[]> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.segmentPerformance;
  const { rows } = await getPool().query<SegmentPerformance>(`
    SELECT
      c.personalization_payload->>'segment' AS segment,
      COUNT(*) AS total_sent,
      COUNT(CASE WHEN c.replied_at IS NOT NULL THEN 1 END) AS replied,
      ROUND(
        100.0 * COUNT(CASE WHEN c.replied_at IS NOT NULL THEN 1 END)
        / NULLIF(COUNT(*), 0), 1
      ) AS reply_rate_pct,
      COUNT(CASE WHEN c.reply_intent = 'positive' THEN 1 END) AS positive
    FROM contacts c
    JOIN sequence_enrollments se ON se.contact_id = c.contact_id
    WHERE c.personalization_payload IS NOT NULL
    GROUP BY segment
    ORDER BY reply_rate_pct DESC NULLS LAST;
  `);
  return rows;
}

export async function getAbPerformance(): Promise<AbPerformance[]> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.abPerformance;
  const { rows } = await getPool().query<AbPerformance>(`
    SELECT
      c.personalization_payload->>'variant' AS variant,
      COUNT(*) AS total_sent,
      COUNT(CASE WHEN c.replied_at IS NOT NULL THEN 1 END) AS replied,
      ROUND(
        100.0 * COUNT(CASE WHEN c.replied_at IS NOT NULL THEN 1 END)
        / NULLIF(COUNT(*), 0), 1
      ) AS reply_rate_pct
    FROM contacts c
    JOIN sequence_enrollments se ON se.contact_id = c.contact_id
    WHERE c.personalization_payload->>'variant' IS NOT NULL
    GROUP BY variant
    ORDER BY variant;
  `);
  return rows;
}

export async function getAiApproval(): Promise<AiApproval> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.aiApproval;
  const { rows } = await getPool().query<AiApproval>(`
    SELECT
      COUNT(*) AS total_processed,
      COUNT(CASE WHEN personalization_payload->>'send' = 'true'
        THEN 1 END) AS approved,
      COUNT(CASE WHEN personalization_payload->>'send' = 'false'
        THEN 1 END) AS skipped,
      ROUND(
        100.0 * COUNT(CASE WHEN personalization_payload->>'send' = 'true'
          THEN 1 END)
        / NULLIF(COUNT(*), 0), 1
      ) AS approval_rate_pct
    FROM contacts
    WHERE personalization_payload IS NOT NULL;
  `);
  return rows[0];
}

export async function getStuckLeads(): Promise<StuckLeads> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.stuckLeads;
  const { rows } = await getPool().query<StuckLeads>(`
    SELECT COUNT(*) AS stuck_count
    FROM contacts c
    LEFT JOIN sequence_enrollments se ON se.contact_id = c.contact_id
    WHERE c.personalization_payload->>'send' = 'true'
      AND c.email_verification_status = 'valid'
      AND se.contact_id IS NULL;
  `);
  return rows[0];
}

export async function getReplyIntentBreakdown(): Promise<
  ReplyIntentBreakdown[]
> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.replyIntentBreakdown;
  const { rows } = await getPool().query<ReplyIntentBreakdown>(`
    SELECT
      COALESCE(reply_intent, 'no_reply') AS intent,
      COUNT(*) AS count
    FROM contacts c
    JOIN sequence_enrollments se ON se.contact_id = c.contact_id
    GROUP BY reply_intent
    ORDER BY count DESC;
  `);
  return rows;
}

export async function getRecentReplies(): Promise<RecentReply[]> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.recentReplies;
  const { rows } = await getPool().query<RecentReply>(`
    SELECT
      c.first_name,
      a.company_name,
      c.email,
      c.reply_intent,
      c.reply_text,
      c.reply_step,
      c.replied_at
    FROM contacts c
    JOIN accounts a ON a.account_id = c.account_id
    WHERE c.replied_at IS NOT NULL
    ORDER BY c.replied_at DESC
    LIMIT 10;
  `);
  return rows;
}

export async function getDashboardData(): Promise<DashboardData> {
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
    getOverviewMetrics(),
    getDailySends(),
    getStepDropoff(),
    getSegmentPerformance(),
    getAbPerformance(),
    getAiApproval(),
    getStuckLeads(),
    getReplyIntentBreakdown(),
    getRecentReplies(),
  ]);

  return {
    overview,
    dailySends,
    stepDropoff,
    segmentPerformance,
    abPerformance,
    aiApproval,
    stuckLeads,
    replyIntentBreakdown,
    recentReplies,
  };
}
