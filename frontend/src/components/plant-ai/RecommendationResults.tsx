import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Sun, Droplets, ShieldAlert, BadgeHelp } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

interface RecommendedPlant {
  _id: string;
  id: string;
  name: string;
  dbProductName: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  sunlight: string;
  watering: string;
  difficulty: string;
  shortDescription: string;
  careTips: string[];
}

interface RecommendationResultsProps {
  recommendations: RecommendedPlant[];
  hasMore: boolean;
  totalMatches: number;
}

export default function RecommendationResults({ 
  recommendations, 
  hasMore, 
  totalMatches 
}: RecommendationResultsProps) {
  const { add } = useCart();

  const handleAddToCart = (plant: RecommendedPlant) => {
    // Construct a catalog product representation to fit cart store expectations
    const product = {
      _id: plant._id,
      id: plant.id,
      name: plant.dbProductName || plant.name,
      slug: plant.slug,
      price: plant.price,
      images: plant.images && plant.images.length > 0 ? plant.images : ["https://res.cloudinary.com/dzwlbzyg4/image/upload/v1716440000/placeholder.jpg"],
      category: plant.category.toLowerCase().replace(" ", "-"),
      description: plant.shortDescription,
      stock: 10,
      rating: 0,
      reviewsCount: 0,
    };

    add(product);
    toast.success(`${plant.name} added to cart!`);
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center p-6 bg-card border border-border/80 rounded-2xl max-w-md mx-auto">
        <BadgeHelp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-semibold text-sm">No exact matches found</h3>
        <p className="text-xs text-muted-foreground mt-1">We couldn't find plants matching all strictly set filters. Try relaxing pet safety or light constraints in your next search!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-400">
      
      {/* Intro Match Counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Matches Found ({totalMatches})
        </span>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
          Displaying top {recommendations.length}
        </span>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((plant) => {
          const image = plant.images?.[0] || "https://res.cloudinary.com/dzwlbzyg4/image/upload/v1716440000/placeholder.jpg";
          
          return (
            <div 
              key={plant._id || plant.id}
              className="flex flex-col sm:flex-row gap-3 p-3 bg-card border border-border/80 rounded-2xl hover:border-emerald-500/20 shadow-sm transition-all group overflow-hidden"
            >
              
              {/* Product Thumbnail */}
              <Link 
                to={`/product/${plant.slug}`}
                className="w-full sm:w-[120px] aspect-square rounded-xl overflow-hidden bg-muted shrink-0 relative block"
              >
                <img
                  src={image}
                  alt={plant.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider shadow-sm">
                  {plant.difficulty}
                </span>
              </Link>

              {/* Plant Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${plant.slug}`} className="hover:underline">
                      <h4 className="text-sm font-bold text-foreground truncate group-hover:text-emerald-600 transition-colors">
                        {plant.name}
                      </h4>
                    </Link>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      Rs. {plant.price}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">{plant.category}</span>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {plant.shortDescription}
                  </p>

                  {/* Botanical Specs */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2.5 pt-2.5 border-t border-border/40 text-[10px] font-medium text-foreground/80">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sun className="h-3 w-3 text-amber-500 shrink-0" />
                      <span className="truncate" title={plant.sunlight}>{plant.sunlight}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Droplets className="h-3 w-3 text-sky-500 shrink-0" />
                      <span className="truncate" title={plant.watering}>{plant.watering}</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Trigger */}
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    onClick={() => handleAddToCart(plant)}
                    size="sm"
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-8 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                  
                  <Link to={`/product/${plant.slug}`} className="shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-border/80 hover:bg-emerald-500/5 text-xs font-semibold h-8 text-foreground"
                    >
                      Details
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* View More Trigger */}
      {hasMore && (
        <div className="text-center pt-2">
          <Link to="/category/plants">
            <Button
              variant="link"
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold p-0 h-auto hover:underline"
            >
              View More Matching Plants in Shop &rarr;
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
}
