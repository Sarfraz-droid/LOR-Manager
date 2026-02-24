"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { intelligentRecommendationSuggestion, IntelligentRecommendationSuggestionOutput } from "@/ai/flows/intelligent-recommendation-suggestion";
import { Professor } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface AISuggestionToolProps {
  professors: Professor[];
  geminiKey?: string;
}

export function AISuggestionTool({ professors, geminiKey }: AISuggestionToolProps) {
  const [history, setHistory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelligentRecommendationSuggestionOutput | null>(null);

  const handleGetSuggestion = async () => {
    if (!history.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await intelligentRecommendationSuggestion({
        studentAcademicHistory: history,
        professorProfiles: professors.map(p => ({
          name: p.name,
          expertise: `${p.expertise}. Taught courses: ${p.courses.join(", ")}`,
          contactInfo: p.email
        })),
      }, geminiKey || undefined);
      setResult(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-cream/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Professor Matching
          </CardTitle>
          <CardDescription>
            Provide your academic background, research interests, and courses you've excelled in. 
            We'll suggest the best professor for your recommendation letter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Academic History & Interests</label>
            <Textarea
              placeholder="e.g., I specialized in AI ethics, completed a project on neural networks under Dr. Smith, and have a high GPA in mathematics. I am applying for research-heavy Master's programs..."
              className="min-h-[150px] font-literata border-accent/20"
              value={history}
              onChange={(e) => setHistory(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGetSuggestion} 
            disabled={loading || professors.length === 0}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Profiles...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Get Recommendation</>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="border-l-4 border-l-accent animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-primary">{result.suggestedProfessor}</CardTitle>
              <div className="text-right">
                <span className="text-xs font-bold text-muted-foreground uppercase">Match Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-accent">{result.confidenceScore}%</span>
                </div>
              </div>
            </div>
            <Progress value={result.confidenceScore} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed text-primary font-literata italic">
                  "{result.reasoning}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {professors.length === 0 && (
        <p className="text-sm text-center text-muted-foreground italic">
          Add some professor profiles first to get suggestions.
        </p>
      )}
    </div>
  );
}