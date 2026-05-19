import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

export type Role = "customer" | "admin";
export interface User { id: string; email: string; name: string; role: Role; phone?: string; }

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  sendOtp: (email: string) => Promise<void>;
  signup: (name: string, email: string, password: string, otp: string) => Promise<User>;
  loginGoogle: (credential: string) => Promise<User>;
  logout: () => void;
  updateProfile: (name: string, phone: string) => Promise<User>;
}
const Ctx = createContext<AuthCtx | null>(null);

// Demo: any email with "admin" gets admin role. password is not validated (frontend mock).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    void api.get("/auth/me").then((data) => setUser(data.user || null)).catch(() => setUser(null));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api.post("/auth/login", { email, password });
    setUser(u);
    return u;
  }, []);
  const sendOtp = useCallback(async (email: string) => {
    await api.post("/auth/send-otp", { email });
  }, []);
  const signup = useCallback(async (name: string, email: string, password: string, otp: string) => {
    const u = await api.post("/auth/signup", { name, email, password, otp });
    setUser(u);
    return u;
  }, []);
  const loginGoogle = useCallback(async (credential: string) => {
    const u = await api.post("/auth/google", { credential });
    setUser(u);
    return u;
  }, []);
  const logout = useCallback(() => {
    void api.post("/auth/logout").catch(() => undefined);
    setUser(null);
  }, []);
  const updateProfile = useCallback(async (name: string, phone: string) => {
    const u = await api.put("/auth/profile", { name, phone });
    setUser(u);
    return u;
  }, []);

  return <Ctx.Provider value={{ user, login, sendOtp, signup, loginGoogle, logout, updateProfile }}>{children}</Ctx.Provider>;
}
export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
