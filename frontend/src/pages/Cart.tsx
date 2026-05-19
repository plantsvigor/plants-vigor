import { Link, useNavigate, useLocation } from "react-router-dom";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { useProducts } from "@/hooks/useProducts";
import { formatINR } from "@/data/catalog";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { items, update, remove } = useCart();
  const { products: allProducts } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();

  const lines = items.map(i => {
    const baseId = i.productId.split('_')[0];
    const baseProduct = allProducts.find(p => p.id === baseId);
    if (!baseProduct) return null;
    
    const isKrish = i.productId.includes('_krish');
    const product = {
      ...baseProduct,
      id: i.productId,
      name: isKrish ? `${baseProduct.name} (Krish Planter)` : baseProduct.name,
      price: baseProduct.price + (isKrish ? 50 : 0),
      discountPrice: (baseProduct.discountPrice && baseProduct.discountPrice > 0)
        ? baseProduct.discountPrice + (isKrish ? 50 : 0)
        : undefined
    };
    return { ...i, product };
  }).filter(Boolean) as any[];

  const subtotal = lines.reduce((sum, l) => {
    const price = (l.product.discountPrice && l.product.discountPrice > 0) ? l.product.discountPrice : l.product.price;
    return sum + price * l.qty;
  }, 0);
  const delivery = subtotal === 0 ? 0 : subtotal >= 549 ? 0 : 50;

  const handleClose = () => {
    const from = location.state?.from || "/";
    navigate(from);
  };

  if (lines.length === 0) {
    return (
      <div className="container py-24 text-center relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose}
          className="absolute top-10 right-4 md:right-10 rounded-full hover:bg-secondary"
          aria-label="Close cart"
        >
          <X className="h-6 w-6" />
        </Button>
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Let's find some greenery for your space.</p>
        <Button asChild className="mt-6 rounded-full" size="lg"><Link to="/category/plants">Start shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14 relative">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl md:text-5xl">Your Cart</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose}
          className="rounded-full hover:bg-secondary"
          aria-label="Close cart"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-4">
          {lines.map(({ product, qty }) => {
            const price = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
            return (
              <div key={product.id} className="flex gap-4 rounded-2xl border p-3 sm:p-4 bg-card">
                <Link to={`/product/${product.slug}`} className="shrink-0">
                  <img src={product.images[0]} alt={product.name} className="h-24 w-24 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${product.slug}`} className="font-display text-lg leading-tight hover:underline">{product.name}</Link>
                    <button onClick={() => remove(product.id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{formatINR(price)} each</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border">
                      <Button variant="ghost" size="icon" onClick={() => update(product.id, qty - 1)}><Minus className="h-4 w-4" /></Button>
                      <span className="w-8 text-center text-sm font-medium">{qty}</span>
                      <Button variant="ghost" size="icon" onClick={() => update(product.id, qty + 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="font-display text-lg font-semibold">{formatINR(price * qty)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="rounded-2xl border bg-card p-4 sm:p-6 h-fit shadow-soft sticky top-28">
          <h2 className="font-display text-2xl mb-4">Order Summary</h2>
          <Row label="Subtotal" value={formatINR(subtotal)} />
          <Row label="Delivery" value={delivery === 0 ? "FREE" : formatINR(delivery)} />
          {subtotal < 549 && <p className="text-xs text-muted-foreground mt-1">Add {formatINR(549 - subtotal)} more for free delivery</p>}
          <div className="mt-4 pt-4 border-t flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-semibold">{formatINR(subtotal + delivery)}</span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full rounded-full"><Link to="/checkout">Proceed to checkout</Link></Button>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-1.5 text-sm"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
