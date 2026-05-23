import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecommendationWizardProps {
  onComplete: (answers: {
    sunlight: string;
    petSafe: string;
    maintenance: string;
    location: string;
  }) => void;
}

export default function RecommendationWizard({ onComplete }: RecommendationWizardProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    sunlight: "",
    petSafe: "",
    maintenance: "",
    location: "",
  });

  const totalSteps = 4;

  const handleSelect = (field: string, value: string) => {
    const updatedAnswers = { ...answers, [field]: value };
    setAnswers(updatedAnswers);

    // Auto-advance to the next slide with a brief 250ms smooth transition delay
    if (step < totalSteps) {
      setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 250);
    } else {
      setTimeout(() => {
        onComplete(updatedAnswers);
      }, 250);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  // Sunlight Options
  const sunlightOptions = [
    { label: "Bright direct sunlight", desc: "Sunny balconies, hot south windows" },
    { label: "Bright indirect light", desc: "Filtered sun, east/west windows" },
    { label: "Low light (north facing)", desc: "North windows, shaded rooms" },
    { label: "No natural light (office)", desc: "Relies on fluorescent desk lighting" },
  ];

  // Pet safety Options
  const petSafeOptions = [
    { label: "Yes, I need pet-safe plants", desc: "100% non-toxic to dogs and cats" },
    { label: "No, pet safety isn't a concern", desc: "Toxicity is not an issue" },
  ];

  // Maintenance Options
  const maintenanceOptions = [
    { label: "Low maintenance (hard to kill)", desc: "Thrives on neglect, drought-tolerant" },
    { label: "I'm a regular waterer", desc: "Can care for standard moisture needs" },
    { label: "I'm an expert gardener", desc: "Enjoys advanced watering and humidity care" },
  ];

  // Location Options
  const locationOptions = [
    { label: "Bedroom", desc: "Purifying plants for clean night oxygen" },
    { label: "Living Room", desc: "Bold statement foliage and focal points" },
    { label: "Balcony", desc: "Direct sun climbers and leafy containers" },
    { label: "Bathroom", desc: "Humidity lovers thriving in steamy spaces" },
    { label: "Office Desk", desc: "Compact growers requiring minimal footprint" },
    { label: "Kitchen", desc: "Fragrant edible container herbs" },
    { label: "Outdoor Garden", desc: "Resilient bushes and sunny bed items" },
  ];

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="w-full bg-card rounded-2xl border border-border/80 p-4 shadow-md max-w-lg mx-auto animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
      
      {/* Header and Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-1.5">
          <div className="flex items-center gap-1">
            {step > 1 && (
              <button 
                type="button"
                onClick={handlePrev} 
                className="hover:text-emerald-600 transition-colors p-0.5 rounded mr-1"
                title="Go Back"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">PLANT FINDER WIZARD</span>
          </div>
          <span>Step {step} of {totalSteps}</span>
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Slide Content */}
      <div className="min-h-[220px] flex flex-col justify-between py-2">
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">1. How much sunlight does your space get?</h3>
            <div className="grid grid-cols-1 gap-2">
              {sunlightOptions.map((opt) => {
                const isSelected = answers.sunlight === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelect("sunlight", opt.label)}
                    className={cn(
                      "flex items-center justify-between text-left p-3 rounded-xl border text-xs transition-all relative overflow-hidden",
                      isSelected 
                        ? "border-emerald-600 bg-emerald-500/5 ring-1 ring-emerald-500/30 text-foreground"
                        : "border-border/80 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
                    )}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">2. Do you have pets or small children?</h3>
            <div className="grid grid-cols-1 gap-2">
              {petSafeOptions.map((opt) => {
                const isSelected = answers.petSafe === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelect("petSafe", opt.label)}
                    className={cn(
                      "flex items-center justify-between text-left p-3 rounded-xl border text-xs transition-all relative overflow-hidden",
                      isSelected 
                        ? "border-emerald-600 bg-emerald-500/5 ring-1 ring-emerald-500/30 text-foreground"
                        : "border-border/80 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
                    )}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">3. What's your plant maintenance preference?</h3>
            <div className="grid grid-cols-1 gap-2">
              {maintenanceOptions.map((opt) => {
                const isSelected = answers.maintenance === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelect("maintenance", opt.label)}
                    className={cn(
                      "flex items-center justify-between text-left p-3 rounded-xl border text-xs transition-all relative overflow-hidden",
                      isSelected 
                        ? "border-emerald-600 bg-emerald-500/5 ring-1 ring-emerald-500/30 text-foreground"
                        : "border-border/80 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
                    )}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">4. Where will this plant live?</h3>
            <ScrollArea className="h-[180px] pr-2">
              <div className="grid grid-cols-1 gap-1.5 pr-1">
                {locationOptions.map((opt) => {
                  const isSelected = answers.location === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect("location", opt.label)}
                      className={cn(
                        "flex items-center justify-between text-left p-2.5 rounded-xl border text-xs transition-all relative overflow-hidden",
                        isSelected 
                          ? "border-emerald-600 bg-emerald-500/5 ring-1 ring-emerald-500/30 text-foreground"
                          : "border-border/80 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
                      )}
                    >
                      <div>
                        <p className="font-semibold text-[11px] text-foreground">{opt.label}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="h-4.5 w-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

    </div>
  );
}
