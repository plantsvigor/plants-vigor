import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  MessageCircle, 
  FileText,
  CheckCircle2,
  Truck,
  PackageCheck,
  Clock,
  MapPin,
  Copy,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const statusColors: any = {
  "Pending": "bg-orange-100 text-orange-700 border-orange-200",
  "Confirmed": "bg-blue-100 text-blue-700 border-blue-200",
  "Shipped": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Out for Delivery": "bg-purple-100 text-purple-700 border-purple-200",
  "Delivered": "bg-green-100 text-green-700 border-green-200",
};

const statusIcons: any = {
  "Pending": <Clock className="h-4 w-4" />,
  "Confirmed": <CheckCircle2 className="h-4 w-4" />,
  "Shipped": <Truck className="h-4 w-4" />,
  "Out for Delivery": <PackageCheck className="h-4 w-4" />,
  "Delivered": <CheckCircle2 className="h-4 w-4" />,
};

export default function Orders() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");

  const [assigningAWB, setAssigningAWB] = useState<string | null>(null);
  const [schedulingPickup, setSchedulingPickup] = useState<string | null>(null);
  const [generatingLabel, setGeneratingLabel] = useState<string | null>(null);

  const handleAssignAWB = async (orderCode: string) => {
    setAssigningAWB(orderCode);
    try {
      await api.post(`/shiprocket/orders/${orderCode}/awb`);
      toast.success("Courier and AWB assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to assign AWB.");
    } finally {
      setAssigningAWB(null);
    }
  };

  const handleRequestPickup = async (orderCode: string) => {
    setSchedulingPickup(orderCode);
    try {
      await api.post(`/shiprocket/orders/${orderCode}/pickup`);
      toast.success("Pickup scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule pickup.");
    } finally {
      setSchedulingPickup(null);
    }
  };

  const handleGenerateLabel = async (orderCode: string) => {
    setGeneratingLabel(orderCode);
    try {
      const res: any = await api.get(`/shiprocket/orders/${orderCode}/label`);
      if (res && res.label_url) {
        window.open(res.label_url, "_blank");
        toast.success("Shipping label opened in a new tab!");
      } else {
        toast.error("No label URL returned.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate label.");
    } finally {
      setGeneratingLabel(null);
    }
  };

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.get("/admin/orders"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const filteredOrders = ordersData?.orders?.filter((o: any) => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatus === "All" || o.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };

  const openWhatsApp = (phone: string, orderId: string) => {
    const message = `Hello, this is GreenBloom Admin regarding your order #${orderId}.`;
    window.open(`https://wa.me/${phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-secondary rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toast.info("Exporting CSV...")}
            className="px-4 py-2 bg-secondary rounded-xl font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search orders, customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto">
          {["All", "Pending", "Confirmed", "Shipped", "Delivered"].map(status => (
            <button 
              key={status} 
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeStatus === status ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders?.length > 0 ? filteredOrders.map((order: any) => (
          <div key={order.id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColors[order.status]?.split(' ')[1]}`} />
            
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono font-bold text-sm bg-secondary px-2 py-1 rounded-lg">#{order.id}</span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColors[order.status]}`}>
                    {statusIcons[order.status]}
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center font-bold text-xs uppercase">
                    {order.address?.fullName?.[0] || 'G'}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{order.address?.fullName || 'Guest User'}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-3 mb-4 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Shipping Address
                    </p>
                    <button 
                      onClick={() => copyToClipboard(`${order.address?.street}, ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}`)}
                      className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    {order.address?.street}<br />
                    {order.address?.city}, {order.address?.state} - {order.address?.pincode}<br />
                    <span className="text-muted-foreground uppercase text-[10px]">{order.address?.country}</span>
                  </p>
                  <p className="text-xs font-bold mt-2 text-primary">Phone: {order.address?.phone}</p>
                </div>

                {/* Shiprocket Shipping Integration Info */}
                <div className="bg-primary/5 rounded-xl p-3.5 mb-4 border border-primary/10 text-card-foreground">
                  <p className="text-[10px] font-bold uppercase text-primary flex items-center gap-1.5 mb-2">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    Shiprocket Shipping
                  </p>
                  
                  {order.awb_code ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Courier:</span>
                        <span className="font-bold">{order.courier_name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">AWB:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold">{order.awb_code}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(order.awb_code);
                              toast.success("AWB copied!");
                            }}
                            className="p-1 hover:bg-secondary rounded text-primary"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipment Status:</span>
                        <span className="font-semibold text-primary capitalize bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                          {order.current_status || "Assigned"}
                        </span>
                      </div>
                      {order.tracking_url && (
                        <div className="pt-1.5 border-t border-primary/10 mt-1">
                          <a 
                            href={order.tracking_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1"
                          >
                            Track on Shiprocket <ChevronRight className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs space-y-2">
                      <p className="text-muted-foreground leading-normal">
                        No courier or AWB assigned yet. {order.shipment_id ? `(Shipment ID: ${order.shipment_id})` : "(Shipment not created yet)"}
                      </p>
                      <button
                        onClick={() => handleAssignAWB(order.id)}
                        disabled={assigningAWB === order.id}
                        className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {assigningAWB === order.id ? "Assigning Courier & AWB..." : "Assign Courier & AWB"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3" />
                    Ordered Items ({order.products.reduce((acc: number, item: any) => acc + item.quantity, 0)})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.products.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-secondary/20 p-2 rounded-xl border border-border/30 hover:bg-secondary/40 transition-colors">
                        <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover border shadow-sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate" title={item.name}>{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {item.quantity} × ₹{item.price} = <span className="text-primary font-bold">₹{item.quantity * item.price}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:w-48 lg:border-l lg:pl-6 flex flex-col justify-between py-1">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Bill</p>
                  <p className="text-2xl font-black text-primary">₹{order.totalAmount}</p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">{order.payment} Method</p>
                    <p className="text-[9px] text-green-600 font-bold uppercase bg-green-50 px-1.5 py-0.5 rounded w-fit">Delivery: ₹{order.delivery}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 lg:border-t-0 lg:pt-0">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Placed On</p>
                  <p className="text-xs font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="lg:w-64 lg:border-l lg:pl-6 flex flex-col gap-2">
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="w-full bg-secondary border-none rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  {["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {/* Shiprocket Actions (only if shipment exists) */}
                {order.shipment_id && (
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => handleRequestPickup(order.id)}
                      disabled={schedulingPickup === order.id || !order.awb_code}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      {schedulingPickup === order.id ? "Scheduling..." : "Request Pickup"}
                    </button>
                    <button 
                      onClick={() => handleGenerateLabel(order.id)}
                      disabled={generatingLabel === order.id}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {generatingLabel === order.id ? "Generating..." : "Generate Label"}
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => openWhatsApp(order.address?.phone, order.id)}
                    className="flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => toast.info(`Viewing details for #${order.id}`)}
                    className="flex items-center justify-center gap-2 py-2 bg-secondary rounded-xl text-xs font-bold hover:bg-secondary/80 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-card border rounded-2xl p-20 text-center text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
