import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";
import { useAuth } from "@/store/auth";
import { useAddress, Address } from "@/store/address";
import { useProducts } from "@/hooks/useProducts";
import { formatINR } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { z } from "zod";
import { Lock, Minus, Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import AddressForm from "@/components/AddressForm";



export default function Checkout() {
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;

  const { items, clear, update: updateCart } = useCart();
  const { place } = useOrders();
  const { user } = useAuth();
  const { addresses, remove, setDefault, loading: addressesLoading } = useAddress();
  const navigate = useNavigate();
  const { products: allProducts } = useProducts();

  const [buyNowQty, setBuyNowQty] = useState(buyNowItem?.quantity || 1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editAddr, setEditAddr] = useState<Address | null>(null);
  const [email, setEmail] = useState(user?.email || "");
  const [payment, setPayment] = useState<"COD" | "Razorpay">("Razorpay");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Please login first to checkout");
      navigate("/login", { state: { from: "/checkout", buyNowItem } });
    }
  }, [user, navigate, buyNowItem]);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(def._id!);
    }
  }, [addresses, selectedAddressId]);

  const cartLines = useMemo(() => {
    return items.map(i => {
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
  }, [items, allProducts]);

  const lines = useMemo(() => {
    if (!buyNowItem) return cartLines;
    
    const baseId = buyNowItem.productId.split('_')[0];
    const baseProduct = allProducts.find(p => p.id === baseId);
    if (!baseProduct) return [];
    
    const isKrish = buyNowItem.productId.includes('_krish');
    const resolvedPrice = buyNowItem.price ?? (
      ((baseProduct.discountPrice && baseProduct.discountPrice > 0) ? baseProduct.discountPrice : baseProduct.price) + (isKrish ? 50 : 0)
    );
    const resolvedImage = buyNowItem.image ?? baseProduct.images[0];
    
    return [{ 
      productId: buyNowItem.productId, 
      qty: buyNowQty, 
      product: {
        id: buyNowItem.productId,
        name: buyNowItem.name ?? (isKrish ? `${baseProduct.name} (Krish Planter)` : baseProduct.name),
        price: resolvedPrice,
        images: [resolvedImage]
      }
    }];
  }, [buyNowItem, buyNowQty, cartLines, allProducts]);

  const handleQty = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    if (buyNowItem) {
      setBuyNowQty(newQty);
    } else {
      updateCart(productId, newQty);
    }
  };

  const originalSubtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const subtotal = lines.reduce((s, l) => {
    const price = (l.product.discountPrice && l.product.discountPrice > 0) ? l.product.discountPrice : l.product.price;
    return s + price * l.qty;
  }, 0);
  const discount = originalSubtotal - subtotal;
  const delivery = subtotal >= 549 ? 0 : 50;
  const total = subtotal + delivery;

  if (lines.length === 0) {
    return (
      <div className="container py-24 text-center">
        <h1 className="font-display text-4xl">Nothing to checkout</h1>
        <Button onClick={() => navigate("/category/plants")} className="mt-6 rounded-full">Browse plants</Button>
      </div>
    );
  }



  /** Real Razorpay integration with backend verification */
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (): Promise<{ paymentId: string; orderId: string; signature: string }> => {
    const res = await loadRazorpayScript();
    if (!res) {
      throw new Error("Razorpay SDK failed to load. Check your internet connection.");
    }

    console.log("Creating Razorpay order for amount:", total);
    // 1. Create order on backend
    const orderRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payment/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(total) }),
    });
    const orderData = await orderRes.json();

    return new Promise((resolve, reject) => {
      const options = {
        key: (window as any).__APP_KEYS__?.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "GreenBloom Co.",
        description: "Greenhouse Fresh Plants",
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // 2. Verify payment on backend
            const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              resolve({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            } else {
              reject(new Error("Payment verification failed"));
            }
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          name: user?.name || "",
          email: email,
        },
        theme: {
          color: "#0D9488",
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAddress = addresses.find(a => a._id === selectedAddressId);
    if (!selectedAddress) {
      toast.error("Please select or add a shipping address");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Enter a valid email"); return; }
    setSubmitting(true);
    try {
      let paymentId: string | undefined;
      let razorpayOrderId: string | undefined;
      let razorpaySignature: string | undefined;

      if (payment === "Razorpay") {
        const r = await openRazorpay();
        paymentId = r.paymentId;
        razorpayOrderId = r.orderId;
        razorpaySignature = r.signature;
      }
      const order = await place({
        userId: user?.id || null, 
        email, 
        products: lines.map(l => ({ 
          productId: l.productId, 
          name: l.product.name,
          image: l.product.images[0],
          price: (l.product.discountPrice && l.product.discountPrice > 0) ? l.product.discountPrice : l.product.price,
          quantity: l.qty 
        })), 
        subtotal, 
        delivery, 
        totalAmount: total, 
        payment, 
        paymentId, 
        address: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country,
        },
      });
      if (!buyNowItem) clear();
      toast.success("Order placed!");
      navigate(`/order/${order.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-10 md:py-14 max-w-6xl">
      <h1 className="font-display text-4xl md:text-5xl mb-8">Checkout</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          <section className="rounded-2xl border bg-card p-4 sm:p-6">
            <h2 className="font-display text-2xl mb-4">Contact</h2>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </section>

          <section className="rounded-2xl border bg-card p-4 sm:p-6 shadow-soft transition-smooth border-l-4 border-l-primary/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl">Shipping address</h2>
              </div>
              {addresses.length < 5 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setEditAddr(null); setFormOpen(true); }} 
                  className="rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add New
                </Button>
              )}
            </div>
            
            {addressesLoading ? (
              <div className="py-10 text-center animate-pulse text-muted-foreground font-medium">Loading addresses...</div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-2">
                {addresses.map((addr) => (
                  <div 
                    key={addr._id} 
                    onClick={() => setSelectedAddressId(addr._id!)}
                    className={cn(
                      "relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 group flex flex-col justify-between",
                      selectedAddressId === addr._id 
                        ? "border-primary bg-primary/5 shadow-md scale-[1.02] z-10" 
                        : "border-secondary/20 bg-secondary/10 hover:bg-secondary/20"
                    )}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-base text-foreground line-clamp-1">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="bg-primary text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Default</span>
                          )}
                        </div>
                        <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-background/80 shadow-sm hover:bg-primary hover:text-white"
                            onClick={(e) => { e.stopPropagation(); setEditAddr(addr); setFormOpen(true); }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-background/80 shadow-sm hover:bg-destructive hover:text-white"
                            onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this address?")) remove(addr._id!); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">{addr.phone}</p>
                      <p className="text-xs leading-relaxed font-medium text-foreground/80">
                        {addr.street}, {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[9px] text-primary/70 font-bold uppercase tracking-wider">{addr.country}</p>
                      {!addr.isDefault && (
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDefault(addr._id!); }}
                          className="text-[9px] font-extrabold text-primary hover:underline uppercase tracking-wider"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed p-10 text-center bg-secondary/5 border-secondary/50">
                <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                   <MapPin className="h-8 w-8" />
                </div>
                <p className="text-muted-foreground mb-6 font-medium">You don't have any saved addresses yet.</p>
                <Button type="button" onClick={() => setFormOpen(true)} className="rounded-full px-8 shadow-md">
                  <Plus className="h-4 w-4 mr-2" /> Add your first address
                </Button>
              </div>
            )}
            
            {addresses.length >= 5 && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
                <span className="text-[10px] font-bold uppercase tracking-wider">Maximum 5 addresses allowed</span>
              </div>
            )}

          </section>

          <section className="rounded-2xl border bg-card p-4 sm:p-6">
            <h2 className="font-display text-2xl mb-4">Payment</h2>
            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as any)} className="space-y-3">
              <PayOption id="rzp" value="Razorpay" title="Razorpay (Cards / UPI / Netbanking)" description="Pay securely. Test mode active." selected={payment === "Razorpay"} />
              <PayOption id="cod" value="COD" title="Cash on Delivery" description="Pay in cash when your plant arrives." selected={payment === "COD"} />
            </RadioGroup>
          </section>
        </div>

        <aside className="rounded-2xl border bg-card p-4 sm:p-6 h-fit shadow-soft lg:sticky lg:top-28">
          <h2 className="font-display text-2xl mb-4">Order summary</h2>
          <ul className="space-y-4 mb-4 max-h-72 overflow-auto">
            {lines.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-4 text-sm items-start border-b pb-4 last:border-0 last:pb-0">
                <img src={product.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-base">{product.name}</div>
                  <div className="text-primary font-display font-medium text-sm">
                    {formatINR((product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price)}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded-full shadow-sm hover:bg-secondary/80 transition-colors"
                      onClick={() => handleQty(product.id, qty - 1)}
                      disabled={qty <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-bold w-4 text-center">{qty}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 rounded-full shadow-sm hover:bg-secondary/80 transition-colors"
                      onClick={() => handleQty(product.id, qty + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="font-display font-semibold text-lg">
                  {formatINR(((product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price) * qty)}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Original Price</span><span className="line-through">{formatINR(originalSubtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Savings</span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{delivery === 0 ? "FREE" : formatINR(delivery)}</span></div>
            <div className="flex justify-between pt-2 border-t mt-2 text-base font-semibold"><span>Total Amount</span><span className="font-display text-xl text-primary">{formatINR(total)}</span></div>
          </div>
          <Button type="submit" size="lg" className="w-full mt-6 rounded-full" disabled={submitting}>
            <Lock className="mr-2 h-4 w-4" />
            {submitting ? "Processing…" : payment === "COD" ? "Place Order (COD)" : `Pay ${formatINR(total)}`}
          </Button>
          <p className="text-xs text-muted-foreground mt-3 text-center">Secure payments powered by Razorpay</p>
        </aside>
      </form>
      <AddressForm 
        open={isFormOpen} 
        onOpenChange={setFormOpen} 
        initialData={editAddr} 
      />
    </div>
  );
}



function PayOption({ id, value, title, description, selected }: { id: string; value: string; title: string; description: string; selected: boolean }) {
  return (
    <Label htmlFor={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-smooth ${selected ? "border-primary bg-secondary/40" : "hover:bg-secondary/30"}`}>
      <RadioGroupItem id={id} value={value} className="mt-1" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </Label>
  );
}
