"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";

export default function CartDrawer() {
  const { cart, open, setOpen, update, remove } = useCart();

  // Esc dabane par band
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const btn = "flex h-8 w-8 items-center justify-center rounded-full border border-line hover:border-gold";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-40 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <motion.aside
          key="drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-card p-5"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl">Your cart</h2>
            <button onClick={() => setOpen(false)} aria-label="Close cart" className={btn}>
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto">
            {cart.items.length === 0 && <p className="text-mut">Your cart is empty.</p>}
            {cart.items.map((i) => (
              <div key={i.id} className="flex items-center gap-3 border-b border-line py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.imageUrl} alt="" className="h-20 w-16 rounded-lg bg-[#2A231F] object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-sm text-mut">{inr(i.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => update(i.id, i.quantity - 1)} aria-label="Decrease quantity" className={btn}>
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center">{i.quantity}</span>
                    <button onClick={() => update(i.id, i.quantity + 1)} aria-label="Increase quantity" className={btn}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span>{inr(i.lineTotal)}</span>
                  <button onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`} className="text-mut hover:text-accent">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-lg">
            <span>Total</span>
            <b>{inr(cart.total)}</b>
          </div>
          {cart.items.length > 0 ? (
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-gold font-medium text-on-gold"
            >
              Checkout
            </Link>
          ) : (
            <button
              onClick={() => setOpen(false)}
              className="mt-4 min-h-12 rounded-full border border-line hover:border-gold"
            >
              Continue shopping
            </button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
