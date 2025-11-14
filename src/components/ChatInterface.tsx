import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Smile, Meh, Frown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentiment?: number;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onBack: () => void;
}

const ChatInterface = ({ onBack }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi there! I'm here to listen and support you. How are you feeling today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState<number>(0.5);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeSentiment = (text: string): number => {
    // Simple sentiment analysis simulation
    const positiveWords = ["good", "great", "happy", "better", "thanks", "helped", "wonderful"];
    const negativeWords = ["sad", "bad", "worse", "anxious", "stressed", "worried", "terrible"];
    
    const lowerText = text.toLowerCase();
    let score = 0.5;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 0.1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.1;
    });
    
    return Math.max(0, Math.min(1, score));
  };

  const generateAIResponse = (userMessage: string, sentiment: number): string => {
    // Empathetic AI responses based on sentiment
    const responses = {
      positive: [
        "I'm so glad to hear you're feeling positive! What's contributing to this good feeling?",
        "That's wonderful! It's great that you're experiencing these positive emotions.",
        "I can hear the positivity in your words. How can I help you maintain this feeling?",
      ],
      neutral: [
        "I hear you. Tell me more about what's on your mind.",
        "I'm listening. What would help you feel more supported right now?",
        "Thank you for sharing. How can I best support you today?",
      ],
      negative: [
        "I'm here for you. It's okay to feel this way. Would you like to talk about what's troubling you?",
        "I hear that you're going through a difficult time. You're not alone in this.",
        "Thank you for trusting me with your feelings. Let's work through this together.",
      ],
    };

    const category = sentiment > 0.6 ? "positive" : sentiment < 0.4 ? "negative" : "neutral";
    const responseList = responses[category];
    return responseList[Math.floor(Math.random() * responseList.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const sentiment = analyzeSentiment(input);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      sentiment,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setCurrentMood(sentiment);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(input, sentiment),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getMoodIcon = (sentiment: number) => {
    if (sentiment > 0.6) return <Smile className="w-5 h-5 text-mood-positive" />;
    if (sentiment < 0.4) return <Frown className="w-5 h-5 text-mood-negative" />;
    return <Meh className="w-5 h-5 text-mood-neutral" />;
  };

  const getMoodColor = (sentiment: number) => {
    if (sentiment > 0.6) return "bg-mood-positive";
    if (sentiment < 0.4) return "bg-mood-negative";
    return "bg-mood-neutral";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-b border-border px-4 py-4 shadow-soft"
      >
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AI Support Chat</h1>
              <p className="text-sm text-muted-foreground">Always here to listen</p>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex items-center gap-3"
          >
            <div className="text-sm text-muted-foreground">Current mood:</div>
            <div className="flex items-center gap-2">
              {getMoodIcon(currentMood)}
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${getMoodColor(currentMood)} transition-all duration-500`}
                  style={{ width: `${currentMood * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] px-6 py-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground border border-border"
                  }`}
                >
                  <p className="leading-relaxed">{message.content}</p>
                  {message.sentiment !== undefined && message.role === "user" && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-primary-foreground/20">
                      {getMoodIcon(message.sentiment)}
                      <span className="text-xs opacity-80">Mood detected</span>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="bg-card text-card-foreground border border-border px-6 py-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-breathe" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-breathe"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-breathe"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border px-4 py-4 shadow-soft">
        <div className="container mx-auto max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share what's on your mind..."
              className="flex-1 h-12 text-base"
              disabled={isTyping}
            />
            <Button type="submit" size="lg" disabled={!input.trim() || isTyping}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Your conversations are private and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
