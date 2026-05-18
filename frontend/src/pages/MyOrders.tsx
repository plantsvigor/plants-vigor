import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useOrders, OrderStatus } from "@/store/orders";
import { formatINR } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Package, Calendar, Tag, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Confirmed": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Shipped": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Out for Delivery": return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "Delivered": return "bg-green-100 text-green-700 border-green-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function MyOrders() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  if (!user) return <Navigate to="/login" replace />;

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  return (
    <div className="container py-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl mb-2">My Orders</h1>
        <p className="text-muted-foreground">View and track all your recent purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-16 text-center bg-secondary/10">
          <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-display mb-2">No orders found</h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Looks like you haven't placed any orders yet. Start exploring our beautiful plant collection!
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/category/plants">Explore Shop</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-soft transition-smooth">
              {/* Order Header */}
              <div className="p-6 border-b bg-secondary/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID</span>
                      <span className="font-mono font-bold text-sm">{order.id}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5" />
                        {order.payment}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Amount</div>
                    <div className="text-xl font-display font-bold text-primary">{formatINR(order.totalAmount)}</div>
                  </div>
                  <Badge variant="outline" className={`px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              {/* Product List */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg">Products ({order.products.length})</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleExpand(order.id)}
                    className="text-primary hover:text-primary hover:bg-primary/5"
                  >
                    {expandedOrders.includes(order.id) ? (
                      <><ChevronUp className="mr-2 h-4 w-4" /> Hide Details</>
                    ) : (
                      <><ChevronDown className="mr-2 h-4 w-4" /> View Details</>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  {(expandedOrders.includes(order.id) ? order.products : order.products.slice(0, 2)).map((item, idx) => (
                    <div key={`${order.id}-${item.productId}-${idx}`} className="flex gap-4 items-center">
                      <div className="relative h-20 w-20 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-full w-full object-cover rounded-xl border"
                        />
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-background">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{formatINR(item.price)} × {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-semibold">{formatINR(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                  
                  {!expandedOrders.includes(order.id) && order.products.length > 2 && (
                    <p className="text-sm text-muted-foreground italic pl-24">
                      + {order.products.length - 2} more items...
                    </p>
                  )}
                </div>
              </div>

              {/* Order Footer Actions */}
              <div className="px-6 py-4 bg-secondary/5 border-t flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Ordered at {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                </p>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to={`/account/track-order?id=${order.id}`}>
                    Track Order <ChevronRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
