import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJob } from "../../hooks/useJob";
import { useAuthContext } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { formatPKR } from "../../lib/pricing";
import { Category, Offer } from "../../types";
import AcceptanceChecklist from "../../components/job/AcceptanceChecklist";
import OfferForm from "../../components/job/OfferForm";

export default function JobDetails() {
  const { id } = useParams();
  const { job, loading } = useJob(id);
  const { session, profile } = useAuthContext();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [myOffer, setMyOffer] = useState<Offer | null>(null);
  const [showOfferSheet, setShowOfferSheet] = useState(false);

  useEffect(() => {
    if (!job) return;
    supabase.from("categories").select("*").eq("id", job.category_id).single().then(({ data }) => setCategory(data));
    if (session) {
      supabase
        .from("offers")
        .select("*")
        .eq("job_id", job.id)
        .eq("worker_id", session.user.id)
        .maybeSingle()
        .then(({ data }) => setMyOffer(data));
    }
  }, [job, session]);

  if (loading || !job) return <div className="p-6 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading…</div>;

  const isClient = session?.user.id === job.client_id;
  const canAcceptJob = profile?.is_profile_complete;

  async function acceptOffer(offer: Offer) {
    // Real escrow lock always goes through calculate-final-price first, then a
    // server-side lock — this call just kicks off that flow.
    const { data: priceData } = await supabase.functions.invoke("calculate-final-price", {
      body: { jobId: job!.id, offerAmountCents: offer.offer_amount_cents ?? 0 },
    });
    if (priceData?.error) return alert(priceData.error);
    await supabase
      .from("jobs")
      .update({ worker_id: offer.worker_id, status: "assigned" })
      .eq("id", job!.id);
    await supabase.from("offers").update({ status: "accepted" }).eq("id", offer.id);
    navigate(`/jobs/${job!.id}/progress`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal/10 text-teal">{category?.name}</span>
        <h1 className="mt-2 text-2xl font-semibold text-text-light dark:text-text-dark">{job.title}</h1>
        <p className="mt-2 text-text-light-secondary dark:text-text-dark-secondary">{job.description}</p>
      </div>

      <div className="rounded-xl border border-border-light dark:border-border-dark p-4">
        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Price</p>
        <p className="text-lg font-medium tabular-nums text-text-light dark:text-text-dark">
          {job.payment_type === "service"
            ? "Service swap"
            : `${formatPKR(job.price_min_cents ?? 0)} – ${formatPKR(job.price_max_cents ?? 0)}`}
        </p>
        <p className="mt-2 text-xs text-text-light-secondary dark:text-text-dark-secondary">
          Deadline: {new Date(job.deadline).toLocaleString()}
        </p>
      </div>

      <div>
        <h2 className="text-sm font-medium text-text-light dark:text-text-dark mb-2">Acceptance criteria</h2>
        <AcceptanceChecklist items={job.acceptance_criteria} />
      </div>

      {isClient ? (
        <ClientOffers jobId={job.id} onAccept={acceptOffer} />
      ) : myOffer ? (
        <div className="rounded-xl border border-border-light dark:border-border-dark p-4 text-sm text-text-light dark:text-text-dark">
          Your offer: {myOffer.offer_amount_cents ? formatPKR(myOffer.offer_amount_cents) : myOffer.offer_service_description} —{" "}
          <span className="capitalize">{myOffer.status}</span>
        </div>
      ) : (
        <button
          onClick={() => setShowOfferSheet(true)}
          disabled={!canAcceptJob}
          className="w-full rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
        >
          {canAcceptJob ? "Submit offer" : "Complete your profile to accept jobs"}
        </button>
      )}

      {showOfferSheet && session && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center sm:justify-center z-50">
          <div className="w-full sm:max-w-md bg-white dark:bg-[#1a1c1a] rounded-t-2xl sm:rounded-2xl p-6 space-y-4 animate-[scaleFade_0.2s_ease-out]">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-text-light dark:text-text-dark">Submit an offer</h3>
              <button onClick={() => setShowOfferSheet(false)} className="text-text-light-secondary dark:text-text-dark-secondary">
                ✕
              </button>
            </div>
            <OfferForm job={job} workerId={session.user.id} onSubmitted={() => setShowOfferSheet(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function ClientOffers({ jobId, onAccept }: { jobId: string; onAccept: (offer: Offer) => void }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => {
    supabase
      .from("offers")
      .select("*")
      .eq("job_id", jobId)
      .eq("status", "pending")
      .then(({ data }) => setOffers((data as Offer[]) ?? []));
  }, [jobId]);

  if (offers.length === 0)
    return <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">No offers yet.</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-text-light dark:text-text-dark">Offers received</h2>
      {offers.map((o) => (
        <div key={o.id} className="flex items-center justify-between rounded-xl border border-border-light dark:border-border-dark p-3">
          <span className="text-sm tabular-nums text-text-light dark:text-text-dark">
            {o.offer_amount_cents ? formatPKR(o.offer_amount_cents) : o.offer_service_description}
          </span>
          <button onClick={() => onAccept(o)} className="text-sm font-medium text-teal">
            Accept
          </button>
        </div>
      ))}
    </div>
  );
}
