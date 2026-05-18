import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { useProducts } from "@/hooks/useProducts";
import { formatINR } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CartDrawer() {
  const { items, update, remove, isOpen, setOpen } = useCart();
  const { products: allProducts } = useProducts();
  const navigate = useNavigate();

  const lines = items.map(i => {
    const product = allProducts.find(p => p.id === i.productId);
    return { ...i, product };
  }).filter(l => l.product) as any[];

  const subtotal = lines.reduce((sum, l) => sum + (l.product.discountPrice ?? l.product.price) * l.qty, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setOpen(false)}
      />
      
      {/* Drawer */}
      <div className="relative h-full w-full sm:w-[33%] min-w-[320px] max-w-[500px] bg-background shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl">Your Cart</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {lines.map(({ product, qty }) => {
                const price = product.discountPrice ?? product.price;
                return (
                  <div key={product.id} className="flex gap-4">
                    <Link to={`/product/${product.slug}`} onClick={() => setOpen(false)} className="shrink-0">
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-secondary">
                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/product/${product.slug}`} onClick={() => setOpen(false)} className="font-medium text-sm leading-tight hover:text-primary truncate">
                          {product.name}
                        </Link>
                        <button onClick={() => remove(product.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{formatINR(price)}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-border/50 bg-secondary/30 scale-90 -ml-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => update(product.id, qty - 1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-6 text-center text-xs font-semibold">{qty}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => update(product.id, qty + 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <div className="text-sm font-semibold">{formatINR(price * qty)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="p-6 border-t bg-secondary/10 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span className="font-display">{formatINR(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center italic">
              {subtotal >= 549 ? "Congrats! You've unlocked FREE delivery! 🌿" : `Add ${formatINR(549 - subtotal)} more for free delivery`}
            </p>
            <div className="grid gap-2">
              <Button 
                onClick={() => { setOpen(false); navigate("/checkout"); }} 
                className="w-full rounded-full h-12 text-base font-semibold shadow-leaf hover:shadow-leaf-lg transition-all"
              >
                Checkout Now
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setOpen(false)} 
                className="w-full rounded-full h-10 text-sm text-muted-foreground hover:bg-transparent hover:text-primary"
              >
                Keep Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
