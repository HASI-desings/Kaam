import { useAuthContext } from "../../context/AuthContext";
import Portfolio from "./Portfolio";

export default function MyProfile() {
  const { session, profile } = useAuthContext();
  if (!session || !profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-teal/10 flex items-center justify-center text-teal font-semibold text-xl">
          {profile.full_name?.[0] ?? "?"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">{profile.full_name}</h1>
            {profile.is_verified && (
              <span className="text-xs px-2 py-0.5 rounded-full text-white bg-gradient-to-r from-amber to-amber-light">
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary capitalize">{profile.occupation}</p>
        </div>
      </div>
      <Portfolio userId={session.user.id} />
    </div>
  );
}
