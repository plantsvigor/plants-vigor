import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "./cart";
import { api } from "@/lib/api";

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Out for Delivery" | "Delivered";
export const ORDER_STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];

export interface Address {
  fullName: string; phone: string; street: string;
  city: string; state: string; pincode: string; country: string;
}
export interface OrderProduct {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string | null;
  email: string;
  products: OrderProduct[];
  subtotal: number;
  delivery: number;
  totalAmount: number;
  payment: "COD" | "Razorpay";
  paymentId?: string;
  address: Address;
  status: OrderStatus;
  createdAt: number;
  history: { status: OrderStatus; at: number }[];
}

interface OrdersCtx {
  orders: Order[];
  place: (o: Omit<Order, "id" | "status" | "createdAt" | "history">) => Promise<Order>;
  setStatus: (id: string, status: OrderStatus) => void;
  byId: (id: string) => Order | undefined;
}
const Ctx = createContext<OrdersCtx | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    void api.get("/orders/my-orders")
      .then((data) => setOrders(data.orders || []))
      .catch(() => {
        // Fallback or handle error
        setOrders([]);
      });
  }, []);

  const place = useCallback(async (o: Omit<Order, "id" | "status" | "createdAt" | "history">) => {
    const saved = await api.post("/orders", o);
    setOrders((p) => [saved, ...p.filter((x) => x.id !== saved.id)]);
    return saved;
  }, []);
  const setStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((p) => p.map((o) => o.id === id ? { ...o, status, history: [...o.history, { status, at: Date.now() }] } : o));
    void api.patch(`/orders/${id}/status`, { status }).then((saved) => {
      setOrders((prev) => prev.map((x) => (x.id === id ? saved : x)));
    }).catch(() => undefined);
  }, []);
  const byId = useCallback((id: string) => orders.find(o => o.id === id), [orders]);
  return <Ctx.Provider value={{ orders, place, setStatus, byId }}>{children}</Ctx.Provider>;
}
export const useOrders = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useOrders outside provider");
  return c;
};
