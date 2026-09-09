import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAuthContext } from "../../context/AuthContext";
import OtpInput from "../../components/ui/OtpInput";

export default function VerifyEmail() {
  const { verifyEmailOtp } = useAuth();
  const { session } = useAuthContext();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  async function handleComplete(code: string) {
    if (!session?.user.email) return;
    const { error } = await verifyEmailOtp(session.user.email, code);
    if (error) {
      setError("That code didn't work. Try again.");
      (window as any).__otpTriggerError?.();
      setCooldown(30);
      const interval = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
      setTimeout(() => clearInterval(interval), 30000);
      return;
    }
    navigate("/verify-mobile");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light dark:bg-bg-dark px-4 gap-6">
      <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">Verify your email</h1>
      <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm text-center max-w-xs">
        Enter the 6-digit code we sent to {session?.user.email}
      </p>
      <OtpInput onComplete={handleComplete} />
      {error && <p className="text-danger text-sm">{error}</p>}
      {cooldown > 0 && (
        <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs">
          You can retry in {cooldown}s
        </p>
      )}
    </div>
  );
}
