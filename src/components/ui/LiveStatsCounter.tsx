import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}

export default function LiveStatsCounter({
  value,
  label,
  prefix = "",
  suffix = "",
  durationMs = 1200,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let frame: number;
    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      setDisplay(Math.round(value * easeOutQuad(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, durationMs]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl font-semibold tabular-nums text-text-light dark:text-text-dark">
        {prefix}
        {display.toLocaleString()}
        {suffix}
      </p>
      <p className="text-xs mt-1 text-text-light-secondary dark:text-text-dark-secondary">{label}</p>
    </div>
  );
}
