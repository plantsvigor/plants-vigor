import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

// Layouts
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Pages
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Products = React.lazy(() => import("@/pages/Products"));
const Orders = React.lazy(() => import("@/pages/Orders"));
const Users = React.lazy(() => import("@/pages/Users"));
const Reviews = React.lazy(() => import("@/pages/Reviews"));
const Login = React.lazy(() => import("@/pages/Login"));
const Reels = React.lazy(() => import("@/pages/Reels"));
const Banners = React.lazy(() => import("@/pages/Banners"));


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
        <React.Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }>
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
        </React.Suspense>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
