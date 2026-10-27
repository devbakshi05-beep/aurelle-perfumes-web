"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getDevCode, setDevCode } from "@/lib/devcode";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const COOLDOWN = 30;

export default function VerifyEmailForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const { verifyEmail, resendCode } = useAuth();
  const { toast } = useToast();

  const email = sp.get("email") ?? "";
  const rawNext = sp.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const [code, setCode] = useState("");
  const [devCode, setDevCodeState] = useState("");
  const [wait, setWait] = useState(COOLDOWN);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // demo mode ka code (agar backend mein Gmail set nahi hai)
  useEffect(() => {
    setDevCodeState(getDevCode());
  }, []);

  // resend ka countdown
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await verifyEmail(email, code.trim());
      setDevCode(null);
      toast("Email verified! Welcome");
      router.push(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    setInfo("");
    try {
      const r = await resendCode(email);
      setDevCode(r.devCode);
      setDevCodeState(r.devCode ?? "");
      setInfo(r.message);
      setWait(COOLDOWN);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!email) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-display text-5xl">Verify email</h1>
        <p className="mt-4 text-mut">
          Email nahi mila.{" "}
          <Link href="/register" className="text-accent underline">
            Pehle register karo
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-5xl">Verify your email</h1>
      <p className="mt-3 text-mut">
        Humne <b className="text-tx">{email}</b> par 6 digit code bheja hai. Code 10 minute tak valid hai.
      </p>

      {devCode && (
        <div className="mt-4 rounded-xl border border-gold p-4 text-sm" role="note">
          <b>Demo mode:</b> backend mein Gmail set nahi hai, isliye code yahan dikh raha hai: <b className="text-lg tracking-widest">{devCode}</b>
          <button type="button" onClick={() => setCode(devCode)} className="mt-2 block min-h-10 text-accent underline">
            Code bhar do
          </button>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-6">
        <label className="block">
          <span className="text-sm text-mut">6 digit code</span>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            className="mt-1 h-14 w-full rounded-xl border border-line bg-bg px-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-gold"
          />
        </label>
        {error && (
          <p role="alert" className="text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {info && (
          <p role="status" className="text-mut">
            {info}
          </p>
        )}
        <button
          disabled={busy || code.length !== 6}
          className="min-h-12 w-full rounded-full bg-gold font-medium text-on-gold disabled:opacity-50"
        >
          {busy ? "Verifying..." : "Verify"}
        </button>
      </form>

      <p className="mt-4 text-mut">
        Code nahi aaya?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={wait > 0}
          className="min-h-10 text-accent underline disabled:text-mut disabled:no-underline"
        >
          {wait > 0 ? `Resend code (${wait}s)` : "Resend code"}
        </button>
      </p>
      <p className="mt-1 text-sm text-mut">Spam / Junk folder bhi check kar lo.</p>
    </div>
  );
}
