import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const navigate = useNavigate();

  const events = [
    {
      id: "1",
      title: "Community Yoga & Meditation",
      description: "Join us for a relaxing morning session focused on mindfulness and gentle movement",
      date: "2025-11-20",
      time: "09:00 AM",
      location: "Central Park",
      attendees: 24,
      category: "wellness",
      organizer: "Wellness Warriors"
    },
    {
      id: "2",
      title: "Mental Health Workshop",
      description: "Expert-led workshop on managing anxiety and stress in daily life",
      date: "2025-11-22",
      time: "02:00 PM",
      location: "Community Center",
      attendees: 45,
      category: "workshop",
      organizer: "MindCare Foundation"
    },
    {
      id: "3",
      title: "Support Group Meetup",
      description: "Safe space for sharing experiences and building community connections",
      date: "2025-11-25",
      time: "06:00 PM",
      location: "Online",
      attendees: 18,
      category: "support",
      organizer: "Connect Circle"
    },
    {
      id: "4",
      title: "Art Therapy Session",
      description: "Express yourself through creative art in a supportive environment",
      date: "2025-11-27",
      time: "03:00 PM",
      location: "Arts Studio Downtown",
      attendees: 12,
      category: "therapy",
      organizer: "Creative Healing"
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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Community Events</h1>
          <p className="text-muted-foreground">Discover local and virtual wellness events near you</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {events.map((event) => (
            <motion.div key={event.id} variants={itemVariants}>
              <Card className="p-6 hover:shadow-large transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex flex-col items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary mb-1" />
                      <span className="text-sm font-semibold text-primary">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-semibold text-foreground mb-2">{event.title}</h3>
                        <Badge variant="secondary" className="mb-3">
                          {event.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{event.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        {event.attendees} attending
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4">
                      Organized by {event.organizer}
                    </p>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button>Register for Event</Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Events;
