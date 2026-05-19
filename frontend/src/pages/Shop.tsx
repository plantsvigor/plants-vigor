import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const { products, loading } = useProducts();
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const cat = params.get("category") || "all";
  const [sort, setSort] = useState<string>("recommended");

  const filtered = useMemo(() => {
    let list = (products || []).filter(p => {
      if (cat !== "all" && p.category !== cat && p.subCategory !== cat) return false;
      if (q.trim() && !(`${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    if (sort === "price-desc") list = [...list].sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
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
    <div className="container py-10 md:py-14">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-center md:text-left">Shop All</h1>
          <p className="text-muted-foreground mt-2 text-center md:text-left">{filtered.length} {filtered.length === 1 ? "product" : "products"}</p>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-2">
          <label className="text-sm text-muted-foreground font-medium">Sort by:</label>
          <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-full border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-16 md:p-24 text-center bg-secondary/10">
            <p className="font-display text-2xl mb-2 text-muted-foreground/60">No plants match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
