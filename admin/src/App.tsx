import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

// Layouts
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
import Users from "@/pages/Users";
import Reviews from "@/pages/Reviews";
import Login from "@/pages/Login";
import Reels from "@/pages/Reels";
import Banners from "@/pages/Banners";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>;
  
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />

          <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
          <Route path="/banners" element={<ProtectedRoute><Banners /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
