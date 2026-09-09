import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Profile } from "../../types";
import Portfolio from "./Portfolio";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("*").eq("id", userId).single().then(({ data }) => setProfile(data));
  }, [userId]);

  if (!profile || !userId) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-teal/10 flex items-center justify-center text-teal font-semibold text-xl">
            {profile.full_name?.[0] ?? "?"}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">{profile.full_name}</h1>
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary capitalize">{profile.occupation}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/jobs/new?rehire=${userId}`)}
          className="rounded-xl border border-teal text-teal px-4 py-2 text-sm font-medium active:scale-[0.97] transition"
        >
          Rehire
        </button>
      </div>
      <Portfolio userId={userId} />
    </div>
  );
}
