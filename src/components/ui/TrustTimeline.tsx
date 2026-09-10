import { useInView } from "../../hooks/useInView";

export default function TrustTimeline({ steps }: { steps: { label: string; done: boolean }[] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const completedCount = steps.filter((s) => s.done).length;
  const fillPercent = steps.length > 1 ? (Math.max(completedCount - 1, 0) / (steps.length - 1)) * 100 : 0;

  return (
    <div ref={ref} className="relative pl-2">
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border-light dark:bg-border-dark" />
      <div
        className="absolute left-[15px] top-2 w-0.5 bg-trust transition-[height] duration-[1200ms] ease-out"
        style={{ height: inView ? `calc(${fillPercent}% - 8px)` : 0 }}
      />
      <div className="space-y-5">
        {steps.map((step, i) => (
          <div key={i} className="relative flex items-center gap-3">
            <span
              className={`relative z-10 flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold transition-colors duration-500 ${
                step.done ? "bg-trust text-white" : "bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary"
              }`}
            >
              {step.done ? (
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                  <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className={`text-sm ${step.done ? "text-text-light dark:text-text-dark font-medium" : "text-text-light-secondary dark:text-text-dark-secondary"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
