import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

interface RecentCtx { ids: string[]; push: (id: string) => void; }
const Ctx = createContext<RecentCtx | null>(null);

export function RecentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      void api.get(`/recent`).then((data) => setIds(data.ids || [])).catch(() => setIds([]));
    } else {
      setIds([]);
    }
  }, [user]);

  const push = useCallback((id: string) => {
    if (!user) return;
    setIds((p) => [id, ...p.filter((x) => x !== id)].slice(0, 8));
    void api.post(`/recent`, { id }).catch(() => undefined);
  }, [user]);

  return <Ctx.Provider value={{ ids, push }}>{children}</Ctx.Provider>;
}

export const useRecent = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRecent outside provider");
  return c;
};
