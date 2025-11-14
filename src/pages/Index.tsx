import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, Users, Shield, ArrowRight } from "lucide-react";
import AuthDialog from "@/components/AuthDialog";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
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
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            <span className="text-xl font-semibold text-foreground">MindLink AI</span>
          </div>
          <Button variant="default" onClick={() => setShowAuth(true)}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Safe, Anonymous, Always Here</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Your AI Companion for
              <br />
              <span className="bg-gradient-to-r from-primary to-support bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connect with empathetic AI support, join voice circles, and discover community resources—all in one safe space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 h-14 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setShowAuth(true)}
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 border-2"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="AI Empathetic Chat"
              description="Talk to our AI companion trained to listen, understand, and provide supportive guidance 24/7."
              delay="0.1s"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Voice Support Circles"
              description="Join real-time voice rooms with others who understand. Anonymous and judgment-free."
              delay="0.2s"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Mood Tracking"
              description="Visualize your emotional journey with AI-powered sentiment analysis and insights."
              delay="0.3s"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary to-support rounded-3xl p-12 text-center text-white shadow-2xl animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">
              You're Not Alone
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands finding support, connection, and hope through MindLink AI.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 h-14 bg-white text-primary hover:bg-white/90"
              onClick={() => setShowAuth(true)}
            >
              Start Talking Now
            </Button>
          </div>
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
}

const FeatureCard = ({ icon, title, description, delay = "0s" }: FeatureCardProps) => {
  return (
    <div
      className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all animate-fade-in border border-border"
      style={{ animationDelay: delay }}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default Index;
