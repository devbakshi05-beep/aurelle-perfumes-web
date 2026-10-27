import { Suspense } from "react";
import ProductsClient from "@/components/ProductsClient";

export const metadata = { title: "Shop | Aurelle Perfumes" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-10 text-mut">Loading...</p>}>
      <ProductsClient />
    </Suspense>
  );
}
