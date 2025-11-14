import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Users, Heart, Activity, MessageCircle, ArrowRight } from "lucide-react";
import { moodAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MoodTrackerNewProps {
  onMoodComplete?: (data: { moodScore: number; aiResponse: string; suggestions: any }) => void;
  showHistory?: boolean;
}

const MoodTrackerNew = ({ onMoodComplete, showHistory = true }: MoodTrackerNewProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [step, setStep] = useState<"mood" | "reflection" | "suggestions">("mood");
  const [isSaving, setIsSaving] = useState(false);
  const [moodData, setMoodData] = useState<any>(null);
  const { toast } = useToast();

  const moods = [
    { score: 2, emoji: "😄", label: "Great", color: "text-mood-positive" },
    { score: 1, emoji: "🙂", label: "Good", color: "text-mood-positive" },
    { score: 0, emoji: "😐", label: "Okay", color: "text-mood-neutral" },
    { score: -1, emoji: "☹️", label: "Low", color: "text-mood-negative" },
    { score: -2, emoji: "😫", label: "Stressed", color: "text-mood-negative" },
  ];

  // Reflection questions based on mood
  const getReflectionQuestion = (score: number): string => {
    const questions = {
      2: "What's something exciting today?",
      1: "What are you looking forward to?",
      0: "Anything on your mind?",
      '-1': "Want to share what caused this feeling?",
      '-2': "What's the biggest stress today?",
    };
    return questions[score.toString() as keyof typeof questions] || "Anything on your mind?";
  };

  const handleMoodSelect = async (score: number, emoji: string) => {
    setSelectedMood(score);
    setIsSaving(true);

    try {
      // Save mood to backend immediately
      const response = await moodAPI.record({
        moodScore: score,
        moodEmoji: emoji,
      });

      // Store AI response, suggestions, trend, and moodAnalysis
      setMoodData({
        moodScore: score,
        moodEmoji: emoji,
        aiResponse: response.aiResponse || "",
        suggestions: response.suggestions || null,
        trend: response.trend || null,
        moodAnalysis: response.moodAnalysis || null,
      });

      setIsSaving(false);
      
      // Move to reflection step
      setTimeout(() => {
        setStep("reflection");
      }, 1500);
    } catch (error: any) {
      console.error('Error saving mood:', error);
      const errorMessage = error.message || "Failed to save mood. Please try again.";
      
      // Check if it's a connection error
      if (errorMessage.includes('Cannot connect to server') || 
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('Failed to fetch')) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to server. Please make sure the backend server is running.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      setIsSaving(false);
      setSelectedMood(null); // Reset selection on error
    }
  };

  const handleReflectionSubmit = async () => {
    if (!moodData) return;

    try {
      // Update mood entry with reflection - this will also return updated trend and analysis
      const response = await moodAPI.record({
        moodScore: moodData.moodScore,
        moodEmoji: moodData.moodEmoji,
        reflection: reflection.trim() || undefined,
      });

      // Update mood data with fresh trend and analysis
      setMoodData({
        ...moodData,
        trend: response.trend || moodData.trend,
        moodAnalysis: response.moodAnalysis || moodData.moodAnalysis,
      });

      // Move to suggestions
      setStep("suggestions");
    } catch (error: any) {
      console.error('Error saving reflection:', error);
      // Still proceed to suggestions even if reflection save fails
      setStep("suggestions");
    }
  };

  const handleSkipReflection = () => {
    setStep("suggestions");
  };

  const handleSuggestionClick = (suggestion: any) => {
    // This will be handled by parent component
    onMoodComplete?.({
      moodScore: moodData?.moodScore || 0,
      aiResponse: moodData?.aiResponse || "",
      suggestions: moodData?.suggestions || null,
      action: suggestion.action,
      suggestion,
      trend: moodData?.trend || null,
      moodAnalysis: moodData?.moodAnalysis || null,
    });
  };

  const selectedMoodData = selectedMood !== null ? moods.find(m => m.score === selectedMood) : null;

  return (
    <Card className="p-8 md:p-12 shadow-2xl border-2 bg-gradient-to-br from-background via-calm/30 to-background">
      <AnimatePresence mode="wait">
        {step === "mood" && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
            >
              <Calendar className="w-10 h-10 text-primary" />
            </motion.div>
            <h3 className="text-3xl font-bold text-foreground mb-2">How are you feeling today?</h3>
            <p className="text-muted-foreground text-lg mb-8">Tap one to continue</p>

            <div className="grid grid-cols-5 gap-4 mb-8 max-w-2xl mx-auto">
              {moods.map((mood, index) => {
                const isSelected = selectedMood === mood.score;
                
                return (
                  <motion.button
                    key={mood.score}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMoodSelect(mood.score, mood.emoji)}
                    disabled={isSaving}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <motion.div
                      animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="text-4xl mb-3"
                    >
                      {mood.emoji}
                    </motion.div>
                    <p className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                      {mood.label}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {isSaving && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-muted-foreground">Saving your mood...</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === "reflection" && moodData && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* AI Response */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-lg leading-relaxed">{moodData.aiResponse}</p>
                </div>
              </div>
            </motion.div>

            {/* Reflection Question */}
            <div className="mb-6">
              <label className="text-lg font-semibold text-foreground mb-3 block">
                {getReflectionQuestion(moodData.moodScore)}
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 rounded-xl border-2 border-border bg-background text-foreground min-h-[120px] resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkipReflection}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={handleReflectionSubmit}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === "suggestions" && moodData && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Here's what might help</h3>
              <p className="text-muted-foreground">Choose an option to continue</p>
            </div>

            {moodData.suggestions && moodData.suggestions.options && (
              <div className="space-y-3 mb-6">
                {moodData.suggestions.options.map((suggestion: any, index: number) => {
                  const icons: Record<string, any> = {
                    support_circle: Users,
                    exercise: Activity,
                    chat: MessageCircle,
                    event: Calendar,
                    journal: Heart,
                  };
                  const Icon = icons[suggestion.type] || Sparkles;

                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => onMoodComplete?.({
                moodScore: moodData.moodScore,
                aiResponse: moodData.aiResponse,
                suggestions: moodData.suggestions,
                action: 'done',
                trend: moodData.trend || null,
                moodAnalysis: moodData.moodAnalysis || null,
              })}
              className="w-full"
            >
              Done for today
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default MoodTrackerNew;

