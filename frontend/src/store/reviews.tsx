import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

export interface Review { id: string; productId: string; author: string; rating: number; comment: string; at: number; }
interface ReviewsCtx { reviews: Review[]; add: (r: Omit<Review, "id" | "at">) => void; forProduct: (id: string) => Review[]; }
const Ctx = createContext<ReviewsCtx | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    void api.get("/reviews").then((data) => setReviews(data.reviews || [])).catch(() => setReviews([]));
  }, []);
  const add = useCallback((r: Omit<Review, "id" | "at">) => {
    const optimistic: Review = { ...r, id: crypto.randomUUID(), at: Date.now() };
    setReviews((p) => [optimistic, ...p]);
    void api.post("/reviews", r).then((saved) => {
      setReviews((prev) => [saved, ...prev.filter((x) => x.id !== optimistic.id)]);
    }).catch(() => undefined);
  }, []);
  const forProduct = useCallback((id: string) => reviews.filter(r => r.productId === id), [reviews]);
  return <Ctx.Provider value={{ reviews, add, forProduct }}>{children}</Ctx.Provider>;
}
export const useReviews = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useReviews outside provider");
  return c;
};
