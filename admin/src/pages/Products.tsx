import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { ProductModal } from "@/components/ProductModal";

export default function Products() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const filteredProducts = products?.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-secondary rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your plant inventory.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between relative">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Stock</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts?.length > 0 ? filteredProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={product.images?.[0] || ''} alt="" className="h-12 w-12 rounded-xl object-cover border shadow-sm" />
                        {product.featured && (
                          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground p-0.5 rounded-full border-2 border-card shadow-sm">
                            <Plus className="h-2 w-2" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold group-hover:text-primary transition-colors">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5" />
                          {product.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {(() => {
                      const selling = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
                      const original = product.price;
                      const hasDiscount = (product.discountPrice && product.discountPrice > 0 && product.discountPrice !== product.price);
                      return (
                        <div>
                          <p className="font-bold text-sm">₹{selling}</p>
                          {hasDiscount && (
                            <p className="text-[10px] text-muted-foreground line-through">₹{original}</p>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                      {product.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className={`text-xs font-semibold ${product.stock === 0 ? "text-red-600 font-bold" : ""}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toast.info("More options coming soon!")}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Search className="h-10 w-10" />
                      <p className="font-medium">No products found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex items-center justify-between bg-secondary/10">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-bold text-foreground">1</span> to <span className="font-bold text-foreground">{filteredProducts?.length}</span> of <span className="font-bold text-foreground">{filteredProducts?.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-xl hover:bg-secondary disabled:opacity-30 transition-all" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-2 border rounded-xl hover:bg-secondary disabled:opacity-30 transition-all" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
      />
    </div>
  );
}
