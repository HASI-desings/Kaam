// Central config for every value Rules.md #28 flagged as "don't guess, name it."
// Each of these is a placeholder default — change here, not scattered through code.

export const CONFIG = {
  CURRENCY: "PKR",
  COMMISSION_RATE: 0.02, // 2%, added on top of client price

  // Mid-job scope-change request overage fees (cents), applied beyond the free tier cap
  MID_JOB_OVERAGE_SCHEDULE_CENTS: [500, 800, 1000, 1500, 2500, 5000], // $5,$8,$10,$15,$25,$50 equivalent
  MID_JOB_OVERAGE_CEILING_CENTS: 5000, // repeats at this ceiling once schedule is exhausted — OPEN DECISION, confirm with Hussnain

  MID_JOB_FREE_CAP: { free: 2, basic: 4, elite: 10 },

  // Penalty-money split between platform and the affected counterparty — OPEN DECISION
  PENALTY_SPLIT_TO_COUNTERPARTY: 0.5, // 50/50 default until confirmed

  // 30%-price-gap mutual-confirmation prompt timeout — OPEN DECISION
  GAP_CONFIRMATION_TIMEOUT_HOURS: 24,

  // Dispute resolution window before forced admin escalation — OPEN DECISION
  DISPUTE_ESCALATION_WINDOW_HOURS: 72,

  // Whether repeated confirmed chat violations feed a trust score — OPEN DECISION, currently off
  CHAT_VIOLATIONS_AFFECT_TRUST_SCORE: false,

  DEFAULT_AUTO_RELEASE_HOURS: 72,
  PRO_MAX_CUSTOM_RELEASE_HOURS: 168, // 7 days ceiling for Elite/Basic custom timers

  PENALTIES_CENTS: {
    deadline_missed: 200,
    first_pause: 100,
    second_pause: 300,
    non_response_under_50: 200,
    non_response_over_50: 400,
    false_dispute_or_proof: 800,
    emergency_abuse: 3000,
    redo_misuse: 200,
  },

  SUBSCRIPTION_PRICE_CENTS: { basic: 2500, elite: 7500 },
  BOOST_PRICE_CENTS: { free: 1000, basic: 1000, elite: 700 },
  VERIFICATION_FEE_CENTS: 10000,
};
