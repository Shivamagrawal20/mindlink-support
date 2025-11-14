import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Video, BookOpen, Heart, ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

const Resources = () => {
  const navigate = useNavigate();

  const crisisLines = [
    {
      name: "Vandrevala Foundation Helpline",
      number: "1860 2662 345 / 1800 2333 330",
      description: "24/7 free and confidential mental health support",
      type: "Crisis"
    },
    {
      name: "iCall (TISS) Helpline",
      number: "022-25521111",
      description: "Monday to Saturday, 8 AM to 10 PM - Professional counseling",
      type: "Support"
    },
    {
      name: "AASRA Suicide Prevention",
      number: "91-9820466726 / 022 2754 6669",
      description: "24/7 crisis intervention and emotional support",
      type: "Crisis"
    },
    {
      name: "National Mental Health Helpline",
      number: "1800-599-0019",
      description: "Government helpline for mental health support",
      type: "Support"
    }
  ];

  const resources = [
    {
      icon: Video,
      title: "Guided Meditations",
      description: "Calming meditation sessions inspired by Indian practices like Yoga and Mindfulness",
      link: "#"
    },
    {
      icon: BookOpen,
      title: "Self-Help Articles",
      description: "Evidence-based strategies for mental wellness tailored for Indian context",
      link: "#"
    },
    {
      icon: Heart,
      title: "Breathing Exercises",
      description: "Pranayama and quick techniques to reduce stress and anxiety",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col">
      <NavBar />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-2"
          >
            Support Resources
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground text-lg"
          >
            Access helpful resources and emergency support in India
          </motion.p>
        </motion.div>

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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {crisisLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <Card className="p-6 bg-card hover:shadow-large transition-all h-full border-2 hover:border-destructive/50">
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
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -4, rotate: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 hover:shadow-large transition-all h-full border-2 hover:border-primary/50 group">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                  >
                    <resource.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{resource.title}</h3>
                  <p className="text-muted-foreground mb-4">{resource.description}</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
      
      <Footer />
    </div>
  );
};

export default Resources;
