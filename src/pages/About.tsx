import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Heart,
  Users,
  Brain,
  Shield,
  Sparkles,
  Target,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Compassion First",
      description:
        "Every interaction is designed with empathy and understanding at its core.",
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      description:
        "Your privacy is sacred. We provide anonymous, secure spaces for healing.",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Building connections and fostering supportive communities together.",
    },
    {
      icon: Brain,
      title: "Innovation",
      description:
        "Leveraging cutting-edge AI to provide accessible mental health support.",
    },
  ];

  const stats = [
    { number: "24/7", label: "Available Support" },
    { number: "100%", label: "Anonymous Option" },
    { number: "Free", label: "Forever" },
    { number: "AI-Powered", label: "Compassionate Care" },
  ];

  const mission = [
    {
      title: "Our Mission",
      content:
        "To make mental health support accessible, anonymous, and available to everyone, regardless of their circumstances. We believe that everyone deserves compassionate support on their wellness journey.",
    },
    {
      title: "Our Vision",
      content:
        "A world where mental health support is as accessible as a conversation, where technology serves humanity with empathy, and where no one has to face their struggles alone.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col">
      <NavBar />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 pt-24 max-w-6xl"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-6"
          >
            <Brain className="w-20 h-20 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            About MindLink AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make mental health support accessible,
            anonymous, and available to everyone. Through compassionate AI and
            community connection, we're here for you, 24/7.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="p-6 text-center hover:shadow-large transition-all border-2 hover:border-primary/50">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {mission.map((item, index) => (
            <motion.div key={item.title} variants={itemVariants}>
              <Card className="p-8 h-full hover:shadow-large transition-all border-2 hover:border-primary/50">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    {item.title}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {item.content}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Our Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What We Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">
                What We Offer
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  AI-Powered Support
                </h3>
                <p className="text-muted-foreground mb-4">
                  Chat with our compassionate AI companion anytime, anywhere.
                  Available 24/7 for text or voice conversations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Voice Support Circles
                </h3>
                <p className="text-muted-foreground mb-4">
                  Join live audio support groups or create your own. Connect
                  with others in a safe, moderated environment.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Community Events
                </h3>
                <p className="text-muted-foreground mb-4">
                  Participate in wellness workshops, support groups, and
                  community gatherings organized by leaders.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Mood Tracking
                </h3>
                <p className="text-muted-foreground mb-4">
                  Monitor your emotional well-being over time with our mood
                  tracking tools and insights.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of users who have found support, connection, and
              hope through MindLink AI.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/")}>
                Start Chatting
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default About;

