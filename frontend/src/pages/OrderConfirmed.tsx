import { useParams, Link } from "react-router-dom";
import { Check, Package } from "lucide-react";
import { useOrders, ORDER_STATUSES } from "@/store/orders";
import { formatINR, getProductById } from "@/data/catalog";
import { Button } from "@/components/ui/button";

export default function OrderConfirmed() {
  const { id } = useParams();
  const { byId } = useOrders();
  const order = id ? byId(id) : undefined;

  if (!order) return (
    <div className="container py-24 text-center">
      <h1 className="font-display text-4xl">Order not found</h1>
      <Button asChild className="mt-6 rounded-full"><Link to="/">Go home</Link></Button>
    </div>
  );

  return (
    <div className="container py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-leaf text-primary-foreground shadow-glow">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-5">Thank you!</h1>
        <p className="text-muted-foreground mt-2">Your order has been placed successfully.</p>
        <p className="mt-4 text-sm">Order ID: <span className="font-mono font-semibold">{order.id}</span></p>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-6 mb-6">
        <h2 className="font-display text-xl mb-3 flex items-center gap-2"><Package className="h-5 w-5" /> Order timeline</h2>
        <ol className="grid grid-cols-5 gap-2 mt-4">
          {ORDER_STATUSES.map((s, i) => {
            const idx = ORDER_STATUSES.indexOf(order.status);
            const reached = i <= idx;
            return (
              <li key={s} className="text-center">
                <div className={`mx-auto h-3 w-3 rounded-full ${reached ? "bg-primary" : "bg-muted"}`} />
                <div className={`mt-2 text-[11px] ${reached ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s}</div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-6 mb-6">
        <h2 className="font-display text-xl mb-3">Items</h2>
        <ul className="space-y-3">
          {order.products.map((p, idx) => (
            <li key={`${p.productId}-${idx}`} className="flex gap-3 text-sm">
              <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">Qty {p.quantity}</div>
              </div>
              <div className="font-medium">{formatINR(p.price * p.quantity)}</div>
            </li>
          ))}
        </ul>
        <div className="border-t mt-4 pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.delivery === 0 ? "FREE" : formatINR(order.delivery)}</span></div>
          <div className="flex justify-between font-semibold pt-2 text-primary"><span>Total ({order.payment})</span><span>{formatINR(order.totalAmount)}</span></div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-6 mb-6">
        <h2 className="font-display text-xl mb-2">Shipping to</h2>
        <p className="text-sm">{order.address.fullName} · {order.address.phone}</p>
        <p className="text-sm text-muted-foreground">
          {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <Button asChild variant="outline" className="rounded-full"><Link to={`/track?id=${order.id}`}>Track this order</Link></Button>
        <Button asChild className="rounded-full"><Link to="/category/plants">Continue shopping</Link></Button>
      </div>
    </div>
  );
}
