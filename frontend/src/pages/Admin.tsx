import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useOrders, ORDER_STATUSES } from "@/store/orders";
import { categories, products, formatINR, getProductById } from "@/data/catalog";
import { useAdminCatalog } from "@/store/adminCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Package, Boxes, Tags, Eye, EyeOff, IndianRupee, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return (
    <div className="container py-24 text-center">
      <h1 className="font-display text-4xl">Access denied</h1>
      <p className="text-muted-foreground mt-2">You need admin privileges.</p>
      <p className="text-xs text-muted-foreground mt-3">Tip: log in with an email containing "admin".</p>
    </div>
  );

  return (
    <div className="container py-10">
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          <NavItem to="/admin" end icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavItem>
          <NavItem to="/admin/products" icon={<Boxes className="h-4 w-4" />}>Products</NavItem>
          <NavItem to="/admin/orders" icon={<Package className="h-4 w-4" />}>Orders</NavItem>
          <NavItem to="/admin/categories" icon={<Tags className="h-4 w-4" />}>Categories</NavItem>
        </aside>
        <div>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, end, icon, children }: any) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) =>
      `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-smooth ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`
    }>{icon}{children}</NavLink>
  );
}

function Dashboard() {
  const { orders, setStatus } = useOrders();
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status !== "Delivered").length;
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Total revenue" value={formatINR(revenue)} icon={<IndianRupee className="h-4 w-4" />} />
        <Stat label="Total orders" value={orders.length} icon={<ShoppingBag className="h-4 w-4" />} />
        <Stat label="Pending fulfilment" value={pending} icon={<Package className="h-4 w-4" />} />
      </div>

      <h2 className="font-display text-2xl mt-10 mb-3">Latest orders</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map(o => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{o.id}</td>
                  <td className="p-3">{o.email}</td>
                  <td className="p-3 font-semibold">{formatINR(o.total)}</td>
                  <td className="p-3">
                    <select className="rounded border bg-background px-2 py-1 text-xs" value={o.status} onChange={e => { setStatus(o.id, e.target.value as any); toast.success("Status updated"); }}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className="font-display text-3xl mt-2">{value}</div>
    </div>
  );
}

function ProductsAdmin() {
  const { productOverrides, hiddenIds, updateProduct, hideProduct, unhideProduct } = useAdminCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});

  const startEdit = (id: string) => {
    const p = getProductById(id)!;
    const o = productOverrides[id] || {};
    setEditingId(id);
    setDraft({ name: o.name ?? p.name, price: o.price ?? p.price, discountPrice: o.discountPrice ?? p.discountPrice ?? 0, stock: o.stock ?? p.stock });
  };
  const save = () => {
    if (!editingId) return;
    updateProduct(editingId, { ...draft, discountPrice: draft.discountPrice ? Number(draft.discountPrice) : undefined });
    toast.success("Product saved");
    setEditingId(null);
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Products</h1>
      <p className="text-sm text-muted-foreground mb-4">Edit price, stock, or hide products. Image uploads would require Firebase Storage in production.</p>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {products.map(p => {
              const o = productOverrides[p.id] || {};
              const hidden = hiddenIds.has(p.id);
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3 flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
                    <div className={hidden ? "opacity-50" : ""}><div className="font-medium">{o.name ?? p.name}</div><div className="text-xs text-muted-foreground">{p.id}</div></div>
                  </td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{formatINR(o.price ?? p.price)}{(o.discountPrice ?? p.discountPrice) ? <span className="text-xs text-primary"> · {formatINR(o.discountPrice ?? p.discountPrice!)}</span> : null}</td>
                  <td className="p-3">{o.stock ?? p.stock}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(p.id)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => { hidden ? unhideProduct(p.id) : hideProduct(p.id); toast(hidden ? "Visible" : "Hidden"); }}>
                      {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setEditingId(null)}>
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-card" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-2xl mb-4">Edit product</h2>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price</Label><Input type="number" value={draft.price} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} /></div>
                <div><Label>Discount price</Label><Input type="number" value={draft.discountPrice} onChange={e => setDraft({ ...draft, discountPrice: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Stock</Label><Input type="number" value={draft.stock} onChange={e => setDraft({ ...draft, stock: Number(e.target.value) })} /></div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersAdmin() {
  const { orders, setStatus } = useOrders();
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Orders</h1>
      {orders.length === 0 ? <p className="text-muted-foreground">No orders yet.</p> : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-mono font-semibold">{o.id}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()} · {o.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatINR(o.total)}</div>
                  <div className="text-xs text-muted-foreground">{o.payment} · {o.items.reduce((a, b) => a + b.qty, 0)} items</div>
                </div>
                <select className="rounded border bg-background px-3 py-1.5 text-sm" value={o.status} onChange={e => { setStatus(o.id, e.target.value as any); toast.success("Updated"); }}>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Ship to: {o.address.fullName}, {o.address.city}, {o.address.state} - {o.address.pincode}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesAdmin() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Categories</h1>
      <p className="text-sm text-muted-foreground mb-4">Categories are seeded with the catalog. In a full backend, you could add/rename them here.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map(c => (
          <div key={c.slug} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <img src={c.image} alt="" className="h-12 w-12 rounded-full object-cover bg-secondary" />
            <div className="flex-1"><div className="font-semibold">{c.name}</div><div className="text-xs text-muted-foreground">{c.tagline}</div></div>
            <span className="text-xs text-muted-foreground">{products.filter(p => p.category === c.slug).length} items</span>
          </div>
        ))}
      </div>
    </div>
  );
}
