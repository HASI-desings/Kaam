import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../context/AuthContext";
import { Category } from "../../types";
import PriceRangeInput from "../../components/job/PriceRangeInput";
import AcceptanceChecklist from "../../components/job/AcceptanceChecklist";
import { isValidDeadline } from "../../lib/validators";

export default function PostJob() {
  const { session } = useAuthContext();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [paymentType, setPaymentType] = useState<"cash" | "service" | "either">("cash");
  const [minCents, setMinCents] = useState(0);
  const [maxCents, setMaxCents] = useState(0);
  const [floorCents, setFloorCents] = useState<number | null>(null);
  const [deadline, setDeadline] = useState("");
  const [criteria, setCriteria] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    supabase.functions
      .invoke("check-average-rate", { body: { categoryId } })
      .then(({ data }) => setFloorCents(data?.floorActive ? data.averagePriceCents : null));
  }, [categoryId]);

  async function handleSubmit() {
    setError(null);
    if (!session) return;
    if (!categoryId || !title || !description || !deadline) {
      setError("Please fill in every field.");
      return;
    }
    if (!isValidDeadline(deadline)) {
      setError("Deadline must be in the future.");
      return;
    }
    if (paymentType !== "service" && floorCents !== null && minCents < floorCents) {
      setError("Minimum price can't go below the category average.");
      return;
    }
    setSubmitting(true);
    const { data, error: insertError } = await supabase
      .from("jobs")
      .insert({
        client_id: session.user.id,
        category_id: categoryId,
        title,
        description,
        payment_type: paymentType,
        price_min_cents: paymentType === "service" ? null : minCents,
        price_max_cents: paymentType === "service" ? null : maxCents,
        deadline: new Date(deadline).toISOString(),
        acceptance_criteria: criteria.filter(Boolean),
      })
      .select()
      .single();
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    navigate(`/jobs/${data.id}`);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Post a job</h1>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal"
      >
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Job title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal"
      />

      <textarea
        placeholder="Describe what you need done"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal"
      />

      <div className="flex gap-2">
        {(["cash", "service", "either"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setPaymentType(t)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium capitalize transition-colors ${
              paymentType === t ? "bg-teal text-white" : "border border-border-light dark:border-border-dark text-text-light dark:text-text-dark"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {paymentType !== "service" && (
        <PriceRangeInput minCents={minCents} maxCents={maxCents} floorCents={floorCents} onChange={(min, max) => { setMinCents(min); setMaxCents(max); }} />
      )}

      <input
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal"
      />

      <div>
        <p className="text-sm font-medium text-text-light dark:text-text-dark mb-2">Acceptance criteria</p>
        <AcceptanceChecklist items={criteria} editable onChange={setCriteria} />
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
      >
        {submitting ? "Posting…" : "Post job"}
      </button>
    </div>
  );
}
