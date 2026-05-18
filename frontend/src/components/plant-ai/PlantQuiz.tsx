import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const questions = [
  {
    id: "sunlight",
    question: "How much sunlight does your space get?",
    options: [
      { label: "Bright direct sunlight", value: "direct" },
      { label: "Bright indirect light", value: "indirect" },
      { label: "Low light (north facing)", value: "low" },
      { label: "No natural light (office)", value: "none" }
    ]
  },
  {
    id: "pets",
    question: "Do you have pets or small children?",
    options: [
      { label: "Yes, I need pet-safe plants", value: "yes" },
      { label: "No, pet safety isn't a concern", value: "no" }
    ]
  },
  {
    id: "maintenance",
    question: "What's your plant maintenance preference?",
    options: [
      { label: "Low maintenance (hard to kill)", value: "low" },
      { label: "I'm a regular waterer", value: "medium" },
      { label: "I'm an expert gardener", value: "high" }
    ]
  },
  {
    id: "roomType",
    question: "Where will this plant live?",
    options: [
      { label: "Living Room / Bedroom", value: "living" },
      { label: "Bathroom (High humidity)", value: "bathroom" },
      { label: "Kitchen", value: "kitchen" },
      { label: "Office / Desk", value: "office" }
    ]
  }
];

export default function PlantQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = async () => {
    setLoading(true);
    // Simulate AI calculation or call API
    setTimeout(() => {
      const results = [
        { name: "Snake Plant", reason: "Perfect for low light and very easy to maintain." },
        { name: "Spider Plant", reason: "Completely pet-safe and loves indirect light." },
        { name: "Peace Lily", reason: "Great for improving air quality in your living room." }
      ];
      setRecommendations(results);
      setShowResults(true);
      setLoading(false);
      
      // Save results to DB
      fetch(`${import.meta.env.VITE_API_BASE_URL}/plant-ai/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          preferences: answers,
          recommendedPlants: results.map(r => r.name)
        }),
      });
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!showResults ? (
        <Card className="border-none shadow-xl bg-background/50 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-green-500/10 border-b pb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Question {step + 1} of {questions.length}</span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-primary/10"}`} />
                ))}
              </div>
            </div>
            <CardTitle className="text-2xl font-display">{questions[step].question}</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8">
            <RadioGroup 
              value={answers[questions[step].id]} 
              onValueChange={(val) => setAnswers({...answers, [questions[step].id]: val})}
              className="grid gap-4"
            >
              {questions[step].options.map((opt) => (
                <div key={opt.value} className={`relative group`}>
                  <RadioGroupItem value={opt.value} id={opt.value} className="peer sr-only" />
                  <Label 
                    htmlFor={opt.value}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-muted bg-background/50 cursor-pointer transition-smooth peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary/50"
                  >
                    <span className="font-medium text-lg">{opt.label}</span>
                    <CheckCircle2 className="h-5 w-5 text-primary opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between px-8 py-6 border-t bg-background/30 mt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button 
              disabled={!answers[questions[step].id] || loading} 
              onClick={handleNext}
              className="gap-2 px-8"
            >
              {loading ? "Analyzing..." : (step === questions.length - 1 ? "Get My Plants" : "Next")}
              {!loading && <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6 animate-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold">Your Perfect Plant Matches</h2>
            <p className="text-muted-foreground">Based on your space and lifestyle, we recommend these plants.</p>
          </div>

          <div className="grid gap-4">
            {recommendations.map((plant, i) => (
              <Card key={i} className="border-none shadow-lg bg-background/60 backdrop-blur-md overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-primary/5 p-8 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-background flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Leaf className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h3 className="text-xl font-bold mb-2">{plant.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plant.reason}</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      View in Shop
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="ghost" onClick={() => {setShowResults(false); setStep(0); setAnswers({});}}>
              Retake Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Leaf(props: any) {
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
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C10.9 14.2 12 14 15 14" />
    </svg>
  );
}
