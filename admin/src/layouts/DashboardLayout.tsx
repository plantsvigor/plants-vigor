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
  ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
            <button className="p-2 hover:bg-secondary rounded-xl relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </button>
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
