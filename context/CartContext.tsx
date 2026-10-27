"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Cart } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const EMPTY: Cart = { items: [], total: 0 };

type Ctx = {
  cart: Cart;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (productId: number, quantity?: number) => Promise<void>;
  update: (itemId: number, quantity: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartCtx = createContext<Ctx>(null as unknown as Ctx);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, ready, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [cart, setCart] = useState<Cart>(EMPTY);
  const [open, setOpen] = useState(false);

  // har cart call yahan se jaati hai
  const run = useCallback(
    async (path: string, init: { method?: string; body?: string } = {}) => {
      try {
        setCart(await api<Cart>(path, { ...init, token }));
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

  const refresh = useCallback(async () => {
    if (!token) {
      setCart(EMPTY);
      return;
    }
    await run("/api/cart");
  }, [token, run]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  const add = useCallback(
    async (productId: number, quantity = 1) => {
      if (!token) {
        toast("Cart use karne ke liye pehle login karo");
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const ok = await run("/api/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) });
      if (ok) {
        toast("Added to cart");
        setOpen(true);
      }
    },
    [token, run, toast, router, pathname]
  );

  const update = useCallback(
    async (itemId: number, quantity: number) => {
      if (quantity < 1) {
        await run(`/api/cart/${itemId}`, { method: "DELETE" });
        return;
      }
      await run(`/api/cart/${itemId}`, { method: "PUT", body: JSON.stringify({ quantity }) });
    },
    [run]
  );

  const remove = useCallback(
    async (itemId: number) => {
      await run(`/api/cart/${itemId}`, { method: "DELETE" });
    },
    [run]
  );

  const count = cart.items.reduce((n, i) => n + i.quantity, 0);

  const value = useMemo(
    () => ({ cart, count, open, setOpen, add, update, remove, refresh }),
    [cart, count, open, add, update, remove, refresh]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
