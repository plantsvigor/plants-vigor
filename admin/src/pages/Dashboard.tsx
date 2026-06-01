import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

const StatCard = ({ title, value, icon, trend, trendValue, color }: any) => (
  <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
        {React.cloneElement(icon, { className: `h-6 w-6 ${color.replace('bg-', 'text-')}` })}
      </div>
      {trend && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div>
      <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-black mt-1 tracking-tight">{value}</h3>
    </div>
  </div>
);

export default function Dashboard() {
  const [range, setRange] = useState("30d");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats", range],
    queryFn: () => api.get("/admin/stats", { params: { range } }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary animate-pulse rounded-2xl" />)}
        </div>
        <div className="h-96 bg-secondary animate-pulse rounded-2xl" />
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Good morning, Admin</h1>
          <p className="text-muted-foreground">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            className="bg-card border rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="15d">Last 15 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats?.totalRevenue || 0)} 
          icon={<TrendingUp />} 
          trend="up" 
          trendValue="12"
          color="bg-green-500"
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          icon={<ShoppingBag />} 
          trend="up" 
          trendValue="8"
          color="bg-blue-500"
        />
        <StatCard 
          title="Active Users" 
          value={stats?.totalUsers || 0} 
          icon={<Users />} 
          trend="down" 
          trendValue="3"
          color="bg-purple-500"
        />
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts || 0} 
          icon={<Package />} 
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue Analytics</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Recent Orders</h3>
          <div className="space-y-4">
            {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors border border-transparent hover:border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center font-mono text-xs font-bold">
                    #{order.id?.slice(-4) || '....'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{order.address?.fullName || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(order.totalAmount || 0)}</p>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                    order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-10">No recent orders</p>
            )}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-primary hover:underline">View all orders</button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Alerts
          </h3>
          <button className="text-sm text-primary font-medium hover:underline">Manage Stock</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-sm border-b">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Stock Left</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats?.lowStockProducts?.map((product: any) => (
                <tr key={product.id || product._id} className="text-sm group">
                  <td className="py-4 flex items-center gap-3">
                    <img src={product.images?.[0] || ''} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-medium group-hover:text-primary transition-colors">{product.name || 'Unknown Product'}</span>
                  </td>

                  <td className="py-4 font-bold text-red-500">
                    {product.stock === 0 ? "Out of Stock" : `${product.stock ?? 0} left`}
                  </td>
                  <td className="py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${product.stock === 0 ? 'bg-red-200 text-red-800 animate-pulse' : 'bg-orange-100 text-orange-700'}`}>
                      {product.stock === 0 ? 'Out of Stock' : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
