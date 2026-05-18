import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

interface WishlistCtx {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}
const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      void api.get(`/wishlist`).then((data) => setIds(data.ids || [])).catch(() => setIds([]));
    } else {
      setIds([]);
    }
  }, [user]);

  const toggle = useCallback((id: string) => {
    if (!user) {
      toast.error("Please log in to use the wishlist");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
    void api.post(`/wishlist/toggle`, { id }).catch(() => undefined);
  }, [user, navigate, location.pathname]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const clear = useCallback(() => {
    if (!user) return;
    setIds([]);
    void api.delete(`/wishlist`).catch(() => undefined);
  }, [user]);

  return <Ctx.Provider value={{ ids, toggle, has, clear }}>{children}</Ctx.Provider>;
}

export const useWishlist = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist outside provider");
  return c;
};
