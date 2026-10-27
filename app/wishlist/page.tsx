"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { token, ready } = useAuth();
  const { items } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (ready && !token) router.replace("/login?next=/wishlist");
  }, [ready, token, router]);

  if (!ready || !token) return <p className="mx-auto max-w-6xl px-5 py-10 text-mut">Loading...</p>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-5xl">My wishlist</h1>
      <p className="text-mut" role="status">
        {items.length} saved fragrance{items.length === 1 ? "" : "s"}
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line p-10 text-center">
          <p className="text-lg">Wishlist abhi khali hai.</p>
          <p className="mt-1 text-mut">Kisi bhi perfume ke heart button ko dabao.</p>
          <Link href="/products" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-gold px-8 text-on-gold">
            Browse fragrances
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
