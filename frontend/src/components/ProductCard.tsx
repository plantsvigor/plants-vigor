import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, ShoppingBag, Star, Zap } from "lucide-react";
import { Product, formatINR } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export default function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isWish = has(product.id);
  const sellingPrice = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
  const originalPrice = product.price;
  const hasDiscount = (product.discountPrice && product.discountPrice > 0 && product.discountPrice !== product.price);
  const discountPct = (hasDiscount && originalPrice > 0) ? Math.round((1 - sellingPrice / originalPrice) * 100) : 0;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    add(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      const buyNowItem = await api.post("/checkout/buynow", { productId: product.id });
      navigate("/checkout", { state: { buyNowItem } });
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate buy now");
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const images = product.images && product.images.length > 0 ? product.images : ["https://via.placeholder.com/400x300?text=No+Image"];
  const showSecond = isHovered && images.length > 1;

  return (
    <div 
      className={cn("group relative flex flex-col rounded-xl bg-card shadow-soft hover:shadow-card transition-smooth overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/3] sm:aspect-[5/4] overflow-hidden bg-secondary/50">
        <img
          src={images[0]}
          alt={product.name}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105",
            showSecond ? "opacity-0" : "opacity-100"
          )}
        />
        {images.length > 1 && (
          <img
            src={images[1]}
            alt={`${product.name} alternate`}
            loading="lazy"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110",
              showSecond ? "opacity-100 scale-105" : "opacity-0"
            )}
          />
        )}
        {discountPct > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
            -{discountPct}%
          </span>
        )}
        {product.bestSeller && (
          <span className="absolute left-2 bottom-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Bestseller
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); toggle(product.id); toast(isWish ? "Removed from wishlist" : "Added to wishlist"); }}
        aria-label="Wishlist"
        className={cn(
          "absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 shadow-soft transition-smooth hover:scale-110",
          isWish ? "text-destructive" : "text-foreground/60"
        )}
      >
        <Heart className={cn("h-3.5 w-3.5", isWish && "fill-current")} />
      </button>

      <div className="flex flex-1 flex-col p-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-base leading-tight line-clamp-2">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span>({product.reviewsCount})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold">{formatINR(sellingPrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">{formatINR(originalPrice)}</span>
          )}
        </div>
        
        <div className="mt-auto pt-3">
          <Button
            onClick={handleAddToCart}
            className="w-full rounded-full text-[11px] h-9"
            size="sm"
          >
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
