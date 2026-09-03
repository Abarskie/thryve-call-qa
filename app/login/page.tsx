"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFillDemo = () => {
    setEmail("test@example.com");
    setPassword("Password123!");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const res = await loginAction(formData);
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
          Welcome to Callsy QA
        </h1>
        <p className="text-xs text-slate-400">
          Sign in to access your call recordings and AI audit reports
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
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo fill button */}
        <div className="pt-2 border-t border-[#1e2e4a]/60">
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0e1726] hover:bg-[#182338] text-slate-400 hover:text-blue-400 border border-[#1e2e4a] rounded-xl text-[11px] font-semibold transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Quick fill demo account (test@example.com)
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/signup"
          className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
