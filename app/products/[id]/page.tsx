"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Minus, Plus, Star } from "lucide-react";
import Stars from "@/components/Stars";
import WishlistButton from "@/components/WishlistButton";
import { api } from "@/lib/api";
import { fmtDate, inr } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type { ProductDetail, ReviewResult } from "@/lib/types";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { add } = useCart();
  const { toast } = useToast();

  const [p, setP] = useState<ProductDetail | null>(null);
  const [rv, setRv] = useState<ReviewResult | null>(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let off = false;
    Promise.all([api<ProductDetail>(`/api/products/${id}`), api<ReviewResult>(`/api/products/${id}/reviews`)])
      .then(([a, b]) => {
        if (!off) {
          setP(a);
          setRv(b);
        }
      })
      .catch((e) => !off && setError((e as Error).message));
    return () => {
      off = true;
    };
  }, [id]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      setRv(
        await api<ReviewResult>(`/api/products/${id}/reviews`, {
          method: "POST",
          token,
          body: JSON.stringify({ rating, comment }),
        })
      );
      setComment("");
      toast("Review added");
    } catch (err) {
      toast((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="mx-auto max-w-6xl px-5 py-10 text-mut">Product nahi mila: {error}</p>;
  if (!p) return <p className="mx-auto max-w-6xl px-5 py-10 text-mut">Loading...</p>;

  const stockText = p.stock < 1 ? "Out of stock" : p.stock < 10 ? `Only ${p.stock} left` : "In stock";

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <Link href="/products" className="text-accent hover:underline">
        ← Back to shop
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div
          className="group cursor-zoom-in overflow-hidden rounded-2xl bg-[#2A231F]"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.imageUrl}
            alt={p.name}
            style={{ transformOrigin: origin }}
            className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-150"
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            {p.brand?.name} · {p.gender}
          </p>
          <h1 className="mt-1 font-display text-5xl">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-mut">
            <Stars value={rv?.average ?? 0} size={18} /> {rv?.average ?? 0} ({rv?.count ?? 0} reviews)
          </div>
          <p className="mt-4 text-3xl">{inr(p.price)}</p>
          <p className="mt-1 text-sm text-mut">
            {p.sizeMl} ml · {stockText}
          </p>
          <p className="mt-4 text-mut">{p.description}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            {[
              ["TOP", p.topNotes],
              ["HEART", p.heartNotes],
              ["BASE", p.baseNotes],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line p-3">
                <b className="block text-[11px] tracking-[0.2em] text-accent">{k}</b>
                {v || "-"}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(Math.max(1, p.stock), q + 1))}
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => add(p.id, qty)}
              disabled={p.stock < 1}
              className="min-h-12 flex-1 rounded-full bg-gold font-medium text-on-gold disabled:opacity-50"
            >
              Add to Cart
            </button>
            <WishlistButton productId={p.id} />
          </div>
        </div>
      </div>

      <section className="mt-16" aria-labelledby="reviews-h">
        <h2 id="reviews-h" className="font-display text-4xl">
          Reviews
        </h2>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div>
            {rv && rv.reviews.length === 0 && <p className="text-mut">No reviews yet. Be the first!</p>}
            {rv?.reviews.map((r) => (
              <div key={r.id} className="border-b border-line py-4">
                <div className="flex items-center justify-between">
                  <b>{r.reviewer}</b>
                  <span className="text-sm text-mut">{fmtDate(r.createdAt)}</span>
                </div>
                <Stars value={r.rating} />
                <p className="mt-1 text-mut">{r.comment}</p>
              </div>
            ))}
          </div>

          <div>
            {token ? (
              <form onSubmit={submitReview} className="space-y-4 rounded-2xl border border-line p-5">
                <h3 className="font-display text-2xl">Write a review</h3>
                <div role="radiogroup" aria-label="Rating" className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onClick={() => setRating(n)}
                      className="flex h-11 w-11 items-center justify-center"
                    >
                      <Star size={26} className={n <= rating ? "fill-gold text-gold" : "text-line"} />
                    </button>
                  ))}
                </div>
                <label className="block">
                  <span className="text-sm text-mut">Your review</span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    maxLength={1000}
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-line bg-bg p-3 outline-none focus:border-gold"
                  />
                </label>
                <button
                  disabled={busy}
                  className="min-h-11 rounded-full bg-gold px-6 font-medium text-on-gold disabled:opacity-50"
                >
                  {busy ? "Submitting..." : "Submit review"}
                </button>
              </form>
            ) : (
              <p className="rounded-2xl border border-line p-5 text-mut">
                Review likhne ke liye{" "}
                <Link href={`/login?next=/products/${p.id}`} className="text-accent underline">
                  login karo
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
