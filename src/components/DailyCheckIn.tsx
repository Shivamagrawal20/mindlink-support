import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MoodTrackerNew from "./MoodTrackerNew";

interface DailyCheckInProps {
  onComplete?: () => void;
  onDismiss?: () => void;
  fullscreen?: boolean;
  showSkip?: boolean;
}

const DailyCheckIn = ({ onComplete, onDismiss, fullscreen = true, showSkip = false }: DailyCheckInProps) => {
  const navigate = useNavigate();

  const handleMoodComplete = (data: { 
    moodScore: number; 
    aiResponse: string; 
    suggestions: any;
    action?: string;
    suggestion?: any;
    trend?: any;
    moodAnalysis?: any;
  }) => {
    // Store mood context in sessionStorage for chat to pick up
    if (data.trend || data.moodAnalysis) {
      sessionStorage.setItem('mindlink_mood_context', JSON.stringify({
        todayMood: {
          score: data.moodScore,
          emoji: data.moodScore === 2 ? '😄' : data.moodScore === 1 ? '🙂' : data.moodScore === 0 ? '😐' : data.moodScore === -1 ? '☹️' : '😫',
        },
        trend: data.trend,
        moodAnalysis: data.moodAnalysis,
      }));
    }

    // Handle the action from suggestion click
    if (data.action === 'chat') {
      // Navigate to chat - onComplete will show chat interface
      // Pass mood context via sessionStorage
      onComplete?.();
    } else if (data.action === 'join_circle') {
      // Navigate to rooms page
      onComplete?.();
      setTimeout(() => {
        navigate('/rooms');
      }, 300);
    } else if (data.action === 'events') {
      // Navigate to events page
      onComplete?.();
      setTimeout(() => {
        navigate('/events');
      }, 300);
    } else {
      // Done for today - close check-in
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }
  };

  const containerClass = fullscreen 
    ? "min-h-screen w-screen fixed inset-0 bg-gradient-to-br from-background via-calm to-background flex items-center justify-center p-4 z-50"
    : "";

  return (
    <div className={containerClass}>
      {fullscreen && showSkip && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDismiss?.() || onComplete?.()}
          className="absolute top-4 right-4 z-50 rounded-full hover:bg-destructive/10"
        >
          <X className="w-5 h-5" />
        </Button>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={fullscreen ? "w-full max-w-3xl" : "w-full"}
      >
        <MoodTrackerNew onMoodComplete={handleMoodComplete} showHistory={false} />
      </motion.div>
    </div>
  );
};

export default DailyCheckIn;
