import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../context/AuthContext";
import { isProfileComplete } from "../../lib/validators";

const STEPS = ["full_name", "address", "education", "occupation"] as const;

export default function CompleteProfile() {
  const { session, refreshProfile } = useAuthContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ full_name: "", address: "", education: "", occupation: "" });
  const [saving, setSaving] = useState(false);

  const field = STEPS[step];
  const labels: Record<(typeof STEPS)[number], string> = {
    full_name: "Full name",
    address: "Address",
    education: "Education",
    occupation: "Occupation",
  };

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    if (!session) return;
    setSaving(true);
    const complete = isProfileComplete(form);
    await supabase
      .from("profiles")
      .upsert({ id: session.user.id, ...form, is_profile_complete: complete });
    await refreshProfile();
    setSaving(false);
    navigate("/feed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex gap-1.5 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i <= step ? "bg-teal" : "bg-border-light dark:bg-border-dark"
              }`}
            />
          ))}
        </div>
        <div className="key-[fadeSlide] space-y-3">
          <label className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
            Step {step + 1} of {STEPS.length}
          </label>
          <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">{labels[field]}</h2>
          <input
            autoFocus
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-xl border border-teal text-teal py-3 font-medium active:scale-[0.97] transition"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!form[field] || saving}
            className="flex-1 rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
          >
            {step === STEPS.length - 1 ? (saving ? "Saving…" : "Finish") : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
