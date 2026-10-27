"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

type Ctx = {
  items: ProductSummary[];
  count: number;
  has: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
};

const WishCtx = createContext<Ctx>(null as unknown as Ctx);
export const useWishlist = () => useContext(WishCtx);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { token, ready, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [items, setItems] = useState<ProductSummary[]>([]);

  // wishlist ki har call yahan se jaati hai; backend poori nayi list wapas deta hai
  const run = useCallback(
    async (path: string, method = "GET") => {
      try {
        setItems(await api<ProductSummary[]>(path, { method, token }));
        return true;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          logout();
          toast("Session expire ho gaya, dobara login karo");
        } else {
          toast((e as Error).message);
        }
        return false;
      }
    },
    [token, logout, toast]
  );

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      setItems([]);
      return;
    }
    run("/api/wishlist");
  }, [ready, token, run]);

  const ids = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const has = useCallback((id: number) => ids.has(id), [ids]);

  const toggle = useCallback(
    async (id: number) => {
      if (!token) {
        toast("Wishlist ke liye pehle login karo");
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (ids.has(id)) {
        if (await run(`/api/wishlist/${id}`, "DELETE")) toast("Removed from wishlist");
      } else {
        if (await run(`/api/wishlist/${id}`, "POST")) toast("Added to wishlist");
      }
    },
    [token, ids, run, toast, router, pathname]
  );

  const value = useMemo(() => ({ items, count: items.length, has, toggle }), [items, has, toggle]);

  return <WishCtx.Provider value={value}>{children}</WishCtx.Provider>;
}
