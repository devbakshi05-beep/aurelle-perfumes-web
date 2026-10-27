"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { setDevCode } from "@/lib/devcode";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const input = "mt-1 h-12 w-full rounded-xl border border-line bg-bg px-4 outline-none focus:border-gold";

// ?next=/checkout jaisa link sirf apni site ke andar ka ho tabhi maano
function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  function goVerify(email: string, devCode?: string | null) {
    setDevCode(devCode);
    router.push(`/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(safeNext())}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast("Welcome back!");
        router.push(safeNext());
      } else {
        const r = await register(form.fullName, form.email, form.password);
        // purana backend seedha account bana deta hai aur code nahi bhejta, usse pakdo
        if (!r?.requiresVerification || !r.email) {
          throw new Error("Server ne verification code nahi bheja. Backend ka AuthController naya wala hai ya nahi check karo.");
        }
        toast("Verification code bheja gaya hai");
        goVerify(r.email, r.devCode);
      }
    } catch (err) {
      // password sahi hai par email verify nahi hua: verify page par bhejo
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        const dev = typeof err.data.devCode === "string" ? err.data.devCode : null;
        toast("Pehle email verify karo");
        goVerify(form.email, dev);
        return;
      }
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-5xl">{isLogin ? "Login" : "Create account"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-line bg-card p-6">
        {!isLogin && (
          <label className="block">
            <span className="text-sm text-mut">Full name</span>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              autoComplete="name"
              className={input}
            />
          </label>
        )}
        <label className="block">
          <span className="text-sm text-mut">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-sm text-mut">Password {isLogin ? "" : "(minimum 6 characters)"}</span>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className={input}
          />
        </label>
        {!isLogin && (
          <p className="text-sm text-mut">Register ke baad aapke email par 6 digit verification code aayega.</p>
        )}
        {error && (
          <p role="alert" className="text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button disabled={busy} className="min-h-12 w-full rounded-full bg-gold font-medium text-on-gold disabled:opacity-50">
          {busy ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p className="mt-4 text-mut">
        {isLogin ? "Naya user? " : "Already account hai? "}
        <Link href={isLogin ? "/register" : "/login"} className="text-accent underline">
          {isLogin ? "Register karo" : "Login karo"}
        </Link>
      </p>
    </div>
  );
}
