import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Users, Shield, ArrowRight, Calendar, Heart, UserCircle, Mic, TrendingUp, Sparkles, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from "@/components/AuthDialog";
import ChatInterface from "@/components/ChatInterface";
import VoiceAIChat from "@/components/VoiceAIChat";
import DailyCheckIn from "@/components/DailyCheckIn";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { useUser } from "@/contexts/UserContext";
import { useDailyCheckIn } from "@/hooks/useDailyCheckIn";
import { canCreateEvents, canCreateSupportCircles, canAccessAdminPanel, canModerate } from "@/lib/roles";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();
  const { needsCheckIn, isLoading: checkInLoading, refresh: refreshCheckIn } = useDailyCheckIn();
  const [showAuth, setShowAuth] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [checkInDismissed, setCheckInDismissed] = useState(false);
  const [hasShownCheckInThisSession, setHasShownCheckInThisSession] = useState(false);

  // Only automatically show check-in on fresh login (not on navigation)
  // Track if we've shown it this session to prevent re-showing on navigation
  useEffect(() => {
    // Don't auto-show if:
    // - Already shown this session
    // - User dismissed it
    // - Already visible
    // - Chat is open
    // - Still loading
    if (hasShownCheckInThisSession || checkInDismissed || showDailyCheckIn || showChat || checkInLoading) {
      return;
    }

    if (isAuthenticated && needsCheckIn) {
      // Check if this is a fresh login (within last 10 seconds)
      const lastLogin = localStorage.getItem('mindlink_last_login');
      const now = Date.now();
      
      // Only auto-show if:
      // 1. Just logged in (within last 10 seconds) - fresh session
      // 2. Or user needs check-in and hasn't seen it this session
      if (lastLogin && (now - parseInt(lastLogin)) < 10 * 1000) {
        // Fresh login - show check-in
        setShowDailyCheckIn(true);
        setHasShownCheckInThisSession(true);
      }
      // Otherwise, user is navigating - don't auto-show (only show on manual click)
    }
  }, [isAuthenticated, needsCheckIn, checkInLoading, showDailyCheckIn, showChat, checkInDismissed, hasShownCheckInThisSession]);

  // Reset session flag when user logs out or check-in status changes
  useEffect(() => {
    if (!isAuthenticated) {
      setHasShownCheckInThisSession(false);
      setCheckInDismissed(false);
    }
  }, [isAuthenticated]);

  // Only store login time once on initial authentication (not on every render)
  useEffect(() => {
    if (isAuthenticated && user) {
      const existingLogin = localStorage.getItem('mindlink_last_login');
      // Only set if not already set (to avoid updating on every navigation)
      if (!existingLogin) {
        localStorage.setItem('mindlink_last_login', Date.now().toString());
      }
    }
  }, [isAuthenticated, user]);

  const handleAuthSuccess = async (method?: "email" | "google" | "anonymous") => {
    setShowAuth(false);
    // Reset session flags on fresh login
    setHasShownCheckInThisSession(false);
    setCheckInDismissed(false);
    
    // Store login time for session detection
    localStorage.setItem('mindlink_last_login', Date.now().toString());
    
    // The useEffect will handle showing check-in if needed (only on fresh login)
    // If check-in not needed, show chat
    if (!needsCheckIn) {
      setShowChat(true);
    }
    // If check-in needed, useEffect will show it automatically
  };

  const handleCheckInComplete = () => {
    setShowDailyCheckIn(false);
    setCheckInDismissed(false); // Reset dismiss flag after completion
    setHasShownCheckInThisSession(true); // Mark as shown so it doesn't reappear
    
    // Refresh check-in status after a delay to ensure backend updated
    setTimeout(() => {
      refreshCheckIn();
      // Navigate to chat after completion (only if not already there)
      if (!showChat) {
        setShowChat(true);
      }
    }, 1000);
  };

  const handleManualCheckIn = () => {
    // User manually clicked check-in button
    setShowDailyCheckIn(true);
    setCheckInDismissed(false);
  };

  const handleDismissCheckIn = () => {
    // User manually dismissed check-in (via skip button)
    setShowDailyCheckIn(false);
    setCheckInDismissed(true);
    setHasShownCheckInThisSession(true); // Don't show again this session
  };

  // Show loading state while checking check-in status
  if (isAuthenticated && checkInLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (showDailyCheckIn && isAuthenticated) {
    return (
      <DailyCheckIn 
        onComplete={handleCheckInComplete}
        onDismiss={handleDismissCheckIn}
        fullscreen={true}
        showSkip={true}
      />
    );
  }

  if (showVoiceChat && isAuthenticated) {
    // Get mood context from sessionStorage if available
    let moodContext = undefined;
    try {
      const contextStr = sessionStorage.getItem('mindlink_mood_context');
      if (contextStr) {
        moodContext = JSON.parse(contextStr);
        // Clear it after use (one-time use)
        sessionStorage.removeItem('mindlink_mood_context');
      }
    } catch (e) {
      console.error('Error parsing mood context:', e);
    }
    
    return <VoiceAIChat onBack={() => setShowVoiceChat(false)} moodContext={moodContext} />;
  }

  if (showChat && isAuthenticated) {
    // Get mood context from sessionStorage if available
    let moodContext = undefined;
    try {
      const contextStr = sessionStorage.getItem('mindlink_mood_context');
      if (contextStr) {
        moodContext = JSON.parse(contextStr);
        // Clear it after use (one-time use)
        sessionStorage.removeItem('mindlink_mood_context');
      }
    } catch (e) {
      console.error('Error parsing mood context:', e);
    }
    
    return <ChatInterface onBack={() => setShowChat(false)} moodContext={moodContext} onVoiceMode={() => {
      setShowChat(false);
      setShowVoiceChat(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col">
      <NavBar onAuthClick={() => setShowAuth(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Safe, Anonymous, Always Here</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
            >
              Your AI Companion for
              <br />
              <span className="bg-gradient-to-r from-primary to-support bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Connect with empathetic AI support, join voice circles, and discover community resources—all in one safe space.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setShowAuth(true)}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 h-14 border-2"
                  onClick={() => navigate("/resources")}
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Section */}
      {isAuthenticated && user && (
        <section className="py-12 px-4 bg-card/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-foreground mb-2">How would you like to connect?</h2>
              <p className="text-muted-foreground">Choose your preferred way to get support</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-all h-full"
                  onClick={() => setShowChat(true)}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Talk to MindLink</h3>
                  <p className="text-sm text-muted-foreground">Text chat with empathetic AI support</p>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-all h-full"
                  onClick={() => navigate("/rooms")}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Join Support Circle</h3>
                  <p className="text-sm text-muted-foreground">Real-time voice rooms with others</p>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-all h-full"
                  onClick={handleManualCheckIn}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Daily Mood Check-in</h3>
                  <p className="text-sm text-muted-foreground">Track your wellness journey</p>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-all h-full"
                  onClick={() => navigate("/events")}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Discover Events</h3>
                  <p className="text-sm text-muted-foreground">Community events and meetups</p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">How We Help</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive support tools designed for your mental wellness journey
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            className="grid md:grid-cols-4 gap-8"
          >
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="AI Empathetic Chat"
              description="Talk to our AI companion trained to listen, understand, and provide supportive guidance 24/7."
              delay="0.1s"
              onClick={() => setShowAuth(true)}
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Voice Support Circles"
              description="Join real-time voice rooms with others who understand. Anonymous and judgment-free."
              delay="0.2s"
              onClick={() => navigate("/rooms")}
            />
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Community Events"
              description="Discover local and virtual wellness events, workshops, and support group meetups."
              delay="0.3s"
              onClick={() => navigate("/events")}
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Crisis Resources"
              description="Immediate access to crisis hotlines, self-help tools, and emergency support."
              delay="0.4s"
              onClick={() => navigate("/resources")}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-primary to-support rounded-3xl p-12 text-center text-white shadow-2xl"
          >
            <h2 className="text-4xl font-bold mb-4">
              You're Not Alone
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands finding support, connection, and hope through MindLink AI.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 h-14 bg-white text-primary hover:bg-white/90"
                onClick={() => setShowAuth(true)}
              >
                Start Talking Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        onSuccess={handleAuthSuccess}
      />
      
      <Footer />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
  onClick?: () => void;
}

const FeatureCard = ({ icon, title, description, delay = "0s", onClick }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: parseFloat(delay), duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.03, rotate: 1 }}
      className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-large transition-all border border-border cursor-pointer group"
      onClick={onClick}
    >
      <motion.div
        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/20 transition-colors"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default Index;
