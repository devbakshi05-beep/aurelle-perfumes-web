"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Stars from "./Stars";
import QuickView from "./QuickView";
import WishlistButton from "./WishlistButton";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";

export default function ProductCard({ p, index = 0 }: { p: ProductSummary; index?: number }) {
  const [quick, setQuick] = useState(false);
  const { add } = useCart();

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group rounded-2xl border border-line bg-card p-3 transition-shadow hover:shadow-xl"
    >
      <div className="relative">
        <Link href={`/products/${p.id}`} className="block overflow-hidden rounded-xl bg-[#2A231F]">
          <div className="aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.imageUrl}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </Link>
        <WishlistButton productId={p.id} className="absolute right-3 top-3" />
        <button
          onClick={() => setQuick(true)}
          className="absolute inset-x-3 bottom-3 min-h-10 rounded-full bg-gold text-sm font-medium text-on-gold opacity-0 transition group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100"
        >
          Quick View
        </button>
      </div>

      <Link href={`/products/${p.id}`} className="block">
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-accent">
          {p.brand} · {p.gender}
        </p>
        <h3 className="font-display text-2xl">{p.name}</h3>
      </Link>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-lg">{inr(p.price)}</span>
        <span className="flex items-center gap-1 text-sm text-mut">
          <Stars value={p.avgRating} size={14} />
          {p.avgRating > 0 ? p.avgRating.toFixed(1) : "New"}
        </span>
      </div>

      <button
        onClick={() => add(p.id)}
        className="mt-3 min-h-11 w-full rounded-full border border-accent text-accent transition hover:bg-gold hover:text-on-gold"
      >
        Add to Cart
      </button>

      {quick && <QuickView id={p.id} onClose={() => setQuick(false)} />}
    </motion.article>
  );
}
