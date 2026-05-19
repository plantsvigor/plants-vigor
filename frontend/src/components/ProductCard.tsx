import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, ShoppingBag, Star, StarHalf, Zap } from "lucide-react";
import { Product, formatINR } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { useReviews } from "@/store/reviews";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export default function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { forProduct } = useReviews();
  const navigate = useNavigate();
  const location = useLocation();

  const isWish = has(product.id);
  const sellingPrice = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
  const originalPrice = product.price;
  const hasDiscount = (product.discountPrice && product.discountPrice > 0 && product.discountPrice !== product.price);
  const discountPct = (hasDiscount && originalPrice > 0) ? Math.round((1 - sellingPrice / originalPrice) * 100) : 0;

  const reviews = forProduct(product.id);
  const reviewCount = reviews.length > 0 ? reviews.length : (product.reviewsCount || 0);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : (product.rating ?? 0);

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
      className={cn("group relative flex flex-col transition-smooth max-w-[260px] mx-auto w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden rounded-2xl">
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
          <span className="absolute left-3 top-3 z-10 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground shadow-sm">
            {discountPct}% OFF
          </span>
        )}
        {product.bestSeller && (
          <span className="absolute left-3 bottom-3 z-10 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
            Bestseller
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); toggle(product.id); toast(isWish ? "Removed from wishlist" : "Added to wishlist"); }}
        aria-label="Wishlist"
        className={cn(
          "absolute top-3 right-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-background/90 shadow-soft transition-smooth hover:scale-110",
          isWish ? "text-destructive" : "text-foreground/60"
        )}
      >
        <Heart className={cn("h-4 w-4", isWish && "fill-current")} />
      </button>

      <div className="flex flex-1 flex-col pt-4 px-1 text-center">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-display text-[15px] leading-tight line-clamp-2 text-foreground/90">{product.name}</h3>
        </Link>
        
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => {
              const ratingRounded = Math.round(averageRating * 2) / 2;
              if (ratingRounded >= star) {
                return (
                  <Star 
                    key={star} 
                    className="h-3 w-3 fill-accent text-accent" 
                  />
                );
              } else if (ratingRounded >= star - 0.5) {
                return (
                  <StarHalf 
                    key={star} 
                    className="h-3 w-3 fill-accent text-accent" 
                  />
                );
              } else {
                return (
                  <Star 
                    key={star} 
                    className="h-3 w-3 text-gray-300" 
                  />
                );
              }
            })}
          </div>
          <span>({reviewCount})</span>
        </div>
        
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-[15px] font-medium text-black">Rs. {sellingPrice}.00</span>
          {hasDiscount && (
            <span className="text-[13px] text-muted-foreground line-through">Rs. {originalPrice}.00</span>
          )}
        </div>
        
        <div className="mt-4 pb-2">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="w-full rounded-[14px] border-gray-400 text-[#111] hover:bg-gray-50 h-[42px] text-[15px] font-normal"
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
