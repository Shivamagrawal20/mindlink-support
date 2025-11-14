import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Smile, Meh, Frown, AlertTriangle, Phone, TrendingUp, TrendingDown, Minus, Sparkles, Heart, Mic, MessageSquare, Cpu, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { checkMessageSafety, getCrisisResources } from "@/lib/safety";
import { chatAPI } from "@/lib/api";
import AuthDialog from "./AuthDialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentiment?: number;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onBack: () => void;
  onVoiceMode?: () => void;
  moodContext?: {
    todayMood?: {
      score: number;
      emoji: string;
      reflection?: string;
    };
    trend?: {
      direction: string;
      recentTrend: string;
      average: string;
    };
  };
}

const ChatInterface = ({ onBack, onVoiceMode, moodContext }: ChatInterfaceProps) => {
  const { user, isAuthenticated } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [currentMood, setCurrentMood] = useState<number>(0.5);
  const [moodTrend, setMoodTrend] = useState<string>("stable");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [safetyAlert, setSafetyAlert] = useState<{ show: boolean; message?: string; riskLevel?: string }>({ show: false });
  const [modelSize, setModelSize] = useState<'8b' | '405b'>('8b');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load initial context on mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadChatContext();
    } else {
      setIsLoadingContext(false);
      setMessages([{
        id: "auth-required",
        role: "assistant",
        content: "Please sign in to start chatting with MindLink AI.",
        timestamp: new Date(),
      }]);
    }
  }, [isAuthenticated]);

  const loadChatContext = async () => {
    try {
      setIsLoadingContext(true);
      const response = await chatAPI.getContext();
      
      if (response.success && response.data) {
        const { initialMessage, conversationHistory, conversationId, moodContext: context } = response.data;
        
        // Load previous conversation history if exists
        if (conversationHistory && conversationHistory.length > 0) {
          // Convert conversation history to message format
          const historyMessages: Message[] = conversationHistory.map((msg: any, index: number) => ({
            id: `msg-${index}-${msg.timestamp || Date.now()}`,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            sentiment: msg.role === "user" ? analyzeSentiment(msg.content) : undefined,
            messageType: msg.messageType || 'text', // Track if text or voice
          }));
          
          setMessages(historyMessages);
          
          // Set conversation ID for continuity
          if (conversationId) {
            setConversationId(conversationId);
          }
          
          // Update mood based on last user message if available
          const lastUserMessage = historyMessages.filter(m => m.role === "user").pop();
          if (lastUserMessage && lastUserMessage.sentiment !== undefined) {
            setCurrentMood(lastUserMessage.sentiment);
          }
        } else {
          // No previous history - show initial greeting
          setMessages([{
            id: "initial",
            role: "assistant",
            content: initialMessage || "Hi there! I'm here to listen and support you. How are you feeling today?",
            timestamp: new Date(),
          }]);
        }

        // Update mood indicators from context
        if (context?.todayMood) {
          const moodScore = context.todayMood.score;
          const normalizedMood = (moodScore + 2) / 4; // Convert -2 to 2 range to 0-1
          setCurrentMood(normalizedMood);
        }

        if (context?.trend) {
          setMoodTrend(context.trend.recentTrend || "stable");
        }

        // Merge with passed moodContext prop
        if (moodContext?.todayMood) {
          const normalizedMood = (moodContext.todayMood.score + 2) / 4;
          setCurrentMood(normalizedMood);
        }
        if (moodContext?.trend) {
          setMoodTrend(moodContext.trend.recentTrend || "stable");
        }
      }
    } catch (error: any) {
      console.error('Error loading chat context:', error);
      
      // Handle authentication errors
      if (error.isAuthError || error.message?.includes('Not authorized')) {
        setShowAuthDialog(true);
        setMessages([{
          id: "auth-required",
          role: "assistant",
          content: "Please sign in to access your chat history and continue conversations.",
          timestamp: new Date(),
        }]);
      } else {
        // Fallback to default message for other errors
        setMessages([{
          id: "initial",
          role: "assistant",
          content: "Hi there! I'm here to listen and support you. How are you feeling today?",
          timestamp: new Date(),
        }]);
      }
    } finally {
      setIsLoadingContext(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    // Check authentication
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with MindLink AI",
        variant: "default",
      });
      return;
    }

    // Safety check
    const safetyCheck = checkMessageSafety(input);
    
    if (!safetyCheck.isSafe) {
      setSafetyAlert({
        show: true,
        message: safetyCheck.message,
        riskLevel: safetyCheck.riskLevel,
      });
      
      if (safetyCheck.riskLevel === "critical") {
        toast({
          title: "Crisis Support Available",
          description: "Please reach out to a crisis hotline. We've shown resources below.",
          variant: "destructive",
        });
      }
    } else {
      setSafetyAlert({ show: false });
    }

    // Simple sentiment analysis for display
    const sentiment = analyzeSentiment(input);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      sentiment,
      timestamp: new Date(),
      messageType: 'text', // Track message type
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setCurrentMood(sentiment);

    try {
      // Send to backend API with mood context and conversation ID
      const response = await chatAPI.sendMessage(input, conversationId || undefined, 'text', modelSize);
      
      if (response.success && response.data) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data.message,
          timestamp: new Date(),
          messageType: 'text', // AI replies are always text (TTS handled separately for voice)
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        // Store conversation ID if provided
        if (response.data.conversationId && !conversationId) {
          setConversationId(response.data.conversationId);
        }
        
        // Update sentiment if provided
        if (response.data.sentiment !== undefined) {
          setCurrentMood(response.data.sentiment);
        }
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Handle authentication errors
      if (error.isAuthError || error.message?.includes('Not authorized')) {
        setShowAuthDialog(true);
        toast({
          title: "Session expired",
          description: "Please sign in again to continue chatting",
          variant: "destructive",
        });
        // Remove the user message since it failed
        setMessages((prev) => prev.slice(0, -1));
      } else {
        // Fallback to local response generation for other errors
        const aiResponseContent = generateFallbackResponse(input, sentiment, safetyCheck);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponseContent,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        toast({
          title: "Note",
          description: "Using local response generation. Backend connection may be unavailable.",
          variant: "default",
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const analyzeSentiment = (text: string): number => {
    const positiveWords = ["good", "great", "happy", "better", "thanks", "helped", "wonderful", "excited", "love"];
    const negativeWords = ["sad", "bad", "worse", "anxious", "stressed", "worried", "terrible", "awful"];
    
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

  const generateFallbackResponse = (userMessage: string, sentiment: number, safetyCheck: any): string => {
    if (safetyCheck.riskLevel === "critical") {
      return "I'm deeply concerned about what you're sharing. Your life has value, and there are people who want to help. Please reach out to 988 (Suicide & Crisis Lifeline) right now. They're available 24/7 and completely confidential. You don't have to go through this alone.";
    } else if (safetyCheck.riskLevel === "high") {
      return "I hear that you're going through a really difficult time. It's okay to feel this way, and you're not alone. Would you like me to help you find some resources or support? There are people who care and want to help you through this.";
    }

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

  const getMoodIcon = (sentiment: number) => {
    if (sentiment > 0.6) return <Smile className="w-4 h-4 text-green-500" />;
    if (sentiment < 0.4) return <Frown className="w-4 h-4 text-red-500" />;
    return <Meh className="w-4 h-4 text-yellow-500" />;
  };

  const getTrendIcon = () => {
    if (moodTrend === "improving") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (moodTrend === "declining") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (moodTrend === "improving") return "text-green-500 bg-green-500/10 border-green-500/20";
    if (moodTrend === "declining") return "text-red-500 bg-red-500/10 border-red-500/20";
    return "text-gray-500 bg-gray-500/10 border-gray-500/20";
  };

  if (isLoadingContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground">Loading your personalized context...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card/80 backdrop-blur-lg border-b border-border px-4 py-4 shadow-soft sticky top-0 z-50 flex-shrink-0"
      >
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">MindLink AI</h1>
                <p className="text-xs text-muted-foreground">Always here to listen</p>
              </div>
            </div>
            
            {/* Voice Mode Toggle */}
            {onVoiceMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onVoiceMode}
                className="gap-2"
                title="Switch to Voice Mode"
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Voice Mode</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <Select value={modelSize} onValueChange={(value: '8b' | '405b') => setModelSize(value)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8b">Llama 8B</SelectItem>
                  <SelectItem value="405b">Llama 405B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mood Trend Badge */}
            {moodTrend !== "stable" && (
              <Badge variant="outline" className={`${getTrendColor()} border flex items-center gap-1`}>
                {getTrendIcon()}
                <span className="text-xs capitalize">{moodTrend}</span>
              </Badge>
            )}
            
            {/* Current Mood Indicator */}
            <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1.5">
              {getMoodIcon(currentMood)}
              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    currentMood > 0.6 ? "bg-green-500" : currentMood < 0.4 ? "bg-red-500" : "bg-yellow-500"
                  } transition-all duration-500`}
                  style={{ width: `${currentMood * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Safety Alert */}
      <AnimatePresence>
        {safetyAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto max-w-5xl px-4 pt-4 flex-shrink-0"
          >
            <Alert
              variant={safetyAlert.riskLevel === "critical" ? "destructive" : "default"}
              className="border-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="mt-2">
                <p className="font-semibold mb-2">{safetyAlert.message}</p>
                {safetyAlert.riskLevel === "critical" && (
                  <div className="space-y-2 mt-3">
                    {getCrisisResources().map((resource, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4" />
                        <span className="font-semibold">{resource.name}:</span>
                        <span>{resource.number}</span>
                      </div>
                    ))}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
        <div className="container mx-auto max-w-5xl space-y-4">
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
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="max-w-[85%]"
                >
                  <Card
                    className={`px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-medium rounded-2xl rounded-tr-sm"
                        : "bg-card text-card-foreground border-2 border-border hover:border-primary/50 rounded-2xl rounded-tl-sm"
                    } transition-all`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="leading-relaxed">{message.content}</p>
                        {/* Show message type badge */}
                        {message.messageType === 'voice' && (
                          <div className="flex items-center gap-1 mt-2">
                            <Mic className={`w-3 h-3 ${message.role === "user" ? "opacity-70" : "text-primary opacity-70"}`} />
                            <span className={`text-xs ${message.role === "user" ? "opacity-70" : "text-muted-foreground"}`}>
                              {message.role === "user" ? "Voice" : "Voice response"}
                            </span>
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {message.messageType === 'voice' ? (
                            <Mic className="w-3 h-3" />
                          ) : (
                            <MessageSquare className="w-3 h-3" />
                          )}
                        </div>
                      )}
                    </div>
                    {message.sentiment !== undefined && message.role === "user" && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-primary-foreground/20">
                        {getMoodIcon(message.sentiment)}
                        <span className="text-xs opacity-80">Mood detected</span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="bg-card text-card-foreground border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-card/80 backdrop-blur-lg border-t border-border px-4 py-4 shadow-soft sticky bottom-0 flex-shrink-0">
        <div className="container mx-auto max-w-5xl">
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
              placeholder={isAuthenticated ? "Share what's on your mind..." : "Sign in to start chatting..."}
              className="flex-1 h-12 text-base rounded-full border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={isTyping || !isAuthenticated}
              autoFocus
            />
            {!isAuthenticated ? (
              <Button 
                type="button"
                size="lg" 
                onClick={() => setShowAuthDialog(true)}
                className="rounded-full px-6 gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Button>
            ) : (
              <Button 
                type="submit" 
                size="lg" 
                disabled={!input.trim() || isTyping}
                className="rounded-full px-6"
              >
                {isTyping ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            )}
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
            <Heart className="w-3 h-3" />
            Your conversations are private and secure
          </p>
        </div>
      </div>
      
      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={(method) => {
          setShowAuthDialog(false);
          // Reload chat context after successful login
          if (isAuthenticated) {
            loadChatContext();
          }
        }}
      />
    </div>
  );
};

export default ChatInterface;
