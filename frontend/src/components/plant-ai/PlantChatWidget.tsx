import { useState, useEffect } from "react";
import { MessageSquare, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlantChatbot from "./PlantChatbot";
import { useAuth } from "@/store/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export default function PlantChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && location.state?.openChat) {
      setIsOpen(true);
      // Clear openChat from history state to prevent reopening on reload/navigation
      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, openChat: undefined }
      });
    }
  }, [user, location.state, navigate, location.pathname]);

  const handleToggle = () => {
    if (!user) {
      toast.info("Please log in first to chat with Apna Mali");
      navigate("/login", { state: { from: location.pathname, openChat: true } });
      return;
    }
    setIsOpen(!isOpen);
  };

  const showWidget = location.pathname === "/" || location.pathname.replace(/\/$/, "") === "/orders";

  if (!showWidget) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-auto">
      {isOpen && (
        <div className="w-[90vw] sm:w-[400px] shadow-2xl rounded-2xl overflow-hidden border bg-background animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold text-sm">Apna Mali</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 hover:bg-white/20 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[450px]">
            <PlantChatbot hideHeader={true} />
          </div>
        </div>
      )}

      <Button
        onClick={handleToggle}
        size="icon"
        className="h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 bg-primary text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </div>
  );
}
