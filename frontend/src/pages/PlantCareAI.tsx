import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, MessageSquare, History, Search } from "lucide-react";
import PlantDoctor from "@/components/plant-ai/PlantDoctor";
import PlantChatbot from "@/components/plant-ai/PlantChatbot";
import PlantQuiz from "@/components/plant-ai/PlantQuiz";
import DiagnosisHistory from "@/components/plant-ai/DiagnosisHistory";

export default function PlantCareAI() {
  const [activeTab, setActiveTab] = useState("doctor");

  return (
    <div className="container py-8 max-w-6xl mx-auto min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
          Plant Care with AI
        </h1>
        <p className="text-muted-foreground text-lg">
          Diagnose plant health, chat with our expert AI, and find your perfect plant match.
        </p>
      </div>

      <Tabs defaultValue="doctor" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-secondary/50 backdrop-blur-sm p-1 rounded-xl">
          <TabsTrigger value="doctor" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">Plant Doctor</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Plant Quiz</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doctor" className="mt-0 outline-none">
          <PlantDoctor />
        </TabsContent>
        <TabsContent value="history" className="mt-0 outline-none">
          <DiagnosisHistory />
        </TabsContent>
        <TabsContent value="quiz" className="mt-0 outline-none">
          <PlantQuiz />
        </TabsContent>
      </Tabs>
    </div>
  );
}
