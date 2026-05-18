import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { 
  MessageSquare, 
  Star, 
  CheckCircle, 
  Trash2, 
  Clock,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

export default function Reviews() {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => api.get("/admin/reviews"),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, action, isApproved }: any) => 
      api.patch(`/admin/reviews/${id}`, { action, isApproved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review updated");
    },
    onError: (error: any) => toast.error(error.message),
  });

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-secondary rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">Approve or delete customer reviews.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews?.length > 0 ? reviews.map((review: any) => (
          <div key={review._id} className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center font-bold text-sm">
                    {review.author?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-bold">{review.author || 'Anonymous'}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    review.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(review.at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground italic">"{review.comment}"</p>
              <p className="text-[10px] text-muted-foreground mt-3 font-mono">Product ID: {review.productId}</p>
            </div>

            <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 min-w-[140px]">
              <button 
                onClick={() => moderateMutation.mutate({ id: review._id, isApproved: !review.isApproved })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${
                  review.isApproved 
                    ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {review.isApproved ? <><XCircle className="h-4 w-4" /> Reject</> : <><CheckCircle className="h-4 w-4" /> Approve</>}
              </button>
              <button 
                onClick={() => moderateMutation.mutate({ id: review._id, action: 'delete' })}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-card border rounded-2xl p-20 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
