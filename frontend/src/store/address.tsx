import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface AddressCtx {
  addresses: Address[];
  loading: boolean;
  add: (a: Omit<Address, "_id">) => Promise<void>;
  update: (id: string, a: Partial<Address>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AddressCtx | null>(null);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/address");
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (a: Omit<Address, "_id">) => {
    if (addresses.length >= 5) {
      toast.error("Maximum 5 addresses allowed");
      return;
    }
    const data = await api.post("/address/add", a);
    setAddresses(data.addresses);
  };

  const update = async (id: string, a: Partial<Address>) => {
    const data = await api.put(`/address/update/${id}`, a);
    setAddresses(data.addresses);
  };

  const remove = async (id: string) => {
    const data = await api.delete(`/address/delete/${id}`);
    setAddresses(data.addresses);
  };

  const setDefault = async (id: string) => {
    const data = await api.put(`/address/default/${id}`);
    setAddresses(data.addresses);
  };

  return (
    <Ctx.Provider value={{ addresses, loading, add, update, remove, setDefault, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAddress = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAddress outside AddressProvider");
  return c;
};
