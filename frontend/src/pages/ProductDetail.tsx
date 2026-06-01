import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, ShieldCheck, ShoppingBag, Star, StarHalf, Truck, ChevronDown, ChevronUp, Share2, Copy, Facebook, Twitter, Instagram, Info, Leaf, RotateCcw, FileText, Zap, Loader2, Check } from "lucide-react";
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
import { useReviews } from "@/store/reviews";
import { useAuth } from "@/store/auth";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";

const formatDescription = (description: string) => {
  if (!description) return null;

  const lines = description.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: "bullet" | "number" | null = null;
  let keyCounter = 0;

  const renderList = () => {
    if (currentList.length > 0) {
      const ListTag = listType === "number" ? "ol" : "ul";
      const listClass = listType === "number"
        ? "list-decimal pl-6 space-y-2 my-4 text-muted-foreground leading-relaxed"
        : "list-disc pl-6 space-y-2 my-4 text-muted-foreground leading-relaxed";
      
      elements.push(
        <ListTag key={`list-${keyCounter++}`} className={listClass}>
          {currentList}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      renderList();
      return;
    }

    const bulletMatch = line.match(/^(\s*)[-\*•]\s*(.*)/);
    const numberMatch = line.match(/^(\s*)(\d+)[\.\)]\s*(.*)/);

    if (bulletMatch) {
      if (listType !== "bullet") {
        renderList();
        listType = "bullet";
      }
      currentList.push(
        <li key={`li-${keyCounter++}`} className="pl-1">
          {bulletMatch[2]}
        </li>
      );
    } else if (numberMatch) {
      if (listType !== "number") {
        renderList();
        listType = "number";
      }
      currentList.push(
        <li key={`li-${keyCounter++}`} className="pl-1">
          {numberMatch[3]}
        </li>
      );
    } else {
      renderList();
      elements.push(
        <p key={`p-${keyCounter++}`} className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4 last:mb-0">
          {line}
        </p>
      );
    }
  });

  renderList();

  return <div className="space-y-1">{elements}</div>;
};

