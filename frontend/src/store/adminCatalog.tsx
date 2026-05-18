import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface AdminCatalogCtx {
  productOverrides: Record<string, Partial<{ price: number; discountPrice: number; stock: number; name: string; description: string }>>;
  hiddenIds: Set<string>;
  customProducts: any[];
  updateProduct: (id: string, patch: Record<string, any>) => void;
  hideProduct: (id: string) => void;
  unhideProduct: (id: string) => void;
}

// Lightweight admin overlay that lets the admin panel modify dummy data without backend.
const Ctx = createContext<AdminCatalogCtx | null>(null);

export function AdminCatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ productOverrides: {}, hiddenIds: [], customProducts: [] });
  useEffect(() => {
    void api.get("/admin-catalog").then((data) => setState(data)).catch(() => undefined);
  }, []);

  const value: AdminCatalogCtx = {
    productOverrides: state.productOverrides,
    hiddenIds: new Set(state.hiddenIds),
    customProducts: state.customProducts,
    updateProduct: (id, patch) => {
      setState((s: any) => ({ ...s, productOverrides: { ...s.productOverrides, [id]: { ...(s.productOverrides[id] || {}), ...patch } } }));
      void api.patch(`/admin-catalog/product/${id}`, patch).catch(() => undefined);
    },
    hideProduct: (id) => {
      setState((s: any) => ({ ...s, hiddenIds: Array.from(new Set([...s.hiddenIds, id])) }));
      void api.patch(`/admin-catalog/product/${id}/hide`).catch(() => undefined);
    },
    unhideProduct: (id) => {
      setState((s: any) => ({ ...s, hiddenIds: s.hiddenIds.filter((x: string) => x !== id) }));
      void api.patch(`/admin-catalog/product/${id}/unhide`).catch(() => undefined);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAdminCatalog = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminCatalog outside provider");
  return c;
};
