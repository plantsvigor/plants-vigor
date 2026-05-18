import { create } from "zustand";
import { api } from "@/services/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    const user = await api.post("/auth/login", { email, password });
    if (user.role !== "admin") {
      throw new Error("Access denied: Not an admin");
    }
    set({ user });
  },
  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
  checkAuth: async () => {
    try {
      const data = await api.get("/auth/me");
      if (data.user && data.user.role === "admin") {
        set({ user: data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      set({ user: null, loading: false });
    }
  },
}));
