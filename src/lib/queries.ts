import { getPool } from "./db";
import { MOCK_DASHBOARD_DATA } from "./mockData";
import type {
  AbPerformance,
  AiApproval,
  BounceMetrics,
  ClickMetrics,
  DailySend,
  DashboardData,
  OpenMetrics,
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

// Postgres error code 42703 = undefined_column. The reply-tracking columns
// (replied_at / reply_intent / reply_text / reply_step) are part of Phase 6
// and may not exist on `contacts` yet in a given environment — when that's
// the case, treat it the same as "Phase 6 hasn't run" rather than a crash.
function isUndefinedColumnError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42703"
  );
}

// Postgres error code 42P01 = undefined_table. email_link_clicks is a new,
// separate tracking table that may not exist in every environment yet.
function isUndefinedTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  );
}

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.overview;
  try {
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
  } catch (error) {
    if (!isUndefinedColumnError(error)) throw error;
    // Reply columns don't exist yet — total_sent/completed_sequence don't
    // depend on them, so recover those from sequence_enrollments alone.
    const { rows } = await getPool().query<{
      total_sent: number;
      completed_sequence: number;
    }>(`
      SELECT
        COUNT(DISTINCT contact_id) AS total_sent,
        COUNT(DISTINCT CASE WHEN current_step = 5 AND status = 'finished'
          THEN contact_id END) AS completed_sequence
      FROM sequence_enrollments;
    `);
    return {
      total_sent: rows[0].total_sent,
      total_replies: 0,
      positive_replies: 0,
      unsubscribes: 0,
      completed_sequence: rows[0].completed_sequence,
      reply_rate_pct: null,
      positive_rate_pct: null,
    };
  }
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
  try {
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
  } catch (error) {
    if (!isUndefinedColumnError(error)) throw error;
    return [];
  }
}

export async function getAbPerformance(): Promise<AbPerformance[]> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.abPerformance;
  try {
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
  } catch (error) {
    if (!isUndefinedColumnError(error)) throw error;
    return [];
  }
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
  try {
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
  } catch (error) {
    if (!isUndefinedColumnError(error)) throw error;
    return [];
  }
}

export async function getRecentReplies(): Promise<RecentReply[]> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.recentReplies;
  try {
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
  } catch (error) {
    if (!isUndefinedColumnError(error)) throw error;
    return [];
  }
}

// email_link_clicks logs every redirect through /api/track/click. Not part
// of the original 9 client-specified queries — this is new tracking we
// added on top, separate from contacts/accounts/sequence_enrollments.
export async function getClickMetrics(): Promise<ClickMetrics> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.clickMetrics;
  try {
    const { rows } = await getPool().query<ClickMetrics>(`
      SELECT
        COUNT(*) AS click_count,
        COUNT(DISTINCT contact_id) AS unique_clickers,
        ROUND(
          100.0 * COUNT(DISTINCT contact_id)
          / NULLIF((SELECT COUNT(DISTINCT contact_id) FROM sequence_enrollments), 0), 1
        ) AS click_rate_pct
      FROM email_link_clicks;
    `);
    return rows[0];
  } catch (error) {
    if (!isUndefinedTableError(error)) throw error;
    return { click_count: 0, unique_clickers: 0, click_rate_pct: null };
  }
}

// email_opens logs every pixel load through /api/track/open. Same caveats
// as Apple Mail Privacy Protection apply — this number is a loose signal,
// not a precise one. Click rate is the more trustworthy metric.
export async function getOpenMetrics(): Promise<OpenMetrics> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.openMetrics;
  try {
    const { rows } = await getPool().query<OpenMetrics>(`
      SELECT
        COUNT(*) AS open_count,
        COUNT(DISTINCT contact_id) AS unique_openers,
        ROUND(
          100.0 * COUNT(DISTINCT contact_id)
          / NULLIF((SELECT COUNT(DISTINCT contact_id) FROM sequence_enrollments), 0), 1
        ) AS open_rate_pct
      FROM email_opens;
    `);
    return rows[0];
  } catch (error) {
    if (!isUndefinedTableError(error)) throw error;
    return { open_count: 0, unique_openers: 0, open_rate_pct: null };
  }
}

// email_bounces logs hard-rejection NDRs caught by Phase 6's bounce
// classification — a proxy for sender reputation, not real spam-folder
// placement (which generates no bounce and is invisible without Google
// Postmaster Tools on a domain we control).
export async function getBounceMetrics(): Promise<BounceMetrics> {
  if (isMockMode()) return MOCK_DASHBOARD_DATA.bounceMetrics;
  try {
    const { rows } = await getPool().query<BounceMetrics>(`
      SELECT
        COUNT(CASE WHEN bounce_type = 'spam_block' THEN 1 END) AS spam_block_count,
        COUNT(CASE WHEN bounce_type = 'invalid_address' THEN 1 END) AS invalid_address_count,
        COUNT(*) AS total_bounce_count,
        ROUND(
          100.0 * COUNT(CASE WHEN bounce_type = 'spam_block' THEN 1 END)
          / NULLIF((SELECT COUNT(DISTINCT contact_id) FROM sequence_enrollments), 0), 2
        ) AS block_rate_pct
      FROM email_bounces;
    `);
    return rows[0];
  } catch (error) {
    if (!isUndefinedTableError(error)) throw error;
    return {
      spam_block_count: 0,
      invalid_address_count: 0,
      total_bounce_count: 0,
      block_rate_pct: null,
    };
  }
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
    clickMetrics,
    openMetrics,
    bounceMetrics,
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
    getClickMetrics(),
    getOpenMetrics(),
    getBounceMetrics(),
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
    clickMetrics,
    openMetrics,
    bounceMetrics,
  };
}
