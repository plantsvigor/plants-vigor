import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { useBanners } from "@/hooks/useBanners";

export default function Shop() {
  const { products, loading } = useProducts();
  const { getBannerForSlug } = useBanners();
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const cat = params.get("category") || "all";
  const [sort, setSort] = useState<string>("recommended");
  const activeBanner = getBannerForSlug("plants") || "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2000&auto=format&fit=crop";

  const filtered = useMemo(() => {
    let list = (products || []).filter(p => {
      if (cat !== "all") {
        const matchesCat = Array.isArray(p.category) ? p.category.includes(cat) : p.category === cat;
        const matchesSub = Array.isArray(p.subCategory) ? p.subCategory.includes(cat) : p.subCategory === cat;
        if (!matchesCat && !matchesSub) return false;
      }
      if (q.trim() && !(`${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => {
      const pA = (a.discountPrice && a.discountPrice > 0) ? a.discountPrice : a.price;
      const pB = (b.discountPrice && b.discountPrice > 0) ? b.discountPrice : b.price;
      return pA - pB;
    });
    if (sort === "price-desc") list = [...list].sort((a, b) => {
      const pA = (a.discountPrice && a.discountPrice > 0) ? a.discountPrice : a.price;
      const pB = (b.discountPrice && b.discountPrice > 0) ? b.discountPrice : b.price;
      return pB - pA;
    });
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, q, cat, sort]);

  if (loading) return (
    <div className="container py-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground font-medium">Loading catalog...</p>
    </div>
  );

  return (
    <div>
      {/* Dynamic Banner Section */}
      <section className="relative h-[100px] md:h-[150px] overflow-hidden">
        <img
          src={activeBanner}
          alt="Shop All"
          className="w-full h-full object-cover animate-in fade-in duration-1000"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="font-display text-4xl md:text-7xl font-bold tracking-tight drop-shadow-lg">Shop All</h1>
            <p className="text-sm md:text-lg opacity-90 mt-2 font-medium tracking-widest uppercase">Browse all plants</p>
          </div>
        </div>
      </section>

      <div className="container py-2 md:py-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              <span className="text-foreground font-bold">{filtered.length}</span> {filtered.length === 1 ? "Product" : "Products"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-wider">Sort:</label>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="rounded-lg border bg-background px-2 py-1.5 text-[11px] md:text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
            >
              <option value="recommended">Best Match</option>
              <option value="price-asc">Price: Low</option>
              <option value="price-desc">Price: High</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No products found matching your search.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
