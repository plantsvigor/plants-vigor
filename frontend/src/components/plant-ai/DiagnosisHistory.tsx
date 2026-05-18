import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, Loader2, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function DiagnosisHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/plant-ai/history`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const name = item?.diagnosis?.plantName || "Unknown Plant";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    const s = status || "Unknown";
    switch (s) {
      case "Healthy": return "bg-green-500/10 text-green-600 border-green-200";
      case "Needs Attention": return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "Critical": return "bg-red-500/10 text-red-600 border-red-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your plant history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/50 backdrop-blur-md p-4 rounded-xl border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by plant name..." 
            className="pl-9 bg-background/50 border-none focus-visible:ring-1" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            All Status
          </Button>
          <div className="text-sm text-muted-foreground">Total: {history.length} reports</div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <Card className="border-none shadow-xl bg-background/50 backdrop-blur-md p-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">No reports found</h3>
              <p className="text-muted-foreground">You haven't diagnosed any plants yet, or no results match your search.</p>
            </div>
            <Button className="mt-2" onClick={() => window.location.reload()}>Refresh History</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map((item) => (
            <Card key={item._id} className="border-none shadow-md bg-background/60 backdrop-blur-md overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="h-32 w-full sm:w-48 flex-shrink-0 overflow-hidden">
                  <img src={item?.image?.url || ""} alt={item?.diagnosis?.plantName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{item?.diagnosis?.plantName || "Unknown Plant"}</h3>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(item?.diagnosis?.healthStatus)}`}>
                        {item?.diagnosis?.healthStatus || "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {item?.createdAt ? format(new Date(item.createdAt), "PPP") : "Unknown Date"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm font-medium">Health: {item?.diagnosis?.healthPercentage || 0}%</div>
                    <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${item?.diagnosis?.healthPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
