import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  PlayCircle,
  MessageSquare, 
  ImageIcon,
  LogOut,
  Menu,
  Bell,
  Search,
  User as UserIcon,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ to, icon, label, active }: SidebarItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
  >
    <span className={cn("transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")}>
      {icon}
    </span>
    <span className="font-medium">{label}</span>
    {active && <ChevronRight className="ml-auto h-4 w-4" />}
  </Link>
);

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats } = useQuery<any>({
    queryKey: ["admin-stats-nav"],
    queryFn: () => api.get("/admin/stats"),
    refetchInterval: 30000,
    enabled: !!user,
  });

  const notifications = React.useMemo(() => {
    if (!stats) return [];
    const list: any[] = [];

    // Add low stock alerts
    if (stats.lowStockProducts) {
      stats.lowStockProducts.forEach((prod: any) => {
        list.push({
          id: `stock-${prod.id || prod._id}`,
          type: "stock",
          title: "Low Stock Alert",
          description: `${prod.name || 'Product'} has only ${prod.stock ?? 0} left in stock`,
          icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
          to: "/products",
          time: "Active alert",
          rawTime: Date.now() + 1000, // keep low stock at top
        });
      });
    }

    // Add recent orders
    if (stats.recentOrders) {
      stats.recentOrders.forEach((order: any) => {
        list.push({
          id: `order-${order.id}`,
          type: "order",
          title: "New Order Received",
          description: `Order #${order.orderCode || order.id?.slice(-6)} by ${order.address?.fullName || 'Guest'} - Rs. ${order.totalAmount}`,
          icon: <ShoppingBag className="h-4 w-4 text-blue-500" />,
          to: "/orders",
          time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          rawTime: order.createdAt ? new Date(order.createdAt).getTime() : 0,
        });
      });
    }

    return list.sort((a, b) => b.rawTime - a.rawTime);
  }, [stats]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { to: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { to: "/products", icon: <Package className="h-5 w-5" />, label: "Products" },
    { to: "/orders", icon: <ShoppingBag className="h-5 w-5" />, label: "Orders" },
    { to: "/users", icon: <Users className="h-5 w-5" />, label: "Users" },
    { to: "/reels", icon: <PlayCircle className="h-5 w-5" />, label: "Insta Reels" },
    { to: "/banners", icon: <ImageIcon className="h-5 w-5" />, label: "Banners" },
    { to: "/reviews", icon: <MessageSquare className="h-5 w-5" />, label: "Reviews" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r transition-transform duration-300 transform lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Package className="text-primary-foreground h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">GreenBloom <span className="text-primary">Admin</span></span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.to} 
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                active={location.pathname === item.to}
              />
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-card border-b flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-secondary rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:block">
              {/* Search removed as requested */}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 hover:bg-secondary rounded-xl relative flex items-center justify-center transition-colors"
              >
                <Bell className="h-5 w-5 text-foreground/80 hover:text-foreground" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center scale-90">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-card rounded-2xl border shadow-xl z-50 p-4 animate-fade-in-down max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      {notifications.length > 0 && (
                        <span className="text-xs text-muted-foreground font-semibold bg-secondary px-2 py-0.5 rounded-full">{notifications.length} active</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to={notif.to}
                            onClick={() => setNotifOpen(false)}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary transition-all border border-transparent hover:border-border"
                          >
                            <div className="p-2 bg-secondary rounded-lg flex-shrink-0 mt-0.5">
                              {notif.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground">{notif.title}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{notif.description}</p>
                              <span className="text-[9px] text-primary/70 font-bold uppercase tracking-wider block mt-1">{notif.time}</span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-10 text-muted-foreground text-xs font-medium">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="h-10 w-[1px] bg-border mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground uppercase">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