const isPlantProduct = (product: any) => {
  if (!product || !product.category) return false;
  const cats = Array.isArray(product.category) ? product.category : [product.category];
  const plantSlugs = [
    "plants",
    "indoor-plants",
    "succulent-plants",
    "cactus",
    "air-purifying-plants",
    "hardy-plants",
    "adenium-plants",
    "vastu-plants",
    "medicinal-plants",
    "house-plants",
    "outdoor-plants",
    "flowering-plants",
    "summer-plants",
    "hanging-plants",
    "plants-for-bathroom"
  ];
  return cats.some(c => plantSlugs.includes(c));
};

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const { has, toggle } = useWishlist();
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
  const [selectedPlanter, setSelectedPlanter] = useState<"gropot" | "krish">("krish");
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

  const handlePlanterChange = (type: "gropot" | "krish") => {
    setSelectedPlanter(type);
    if (product?.images && product.images.length > 0) {
      const targetIdx = type === "gropot"
        ? Math.min(2, product.images.length - 1)
        : 0;
      
      if (activeImg !== targetIdx) {
        setImgLoaded(false);
        setActiveImg(targetIdx);
      } else {
        setImgLoaded(true);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const isPlant = isPlantProduct(product);
    const isKrish = isPlant && selectedPlanter === "krish";
    const itemToAdd = {
      ...product,
      id: isKrish ? `${product.id}_krish` : product.id,
      name: isKrish ? `${product.name} (With Pot)` : (isPlant ? `${product.name} (Without Pot)` : product.name),
      price: product.price + (isKrish ? 50 : 0),
      discountPrice: (product.discountPrice && product.discountPrice > 0)
        ? product.discountPrice + (isKrish ? 50 : 0)
        : undefined
    };
    add(itemToAdd, 1);
    toast.success(isPlant 
      ? `${isKrish ? `${product.name} with Pot` : `${product.name} without Pot`} added to cart`
      : `${product.name} added to cart`
    );
  };

  const handleBuyNow = () => {
    if (!product) return;
    const isPlant = isPlantProduct(product);
    const isKrish = isPlant && selectedPlanter === "krish";
    const finalProductId = isKrish ? `${product.id}_krish` : product.id;
    const finalPrice = (product.discountPrice && product.discountPrice > 0) 
      ? product.discountPrice + (isKrish ? 50 : 0) 
      : product.price + (isKrish ? 50 : 0);
      
    if (!user) {
      toast.info("Please login first to checkout");
      navigate("/login", { 
        state: { 
          from: "/checkout",
          buyNowItem: {
            productId: finalProductId,
            name: isKrish ? `${product.name} (With Pot)` : (isPlant ? `${product.name} (Without Pot)` : product.name),
            price: finalPrice,
            image: product.images[0],
            quantity: 1
          }
        } 
      });
      return;
    }
    navigate("/checkout", { 
      state: { 
        buyNowItem: {
          productId: finalProductId,
          quantity: 1
        }
      } 
    });
  };

  useEffect(() => { 
    if (product) {
      document.title = `${product.name} • Plants Vigor`;
    } else {
      document.title = "Plants Vigor";
    }
  }, [product]);

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

  const baseSellingPrice = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
  const baseOriginalPrice = product.price;
  
  const isPlant = isPlantProduct(product);
  const additionalPrice = (isPlant && selectedPlanter === "krish") ? 50 : 0;
  
  const sellingPrice = baseSellingPrice + additionalPrice;
  const originalPrice = baseOriginalPrice + additionalPrice;
  
  const hasDiscount = (product.discountPrice && product.discountPrice > 0 && product.discountPrice !== product.price);
  const discount = (hasDiscount && originalPrice > 0) ? Math.round((1 - sellingPrice / originalPrice) * 100) : 0;
  const reviews = forProduct(product.id);
  const averageRating = reviews.length > 0 
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : (product.rating ?? 0);
  const reviewCount = reviews.length > 0 ? reviews.length : (product.reviewsCount ?? 0);
  const related = allProducts.filter(p => {
    if (p.id === product.id) return false;
    const pCats = Array.isArray(p.category) ? p.category : p.category ? [p.category] : [];
    const prodCats = Array.isArray(product.category) ? product.category : product.category ? [product.category] : [];
    return pCats.some((c: string) => prodCats.includes(c));
  }).slice(0, 4);
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
        <div className="space-y-4 lg:px-8 xl:px-16">
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
            {discount > 0 && product.stock > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground shadow-sm">
                {discount}% OFF
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
            <div className="flex gap-4 overflow-x-auto p-2 scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setImgLoaded(false); }}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl transition-all duration-300 group outline-none focus:outline-none",
                    activeImg === i ? "scale-105 shadow-md" : "opacity-75 hover:opacity-100 hover:scale-105"
                  )}
                >
                  <img src={img} alt={`${product.name} thumb ${i}`} className="h-full w-full object-cover" />
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-xl border-2 transition-all duration-300 pointer-events-none",
                      activeImg === i ? "border-primary" : "border-border group-hover:border-primary/60"
                    )} 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl md:text-5xl mt-3">{product.name}</h1>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const ratingRounded = Math.round(averageRating * 2) / 2;
                if (ratingRounded >= star) {
                  return (
                    <Star 
                      key={star} 
                      className="h-4 w-4 fill-accent text-accent" 
                    />
                  );
                } else if (ratingRounded >= star - 0.5) {
                  return (
                    <StarHalf 
                      key={star} 
                      className="h-4 w-4 fill-accent text-accent" 
                    />
                  );
                } else {
                  return (
                    <Star 
                      key={star} 
                      className="h-4 w-4 text-muted-foreground/20" 
                    />
                  );
                }
              })}
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
            <span className="font-display text-3xl font-semibold text-[#008744]">{formatINR(sellingPrice)}</span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">{formatINR(originalPrice)}</span>
            )}
          </div>
          
          {/* Select Pot Section */}
          {isPlantProduct(product) && (
            <div className="mt-6 sm:mt-8">
              <h3 className="text-[13px] font-bold text-[#004d40] mb-3 uppercase tracking-wider">Select Pot</h3>
              <div className="flex gap-4 mt-4">
                {/* Without Pot Option */}
                <button
                  onClick={() => handlePlanterChange("gropot")}
                  className={cn(
                    "relative flex-1 flex items-center gap-3 rounded-2xl border-2 p-3 transition-all outline-none",
                    selectedPlanter === "gropot" ? "border-[#008744] bg-[#008744]/5" : "border-border hover:border-muted-foreground"
                  )}
                >
                  {selectedPlanter === "gropot" && (
                    <div className="absolute -top-3 -right-3 bg-[#008744] rounded-full p-1 border-2 border-background z-10 shadow-sm">
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-3 w-full pl-2">
                    <div className="h-9 w-9 shrink-0 text-[#004d40]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16l-2 14H6L4 6zm0 0v-2a1 1 0 011-1h14a1 1 0 011 1v2" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-sm text-foreground tracking-wide">Without Pot</span>
                      <span className="font-bold text-[#008744]">{formatINR(baseSellingPrice)}</span>
                    </div>
                  </div>
                </button>

                {/* With Pot Option */}
                <button
                  onClick={() => handlePlanterChange("krish")}
                  className={cn(
                    "relative flex-1 flex items-center gap-3 rounded-2xl border-2 p-3 transition-all outline-none",
                    selectedPlanter === "krish" ? "border-[#008744] bg-[#008744]/5" : "border-border hover:border-muted-foreground"
                  )}
                >
                  {/* Most Loved Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FDE68A] text-[#004d40] text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm whitespace-nowrap z-10">
                    <Heart className="h-2.5 w-2.5 fill-red-500 text-red-500" />
                    Most Loved
                  </div>
                  
                  {selectedPlanter === "krish" && (
                    <div className="absolute -top-3 -right-3 bg-[#008744] rounded-full p-1 border-2 border-background z-20 shadow-sm">
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-3 w-full pl-2 mt-1">
                    <div className="h-9 w-9 shrink-0 text-[#004d40]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16l-1 12H5L4 6zm0 0v-2a1 1 0 011-1h14a1 1 0 011 1v2m-6 13h-4v2h4v-2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-sm text-foreground tracking-wide">With Pot</span>
                      <span className="font-bold text-[#008744]">{formatINR(baseSellingPrice + 50)}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            {formatDescription(product.shortDescription || product.description)}
          </div>

          <div className="fixed bottom-0 left-0 z-50 w-full p-4 md:static md:p-0 mt-6 sm:mt-8 pointer-events-none">
            <div className="container md:p-0 pointer-events-auto">
              <div className="flex items-center gap-3">
                <Button 
                  size="lg" 
                  variant="outline" 
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 rounded-full border-primary text-primary bg-background/90 hover:bg-background h-12 md:h-11 text-sm md:text-base shadow-lg transition-all",
                    product.stock === 0 && "opacity-50 grayscale cursor-not-allowed border-gray-300 text-gray-400 bg-gray-50 hover:bg-gray-50 pointer-events-none"
                  )}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> {product.stock === 0 ? "Out of stock" : "Add to cart"}
                </Button>
                <Button 
                  size="lg" 
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 rounded-full shadow-lg h-12 md:h-11 text-sm md:text-base transition-all",
                    product.stock === 0 && "opacity-50 grayscale cursor-not-allowed bg-gray-200 text-gray-400 pointer-events-none shadow-none"
                  )}
                  onClick={handleBuyNow}
                >
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

          <div className={cn("mt-3 text-sm flex items-center gap-2", product.stock > 0 ? "text-muted-foreground" : "text-destructive font-bold animate-pulse")}>
            <div className={cn("w-2 h-2 rounded-full", product.stock > 0 ? "bg-emerald-500" : "bg-red-500")} />
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </div>

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
                  {formatDescription(product.description)}
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
                {[1, 2, 3, 4, 5].map((star) => {
                  const ratingRounded = Math.round(averageRating * 2) / 2;
                  if (ratingRounded >= star) {
                    return (
                      <Star 
                        key={star} 
                        className="h-5 w-5 fill-current" 
                      />
                    );
                  } else if (ratingRounded >= star - 0.5) {
                    return (
                      <StarHalf 
                        key={star} 
                        className="h-5 w-5 fill-current" 
                      />
                    );
                  } else {
                    return (
                      <Star 
                        key={star} 
                        className="h-5 w-5 text-muted-foreground" 
                      />
                    );
                  }
                })}
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
