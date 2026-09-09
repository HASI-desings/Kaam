export interface Profile {
  id: string;
  full_name: string | null;
  address: string | null;
  education: string | null;
  occupation: string | null;
  is_profile_complete: boolean;
  is_verified: boolean;
  subscription_tier: "free" | "basic" | "elite";
}

export interface Wallet {
  user_id: string;
  balance_cents: number;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  is_creative: boolean;
}

export type JobStatus =
  | "open" | "offer_pending" | "assigned" | "in_progress"
  | "submitted" | "completed" | "cancelled" | "disputed";

export interface Job {
  id: string;
  client_id: string;
  worker_id: string | null;
  category_id: string;
  title: string;
  description: string;
  payment_type: "cash" | "service" | "either";
  price_min_cents: number | null;
  price_max_cents: number | null;
  acceptance_criteria: string[];
  deadline: string;
  status: JobStatus;
  is_boosted: boolean;
  progress_percent: number;
  pause_count: number;
}

export interface Offer {
  id: string;
  job_id: string;
  worker_id: string;
  offer_amount_cents: number | null;
  offer_service_description: string | null;
  worker_valuation_cents: number | null;
  status: "pending" | "accepted" | "rejected" | "expired";
}

export interface Message {
  id: string;
  job_id: string;
  sender_id: string;
  content: string;
  status: "pending" | "safe" | "violation";
  created_at: string;
}

export interface Rating {
  id: string;
  job_id: string;
  rater_id: string;
  ratee_id: string;
  stars: number;
  comment: string | null;
  is_removed: boolean;
}
