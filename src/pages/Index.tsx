import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, Users, Shield, ArrowRight, Calendar, Heart, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from "@/components/AuthDialog";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setIsAuthenticated(true);
    setShowChat(true);
  };

  if (showChat && isAuthenticated) {
    return <ChatInterface onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            <span className="text-xl font-semibold text-foreground">MindLink AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/rooms")} className="text-muted-foreground hover:text-foreground transition-colors">
              Voice Rooms
            </button>
            <button onClick={() => navigate("/events")} className="text-muted-foreground hover:text-foreground transition-colors">
              Events
            </button>
            <button onClick={() => navigate("/resources")} className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </button>
            <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </button>
          </nav>
          <Button variant="default" onClick={() => setShowAuth(true)}>
            Get Started
          </Button>
        </div>
      </motion.header>

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

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
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
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all border border-border cursor-pointer"
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default Index;
