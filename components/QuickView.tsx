"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import Stars from "./Stars";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import type { ProductDetail, ReviewResult } from "@/lib/types";

export default function QuickView({ id, onClose }: { id: number; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [p, setP] = useState<ProductDetail | null>(null);
  const [rv, setRv] = useState<ReviewResult | null>(null);
  const { add } = useCart();

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  useEffect(() => {
    let off = false;
    Promise.all([
      api<ProductDetail>(`/api/products/${id}`),
      api<ReviewResult>(`/api/products/${id}/reviews`),
    ])
      .then(([a, b]) => {
        if (!off) {
          setP(a);
          setRv(b);
        }
      })
      .catch(() => {});
    return () => {
      off = true;
    };
  }, [id]);

  async function addAndClose() {
    await add(id);
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-label="Quick view"
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-auto rounded-2xl border border-line bg-card p-6 text-tx backdrop:bg-black/60"
    >
      <button
        onClick={() => ref.current?.close()}
        aria-label="Close quick view"
        className="float-right flex h-10 w-10 items-center justify-center rounded-full border border-line hover:border-gold"
      >
        <X size={18} />
      </button>
      {!p ? (
        <p className="py-10 text-mut">Loading...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.imageUrl} alt={p.name} className="aspect-[4/5] w-full rounded-xl bg-[#2A231F] object-cover" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              {p.brand?.name} · {p.gender}
            </p>
            <h2 className="mt-1 font-display text-4xl">{p.name}</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-mut">
              <Stars value={rv?.average ?? 0} /> {rv?.average ?? 0} ({rv?.count ?? 0})
            </div>
            <p className="mt-3 text-2xl">{inr(p.price)}</p>
            <p className="mt-3 text-mut">{p.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
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
            <p className="mt-3 text-sm text-mut">Size: {p.sizeMl} ml</p>
            <button
              onClick={addAndClose}
              disabled={p.stock < 1}
              className="mt-4 min-h-12 w-full rounded-full bg-gold font-medium text-on-gold disabled:opacity-50"
            >
              {p.stock < 1 ? "Out of stock" : "Add to Cart"}
            </button>
            <Link href={`/products/${p.id}`} className="mt-3 block text-center text-accent hover:underline">
              View full details
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}
