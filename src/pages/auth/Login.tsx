import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await loginWithEmail(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/feed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-[#1a1c1a] rounded-xl p-8 shadow-sm space-y-5"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-text-light dark:text-text-dark">
          Welcome back
        </h1>
        <div className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-teal text-white py-3 font-medium transition active:scale-[0.97] disabled:opacity-40"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary text-center">
          New here?{" "}
          <Link to="/signup" className="text-teal font-medium">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
