import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Product } from "@/data/catalog";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export interface CartItem { productId: string; qty: number; }

interface CartCtx {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  update: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      void api.get(`/cart`).then(async (data) => {
        const backendItems = data.items || [];
        const local = localStorage.getItem("guest_cart");
        if (local) {
          try {
            const guestItems: CartItem[] = JSON.parse(local);
            if (guestItems.length > 0) {
              for (const item of guestItems) {
                await api.post(`/cart/items`, { productId: item.productId, qty: item.qty }).catch(() => undefined);
              }
              localStorage.removeItem("guest_cart");
              const updatedData = await api.get(`/cart`);
              setItems(updatedData.items || []);
              return;
            }
          } catch (e) {
            console.error("Failed to merge guest cart", e);
          }
        }
        setItems(backendItems);
      }).catch(() => setItems([]));
    } else {
      const local = localStorage.getItem("guest_cart");
      if (local) {
        try {
          setItems(JSON.parse(local));
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }
  }, [user]);

  const add = useCallback((p: Product, qty = 1) => {
    if (!user) {
      setItems((prev) => {
        const ex = prev.find(i => i.productId === p.id);
        const next = ex ? prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + qty } : i) : [...prev, { productId: p.id, qty }];
        localStorage.setItem("guest_cart", JSON.stringify(next));
        return next;
      });
      setOpen(true);
      return;
    }
    setItems((prev) => {
      const ex = prev.find(i => i.productId === p.id);
      if (ex) return prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { productId: p.id, qty }];
    });
    void api.post(`/cart/items`, { productId: p.id, qty }).catch(() => undefined);
    setOpen(true); // Open drawer when item added
  }, [user]);

  const update = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    if (!user) {
      setItems((prev) => {
        const next = prev.map(i => i.productId === id ? { ...i, qty } : i);
        localStorage.setItem("guest_cart", JSON.stringify(next));
        return next;
      });
      return;
    }
    setItems((prev) => prev.map(i => i.productId === id ? { ...i, qty } : i));
    void api.put(`/cart/update`, { productId: id, qty }).catch(() => undefined);
  }, [user]);

  const remove = useCallback((id: string) => {
    if (!user) {
      setItems((prev) => {
        const next = prev.filter(i => i.productId !== id);
        localStorage.setItem("guest_cart", JSON.stringify(next));
        return next;
      });
      return;
    }
    setItems((prev) => prev.filter(i => i.productId !== id));
    void api.delete(`/cart/items/${id}`).catch(() => undefined);
  }, [user]);

  const clear = useCallback(() => {
    if (!user) {
      setItems([]);
      localStorage.removeItem("guest_cart");
      return;
    }
    setItems([]);
    void api.delete(`/cart`).catch(() => undefined);
  }, [user]);

  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);

  return <Ctx.Provider value={{ items, add, update, remove, clear, count, isOpen, setOpen }}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart outside provider");
  return ctx;
};
