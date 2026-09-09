export default function ProgressBar({ percent }: { percent: number }) {
  const color = percent >= 90 ? "bg-success" : percent >= 40 ? "bg-teal" : "bg-amber";
  return (
    <div className="w-full h-2.5 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
