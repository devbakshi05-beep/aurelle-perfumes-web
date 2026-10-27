"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import type { Brand, ProductList } from "@/lib/types";

const MAX_PRICE = 10000;
const GENDERS = ["Men", "Women", "Unisex"];
const NOTES = ["Oud", "Rose", "Jasmine", "Amber", "Musk", "Vanilla", "Cedar", "Lemon"];
const SORTS: [string, string][] = [
  ["newest", "Newest"],
  ["priceAsc", "Price: low to high"],
  ["priceDesc", "Price: high to low"],
  ["name", "Name A-Z"],
];
const PAGE_SIZE = 12;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-10 rounded-full border px-4 text-sm ${
        active ? "border-gold bg-gold text-on-gold" : "border-line hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProductsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [data, setData] = useState<ProductList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState(Number(sp.get("maxPrice") ?? MAX_PRICE));

  const search = sp.get("search") ?? "";
  const gender = sp.get("gender") ?? "";
  const brandId = sp.get("brandId") ?? "";
  const note = sp.get("note") ?? "";
  const sort = sp.get("sort") ?? "newest";
  const page = Number(sp.get("page") ?? 1);
  const qs = sp.toString();

  // URL hi filters ka "source of truth" hai
  function setParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in updates)) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  useEffect(() => {
    api<Brand[]>("/api/products/brands").then(setBrands).catch(() => {});
  }, []);

  // URL badalte hi products dobara mangao
  useEffect(() => {
    let off = false;
    setLoading(true);
    setError("");
    const q = new URLSearchParams(qs);
    q.set("pageSize", String(PAGE_SIZE));
    api<ProductList>(`/api/products?${q.toString()}`)
      .then((d) => {
        if (!off) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!off) {
          setError((e as Error).message);
          setLoading(false);
        }
      });
    return () => {
      off = true;
    };
  }, [qs]);

  // slider chhodne ke 400ms baad price filter lagao
  useEffect(() => {
    const t = setTimeout(() => {
      const current = Number(sp.get("maxPrice") ?? MAX_PRICE);
      if (price !== current) setParams({ maxPrice: price >= MAX_PRICE ? null : String(price) });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  const hasFilters = !!(search || gender || brandId || note || price < MAX_PRICE);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  function clearAll() {
    setPrice(MAX_PRICE);
    router.replace(pathname);
  }

  function goPage(n: number) {
    setParams({ page: String(n) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">Shop</h1>
          <p className="text-mut" role="status">
            {data ? `${data.total} fragrance${data.total === 1 ? "" : "s"} found` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="flex min-h-11 items-center gap-2 rounded-full border border-line px-4 lg:hidden"
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
          <label className="flex items-center gap-2 text-sm text-mut">
            Sort
            <select
              value={sort}
              onChange={(e) => setParams({ sort: e.target.value })}
              className="min-h-11 rounded-full border border-line bg-card px-4 text-tx"
            >
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {search && (
        <button
          onClick={() => setParams({ search: null })}
          className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-gold px-4 text-sm"
        >
          Search: {search} <X size={14} />
        </button>
      )}

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} space-y-6 lg:block`} aria-label="Filters">
          <section>
            <h2 className="mb-2 font-display text-2xl">Gender</h2>
            <div className="flex flex-wrap gap-2">
              <Chip active={!gender} onClick={() => setParams({ gender: null })}>
                All
              </Chip>
              {GENDERS.map((g) => (
                <Chip key={g} active={gender === g} onClick={() => setParams({ gender: g })}>
                  {g}
                </Chip>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-2xl">Brand</h2>
            <div className="space-y-1">
              <label className="flex min-h-9 items-center gap-2">
                <input type="radio" name="brand" checked={!brandId} onChange={() => setParams({ brandId: null })} />
                All brands
              </label>
              {brands.map((b) => (
                <label key={b.id} className="flex min-h-9 items-center gap-2">
                  <input
                    type="radio"
                    name="brand"
                    checked={brandId === String(b.id)}
                    onChange={() => setParams({ brandId: String(b.id) })}
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-2xl">
              Max price: {price >= MAX_PRICE ? "Any" : inr(price)}
            </h2>
            <input
              type="range"
              min={1000}
              max={MAX_PRICE}
              step={500}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              aria-label="Maximum price"
              className="w-full accent-[var(--accent)]"
            />
          </section>

          <section>
            <h2 className="mb-2 font-display text-2xl">Notes</h2>
            <div className="flex flex-wrap gap-2">
              {NOTES.map((n) => (
                <Chip key={n} active={note === n} onClick={() => setParams({ note: note === n ? null : n })}>
                  {n}
                </Chip>
              ))}
            </div>
          </section>

          {hasFilters && (
            <button onClick={clearAll} className="min-h-11 w-full rounded-full border border-line hover:border-gold">
              Clear all filters
            </button>
          )}
        </aside>

        <div>
          {error && (
            <p role="alert" className="text-mut">
              Products load nahi ho paaye: {error}
            </p>
          )}
          {data && data.items.length === 0 && !loading && (
            <div className="rounded-2xl border border-line p-10 text-center">
              <p className="text-lg">No perfumes match these filters.</p>
              <button onClick={clearAll} className="mt-4 min-h-11 rounded-full bg-gold px-6 text-on-gold">
                Clear filters
              </button>
            </div>
          )}
          {data && data.items.length > 0 && (
            <div className={`grid grid-cols-2 gap-5 transition-opacity xl:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
              {data.items.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Pagination">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                className="min-h-11 rounded-full border border-line px-5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-mut">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= totalPages}
                className="min-h-11 rounded-full border border-line px-5 disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
