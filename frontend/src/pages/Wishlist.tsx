import { Link } from "react-router-dom";
import { useWishlist } from "@/store/wishlist";
import { useProducts } from "@/hooks/useProducts";
import { formatINR } from "@/data/catalog";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const { ids } = useWishlist();
  const { products: allProducts } = useProducts();
  const list = allProducts.filter(p => ids.includes(p.id));

  return (
    <div className="container py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl mb-8">Your Wishlist</h1>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <p className="font-display text-2xl mb-2">No favourites yet</p>
          <p className="text-muted-foreground mb-6">Tap the heart on any plant to save it here.</p>
          <Button asChild className="rounded-full"><Link to="/category/plants">Discover plants</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {list.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
