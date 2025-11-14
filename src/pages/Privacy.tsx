import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: [
        "For anonymous accounts, we collect minimal information - no email, name, or personal identifiers are required.",
        "For registered accounts, we collect:",
        "• Email address (for account recovery and notifications)",
        "• Display name (optional)",
        "• Conversation history (stored securely and can be deleted at any time)",
        "• Mood tracking data (optional, stored locally and on our servers)",
        "• Usage analytics (anonymized and aggregated)",
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "We use your information solely to provide and improve our services:",
        "• To provide personalized AI support and responses",
        "• To maintain your account and preferences",
        "• To improve our AI models and service quality",
        "• To send important service updates (you can opt out)",
        "• To ensure platform safety and prevent abuse",
        "We never sell your data to third parties or use it for advertising purposes.",
      ],
    },
    {
      icon: Eye,
      title: "Data Security",
      content: [
        "We implement industry-standard security measures to protect your data:",
        "• All data is encrypted in transit using TLS/SSL",
        "• Sensitive data is encrypted at rest",
        "• Regular security audits and updates",
        "• Access controls and authentication",
        "• Secure cloud infrastructure",
        "However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.",
      ],
    },
    {
      icon: FileText,
      title: "Your Rights",
      content: [
        "You have the following rights regarding your data:",
        "• Access: Request a copy of your data at any time",
        "• Deletion: Delete your account and all associated data",
        "• Correction: Update your profile information",
        "• Export: Export your conversation history",
        "• Opt-out: Disable data collection for analytics",
        "• Anonymity: Use anonymous mode without providing personal information",
        "To exercise these rights, contact us at support@mindlink.ai or use the settings in your profile.",
      ],
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
        className="container mx-auto px-4 py-8 pt-24 max-w-4xl"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

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
            <Shield className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6 bg-primary/5 border-primary/20">
            <p className="text-foreground leading-relaxed">
              At MindLink AI, your privacy is our top priority. We are committed
              to protecting your personal information and providing a safe,
              anonymous space for mental wellness support. This Privacy Policy
              explains how we collect, use, and protect your information when
              you use our services.
            </p>
          </Card>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {sections.map((section, index) => (
            <motion.div key={section.title} variants={itemVariants}>
              <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-3 ml-16">
                  {section.content.map((paragraph, pIndex) => (
                    <motion.p
                      key={pIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 + pIndex * 0.05 }}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="p-6 bg-muted/50">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Changes to This Policy
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date. You are advised
              to review this Privacy Policy periodically for any changes.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-4 mt-6">
              Contact Us
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@mindlink.ai"
                className="text-primary hover:underline"
              >
                privacy@mindlink.ai
              </a>{" "}
              or visit our{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate("/contact")}
              >
                Contact page
              </Button>
              .
            </p>
          </Card>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Privacy;

