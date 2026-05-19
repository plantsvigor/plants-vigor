import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";

import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import CategoryPage from "@/pages/CategoryPage";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmed from "@/pages/OrderConfirmed";
import TrackOrder from "@/pages/TrackOrder";
import Wishlist from "@/pages/Wishlist";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import MyOrders from "@/pages/MyOrders";
import Admin from "@/pages/Admin";
import PlantCareAI from "@/pages/PlantCareAI";
import NotFound from "@/pages/NotFound";
import MyProfile from "@/pages/MyProfile";

import { CartProvider } from "@/store/cart";
import { WishlistProvider } from "@/store/wishlist";
import { AuthProvider } from "@/store/auth";
import { OrdersProvider } from "@/store/orders";
import { ReviewsProvider } from "@/store/reviews";
import { AdminCatalogProvider } from "@/store/adminCatalog";
import { AddressProvider } from "@/store/address";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                            <Route path="/plant-care-ai" element={<PlantCareAI />} />
                            <Route path="/admin/*" element={<Admin />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
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

export default App;
