import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrders, ORDER_STATUSES, Order } from "@/store/orders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Truck } from "lucide-react";
import { formatINR } from "@/data/catalog";

export default function TrackOrder() {
  const [params] = useSearchParams();
  const { byId } = useOrders();
  const [id, setId] = useState(params.get("id") || "");
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);

  const lookup = () => { 
    if (!id.trim()) {
      setError(true);
      setSearched(false);
      setOrder(undefined);
      return;
    }
    setError(false);
    setOrder(byId(id.trim())); 
    setSearched(true); 
  };
  
  useEffect(() => { if (params.get("id")) lookup(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="font-display text-4xl md:text-5xl text-center">Track your order</h1>
      <p className="text-center text-muted-foreground mt-2">Enter your order ID to see live status.</p>

      <div className="mt-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={id} 
              onChange={e => { setId(e.target.value); if (error) setError(false); }} 
              placeholder="e.g. POXXXXXX" 
              className={`pl-9 ${error ? "border-destructive ring-destructive/20" : ""}`} 
              onKeyDown={e => e.key === "Enter" && lookup()} 
            />
          </div>
          <Button onClick={lookup}>Track</Button>
        </div>
        {error && <p className="text-destructive text-xs mt-2 ml-1 animate-fade-up">please enter id</p>}
      </div>

      {searched && !order && (
        <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
          <p className="font-display text-2xl mb-1">No order found</p>
          <p className="text-muted-foreground">Double-check the ID, or place an order to get one.</p>
        </div>
      )}

      {order && (
        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Order</p>
              <p className="font-mono font-semibold">{order.id}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold">
              <Truck className="h-4 w-4" /> {order.status}
            </span>
          </div>

          {/* Shiprocket Tracking Info Card */}
          {order.awb_code && (
            <div className="mt-6 bg-primary/5 border border-primary/10 rounded-2xl p-5 text-sm text-card-foreground">
              <div className="flex items-center gap-2 text-primary font-bold text-base mb-3">
                <Truck className="h-5 w-5 animate-pulse text-primary" />
                Shipping Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Courier Partner</p>
                  <p className="font-bold text-sm">{order.courier_name || "Shiprocket Partner"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">AWB Tracking Code</p>
                  <p className="font-mono font-bold text-sm">{order.awb_code}</p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Live Shipment Status</p>
                  <p className="font-semibold text-primary capitalize bg-primary/10 px-2 py-0.5 rounded w-fit text-xs mt-0.5">
                    {order.current_status || "Dispatched"}
                  </p>
                </div>
              </div>
              {order.tracking_url && (
                <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-xs text-muted-foreground">Get detailed scan reports on courier site:</span>
                  <a 
                    href={order.tracking_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/95 transition-colors px-4 py-2 rounded-full text-xs font-bold font-display shadow-sm"
                  >
                    Track Shipment
                  </a>
                </div>
              )}
            </div>
          )}

          <ol className="mt-8 relative border-l border-border ml-3 space-y-6">
            {(() => {
              const statusesToRender = [...ORDER_STATUSES];
              if (order.status === "Cancelled") {
                statusesToRender.push("Cancelled");
              } else if (order.status === "Returned") {
                statusesToRender.push("Returned");
              }

              return statusesToRender.map((s, i) => {
                const idx = statusesToRender.indexOf(order.status);
                const reached = i <= idx;
                const event = order.history.find(h => h.status === s);
                
                let markerColor = reached ? "bg-primary ring-primary/20" : "bg-muted";
                if (reached && s === "Cancelled") markerColor = "bg-destructive ring-destructive/20";
                if (reached && s === "Returned") markerColor = "bg-orange-500 ring-orange-500/20";

                return (
                  <li key={s} className="ml-6">
                    <span className={`absolute -left-[7px] grid h-3.5 w-3.5 place-items-center rounded-full ${markerColor} ${reached ? "ring-4" : ""}`} />
                    <div className={`font-semibold ${reached ? "" : "text-muted-foreground"} ${reached && s === "Cancelled" ? "text-destructive" : ""}`}>{s}</div>
                    {event && <div className="text-xs text-muted-foreground">{new Date(event.at).toLocaleString()}</div>}
                  </li>
                );
              });
            })()}
          </ol>

          <div className="border-t mt-6 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span>{order.products.reduce((a, b) => a + b.quantity, 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{formatINR(order.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{order.payment}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
