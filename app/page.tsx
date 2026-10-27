import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { ProductList, ProductSummary } from "@/lib/types";

// har request pe fresh data (backend se)
export const dynamic = "force-dynamic";

const categories = [
  { label: "For Him", sub: "Woody, oud and spice", href: "/products?gender=Men" },
  { label: "For Her", sub: "Floral, fruity and powdery", href: "/products?gender=Women" },
  { label: "Unisex", sub: "Fresh, citrus and musk", href: "/products?gender=Unisex" },
];

const perks = [
  { icon: Truck, title: "Free shipping", text: "On orders above ₹3,000" },
  { icon: ShieldCheck, title: "100% authentic", text: "Sourced from official brands" },
  { icon: RotateCcw, title: "Easy returns", text: "7-day hassle-free returns" },
];

export default async function Home() {
  // dono calls ek saath (free hosting par time bachta hai)
  const [featured, latest] = await Promise.all([
    api<ProductSummary[]>("/api/products/featured").catch(() => null),
    api<ProductList>("/api/products?sort=newest&pageSize=4").catch(() => null),
  ]);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-2xl border border-line p-8 transition hover:-translate-y-1 hover:border-gold"
            >
              <h2 className="font-display text-3xl">{c.label}</h2>
              <p className="mt-1 text-mut">{c.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {!featured || !latest ? (
        <p className="mx-auto max-w-6xl px-5 text-mut" role="alert">
          Products abhi load nahi ho paaye. Free server so raha ho sakta hai (pehli baar 30-60 second lagte hain), ek minute baad page refresh karo.
        </p>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-5 pb-16">
            <h2 className="mb-8 font-display text-4xl sm:text-5xl">Featured Fragrances</h2>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {featured.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 pb-16">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-4xl sm:text-5xl">New Arrivals</h2>
              <Link href="/products?sort=newest" className="text-accent hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {latest.items.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </section>
        </>
      )}

      <section className="mx-auto max-w-6xl px-5">
        <div className="grid gap-4 rounded-2xl border border-line bg-card p-8 sm:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4">
              <Icon className="text-accent" size={32} />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-mut">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
