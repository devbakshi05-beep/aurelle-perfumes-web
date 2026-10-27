"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PaymentModal, { type PayResult } from "@/components/PaymentModal";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type { PaymentSession } from "@/lib/types";

type Method = "COD" | "Online";

export default function CheckoutPage() {
  const { token, ready } = useAuth();
  const { cart, refresh } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<Method>("COD");
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !token) router.replace("/login?next=/checkout");
  }, [ready, token, router]);

  // payment khatam hone par (paid / failed / cancelled) yahan aate hain
  const finish = useCallback(
    (r: PayResult) => {
      setSession(null);
      toast(
        r === "paid"
          ? "Payment successful. Thank you!"
          : r === "failed"
            ? "Payment fail ho gaya. Orders page se dobara try kar sakte ho"
            : "Payment cancel hua. Orders page se 'Pay now' kar sakte ho"
      );
      router.push("/orders");
    },
    [toast, router]
  );

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      // 1) order banao (cart khali ho jaata hai, stock kam hota hai)
      const r = await api<{ id: number; total: number; status: string }>("/api/orders/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({ shippingAddress: address, paymentMethod: method }),
      });
      await refresh();

      if (method === "COD") {
        toast(`Order #${r.id} placed (Cash on Delivery)`);
        router.push("/orders");
        return;
      }

      // 2) Online: payment session lo aur payment window kholo
      setSession(await api<PaymentSession>(`/api/payments/${r.id}/session`, { method: "POST", token }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !token) return <p className="mx-auto max-w-6xl px-5 py-10 text-mut">Loading...</p>;

  if (session) {
    return (
      <>
        <p className="mx-auto max-w-6xl px-5 py-10 text-mut" role="status">
          Payment chal raha hai...
        </p>
        <PaymentModal session={session} onDone={finish} />
      </>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-display text-5xl">Your cart is empty</h1>
        <Link href="/products" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-gold px-8 text-on-gold">
          Continue shopping
        </Link>
      </div>
    );
  }

  const option = (value: Method, title: string, text: string) => (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
        method === value ? "border-gold bg-card" : "border-line"
      }`}
    >
      <input
        type="radio"
        name="payment"
        checked={method === value}
        onChange={() => setMethod(value)}
        className="mt-1"
      />
      <span>
        <b className="block">{title}</b>
        <span className="text-sm text-mut">{text}</span>
      </span>
    </label>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-2">
      <form onSubmit={placeOrder} className="space-y-4">
        <h1 className="font-display text-5xl">Checkout</h1>
        <label className="block">
          <span className="text-sm text-mut">Shipping address</span>
          <textarea
            required
            maxLength={300}
            rows={5}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-card p-3 outline-none focus:border-gold"
          />
        </label>

        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm text-mut">Payment method</legend>
          {option("COD", "Cash on Delivery", "Delivery ke time paisa do")}
          {option("Online", "Pay online (test mode)", "Card / UPI. Demo ya Razorpay test mode, koi asli paisa nahi katega")}
        </fieldset>

        {error && (
          <p role="alert" className="text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button disabled={busy} className="min-h-12 w-full rounded-full bg-gold font-medium text-on-gold disabled:opacity-50">
          {busy ? "Please wait..." : method === "COD" ? `Place order · ${inr(cart.total)}` : `Continue to payment · ${inr(cart.total)}`}
        </button>
      </form>

      <section aria-label="Order summary" className="rounded-2xl border border-line bg-card p-6">
        <h2 className="font-display text-3xl">Summary</h2>
        {cart.items.map((i) => (
          <div key={i.id} className="flex justify-between border-b border-line py-3">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{inr(i.lineTotal)}</span>
          </div>
        ))}
        <div className="mt-4 flex justify-between text-xl">
          <span>Total</span>
          <b>{inr(cart.total)}</b>
        </div>
      </section>
    </div>
  );
}
