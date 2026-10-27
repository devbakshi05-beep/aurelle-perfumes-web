"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import SearchBox from "./SearchBox";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/products?gender=Men", label: "Men" },
  { href: "/products?gender=Women", label: "Women" },
  { href: "/products?gender=Unisex", label: "Unisex" },
];

const linkCls = "flex min-h-11 items-center rounded-full px-4 hover:text-accent";

export default function Header() {
  const { user, ready, logout } = useAuth();
  const { count, setOpen } = useCart();
  const { count: wishCount } = useWishlist();

  return (
    <>
      <div className="bg-gold px-4 py-2 text-center text-xs tracking-widest text-on-gold">
        FREE SHIPPING ABOVE ₹3,000 | 100% AUTHENTIC | EASY RETURNS
      </div>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4">
        <Link href="/" className="font-display text-3xl tracking-[0.25em] text-accent">
          AURELLE
        </Link>

        <nav aria-label="Main" className="order-last flex w-full flex-wrap gap-1 lg:order-none lg:w-auto">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls}>
              {l.label}
            </Link>
          ))}
        </nav>

        <SearchBox />

        <div className="flex items-center gap-1">
          {ready && user && (
            <>
              <Link href="/wishlist" className={linkCls}>
                Wishlist{wishCount > 0 ? ` (${wishCount})` : ""}
              </Link>
              <Link href="/orders" className={linkCls}>
                Orders
              </Link>
              {user.role === "Admin" && (
                <Link href="/admin" className={linkCls}>
                  Admin
                </Link>
              )}
              <button onClick={logout} className={linkCls}>
                Logout
              </button>
            </>
          )}
          {ready && !user && (
            <Link href="/login" className={linkCls}>
              Login
            </Link>
          )}

          <button
            onClick={() => setOpen(true)}
            aria-label={`Open cart, ${count} items`}
            className="relative mx-1 flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-gold"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-medium text-on-gold">
                {count}
              </span>
            )}
          </button>
          <ThemeToggle />
        </div>
      </header>
    </>
  );
}
