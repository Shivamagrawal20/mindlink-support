import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, HelpCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { Input } from "@/components/ui/input";

const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      questions: [
        {
          q: "What is MindLink AI?",
          a: "MindLink AI is a compassionate AI companion designed to support your mental wellness journey. It provides 24/7 anonymous support through voice and text conversations, helping you navigate challenges, process emotions, and find resources.",
        },
        {
          q: "How do I create an account?",
          a: "You can create an account by clicking 'Sign Up' in the navigation bar. You can choose to create a regular account with email and password, or use anonymous mode for complete privacy. No personal information is required for anonymous accounts.",
        },
        {
          q: "Is MindLink AI free to use?",
          a: "Yes! MindLink AI is completely free to use. Our mission is to make mental health support accessible to everyone, regardless of their financial situation.",
        },
        {
          q: "Do I need to download an app?",
          a: "No, MindLink AI is a web-based platform that works in your browser. You can access it from any device - desktop, tablet, or mobile - without needing to download anything.",
        },
      ],
    },
    {
      title: "Privacy & Safety",
      icon: "🔒",
      questions: [
        {
          q: "Is my information private and secure?",
          a: "Absolutely. We take your privacy seriously. All conversations are encrypted, and we never share your personal information with third parties. Anonymous accounts don't require any personal information at all.",
        },
        {
          q: "Can I use MindLink AI anonymously?",
          a: "Yes! You can create an anonymous account that doesn't require email or personal information. Your conversations remain completely private and anonymous.",
        },
        {
          q: "What data do you collect?",
          a: "We only collect the minimum data necessary to provide our service. For anonymous accounts, we don't collect any personal information. For regular accounts, we only collect email and name (optional). We never track your browsing history or share data with advertisers.",
        },
        {
          q: "How do you protect my conversations?",
          a: "All conversations are encrypted in transit and stored securely. We use industry-standard security measures to protect your data. You can also delete your chat history at any time from your profile settings.",
        },
      ],
    },
    {
      title: "Features & Usage",
      icon: "✨",
      questions: [
        {
          q: "How does the AI chat work?",
          a: "Our AI companion uses advanced language models trained to provide empathetic, supportive responses. You can chat via text or voice, and the AI adapts to your conversation style and needs. It's available 24/7 and never judges.",
        },
        {
          q: "What are Voice Rooms?",
          a: "Voice Rooms are live audio support circles where you can connect with others in a safe, moderated space. You can join existing rooms or create your own. All rooms are monitored for safety and respect.",
        },
        {
          q: "How do Events work?",
          a: "Events are community gatherings - both online and offline - organized by community leaders. You can browse upcoming events, RSVP, and join wellness activities, workshops, and support groups.",
        },
        {
          q: "Can I create my own support circle?",
          a: "Yes! Any user can create a support circle. Community leaders can also create events. Simply navigate to the Rooms or Events page and click 'Create' to get started.",
        },
        {
          q: "What is the Mood Tracker?",
          a: "The Mood Tracker helps you monitor your emotional well-being over time. You can log your mood daily, add reflections, and track patterns. This helps you understand your mental health journey better.",
        },
      ],
    },
    {
      title: "Support & Resources",
      icon: "💙",
      questions: [
        {
          q: "Is MindLink AI a replacement for therapy?",
          a: "No, MindLink AI is not a replacement for professional mental health care. It's a supportive companion that can help you process emotions, find resources, and provide 24/7 support. For serious mental health concerns, please consult with a licensed mental health professional.",
        },
        {
          q: "What should I do in a crisis?",
          a: "If you're in immediate danger or experiencing a mental health crisis, please call 988 (National Suicide Prevention Lifeline) or 911. MindLink AI is not designed for crisis intervention. Visit our Resources page for crisis hotlines and emergency contacts.",
        },
        {
          q: "How can I report inappropriate content?",
          a: "If you encounter inappropriate content or behavior, you can report it using the moderation tools in any room or event. Our moderation team reviews all reports promptly and takes appropriate action.",
        },
        {
          q: "Where can I find mental health resources?",
          a: "Visit our Resources page for crisis hotlines, self-help materials, guided meditations, and links to professional mental health services. We curate trusted resources to support your wellness journey.",
        },
      ],
    },
    {
      title: "Account & Settings",
      icon: "⚙️",
      questions: [
        {
          q: "How do I update my profile?",
          a: "Navigate to your Profile page from the navigation menu. There you can update your name, email, preferences, and manage your account settings. Anonymous accounts have limited profile options.",
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can delete your account at any time from your Profile page. This will permanently delete all your data, including chat history and mood logs. This action cannot be undone.",
        },
        {
          q: "How do I change my notification settings?",
          a: "Go to your Profile page and navigate to the Privacy & Safety section. You can toggle notifications on or off, and customize which types of notifications you receive.",
        },
        {
          q: "What languages are supported?",
          a: "Currently, MindLink AI primarily supports English, but we're working on adding more languages. You can change your language preference in your Profile settings.",
        },
      ],
    },
  ];

  const allQuestions = faqCategories.flatMap((category) =>
    category.questions.map((q) => ({ ...q, category: category.title }))
  );

  const filteredQuestions = searchQuery
    ? allQuestions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allQuestions;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        className="container mx-auto px-4 py-8 pt-24 max-w-5xl"
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
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-4"
          >
            <HelpCircle className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions about MindLink AI
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {faqCategories.map((category, categoryIndex) => {
            const categoryQuestions = category.questions.filter((q) =>
              filteredQuestions.some((fq) => fq.q === q.q)
            );

            if (categoryQuestions.length === 0 && searchQuery) return null;

            return (
              <motion.div key={category.title} variants={itemVariants}>
                <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-foreground">
                      {category.title}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {categoryQuestions.map((item, index) => {
                      const globalIndex = allQuestions.findIndex(
                        (q) => q.q === item.q
                      );
                      const isOpen = openIndex === globalIndex;

                      return (
                        <motion.div
                          key={item.q}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className="border border-border hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => toggleQuestion(globalIndex)}
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-foreground pr-4">
                                  {item.q}
                                </h3>
                                <motion.div
                                  animate={{ rotate: isOpen ? 180 : 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                </motion.div>
                              </div>
                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <p className="text-muted-foreground mt-4 leading-relaxed">
                                      {item.a}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? We're here to help.
            </p>
            <Button onClick={() => navigate("/contact")}>
              Contact Us
            </Button>
          </Card>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default FAQ;

