import { useRef, useState } from "react";

export default function OtpInput({ length = 6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const [shake, setShake] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...values];
    next[i] = val;
    setValues(next);
    if (val && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every((v) => v)) onComplete(next.join(""));
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !values[i] && i > 0) refs.current[i - 1]?.focus();
  }

  // Call this externally (e.g. after a failed verify) to trigger the gentle shake
  function triggerError() {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  }
  (window as any).__otpTriggerError = triggerError; // simple hook for parent pages, avoids prop drilling for this small widget

  return (
    <div className={`flex gap-2 justify-center ${shake ? "animate-[shake_0.3s_ease-in-out]" : ""}`}>
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          inputMode="numeric"
          className="w-11 h-14 text-center text-xl rounded-xl border border-border-light dark:border-border-dark bg-transparent text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-teal"
        />
      ))}
    </div>
  );
}
