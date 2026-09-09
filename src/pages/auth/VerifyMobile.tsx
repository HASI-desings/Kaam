import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import OtpInput from "../../components/ui/OtpInput";

export default function VerifyMobile() {
  const { sendMobileOtp, verifyMobileOtp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await sendMobileOtp(phone);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  async function handleComplete(code: string) {
    const { error } = await verifyMobileOtp(phone, code);
    if (error) {
      setError("That code didn't work. Try again.");
      (window as any).__otpTriggerError?.();
      return;
    }
    navigate("/complete-profile");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light dark:bg-bg-dark px-4 gap-6">
      <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">Verify your mobile</h1>
      {!sent ? (
        <form onSubmit={handleSend} className="w-full max-w-xs space-y-3">
          <input
            type="tel"
            required
            placeholder="+92 300 1234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <button className="w-full rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition">
            Send code
          </button>
        </form>
      ) : (
        <OtpInput onComplete={handleComplete} />
      )}
      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}
