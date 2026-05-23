import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";

import Layout from "@/components/layout/Layout";
const Home = lazy(() => import("@/pages/Home"));
const Shop = lazy(() => import("@/pages/Shop"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderConfirmed = lazy(() => import("@/pages/OrderConfirmed"));
const TrackOrder = lazy(() => import("@/pages/TrackOrder"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const MyOrders = lazy(() => import("@/pages/MyOrders"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const MyProfile = lazy(() => import("@/pages/MyProfile"));


import { CartProvider } from "@/store/cart";
import { WishlistProvider } from "@/store/wishlist";
import { AuthProvider } from "@/store/auth";
import { OrdersProvider } from "@/store/orders";
import { ReviewsProvider } from "@/store/reviews";
import { AdminCatalogProvider } from "@/store/adminCatalog";
import { AddressProvider } from "@/store/address";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { useState, useEffect, lazy, Suspense } from "react";
import { api } from "@/lib/api";

const queryClient = new QueryClient();

const App = () => {
  const [keys, setKeys] = useState<{ googleClientId: string; razorpayKeyId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.get("/config/keys") as Promise<any>).then((res) => {
      setKeys(res);
      (window as any).__APP_KEYS__ = res;
    }).catch(err => {
      console.error("Failed to load configuration keys:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const googleClientId = keys?.googleClientId || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster />
            <Sonner position="top-center" />
            <AuthProvider>
              <AddressProvider>
                <CartProvider>
                    <WishlistProvider>
                      <ReviewsProvider>
                        <OrdersProvider>
                          <AdminCatalogProvider>
                            <Layout>
                              <Suspense fallback={
                                <div className="flex h-[60vh] w-full items-center justify-center">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                </div>
                              }>
                                <Routes>
                                  <Route path="/" element={<Home />} />
                                  <Route path="/category/plants" element={<Shop />} />
                                  <Route path="/category/:slug" element={<CategoryPage />} />
                                  <Route path="/product/:slug" element={<ProductDetail />} />
                                  <Route path="/cart" element={<Cart />} />
                                  <Route path="/checkout" element={<Checkout />} />
                                  <Route path="/order/:id" element={<OrderConfirmed />} />
                                  <Route path="/track-order" element={<TrackOrder />} />
                                  <Route path="/wishlist" element={<Wishlist />} />
                                  <Route path="/login" element={<Login />} />
                                  <Route path="/signup" element={<Signup />} />
                                  <Route path="/orders" element={<MyOrders />} />
                                  <Route path="/profile" element={<MyProfile />} />
                                  <Route path="/admin/*" element={<Admin />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </Suspense>
                            </Layout>
                        </AdminCatalogProvider>
                      </OrdersProvider>
                    </ReviewsProvider>
                </WishlistProvider>
              </CartProvider>
              </AddressProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
