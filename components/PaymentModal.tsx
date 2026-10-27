"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { loadRazorpay } from "@/lib/razorpay";
import { useAuth } from "@/context/AuthContext";
import type { PaymentSession } from "@/lib/types";

export type PayResult = "paid" | "failed" | "cancelled";
type Props = { session: PaymentSession; onDone: (r: PayResult) => void };

// session.mode se tay hota hai ki asli Razorpay chalega ya demo form
export default function PaymentModal({ session, onDone }: Props) {
  return session.mode === "razorpay" ? (
    <RazorpayRunner session={session} onDone={onDone} />
  ) : (
    <DemoDialog session={session} onDone={onDone} />
  );
}

/* ---------- Asli Razorpay (test mode) ---------- */
function RazorpayRunner({ session, onDone }: Props) {
  const { token, user } = useAuth();
  const started = useRef(false);
  const paying = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const done = (r: PayResult) => {
      if (finished.current) return;
      finished.current = true;
      onDone(r);
    };

    (async () => {
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) return done("failed");

      const rzp = new window.Razorpay({
        key: session.keyId ?? "",
        amount: session.amount,
        currency: session.currency,
        name: "Aurelle Perfumes",
        description: `Order #${session.orderId}`,
        order_id: session.gatewayOrderId ?? "",
        prefill: { name: user?.fullName, email: user?.email },
        theme: { color: "#C9A66B" },
        handler: async (r) => {
          paying.current = true; // ab modal band hone ko "cancel" mat samjho
          try {
            // asli check server karta hai: signature sahi hai ya nahi
            await api("/api/payments/verify", {
              method: "POST",
              token,
              body: JSON.stringify({
                orderId: session.orderId,
                razorpayOrderId: r.razorpay_order_id,
                razorpayPaymentId: r.razorpay_payment_id,
                razorpaySignature: r.razorpay_signature,
              }),
            });
            done("paid");
          } catch {
            done("failed");
          }
        },
        modal: {
          ondismiss: () => {
            if (!paying.current) done("cancelled");
          },
        },
      });
      rzp.open();
    })();
  }, [session, token, user, onDone]);

  return null;
}

/* ---------- Demo payment (nakli card form) ---------- */
function DemoDialog({ session, onDone }: Props) {
  const { token } = useAuth();
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  async function confirm(success: boolean) {
    setBusy(true);
    setError("");
    try {
      await api("/api/payments/demo-confirm", {
        method: "POST",
        token,
        body: JSON.stringify({ orderId: session.orderId, success }),
      });
      onDone(success ? "paid" : "failed");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const field = "mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3 text-mut";

  return (
    <dialog
      ref={ref}
      onCancel={() => onDone("cancelled")}
      aria-label="Demo payment"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-card p-6 text-tx backdrop:bg-black/60"
    >
      <h2 className="font-display text-3xl">Demo payment</h2>
      <p className="mt-1 rounded-xl border border-gold p-3 text-sm">
        Ye sirf demo hai. Koi asli paisa nahi katega aur koi asli card daalne ki zaroorat nahi.
      </p>

      <p className="mt-4 text-lg">
        Order #{session.orderId} · <b>{inr(session.amount / 100)}</b>
      </p>

      <div className="mt-3 space-y-3">
        <label className="block text-sm">
          Card number
          <input readOnly value="4111 1111 1111 1111" className={field} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Expiry
            <input readOnly value="12/30" className={field} />
          </label>
          <label className="block text-sm">
            CVV
            <input readOnly value="123" className={field} />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-2">
        <button
          onClick={() => confirm(true)}
          disabled={busy}
          className="min-h-12 rounded-full bg-gold font-medium text-on-gold disabled:opacity-50"
        >
          {busy ? "Please wait..." : `Pay ${inr(session.amount / 100)}`}
        </button>
        <button
          onClick={() => confirm(false)}
          disabled={busy}
          className="min-h-11 rounded-full border border-line hover:border-gold disabled:opacity-50"
        >
          Simulate failed payment
        </button>
        <button onClick={() => onDone("cancelled")} disabled={busy} className="min-h-11 text-mut underline">
          Cancel
        </button>
      </div>
    </dialog>
  );
}
