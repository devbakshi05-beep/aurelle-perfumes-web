"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { fmtDate, inr } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ORDER_STATUSES } from "@/lib/types";
import type { AdminOrder, Brand, ProductDetail, ProductList, ProductSummary, Stats } from "@/lib/types";

const field = "mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3 outline-none focus:border-gold";
const emptyForm = {
  name: "",
  description: "",
  price: "",
  sizeMl: "100",
  gender: "Unisex",
  topNotes: "",
  heartNotes: "",
  baseNotes: "",
  imageUrl: "",
  stock: "20",
  isFeatured: false,
  brandId: "",
};

export default function AdminPage() {
  const { user, token, ready } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "Admin";

  const [tab, setTab] = useState<"overview" | "products" | "orders">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [newBrand, setNewBrand] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [s, p, o, b] = await Promise.all([
        api<Stats>("/api/admin/stats", { token }),
        api<ProductList>("/api/products?pageSize=100", { token }),
        api<AdminOrder[]>("/api/orders/all", { token }),
        api<Brand[]>("/api/products/brands"),
      ]);
      setStats(s);
      setProducts(p.items);
      setOrders(o);
      setBrands(b);
    } catch (e) {
      toast((e as Error).message);
    }
  }, [token, toast]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  function startNew() {
    setForm({ ...emptyForm, brandId: brands[0] ? String(brands[0].id) : "" });
    setEditing("new");
  }

  async function startEdit(id: number) {
    try {
      const p = await api<ProductDetail>(`/api/products/${id}`);
      setForm({
        name: p.name,
        description: p.description,
        price: String(p.price),
        sizeMl: String(p.sizeMl),
        gender: p.gender,
        topNotes: p.topNotes,
        heartNotes: p.heartNotes,
        baseNotes: p.baseNotes,
        imageUrl: p.imageUrl,
        stock: String(p.stock),
        isFeatured: p.isFeatured,
        brandId: String(p.brandId),
      });
      setEditing(id);
    } catch (e) {
      toast((e as Error).message);
    }
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    const body = JSON.stringify({
      ...form,
      price: Number(form.price),
      sizeMl: Number(form.sizeMl),
      stock: Number(form.stock),
      brandId: Number(form.brandId),
    });
    try {
      if (editing === "new") await api("/api/admin/products", { method: "POST", token, body });
      else await api(`/api/admin/products/${editing}`, { method: "PUT", token, body });
      toast("Product saved");
      setEditing(null);
      load();
    } catch (err) {
      toast((err as Error).message);
    }
  }

  async function deleteProduct(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api(`/api/admin/products/${id}`, { method: "DELETE", token });
      toast("Product deleted");
      load();
    } catch (err) {
      toast((err as Error).message);
    }
  }

  async function addBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!newBrand.trim()) return;
    try {
      await api("/api/admin/brands", { method: "POST", token, body: JSON.stringify(newBrand.trim()) });
      setNewBrand("");
      toast("Brand added");
      load();
    } catch (err) {
      toast((err as Error).message);
    }
  }

  async function setStatus(orderId: number, status: string) {
    try {
      await api(`/api/orders/${orderId}/status`, { method: "PUT", token, body: JSON.stringify({ status }) });
      toast(`Order #${orderId}: ${status}`);
      load();
    } catch (err) {
      toast((err as Error).message);
    }
  }

  if (!ready) return <p className="mx-auto max-w-6xl px-5 py-10 text-mut">Loading...</p>;
  if (!isAdmin) {
    return (
      <p className="mx-auto max-w-6xl px-5 py-10 text-mut">
        Ye page sirf Admin ke liye hai.{" "}
        <Link href="/login?next=/admin" className="text-accent underline">
          Admin se login karo
        </Link>
      </p>
    );
  }

  const tabBtn = (t: typeof tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      aria-pressed={tab === t}
      className={`min-h-11 rounded-full border px-5 ${
        tab === t ? "border-gold bg-gold text-on-gold" : "border-line hover:border-gold"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-5xl">Admin dashboard</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabBtn("overview", "Overview")}
        {tabBtn("products", "Products")}
        {tabBtn("orders", "Orders")}
      </div>

      {tab === "overview" && stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Orders", stats.orders],
            ["Revenue (paid)", inr(stats.revenue)],
            ["Products", stats.products],
            ["Customers", stats.customers],
            ["Low stock (<10)", stats.lowStock],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-line bg-card p-5">
              <p className="text-sm text-mut">{k}</p>
              <p className="font-display text-4xl text-accent">{v}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="mt-8">
          {editing === null ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={startNew} className="min-h-11 rounded-full bg-gold px-6 font-medium text-on-gold">
                  Add product
                </button>
                <form onSubmit={addBrand} className="flex gap-2">
                  <label className="sr-only" htmlFor="nb">
                    New brand name
                  </label>
                  <input
                    id="nb"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="New brand name"
                    className="h-11 rounded-full border border-line bg-card px-4 outline-none focus:border-gold"
                  />
                  <button className="min-h-11 rounded-full border border-line px-5 hover:border-gold">Add brand</button>
                </form>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead className="text-sm text-mut">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Price</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-line">
                        <td className="p-3">{p.name}</td>
                        <td className="p-3">{p.brand}</td>
                        <td className="p-3">{p.gender}</td>
                        <td className="p-3">{inr(p.price)}</td>
                        <td className="flex gap-2 p-3">
                          <button onClick={() => startEdit(p.id)} className="min-h-10 rounded-full border border-line px-4 hover:border-gold">
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id, p.name)}
                            className="min-h-10 rounded-full border border-line px-4 hover:border-red-500"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <form onSubmit={saveProduct} className="grid gap-4 rounded-2xl border border-line bg-card p-6 sm:grid-cols-2">
              <h2 className="font-display text-3xl sm:col-span-2">{editing === "new" ? "Add product" : "Edit product"}</h2>
              <label>
                Name
                <input required className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                Brand
                <select required className={field} value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Price (₹)
                <input required type="number" min={1} className={field} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </label>
              <label>
                Size (ml)
                <input required type="number" min={1} className={field} value={form.sizeMl} onChange={(e) => setForm({ ...form, sizeMl: e.target.value })} />
              </label>
              <label>
                Gender
                <select className={field} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option>Men</option>
                  <option>Women</option>
                  <option>Unisex</option>
                </select>
              </label>
              <label>
                Stock
                <input required type="number" min={0} className={field} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </label>
              <label>
                Top notes
                <input className={field} value={form.topNotes} onChange={(e) => setForm({ ...form, topNotes: e.target.value })} />
              </label>
              <label>
                Heart notes
                <input className={field} value={form.heartNotes} onChange={(e) => setForm({ ...form, heartNotes: e.target.value })} />
              </label>
              <label>
                Base notes
                <input className={field} value={form.baseNotes} onChange={(e) => setForm({ ...form, baseNotes: e.target.value })} />
              </label>
              <label>
                Image URL
                <input className={field} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </label>
              <label className="sm:col-span-2">
                Description
                <textarea rows={3} className="mt-1 w-full rounded-xl border border-line bg-bg p-3 outline-none focus:border-gold" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured on home page
              </label>
              <div className="flex gap-3 sm:col-span-2">
                <button className="min-h-11 rounded-full bg-gold px-6 font-medium text-on-gold">Save</button>
                <button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-full border border-line px-6">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="text-sm text-mut">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(({ order: o, customer }) => (
                <tr key={o.id} className="border-t border-line align-top">
                  <td className="p-3">
                    #{o.id}
                    <span className="block text-xs text-mut">{fmtDate(o.orderDate)}</span>
                  </td>
                  <td className="p-3">{customer}</td>
                  <td className="p-3 text-sm text-mut">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</td>
                  <td className="p-3">{inr(o.total)}</td>
                  <td className="p-3 text-sm">
                    {o.paymentMethod}
                    <span className="block text-mut">{o.paymentStatus}</span>
                  </td>
                  <td className="p-3">
                    <select
                      aria-label={`Status for order ${o.id}`}
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      className="min-h-10 rounded-full border border-line bg-card px-3"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="mt-4 text-mut">Abhi koi order nahi.</p>}
        </div>
      )}
    </div>
  );
}
