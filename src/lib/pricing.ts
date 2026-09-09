// DISPLAY ESTIMATION ONLY. The real number is always fetched fresh from the
// calculate-final-price Edge Function before anything is confirmed or charged.
export const COMMISSION_RATE_DISPLAY = 0.02;

export function formatPKR(cents: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function estimateFinalTotalCents(baseCents: number): number {
  return Math.round(baseCents * (1 + COMMISSION_RATE_DISPLAY));
}
