import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useOrders } from "@/store/orders";
import { useRecent } from "@/store/recent";
import { useProducts } from "@/hooks/useProducts";
import { formatINR } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { ChevronRight, Package } from "lucide-react";

export default function Account() {
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const { ids: recentIds } = useRecent();
  const { products: allProducts } = useProducts();

  if (!user) return <Navigate to="/login" replace />;

  const myOrders = orders.filter(o => o.userId === user.id || o.email === user.email);
  const recent = recentIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean) as any[];

  return (
    <div className="container py-12">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Hi, {user.name} 👋</h1>
          <p className="text-muted-foreground mt-1">{user.email} · {user.role}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && <Button asChild variant="outline"><Link to="/admin">Admin Panel</Link></Button>}
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Your orders</h2>
          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
            <Link to="/orders">View all orders <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {myOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
            <Button asChild className="mt-4 rounded-full"><Link to="/category/plants">Start shopping</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.slice(0, 3).map(o => (
              <Link key={o.id} to="/orders" className="flex items-center justify-between rounded-xl border bg-card p-4 hover:shadow-soft transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/5 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-sm">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()} · {o.products?.length || 0} items</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatINR(o.totalAmount || o.total)}</div>
                  <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border mt-1 inline-block ${
                    o.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {o.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="font-display text-2xl mb-4">Recently viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recent.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
