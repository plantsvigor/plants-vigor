import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, ShieldCheck, ShoppingBag, Star, Truck, ChevronDown, ChevronUp, Share2, Copy, Facebook, Twitter, Instagram, Info, Leaf, RotateCcw, FileText, Zap, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { formatINR, products } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useRecent } from "@/store/recent";
import { useReviews } from "@/store/reviews";
import { useAuth } from "@/store/auth";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { push } = useRecent();
  const { forProduct, add: addReview } = useReviews();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { products: allProducts } = useProducts();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data: any = await api.get(`/products/${slug}`);
        setProduct(data);
        setActiveImg(0);
      } catch (err: any) {
        console.error("Failed to fetch product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const productUrl = window.location.href;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this beautiful plant: ${product.name}`,
          url: productUrl,
        });
        return;
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }
    setIsShareOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    add(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    navigate("/checkout", { 
      state: { 
        buyNowItem: {
          productId: product.id,
          quantity: 1
        }
      } 
    });
  };

  useEffect(() => { 
    if (product) {
      push(product.id); 
      document.title = `${product.name} • Plants Vigor`;
    } else {
      document.title = "Plants Vigor";
    }
  }, [product, push]);

  if (loading) return (
    <div className="container py-20 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground font-medium">Loading plant details...</p>
    </div>
  );

  if (!product) return (
    <div className="container py-20 text-center">
      <h1 className="font-display text-4xl">Plant not found</h1>
      <Link to="/category/plants" className="text-primary underline mt-4 inline-block">Back to shop</Link>
    </div>
  );

  const shareOptions = [
    { 
      name: "WhatsApp", 
      icon: <span className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">W</span>, 
      url: `https://wa.me/?text=Check this product: ${product.name} ${productUrl}`,
      color: "hover:bg-green-50 text-green-600"
    },
    { 
      name: "Facebook", 
      icon: <Facebook className="h-5 w-5" />, 
      url: `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`,
      color: "hover:bg-blue-50 text-blue-600"
    },
    { 
      name: "Twitter", 
      icon: <Twitter className="h-5 w-5" />, 
      url: `https://twitter.com/intent/tweet?text=Check this product: ${product.name}&url=${productUrl}`,
      color: "hover:bg-sky-50 text-sky-500"
    }
  ];

  const sellingPrice = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
  const originalPrice = product.price;
  const hasDiscount = (product.discountPrice && product.discountPrice > 0 && product.discountPrice !== product.price);
  const discount = (hasDiscount && originalPrice > 0) ? Math.round((1 - sellingPrice / originalPrice) * 100) : 0;
  const reviews = forProduct(product.id);
  const averageRating = reviews.length > 0 
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : 0;
  const reviewCount = reviews.length;
  const related = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const isWish = has(product.id);

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in to review"); return; }
    if (!comment.trim()) { toast.error("Write a comment"); return; }
    addReview({ productId: product.id, author: user.name, rating, comment: comment.trim() });
    setComment(""); setRating(5);
    toast.success("Review posted!");
  };


  return (
    <div className="container py-10 md:py-14 pb-20 md:pb-14">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/category/plants" className="hover:text-primary">Shop</Link> / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary/50 shadow-soft group">
            {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-secondary/70" />}
            <img 
              src={product.images && product.images.length > 0 ? product.images[activeImg] : "https://images.unsplash.com/photo-1545239351-ef35f43d514b"} 
              alt={product.name} 
              onLoad={() => setImgLoaded(true)}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110 cursor-zoom-in",
                imgLoaded ? "opacity-100" : "opacity-0"
              )} 
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-sm">
                SAVE {discount}%
              </span>
            )}
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute right-4 top-4 z-20 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-soft hover:bg-background transition-smooth"
              onClick={() => { toggle(product.id); toast(has(product.id) ? "Removed from wishlist" : "Added to wishlist"); }}
              aria-label="Wishlist"
            >
              <Heart className={cn("h-5 w-5", has(product.id) ? "fill-destructive text-destructive" : "")} />
            </Button>
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setImgLoaded(false); }}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-smooth",
                    activeImg === i ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} alt={`${product.name} thumb ${i}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl md:text-5xl mt-3">{product.name}</h1>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    star <= Math.round(averageRating)
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/20"
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{averageRating}</span>
            <span className="text-sm text-muted-foreground mx-1">•</span>
            <button 
              onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-primary hover:underline font-medium transition-smooth"
            >
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </button>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold">{formatINR(sellingPrice)}</span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">{formatINR(originalPrice)}</span>
            )}
          </div>
          <p className="mt-5 text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="fixed bottom-0 left-0 z-50 w-full p-4 md:static md:p-0 mt-6 sm:mt-8 pointer-events-none">
            <div className="container md:p-0 pointer-events-auto">
              <div className="flex items-center gap-3">
                <Button size="lg" variant="outline" className="flex-1 rounded-full border-primary text-primary bg-background/90 hover:bg-background h-12 md:h-11 text-sm md:text-base shadow-lg" onClick={handleAddToCart}>
                  <ShoppingBag className="mr-2 h-4 w-4" /> Add to cart
                </Button>
                <Button size="lg" className="flex-1 rounded-full shadow-lg h-12 md:h-11 text-sm md:text-base" onClick={handleBuyNow}>
                  <Zap className="mr-2 h-4 w-4 fill-current" /> Buy now
                </Button>
                <Button size="lg" variant="ghost" className="hidden md:flex h-11 w-11 rounded-full border bg-secondary/30 hover:bg-secondary/50 p-0" onClick={handleShare} aria-label="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <Button size="lg" variant="outline" className="w-full rounded-full border-dashed" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share with friends
            </Button>
          </div>

          <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Share Product</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (option.onClick) {
                        e.preventDefault();
                        option.onClick();
                        setIsShareOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-4 transition-smooth",
                      option.color
                    )}
                  >
                    {option.icon}
                    <span className="font-medium">{option.name}</span>
                  </a>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border bg-secondary/30 p-2">
                <div className="flex-1 truncate text-sm text-muted-foreground px-2">{productUrl}</div>
                <Button size="sm" variant="secondary" className="rounded-xl shrink-0" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-3 text-sm text-muted-foreground">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</div>

          <div className="mt-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-we-work" className="border-t">
                <AccordionTrigger className="hover:no-underline py-4 px-1 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                      <Info className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">How we work!</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-1">
                  We source our plants directly from premium nurseries to ensure they arrive at your doorstep in peak condition. Each plant is hand-selected and inspected by our botanists before being carefully packaged in our specialized eco-friendly containers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care-tips">
                <AccordionTrigger className="hover:no-underline py-4 px-1 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                      <Leaf className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">Care Tips</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-1">
                  Most of our plants thrive in bright, indirect sunlight and require watering only when the top inch of soil feels dry. We provide a detailed, variety-specific care guide with every purchase to help your new green companion flourish.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="hover:no-underline py-4 px-1 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">Shipping</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-1">
                  We use custom-engineered packaging to prevent soil spillage and protect delicate leaves during transit. Standard delivery takes 3-5 business days. Free shipping is available on all orders above ₹549.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="refund-policy">
                <AccordionTrigger className="hover:no-underline py-4 px-1 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                      <RotateCcw className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">Refund Policy</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-1">
                  Your satisfaction is our priority. If your plant arrives in poor health or damaged, we offer a hassle-free 7-day replacement. Simply share a short unboxing video with our support team within 24 hours of delivery.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="description" className="border-b">
                <AccordionTrigger className="hover:no-underline py-4 px-1 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">Description</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-1">
                  {product.description}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl mb-6">You might also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section id="reviews" className="mt-20 border-t pt-16 pb-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          <div className="md:w-1/3">
            <h2 className="font-display text-4xl mb-4">Customer Reviews</h2>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-accent">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} className={cn("h-5 w-5", n <= Math.round(averageRating) ? "fill-current" : "text-muted-foreground")} />
                ))}
              </div>
              <span className="font-medium text-lg">{averageRating} out of 5</span>
            </div>
            
            <form onSubmit={submitReview} className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg">Write a review</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                    <Star className={cn("h-6 w-6 transition-smooth hover:scale-110", n <= rating ? "fill-accent text-accent" : "text-muted-foreground")} />
                  </button>
                ))}
              </div>
              <Textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder={user ? "What did you think of this plant?" : "Log in to share your experience"} 
                disabled={!user} 
                className="min-h-[120px] rounded-xl"
              />
              <Button type="submit" disabled={!user} className="w-full rounded-full">Submit Review</Button>
            </form>
          </div>

          <div className="md:w-2/3">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-12 text-center">
                <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={cn(
                  "space-y-6 transition-all duration-500 ease-in-out overflow-hidden",
                  expanded ? "max-h-[400px] overflow-y-auto pr-4 custom-scrollbar" : "max-h-[1000px]"
                )}>
                  {(expanded ? reviews : reviews.slice(0, 3)).map((r, i) => (
                    <div key={r.id} className={cn(
                      "rounded-2xl border p-4 sm:p-6 transition-smooth hover:shadow-md bg-card",
                      r.rating === 5 && !expanded && i === 0 && "border-primary/30 bg-primary/5 shadow-sm"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary uppercase">
                            {r.author[0]}
                          </div>
                          <div>
                            <div className="font-semibold">{r.author}</div>
                            <div className="text-xs text-muted-foreground">{new Date(r.at).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          </div>
                        </div>
                        <div className="flex text-accent">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("h-4 w-4", i < r.rating ? "fill-current" : "text-muted-foreground/30")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>

                {reviews.length > 3 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setExpanded(!expanded)} 
                    className="w-full rounded-xl mt-2 hover:bg-secondary flex items-center gap-2 text-primary font-medium"
                  >
                    {expanded ? (
                      <>Show Less <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>View All {reviews.length} Reviews <ChevronDown className="h-4 w-4" /></>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
