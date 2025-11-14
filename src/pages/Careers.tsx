import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

const Careers = () => {
  const navigate = useNavigate();

  const openPositions = [
    {
      id: 1,
      title: "Senior AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description:
        "Lead the development of our AI models for mental health support. Work with cutting-edge LLM technology to create compassionate, helpful AI companions.",
      requirements: [
        "5+ years in ML/AI development",
        "Experience with LLMs and NLP",
        "Strong Python skills",
        "Passion for mental health",
      ],
    },
    {
      id: 2,
      title: "Mental Health Content Specialist",
      department: "Content",
      location: "Remote",
      type: "Full-time",
      description:
        "Create evidence-based mental health content, resources, and guides. Ensure all content is accurate, empathetic, and helpful.",
      requirements: [
        "Background in psychology or mental health",
        "Excellent writing skills",
        "Understanding of evidence-based practices",
        "Empathy and compassion",
      ],
    },
    {
      id: 3,
      title: "Community Safety Moderator",
      department: "Safety",
      location: "Remote",
      type: "Part-time",
      description:
        "Help maintain a safe, supportive environment for our users. Monitor support circles and events, respond to reports, and ensure community guidelines are followed.",
      requirements: [
        "Experience in moderation or community management",
        "Strong judgment and empathy",
        "Ability to handle sensitive situations",
        "Flexible schedule",
      ],
    },
    {
      id: 4,
      title: "Full-Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description:
        "Build and maintain our web platform. Work with React, Node.js, and modern web technologies to create beautiful, accessible user experiences.",
      requirements: [
        "3+ years full-stack development",
        "React and Node.js experience",
        "TypeScript proficiency",
        "Focus on user experience",
      ],
    },
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Mission-Driven Work",
      description: "Make a real difference in people's lives every day",
    },
    {
      icon: Users,
      title: "Remote-First",
      description: "Work from anywhere, flexible hours",
    },
    {
      icon: Sparkles,
      title: "Growth Opportunities",
      description: "Learn and grow with cutting-edge technology",
    },
    {
      icon: Briefcase,
      title: "Competitive Benefits",
      description: "Health insurance, PTO, and professional development",
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-4"
          >
            <Briefcase className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Join Our Team
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Help us make mental health support accessible to everyone. Work
            with a mission-driven team building the future of compassionate AI.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div key={benefit.title} variants={itemVariants}>
              <Card className="p-6 text-center hover:shadow-large transition-all border-2 hover:border-primary/50 h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Open Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Open Positions
          </h2>
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-foreground">
                          {position.title}
                        </h3>
                        <Badge variant="secondary">
                          {position.department}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {position.description}
                      </p>
                      <div className="mb-4">
                        <h4 className="font-semibold text-foreground mb-2">
                          Requirements:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {position.requirements.map((req, reqIndex) => (
                            <li key={reqIndex}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full md:w-auto">
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Card className="p-8 bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Don't See a Fit?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always looking for passionate people to join our mission.
              Send us your resume and let us know how you'd like to contribute.
            </p>
            <Button size="lg" onClick={() => navigate("/contact")}>
              Get in Touch
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Careers;

