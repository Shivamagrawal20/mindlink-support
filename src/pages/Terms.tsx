import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using MindLink AI, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
        "We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.",
      ],
    },
    {
      icon: Scale,
      title: "Use of Service",
      content: [
        "MindLink AI is provided for personal, non-commercial use. You agree to:",
        "• Use the service only for lawful purposes",
        "• Not attempt to harm, disrupt, or interfere with the service",
        "• Not use the service to harass, abuse, or harm others",
        "• Respect the privacy and anonymity of other users",
        "• Not share false or misleading information",
        "• Not attempt to reverse engineer or access unauthorized areas",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Medical Disclaimer",
      content: [
        "IMPORTANT: MindLink AI is not a replacement for professional mental health care, medical advice, or emergency services.",
        "• Our AI companion provides supportive conversations but is not a licensed therapist or medical professional",
        "• For mental health emergencies, contact 988 (Suicide Prevention Lifeline) or 911",
        "• For professional mental health treatment, consult with a licensed therapist or healthcare provider",
        "• We are not responsible for decisions made based on AI-generated content",
        "• Always seek professional help for serious mental health concerns",
      ],
    },
    {
      icon: FileText,
      title: "User Accounts",
      content: [
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "• You must be at least 13 years old to use our service (or older in jurisdictions requiring parental consent)",
        "• You are responsible for all activities under your account",
        "• You must immediately notify us of any unauthorized use",
        "• We reserve the right to suspend or terminate accounts that violate these terms",
      ],
    },
    {
      icon: Scale,
      title: "Content and Intellectual Property",
      content: [
        "All content on MindLink AI, including AI responses, is for personal use only.",
        "• You retain ownership of content you create (messages, mood logs, etc.)",
        "• We may use anonymized, aggregated data to improve our services",
        "• You grant us a license to use your content to provide and improve our services",
        "• You may not copy, modify, or distribute our content without permission",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: [
        "MindLink AI is provided 'as is' without warranties of any kind.",
        "• We do not guarantee uninterrupted or error-free service",
        "• We are not liable for any indirect, incidental, or consequential damages",
        "• Our total liability is limited to the amount you paid (if any) for our services",
        "• We are not responsible for user-generated content or third-party links",
      ],
    },
    {
      icon: FileText,
      title: "Termination",
      content: [
        "We may terminate or suspend your account at any time for violations of these terms.",
        "• You may delete your account at any time from your profile settings",
        "• Upon termination, your right to use the service immediately ceases",
        "• We may delete your data after a reasonable period following account deletion",
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
            <Scale className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms of Service
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
              Please read these Terms of Service carefully before using MindLink
              AI. By using our service, you agree to be bound by these terms.
              If you have any questions, please contact us at{" "}
              <a
                href="mailto:legal@mindlink.ai"
                className="text-primary hover:underline"
              >
                legal@mindlink.ai
              </a>
              .
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
                      transition={{
                        delay: 0.4 + index * 0.1 + pIndex * 0.05,
                      }}
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
              Contact Information
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact
              us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                Email:{" "}
                <a
                  href="mailto:legal@mindlink.ai"
                  className="text-primary hover:underline"
                >
                  legal@mindlink.ai
                </a>
              </p>
              <p>
                General inquiries:{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => navigate("/contact")}
                >
                  Contact Us
                </Button>
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Terms;

