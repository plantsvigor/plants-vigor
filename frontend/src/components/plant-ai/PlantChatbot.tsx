import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import RecommendationWizard from "./RecommendationWizard";
import RecommendationResults from "./RecommendationResults";

interface Product {
  _id: string;
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  description: string;
  category: string;
}

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  products?: Product[];
  quickReplies?: string[];
  isWizard?: boolean;
  recommendations?: any[];
  hasMoreRecs?: boolean;
  totalRecMatches?: number;
}

export default function PlantChatbot({ hideHeader = false }: { hideHeader?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial welcome message from Apna Mali on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "model",
          parts: [
            {
              text: `👋 **Hello! Welcome to Plants Vigor!**\n\nI am your custom support & plant care assistant. I can answer questions about plant care, check if a plant is pet-safe, recommend plants, track your orders, and answer shipping FAQs!\n\n**Here are some things you can try:**\n* "Tell me about Snake Plant"\n* "Which plants are pet safe?"\n* "How long does shipping take?"\n* "Track order GB-100201"\n\nFeel free to click any of the **quick reply buttons** below to get started immediately!`
            }
          ],
          quickReplies: ["Indoor Plants", "Outdoor Plants", "Low Maintenance", "Pet Safe", "Track Order", "Watering Tips"]
        }
      ]);
    }
  }, []);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", parts: [{ text: textToSend }] };
    setMessages((prev) => [...prev, userMessage]);
    
    if (!customMessage) setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          message: textToSend,
          history: messages.map(m => ({ role: m.role, parts: m.parts }))
        }),
      });

      if (!response.ok) throw new Error("Failed to get response from Apna Mali");

      const data = await response.json();
      console.log("Chat response data:", data);

      let formattedMessage: Message | null = null;

      if (data.role && data.parts) {
        formattedMessage = {
          role: data.role,
          parts: data.parts,
          products: data.products,
          quickReplies: data.quickReplies,
          isWizard: data.isWizard
        };
      } else if (data.response) {
        formattedMessage = {
          role: "model",
          parts: [{ text: data.response }],
          products: data.products,
          quickReplies: data.quickReplies,
          isWizard: data.isWizard
        };
      }

      if (formattedMessage) {
        setMessages((prev) => [...prev, formattedMessage!]);
      } else {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      toast.error(error.message || "Failed to communicate with local chatbot");
    } finally {
      setLoading(false);
    }
  };

  const handleWizardComplete = async (answers: {
    sunlight: string;
    petSafe: string;
    maintenance: string;
    location: string;
  }) => {
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chatbot/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(answers),
      });

      if (!response.ok) throw new Error("Failed to load recommendation matches");

      const data = await response.json();
      console.log("Recommendations Received:", data);

      if (data.success && data.recommendations) {
        const resultsMsg: Message = {
          role: "model",
          parts: [
            {
              text: `🎉 **Matches Ready!** Based on your selections:\n* **Sunlight**: ${answers.sunlight}\n* **Pet Safety**: ${answers.petSafe}\n* **Care Preference**: ${answers.maintenance}\n* **Location**: ${answers.location}\n\nHere are our top recommended plants in stock matching your space:`
            }
          ],
          recommendations: data.recommendations,
          hasMoreRecs: data.hasMore,
          totalRecMatches: data.totalMatches,
          quickReplies: defaultQuickReplies
        };

        setMessages((prev) => {
          // Complete and minimize the wizard slide so it stays fixed in history
          const updated = prev.map(msg => 
            msg.isWizard ? { ...msg, isWizard: false, parts: [{ text: "📋 *Plant Finder Questionnaire completed successfully!*" }] } : msg
          );
          return [...updated, resultsMsg];
        });
      } else {
        throw new Error("Invalid recommendation results format");
      }
    } catch (error: any) {
      console.error("Wizard submit error:", error);
      toast.error(error.message || "Failed to parse recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const defaultQuickReplies = ["Indoor Plants", "Outdoor Plants", "Low Maintenance", "Pet Safe", "Track Order", "Watering Tips"];

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-gradient-to-b from-background/95 to-background/50 backdrop-blur-md">
      {!hideHeader && (
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-border/40 py-3 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">Apna Mali</CardTitle>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online &bull; Interactive Care Wizard
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMessages([
              {
                role: "model",
                parts: [
                  {
                    text: `👋 **Hello! Welcome back to Plants Vigor!**\n\nI am your custom support & plant care assistant. What can I help you with?`
                  }
                ],
                quickReplies: defaultQuickReplies
              }
            ])} 
            className="h-8 w-8 hover:bg-emerald-500/10 text-muted-foreground"
            title="Reset Chat"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
      )}
      
      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <ScrollArea className="h-full px-4 py-4">
          <div className="flex flex-col gap-4 pb-4">
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={`flex gap-3 ${m?.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    m?.role === "user" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900"
                  }`}>
                    {m?.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed transition-all ${
                    m?.role === "user" 
                      ? "bg-emerald-600 text-white rounded-tr-none animate-in slide-in-from-right-3 duration-255" 
                      : "bg-card border border-border/60 text-foreground rounded-tl-none animate-in slide-in-from-left-3 duration-255"
                  }`}>
                    {m.isWizard ? (
                      <RecommendationWizard onComplete={handleWizardComplete} />
                    ) : (
                      <>
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                          {m?.parts && m.parts[0] ? (
                            <ReactMarkdown>{m.parts[0].text || ""}</ReactMarkdown>
                          ) : (
                            <span className="italic opacity-50">Empty response</span>
                          )}
                        </div>

                        {/* Rendering dynamic wizard results if they exist */}
                        {m.recommendations && m.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/40">
                            <RecommendationResults
                              recommendations={m.recommendations}
                              hasMore={!!m.hasMoreRecs}
                              totalMatches={m.totalRecMatches || 0}
                            />
                          </div>
                        )}

                        {/* Rendering dynamic E-commerce Product Suggestion Cards */}
                        {!m.recommendations && m.products && m.products.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/40">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recommended Products:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {m.products.map((product) => (
                                <Link
                                  key={product._id || product.id}
                                  to={`/product/${product.slug}`}
                                  className="flex items-center gap-3 p-2 rounded-xl border border-border/60 bg-background/50 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all shadow-sm group"
                                >
                                  <img
                                    src={product.images?.[0] || "https://res.cloudinary.com/dzwlbzyg4/image/upload/v1716440000/placeholder.jpg"}
                                    alt={product.name}
                                    className="h-12 w-12 rounded-lg object-cover bg-muted shrink-0 group-hover:scale-105 transition-transform"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold truncate text-foreground group-hover:text-emerald-600 transition-colors">
                                      {product.name}
                                    </h4>
                                    <span className="text-[10px] text-muted-foreground truncate block">{product.category}</span>
                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                      Rs. {product.price}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Localized Quick Reply Pills below bot messages */}
                {m.role === "model" && m.quickReplies && m.quickReplies.length > 0 && i === messages.length - 1 && (
                  <div className="flex flex-wrap gap-1.5 pl-11 mt-1.5">
                    {m.quickReplies.map((qr) => (
                      <Button
                        key={qr}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(qr)}
                        className="rounded-full text-[11px] bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium px-3.5 py-1 h-7 shadow-sm transition-all active:scale-95 hover:scale-[1.02]"
                      >
                        {qr}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-card border border-border/60 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-1.5 shadow-sm animate-pulse">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium ml-1">Apna Mali is searching...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t border-border/40 bg-background/80 backdrop-blur-md shrink-0">
        <form 
          className="flex w-full items-center gap-2" 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input 
            placeholder="Ask about plants, shipping, or track order..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-full bg-muted/40 border-border/50 focus-visible:bg-background h-10 px-5 text-sm"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !input.trim()}
            className="h-10 w-10 rounded-full flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
