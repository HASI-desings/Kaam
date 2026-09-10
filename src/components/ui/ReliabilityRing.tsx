import { useInView } from "../../hooks/useInView";

export default function ReliabilityRing({ score, size = 88 }: { score: number; size?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "#10B981" : score >= 60 ? "#2563EB" : "#D98C3F";

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-border-light dark:text-border-dark" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <span className="absolute text-lg font-semibold tabular-nums text-text-light dark:text-text-dark">
        {inView ? score : 0}
      </span>
    
