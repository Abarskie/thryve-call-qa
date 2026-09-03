"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    startTransition(async () => {
      const res = await signUpAction(formData);
      if (res && !res.success && res.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8">
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 mb-2">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Create Callsy QA Account
        </h1>
        <p className="text-xs text-slate-400">
          Start auditing agent calls and improving QA compliance
        </p>
      </div>

      <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@example.com"
                disabled={isPending}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                disabled={isPending}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                disabled={isPending}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
