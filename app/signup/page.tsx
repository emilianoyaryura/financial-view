"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/supabase/client";
import { useTheme } from "@/lib/hooks/use-theme";
import { ALLOWED_EMAILS } from "@/lib/constants";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Check allowlist
    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      setError("Registration is currently invite-only.");
      return;
    }

    setIsLoading(true);

    const supabase = getSupabaseClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/api/auth/confirm`,
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-[340px] text-center animate-fade-in">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-foreground-tertiary text-sm mt-3 leading-relaxed">
            We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Click it to activate your account.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 text-xs text-foreground-secondary hover:text-foreground transition-colors font-medium"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {mounted && (
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-background-secondary border border-border text-foreground-tertiary hover:text-foreground transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <SunIcon className="w-4 h-4" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[340px] animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              StockAR
            </h1>
            <p className="text-foreground-tertiary text-xs mt-1.5">
              Create your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs text-foreground-secondary mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-tertiary/40 focus:outline-none focus:border-foreground-tertiary/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs text-foreground-secondary mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-tertiary/40 focus:outline-none focus:border-foreground-tertiary/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs text-foreground-secondary mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-tertiary/40 focus:outline-none focus:border-foreground-tertiary/50 transition-colors"
              />
            </div>

            {error && <p className="text-xs text-negative">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-sm font-medium py-2.5 rounded-lg mt-1 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-foreground-tertiary">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-xs text-foreground-tertiary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground-secondary hover:text-foreground transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="py-4 text-center">
        <p className="text-[11px] text-foreground-tertiary">
          Real-time quotes via Finnhub. Dollar rates via DolarAPI.
        </p>
      </div>
    </div>
  );
}
