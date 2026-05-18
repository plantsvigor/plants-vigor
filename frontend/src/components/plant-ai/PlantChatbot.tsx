import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

export default function PlantChatbot({ hideHeader = false }: { hideHeader?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/plant-ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          message: currentInput,
          history: messages 
        }),
      });

      if (!response.ok) throw new Error("Failed to get response from AI");

      const data = await response.json();
      console.log("Chat AI Data Received:", data);

      let formattedMessage: Message | null = null;

      if (data.role && data.parts) {
        // Standard Google/New format
        formattedMessage = data;
      } else if (data.response) {
        // Old format fallback
        formattedMessage = {
          role: "model",
          parts: [{ text: data.response }]
        };
      }

      if (formattedMessage) {
        setMessages((prev) => [...prev, formattedMessage!]);
      } else {
        console.error("Invalid data structure:", data);
        throw new Error(`Invalid response format: ${JSON.stringify(data).substring(0, 50)}...`);
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      toast.error(error.message || "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
      {!hideHeader && (
        <CardHeader className="bg-gradient-to-r from-primary/10 to-green-500/10 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Apna Mali</CardTitle>
              <p className="text-xs text-muted-foreground">Ask anything about your plants</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMessages([])} title="Reset Chat">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
      )}
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-6">
          <div className="flex flex-col gap-6 pb-4">
            {(!messages || messages.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-lg">How can I help your garden today?</p>
                  <p className="text-sm text-muted-foreground max-w-xs">Ask about watering, sunlight, pests, or specific plant care tips.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {["Yellow leaves?", "Succulent care", "Best soil for herbs"].map(q => (
                    <Button key={q} variant="outline" size="sm" onClick={() => setInput(q)} className="rounded-full text-xs h-8">{q}</Button>
                  ))}
                </div>
              </div>
            )}
            
            {Array.isArray(messages) && messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m?.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${m?.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
                  {m?.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${m?.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-background border border-border/50 rounded-tl-none"}`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {m?.parts && Array.isArray(m.parts) && m.parts[0] ? (
                      <ReactMarkdown>{m.parts[0].text || ""}</ReactMarkdown>
                    ) : (
                      <span className="italic opacity-50">Empty response</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-background border rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <form 
          className="flex w-full items-center gap-2" 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input 
            placeholder="Type your question here..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-full bg-secondary/50 border-transparent focus-visible:bg-background h-12 px-6"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !input.trim()}
            className="h-12 w-12 rounded-full flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
