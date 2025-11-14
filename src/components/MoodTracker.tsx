import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, TrendingUp, Calendar } from "lucide-react";
import { moodAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MoodTrackerProps {
  onMoodSubmit?: (mood: number, note?: string) => void;
  showHistory?: boolean;
}

const MoodTracker = ({ onMoodSubmit, showHistory = true }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const moods = [
    { value: 0.8, icon: Smile, label: "Great", color: "text-mood-positive" },
    { value: 0.6, icon: Smile, label: "Good", color: "text-mood-positive" },
    { value: 0.4, icon: Meh, label: "Okay", color: "text-mood-neutral" },
    { value: 0.2, icon: Frown, label: "Low", color: "text-mood-negative" },
    { value: 0.0, icon: Frown, label: "Very Low", color: "text-mood-negative" },
  ];

  const handleSubmit = async () => {
    if (selectedMood === null) return;
    
    setIsSaving(true);
    try {
      // Save to backend
      await moodAPI.record({
        mood: selectedMood,
        note: note.trim() || undefined,
      });
      
      // Call callback after successful save
      onMoodSubmit?.(selectedMood, note);
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setSelectedMood(null);
        setNote("");
      }, 2000);
    } catch (error: any) {
      console.error('Error saving mood:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const recentMoods = [
    { date: "Today", mood: 0.6 },
    { date: "Yesterday", mood: 0.7 },
    { date: "2 days ago", mood: 0.5 },
    { date: "3 days ago", mood: 0.8 },
  ];

  return (
    <Card className="p-8 md:p-12 shadow-2xl border-2 bg-gradient-to-br from-background via-calm/30 to-background">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
        >
          <Calendar className="w-10 h-10 text-primary" />
        </motion.div>
        <h3 className="text-3xl font-bold text-foreground mb-2">Daily Mood Check-in</h3>
        <p className="text-muted-foreground text-lg">Let's start your day mindfully</p>
      </div>

      {!submitted ? (
        <>
          <p className="text-muted-foreground mb-8 text-center text-lg">How are you feeling today?</p>
          
          <div className="grid grid-cols-5 gap-4 mb-8 max-w-2xl mx-auto">
            {moods.map((mood, index) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.value;
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={`w-10 h-10 mx-auto mb-3 ${isSelected ? mood.color : "text-muted-foreground"}`} />
                  </motion.div>
                  <p className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                    {mood.label}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <div className="mb-8 max-w-2xl mx-auto">
            <label className="text-sm font-semibold text-foreground mb-3 block text-center">
              Optional: What's on your mind?
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share what's contributing to how you feel..."
              className="w-full p-4 rounded-xl border-2 border-border bg-background text-foreground min-h-[120px] resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="max-w-md mx-auto"
          >
            <Button
              onClick={handleSubmit}
              disabled={selectedMood === null || isSaving}
              size="lg"
              className="w-full text-lg h-14"
            >
              {isSaving ? "Saving..." : "Continue"}
            </Button>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            <Smile className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-lg font-semibold text-foreground mb-2">Thank you for checking in!</p>
          <p className="text-muted-foreground">Your mood has been recorded.</p>
        </motion.div>
      )}

      {showHistory && recentMoods.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Recent Moods</h4>
          </div>
          <div className="space-y-3">
            {recentMoods.map((entry, index) => {
              const moodIcon = entry.mood > 0.6 ? Smile : entry.mood > 0.4 ? Meh : Frown;
              const Icon = moodIcon;
              const moodColor = entry.mood > 0.6 ? "text-mood-positive" : entry.mood > 0.4 ? "text-mood-neutral" : "text-mood-negative";
              
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${moodColor}`} />
                    <span className="text-sm text-foreground">{entry.date}</span>
                  </div>
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${entry.mood > 0.6 ? "bg-mood-positive" : entry.mood > 0.4 ? "bg-mood-neutral" : "bg-mood-negative"} transition-all`}
                      style={{ width: `${entry.mood * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MoodTracker;

