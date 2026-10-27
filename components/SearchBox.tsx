"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import type { ProductList, ProductSummary } from "@/lib/types";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);

  // type karne ke 250ms baad suggestions mangao (debounce)
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await api<ProductList>(`/api/products?search=${encodeURIComponent(term)}&pageSize=5`);
        if (!cancelled) {
          setItems(r.items);
          setOpen(true);
        }
      } catch {}
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  // bahar click karne par dropdown band
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div ref={box} className="relative w-full sm:w-72">
      <form onSubmit={submit} role="search">
        <label htmlFor="site-search" className="sr-only">
          Search perfumes
        </label>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mut" />
        <input
          id="site-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search perfumes or brands"
          autoComplete="off"
          className="h-11 w-full rounded-full border border-line bg-card pl-11 pr-4 outline-none focus:border-gold"
        />
      </form>
      {open && items.length > 0 && (
        <ul className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-2xl border border-line bg-card shadow-xl">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/products/${p.id}`}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 hover:bg-bg"
              >
                <span>
                  {p.name}
                  <span className="block text-xs text-mut">{p.brand}</span>
                </span>
                <span className="text-sm">{inr(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
