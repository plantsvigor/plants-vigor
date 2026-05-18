import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_MAP } from "@/constants/categories";

export default function Banners() {
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => api.get("/banners"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted successfully");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const allSubCategories = CATEGORY_MAP.flatMap(main => main.subCategories);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSlug) {
      if (!selectedSlug) toast.error("Please select a category first");
      return;
    }
    
    const formData = new FormData();
    formData.append("image", file);
    
    setUploading(true);
    setLoading(true);
    try {
      // 1. Upload to Cloudinary
      const res: any = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // 2. Save to DB
      if (applyToAll) {
        await api.post("/admin/banners/bulk", {
          slugs: allSubCategories.map(s => s.slug),
          image: res.url
        });
      } else {
        await api.post("/admin/banners", {
          categorySlug: selectedSlug,
          image: res.url
        });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success(applyToAll ? "Banner applied to ALL categories!" : "Banner updated successfully!");
      setSelectedSlug("");
      setApplyToAll(false);
    } catch (err: any) {
      toast.error("Failed to upload banner: " + err.message);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-secondary rounded-2xl" />)}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Category Banners</h1>
        <p className="text-muted-foreground">Upload and manage banners for each category/sub-category.</p>
      </div>

      <div className="bg-card border rounded-3xl p-8 shadow-sm max-w-2xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add / Update Banner
        </h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Select Sub-Category</label>
            <select 
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="">Choose a category...</option>
              {allSubCategories.map(sub => (
                <option key={sub.slug} value={sub.slug}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
            <input 
              type="checkbox" 
              id="apply-all"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="w-5 h-5 rounded-lg text-primary focus:ring-primary/20"
            />
            <label htmlFor="apply-all" className="text-sm font-bold cursor-pointer select-none">
              Apply this image to <span className="text-primary font-black uppercase">ALL</span> categories at once
            </label>
          </div>

          <div className="relative group">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleUpload}
              disabled={loading || !selectedSlug}
              className="hidden"
              id="banner-upload"
            />
            <label 
              htmlFor="banner-upload"
              className={`
                flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer
                ${!selectedSlug ? 'opacity-50 cursor-not-allowed bg-secondary/10' : 'hover:bg-secondary/20 hover:border-primary border-border'}
              `}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <>
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold">Click to upload banner</p>
                    <p className="text-xs text-muted-foreground mt-1">Recommended: 1920x400px (Wide aspect ratio)</p>
                  </div>
                </>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Active Banners
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners?.map((banner: any) => (
            <div key={banner._id} className="bg-card border rounded-3xl overflow-hidden shadow-sm group hover:shadow-md transition-all">
              <div className="aspect-[3/1] relative bg-secondary/20">
                <img src={banner.image} alt={banner.categorySlug} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => {
                      if(confirm("Delete this banner?")) deleteMutation.mutate(banner._id);
                    }}
                    className="p-3 bg-destructive text-destructive-foreground rounded-2xl shadow-xl hover:scale-110 transition-transform"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Category Slug</p>
                  <p className="text-lg font-bold text-primary">{banner.categorySlug}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Last updated</p>
                  <p className="text-xs font-medium">{new Date(banner.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
          {(!banners || banners.length === 0) && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No banners uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
