export function isProfileComplete(p: {
  full_name?: string | null;
  address?: string | null;
  education?: string | null;
  occupation?: string | null;
}): boolean {
  return !!(p.full_name && p.address && p.education && p.occupation);
}

export function isValidDeadline(deadlineISO: string): boolean {
  return new Date(deadlineISO).getTime() > Date.now();
}

export function priceGapExceeds30Percent(clientMax: number, workerValuation: number): boolean {
  if (clientMax <= 0) return false;
  return Math.abs(clientMax - workerValuation) / clientMax > 0.3;
}
