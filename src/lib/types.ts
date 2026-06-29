export interface OverviewMetrics {
  total_sent: number;
  total_replies: number;
  positive_replies: number;
  unsubscribes: number;
  completed_sequence: number;
  reply_rate_pct: number | null;
  positive_rate_pct: number | null;
}

export interface DailySend {
  send_date: string;
  emails_sent: number;
}

export interface StepDropoff {
  current_step: number;
  contacts: number;
  stopped_at_step: number;
}

export interface SegmentPerformance {
  segment: string | null;
  total_sent: number;
  replied: number;
  reply_rate_pct: number | null;
  positive: number;
}

export interface AbPerformance {
  variant: string;
  total_sent: number;
  replied: number;
  reply_rate_pct: number | null;
}

export interface AiApproval {
  total_processed: number;
  approved: number;
  skipped: number;
  approval_rate_pct: number | null;
}

export interface StuckLeads {
  stuck_count: number;
}

export interface ReplyIntentBreakdown {
  intent: string;
  count: number;
}

export interface RecentReply {
  first_name: string;
  company_name: string;
  email: string;
  reply_intent: string | null;
  reply_text: string | null;
  reply_step: number | null;
  replied_at: string;
}

export interface ClickMetrics {
  click_count: number;
  unique_clickers: number;
  click_rate_pct: number | null;
}

export interface OpenMetrics {
  open_count: number;
  unique_openers: number;
  open_rate_pct: number | null;
}

export interface DashboardData {
  overview: OverviewMetrics;
  dailySends: DailySend[];
  stepDropoff: StepDropoff[];
  segmentPerformance: SegmentPerformance[];
  abPerformance: AbPerformance[];
  aiApproval: AiApproval;
  stuckLeads: StuckLeads;
  replyIntentBreakdown: ReplyIntentBreakdown[];
  recentReplies: RecentReply[];
  clickMetrics: ClickMetrics;
  openMetrics: OpenMetrics;
}
