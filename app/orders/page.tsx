"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PaymentModal, { type PayResult } from "@/components/PaymentModal";
import Stepper from "@/components/Stepper";
import { api } from "@/lib/api";
import { fmtDate, inr } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { Order, PaymentSession } from "@/lib/types";

export default function OrdersPage() {
  const { token, ready } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [trackId, setTrackId] = useState("");
  const [session, setSession] = useState<PaymentSession | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await api<Order[]>("/api/orders", { token }));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login?next=/orders");
      return;
    }
    load();
  }, [ready, token, router, load]);

  async function payNow(orderId: number) {
    try {
      setSession(await api<PaymentSession>(`/api/payments/${orderId}/session`, { method: "POST", token }));
    } catch (e) {
      toast((e as Error).message);
    }
  }

  const finish = useCallback(
    (r: PayResult) => {
      setSession(null);
      toast(r === "paid" ? "Payment successful" : r === "failed" ? "Payment fail ho gaya" : "Payment cancel hua");
      load();
    },
    [toast, load]
  );

  if (error) return <p className="mx-auto max-w-6xl px-5 py-10 text-mut">{error}</p>;
  if (!orders) return <p className="mx-auto max-w-6xl px-5 py-10 text-mut">Loading...</p>;

  const shown = trackId.trim() ? orders.filter((o) => String(o.id) === trackId.trim().replace("#", "")) : orders;
  const payColor = (s: string) =>
    s === "Paid" ? "text-green-700 dark:text-green-400" : s === "Failed" ? "text-red-600 dark:text-red-400" : "text-mut";

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="font-display text-5xl">My orders</h1>

      <label className="mt-6 block">
        <span className="text-sm text-mut">Track by order number</span>
        <input
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          placeholder="e.g. 3"
          inputMode="numeric"
          className="mt-1 h-12 w-full max-w-xs rounded-full border border-line bg-card px-5 outline-none focus:border-gold"
        />
      </label>

      {orders.length === 0 && (
        <p className="mt-8 text-mut">
          Abhi tak koi order nahi.{" "}
          <Link href="/products" className="text-accent underline">
            Shopping shuru karo
          </Link>
        </p>
      )}
      {orders.length > 0 && shown.length === 0 && <p className="mt-8 text-mut">Is number ka order nahi mila.</p>}

      <div className="mt-8 space-y-6">
        {shown.map((o) => (
          <article key={o.id} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-3xl">Order #{o.id}</h2>
              <span className="text-mut">
                {fmtDate(o.orderDate)} · {inr(o.total)}
              </span>
            </div>
            <ul className="mt-3 text-mut">
              {o.items.map((i) => (
                <li key={i.productId}>
                  {i.name} × {i.quantity} ({inr(i.unitPrice)})
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-mut">Ship to: {o.shippingAddress}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span>
                Payment: {o.paymentMethod === "COD" ? "Cash on Delivery" : "Online"} ·{" "}
                <b className={payColor(o.paymentStatus)}>{o.paymentStatus}</b>
              </span>
              {o.paymentRef && <span className="text-mut">Ref: {o.paymentRef}</span>}
              {o.paymentMethod === "Online" && o.paymentStatus !== "Paid" && o.status !== "Cancelled" && (
                <button
                  onClick={() => payNow(o.id)}
                  className="min-h-10 rounded-full bg-gold px-5 font-medium text-on-gold"
                >
                  Pay now
                </button>
              )}
            </div>

            <div className="mt-4">
              <Stepper status={o.status} />
            </div>
          </article>
        ))}
      </div>

      {session && <PaymentModal session={session} onDone={finish} />}
    </div>
  );
}
