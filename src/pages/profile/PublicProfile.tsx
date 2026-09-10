import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Profile } from "../../types";
import Portfolio from "./Portfolio";
import VerificationBadge from "../../components/ui/VerificationBadge";
import TestimonialCarousel from "../../components/ui/TestimonialCarousel";

interface RatingRow {
  stars: number;
  comment: string | null;
  profiles: { full_name: string | null } | null;
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ratings, setRatings] = useState<RatingRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("*").eq("id", userId).single().then(({ data }) => setProfile(data));
    supabase
      .from("ratings")
      .select("stars, comment, profiles!ratings_rater_id_fkey(full_name)")
      .eq("ratee_id", userId)
      .eq("is_removed", false)
      .then(({ data }) => setRatings((data as unknown as RatingRow[]) ?? []));
  }, [userId]);

  if (!profile || !userId) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-warmth/10 to-trust/5 p-6">
        <div className="flex items-center justify-between">
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
          <button
            onClick={() => navigate(`/jobs/new?rehire=${userId}`)}
            className="rounded-xl bg-trust text-white px-4 py-2.5 text-sm font-semibold active:scale-[0.97] transition-transform"
          >
            Rehire
          </button>
        </div>
      </div>

      <Portfolio userId={userId} />

      <div>
        <h2 className="text-sm font-medium text-text-light dark:text-text-dark mb-3">What clients say</h2>
        <TestimonialCarousel
          testimonials={ratings.map((r) => ({ stars: r.stars, comment: r.comment ?? "", authorName: r.profiles?.full_name ?? "A client" }))}
        />
      </div>
    </div>
  );
}
