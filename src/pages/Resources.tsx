import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Video, BookOpen, Heart, ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Resources = () => {
  const navigate = useNavigate();

  const crisisLines = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 free and confidential support",
      type: "Crisis"
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "Text-based crisis support",
      type: "Crisis"
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      description: "Treatment referral and information",
      type: "Support"
    }
  ];

  const resources = [
    {
      icon: Video,
      title: "Guided Meditations",
      description: "Calming meditation sessions for anxiety and stress relief",
      link: "#"
    },
    {
      icon: BookOpen,
      title: "Self-Help Articles",
      description: "Evidence-based strategies for mental wellness",
      link: "#"
    },
    {
      icon: Heart,
      title: "Breathing Exercises",
      description: "Quick techniques to reduce stress and anxiety",
      link: "#"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Support Resources</h1>
          <p className="text-muted-foreground">Access helpful resources and emergency support</p>
        </div>

        {/* Crisis Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Need Immediate Help?</h2>
            <p className="text-muted-foreground mb-4">
              If you're in crisis or need immediate support, please reach out to these resources:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {crisisLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="p-6 bg-card hover:shadow-large transition-all h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-primary">{line.type}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{line.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{line.number}</p>
                  <p className="text-sm text-muted-foreground">{line.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Self-Help Resources */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">Self-Help Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 hover:shadow-large transition-all h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <resource.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{resource.title}</h3>
                  <p className="text-muted-foreground mb-4">{resource.description}</p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full gap-2">
                      Explore
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Resources;
