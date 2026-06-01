import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { CATEGORY_MAP } from "@/constants/categories";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess: () => void;
}



export const ProductModal = ({ isOpen, onClose, product, onSuccess }: ProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: "",
    name: "",
    slug: "",
    price: "",
    discountPrice: "",
    discountAmount: "",
    description: "",
    shortDescription: "",
    stock: 10,
    featured: false,
    bestSeller: false,
    images: [],
    tags: [],
    category: [],
    subCategory: []
  });



  useEffect(() => {
    if (product) {
      const calculatedAmt = (product.price && product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price)
        ? product.price - product.discountPrice
        : "";
      
      const categoryArray = Array.isArray(product.category)
        ? product.category
        : product.category
          ? [product.category]
          : [];
      
      const subCategoryArray = Array.isArray(product.subCategory)
        ? product.subCategory
        : product.subCategory
          ? [product.subCategory]
          : [];

      setFormData({
        ...product,
        price: product.price || "",
        discountPrice: product.discountPrice || "",
        discountAmount: calculatedAmt,
        shortDescription: product.shortDescription || "",
        category: categoryArray,
        subCategory: subCategoryArray
      });
    } else {
      setFormData({
        id: "P" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        name: "",
        slug: "",
        price: "",
        discountPrice: "",
        discountAmount: "",
        description: "",
        shortDescription: "",
        stock: 10,
        featured: false,
        bestSeller: false,
        images: [],
        tags: [],
        category: [],
        subCategory: []
      });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: any) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      if (name === "name") {
        newData.slug = value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      }

      if (name === "price" || name === "discountAmount") {
        const actualPrice = name === "price" ? Number(value) : Number(prev.price);
        const disAmount = name === "discountAmount" ? Number(value) : Number(prev.discountAmount);

        if (!isNaN(actualPrice) && actualPrice > 0) {
          if (!isNaN(disAmount) && disAmount > 0) {
            newData.discountPrice = Math.max(0, actualPrice - disAmount);
          } else {
            newData.discountPrice = "";
          }
        } else {
          newData.discountPrice = "";
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = { ...formData };
      
      dataToSave.price = Number(dataToSave.price) || 0;
      dataToSave.discountPrice = Number(dataToSave.discountPrice) || 0;
      dataToSave.stock = Number(dataToSave.stock) || 0;
      
      delete dataToSave.discountAmount;

      // Validation
      if (dataToSave.price <= 0) {
        toast.error("Actual Price must be greater than 0");
        setLoading(false);
        return;
      }

      if (dataToSave.discountPrice > 0 && dataToSave.discountPrice >= dataToSave.price) {
        toast.error("Calculated Offer Price must be less than Actual Price");
        setLoading(false);
        return;
      }

      if (dataToSave.images.length === 0) {
        dataToSave.images = ["https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=1000&auto=format&fit=crop"];
      }

      if (product) {
        await api.put(`/admin/products/${product.id}`, dataToSave);
        toast.success("Product updated successfully");
      } else {
        await api.post("/admin/products", dataToSave);
        toast.success("Product created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col border border-border/50 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex items-center justify-between bg-secondary/20">
          <div>
            <h2 className="text-2xl font-bold">{product ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-sm text-muted-foreground">Fill in the details for your plant catalog.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Product Name</label>
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Monstera Deliciosa"
                  className="w-full px-4 py-3 bg-secondary/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Actual Price (₹)</label>
                  <input 
                    name="price"
                    type="text"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 100"
                    className="w-full px-4 py-3 bg-secondary/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MultiSelectDropdown
                    label="Main Category"
                    placeholder="Select Main Categories"
                    options={CATEGORY_MAP.map(m => ({ name: m.name, slug: m.slug }))}
                    selectedValues={formData.subCategory || []}
                    onChange={(values) => {
                      setFormData((p: any) => {
                        const validSubs = CATEGORY_MAP
                          .filter(m => values.includes(m.slug))
                          .flatMap(m => m.subCategories.map(s => s.slug));
                        const newCategory = (p.category || []).filter((c: string) => validSubs.includes(c));
                        
                        return {
                          ...p,
                          subCategory: values,
                          category: newCategory
                        };
                      });
                    }}
                  />
                  <MultiSelectDropdown
                    label="Sub-Category (Real Category)"
                    placeholder="Select Sub-Categories"
                    options={
                      (formData.subCategory || []).length > 0
                        ? CATEGORY_MAP
                            .filter(m => (formData.subCategory || []).includes(m.slug))
                            .flatMap(m => m.subCategories)
                            .map(sub => ({ name: sub.name, slug: sub.slug }))
                        : CATEGORY_MAP.flatMap(m => m.subCategories).map(sub => ({ name: sub.name, slug: sub.slug }))
                    }
                    selectedValues={formData.category || []}
                    onChange={(values) => {
                      setFormData((p: any) => ({
                        ...p,
                        category: values
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1 text-primary">Discount Amount (₹)</label>
                  <input 
                    name="discountAmount"
                    type="text"
                    value={formData.discountAmount || ""}
                    onChange={handleChange}
                    placeholder="e.g. 50 (Flat amount off Actual Price)"
                    className="w-full px-4 py-3 bg-primary/10 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary"
                  />
                  {formData.price && formData.discountAmount && Number(formData.discountAmount) > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground ml-1 mt-1">
                      Calculated Offer Price: <span className="text-primary font-bold">₹{formData.discountPrice}</span> ({Math.round((Number(formData.discountAmount) / Number(formData.price)) * 100)}% discount on ₹{formData.price})
                    </p>
                  )}
                </div>



              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Stock Quantity</label>
                <input 
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="flex items-center gap-6 p-4 bg-secondary/20 rounded-2xl border border-dashed">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData((p: any) => ({ ...p, featured: e.target.checked }))}
                    className="w-5 h-5 rounded-lg text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.bestSeller}
                    onChange={(e) => setFormData((p: any) => ({ ...p, bestSeller: e.target.checked }))}
                    className="w-5 h-5 rounded-lg text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">Best Seller</span>
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Images</label>
                <div className="grid grid-cols-2 gap-3">
                  {formData.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border bg-secondary/10">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData((p: any) => ({ ...p, images: p.images.filter((_: any, i: number) => i !== idx) }))}
                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 4 && (
                    <div className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-secondary/20 transition-all p-4 relative group cursor-pointer overflow-hidden">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <>
                          <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Upload Image</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append("image", file);
                          
                          setUploading(true);
                          try {
                            const res: any = await api.post("/admin/upload", formData, {
                              headers: { "Content-Type": "multipart/form-data" }
                            });
                            setFormData((p: any) => ({ ...p, images: [...p.images, res.url] }));
                            toast.success("Image uploaded!");
                          } catch (err: any) {
                            toast.error("Upload failed: " + err.message);
                          } finally {
                            setUploading(false);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground italic px-1">Tip: Click the "+" box to select and upload product images.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Short Description</label>
                <textarea 
                  name="shortDescription"
                  value={formData.shortDescription || ""}
                  onChange={handleChange}
                  rows={2}
                  placeholder="A short, catchy overview..."
                  className="w-full px-4 py-3 bg-secondary/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Long Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Tell us about this plant..."
                  className="w-full px-4 py-3 bg-secondary/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t bg-secondary/20 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-bold hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-primary-foreground px-10 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
};
