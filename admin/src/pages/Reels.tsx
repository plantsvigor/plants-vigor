import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { 
  PlayCircle, 
  Plus, 
  Trash2, 
  Loader2, 
  Instagram, 
  Video,
  Upload,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";

export default function Reels() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    instagramId: "",
    profileUrl: "",
    video: null as File | null
  });

  const { data: reels, isLoading } = useQuery({
    queryKey: ["admin-reels"],
    queryFn: async () => {
      const res = await api.get("/reels");
      return res;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post("/reels", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
      toast.success("Reel uploaded successfully");
      setFormData({ instagramId: "", profileUrl: "", video: null });
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
      setIsUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
      toast.success("Reel deleted");
    },
    onError: (error: any) => toast.error(error.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.video) return toast.error("Please select a video");
    
    setIsUploading(true);
    const data = new FormData();
    data.append("video", formData.video);
    data.append("instagramId", formData.instagramId);
    data.append("profileUrl", formData.profileUrl);
    
    uploadMutation.mutate(data);
  };

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-secondary rounded-2xl" />)}</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instagram Reels</h1>
          <p className="text-muted-foreground">Manage videos for the "Delivered with care" section.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Video className="h-4 w-4" />
          {reels?.length || 0} Reels
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Upload Form - Now at the Top */}
        <div className="max-w-4xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="bg-card border rounded-[2rem] p-6 shadow-soft space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Plus className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-lg">Add New Reel</h2>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">Cloudinary Upload</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Instagram ID</label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="e.g. greenbloom_co"
                    value={formData.instagramId}
                    onChange={(e) => setFormData({ ...formData, instagramId: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Profile URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="url" 
                    placeholder="https://instagram.com/..."
                    value={formData.profileUrl}
                    onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-5 w-5" /> Publish Reel</>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Video File</label>
              <label className={`
                flex items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                ${formData.video ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-secondary/30'}
              `}>
                {formData.video ? (
                  <div className="flex items-center gap-3">
                    <Video className="h-6 w-6 text-primary" />
                    <p className="text-sm font-bold truncate max-w-[300px]">{formData.video.name}</p>
                    <p className="text-[10px] text-muted-foreground">Click to change</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-bold">Drop video here or click to upload</p>
                    <p className="text-[10px] text-muted-foreground">MP4, MOV up to 10MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={(e) => setFormData({ ...formData, video: e.target.files?.[0] || null })}
                />
              </label>
            </div>
          </form>
        </div>

        {/* List - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {reels?.map((reel: any) => (
            <div key={reel._id} className="bg-card border rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm group">
              <div className="relative aspect-[9/16] bg-black">
                <video 
                  src={reel.videoUrl} 
                  className="w-full h-full object-cover"
                  controls
                />
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this reel?")) {
                      deleteMutation.mutate(reel._id);
                    }
                  }}
                  className="absolute top-2 right-2 md:top-4 md:right-4 p-2 md:p-3 bg-red-600 text-white rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                >
                  <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
              <div className="p-3 md:p-5 space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <img src={reel.avatarUrl} alt="" className="h-6 w-6 md:h-10 md:w-10 rounded-full border-2 border-primary/20" />
                  <div className="min-w-0">
                    <p className="font-bold text-[10px] md:text-sm truncate">@{reel.instagramId}</p>
                    <a href={reel.profileUrl} target="_blank" rel="noreferrer" className="text-[8px] md:text-[10px] text-primary font-bold hover:underline truncate block">
                      View Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {reels?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-secondary/20 rounded-[2rem] border-2 border-dashed">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No reels uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
