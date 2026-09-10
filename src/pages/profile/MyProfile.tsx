import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import Portfolio from "./Portfolio";
import VerificationBadge from "../../components/ui/VerificationBadge";
import TrustTimeline from "../../components/ui/TrustTimeline";
import TestimonialCarousel from "../../components/ui/TestimonialCarousel";
import ReferralBanner from "../../components/ui/ReferralBanner";

interface RatingRow {
  stars: number;
  comment: string | null;
  rater_id: string;
  profiles: { full_name: string | null } | null;
}

export default function MyProfile() {
  const { session, profile } = useAuthContext();
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [hasSkillPassed, setHasSkillPassed] = useState(false);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("ratings")
      .select("stars, comment, rater_id, profiles!ratings_rater_id_fkey(full_name)")
      .eq("ratee_id", session.user.id)
      .eq("is_removed", false)
      .then(({ data }) => setRatings((data as unknown as RatingRow[]) ?? []));

    supabase
      .from("skill_verifications")
      .select("passed")
      .eq("user_id", session.user.id)
      .eq("passed", true)
      .then(({ data }) => setHasSkillPassed(!!data && data.length > 0));
  }, [session]);

  if (!session || !profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-warmth/10 to-trust/5 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-warmth/15 flex items-center justify-center text-warmth font-semibold text-xl">
            {profile.full_name?.[0] ?? "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">{profile.full_name}</h1>
              {profile.is_verified && <VerificationBadge />}
            </div>
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary capitalize">{profile.occupation}</p>
          </div>
        </div>
      </div>

      <Portfolio userId={session.user.id} />

      <div>
        <h2 className="text-sm font-medium text-text-light dark:text-text-dark mb-3">Verification progress</h2>
        <TrustTimeline
          steps={[
            { label: "Mobile & email verified", done: true },
            { label: "Profile complete", done: profile.is_profile_complete },
            { label: "Skill verification passed", done: hasSkillPassed },
            { label: "Identity verified (paid badge)", done: profile.is_verified },
          ]}
        />
      </div>

      <div>
        <h2 className="text-sm font-medium text-text-light dark:text-text-dark mb-3">What clients say</h2>
        <TestimonialCarousel
          testimonials={ratings.map((r) => ({ stars: r.stars, comment: r.comment ?? "", authorName: r.profiles?.full_name ?? "A client" }))}
        />
      </div>

      <ReferralBanner />
    </div>
  );
}
