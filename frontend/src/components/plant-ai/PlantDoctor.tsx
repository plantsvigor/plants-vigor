import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle, ShoppingCart, Leaf, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PlantDoctor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/plant-ai/diagnose`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to diagnose plant");
      }

      const data = await response.json();
      setResult(data);
      setShowResult(true);
      toast.success("Diagnosis complete!");
    } catch (error: any) {
      toast.error(error.message);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy": return "bg-green-500/10 text-green-600 border-green-200";
      case "Needs Attention": return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "Critical": return "bg-red-500/10 text-red-600 border-red-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="grid gap-8">
      <Card className="border-none shadow-xl bg-background/50 backdrop-blur-md overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-green-500/10 border-b pb-6">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Camera className="h-6 w-6 text-primary" />
            Diagnose Your Plant
          </CardTitle>
          <p className="text-muted-foreground">Upload a photo of your plant (leaves, stem, or overall) for a detailed AI health analysis.</p>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 transition-smooth hover:border-primary/50 hover:bg-primary/5 group">
            {preview ? (
              <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-2xl mb-6">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => {setFile(null); setPreview(null); setResult(null);}}
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors"
                >
                  <AlertCircle className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">Click to upload or drag & drop</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG or JPEG (Max. 10MB)</p>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
              capture="environment"
            />

            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                {preview ? "Change Image" : "Select Image"}
              </Button>
              <Button disabled={!file || loading} onClick={handleUpload} className="gap-2 px-8">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Start Diagnosis
                  </>
                )}
              </Button>
            </div>
          </div>

          {loading && (
            <div className="mt-8 space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-sm font-medium">
                <span>AI is scanning leaves...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
          {result && (
            <div className="grid gap-0">
              <div className="bg-gradient-to-r from-primary to-green-600 p-8 text-primary-foreground relative overflow-hidden">
                <Leaf className="absolute -right-8 -bottom-8 h-40 w-40 opacity-10 rotate-12" />
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-3xl font-display font-bold">{result.diagnosis.plantName}</DialogTitle>
                      <DialogDescription className="text-primary-foreground/80 text-lg mt-2">
                        Health Diagnosis Report
                      </DialogDescription>
                    </div>
                    <Badge className={`text-sm px-4 py-1.5 border-none ${getStatusColor(result.diagnosis.healthStatus)}`}>
                      {result.diagnosis.healthStatus}
                    </Badge>
                  </div>
                </DialogHeader>
              </div>

              <div className="p-8 grid md:grid-cols-3 gap-8 bg-background">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Analysis Summary
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {result.diagnosis.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-700 mb-2">Watering Guide</h4>
                      <p className="text-sm text-slate-700">{result.diagnosis.wateringGuide}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-100">
                      <h4 className="text-sm font-semibold text-orange-700 mb-2">Sunlight Guide</h4>
                      <p className="text-sm text-slate-700">{result.diagnosis.sunlightGuide}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Detected Issues
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(result.diagnosis.issues) && result.diagnosis.issues.map((issue: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-secondary/70 px-3 py-1">{issue}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3">Recovery Plan</h4>
                    <ul className="space-y-3">
                      {Array.isArray(result.diagnosis.recoverySteps) && result.diagnosis.recoverySteps.map((step: string, i: number) => (
                        <li key={i} className="flex gap-4 p-3 rounded-lg bg-secondary/30 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center">
                    <h4 className="text-sm font-semibold mb-4">Health Score</h4>
                    <div className="relative h-32 w-32">
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle className="stroke-muted-foreground/10 fill-none" strokeWidth="8" cx="50" cy="50" r="40" />
                        <circle 
                          className="stroke-primary fill-none transition-all duration-1000 ease-out" 
                          strokeWidth="8" 
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * (result.diagnosis.healthPercentage || 0)) / 100}
                          strokeLinecap="round" 
                          cx="50" cy="50" r="40" 
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{result.diagnosis.healthPercentage || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <Card className="border-none shadow-sm bg-secondary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        Recommended
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Array.isArray(result.diagnosis.recommendedProducts) && result.diagnosis.recommendedProducts.map((prod: any, i: number) => (
                        <div key={i} className="text-xs">
                          <div className="font-bold text-primary">{prod.name}</div>
                          <div className="text-muted-foreground mt-1 line-clamp-2">{prod.reason}</div>
                        </div>
                      ))}
                      <Button className="w-full mt-2" variant="outline" size="sm">Go to Shop</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
