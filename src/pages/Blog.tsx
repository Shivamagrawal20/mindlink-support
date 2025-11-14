import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

const Blog = () => {
  const navigate = useNavigate();

  const blogPosts = [
    {
      id: 1,
      title: "Understanding Mental Health: A Beginner's Guide",
      excerpt:
        "Learn the basics of mental health, common misconceptions, and how to recognize when you or someone you know might need support.",
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Education",
      image: "🧠",
    },
    {
      id: 2,
      title: "The Power of Anonymous Support",
      excerpt:
        "Discover why anonymous mental health support can be transformative and how it removes barriers to seeking help.",
      author: "MindLink Team",
      date: "2024-01-10",
      readTime: "4 min read",
      category: "Wellness",
      image: "🔒",
    },
    {
      id: 3,
      title: "Building Resilience: Practical Strategies",
      excerpt:
        "Evidence-based techniques to build emotional resilience and navigate life's challenges with greater strength.",
      author: "Dr. Michael Torres",
      date: "2024-01-05",
      readTime: "7 min read",
      category: "Self-Help",
      image: "💪",
    },
    {
      id: 4,
      title: "AI and Mental Health: The Future of Support",
      excerpt:
        "Exploring how AI technology is revolutionizing mental health care and making support more accessible to everyone.",
      author: "Tech Team",
      date: "2023-12-28",
      readTime: "6 min read",
      category: "Technology",
      image: "🤖",
    },
    {
      id: 5,
      title: "Creating Safe Spaces Online",
      excerpt:
        "How MindLink AI ensures a safe, respectful environment for everyone seeking mental health support.",
      author: "Safety Team",
      date: "2023-12-20",
      readTime: "5 min read",
      category: "Safety",
      image: "🛡️",
    },
    {
      id: 6,
      title: "Community Support: You're Not Alone",
      excerpt:
        "The importance of community in mental wellness and how support circles can create meaningful connections.",
      author: "Community Team",
      date: "2023-12-15",
      readTime: "4 min read",
      category: "Community",
      image: "👥",
    },
  ];

  const categories = [
    "All",
    "Education",
    "Wellness",
    "Self-Help",
    "Technology",
    "Safety",
    "Community",
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
            <BookOpen className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            MindLink Blog
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights, stories, and resources for your mental wellness journey
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 flex flex-wrap gap-2 justify-center"
        >
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
            >
              {category}
            </Badge>
          ))}
        </motion.div>

        {/* Blog Posts */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {blogPosts.map((post, index) => (
            <motion.div key={post.id} variants={itemVariants}>
              <Card className="h-full hover:shadow-large transition-all border-2 hover:border-primary/50 overflow-hidden group">
                <div className="p-6">
                  <div className="text-6xl mb-4 text-center">{post.image}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:text-primary"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="p-8 bg-primary/5 border-primary/20 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for the latest articles and resources
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md border border-border bg-background text-foreground"
              />
              <Button>Subscribe</Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Blog;

