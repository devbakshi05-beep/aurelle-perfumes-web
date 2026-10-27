"use client";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ productId, className = "" }: { productId: number; className?: string }) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card hover:border-gold ${className}`}
    >
      <Heart size={20} className={active ? "fill-gold text-gold" : "text-tx"} />
    </button>
  );
}
