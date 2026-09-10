export default function VerificationBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  return (
    <span
      className={`badge-glow inline-flex items-center justify-center ${dims} rounded-full bg-trust text-white shrink-0`}
      title="Identity and skill verified"
    >
      <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
        <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
