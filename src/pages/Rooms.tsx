import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Globe, Plus, ArrowLeft, Mic, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Rooms = () => {
  const navigate = useNavigate();
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const rooms = [
    {
      id: "1",
      title: "Evening Support Circle",
      description: "Safe space to share and listen",
      participants: 8,
      maxParticipants: 15,
      isPrivate: false,
      host: "Sarah M.",
      tags: ["anxiety", "stress"]
    },
    {
      id: "2",
      title: "Student Wellness Group",
      description: "For students dealing with academic pressure",
      participants: 5,
      maxParticipants: 10,
      isPrivate: false,
      host: "Alex K.",
      tags: ["students", "pressure"]
    },
    {
      id: "3",
      title: "Late Night Check-in",
      description: "When you need someone awake",
      participants: 12,
      maxParticipants: 20,
      isPrivate: false,
      host: "Jordan P.",
      tags: ["insomnia", "night"]
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

  if (joinedRoom) {
    const room = rooms.find(r => r.id === joinedRoom);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto px-4 py-8"
        >
          <Button
            variant="ghost"
            onClick={() => setJoinedRoom(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Room
          </Button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">{room?.title}</h2>
              <p className="text-muted-foreground mb-8">{room?.description}</p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-lg">{room?.participants} participants</span>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant={isMuted ? "outline" : "default"}
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-20 w-20 rounded-full"
                >
                  {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </Button>
              </motion.div>
              <p className="text-sm text-muted-foreground mt-4">
                {isMuted ? "Unmute to speak" : "You're unmuted"}
              </p>

              <div className="mt-8 text-sm text-muted-foreground">
                <p>Remember: This is a judgment-free zone. Be kind and supportive.</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-foreground">Voice Support Circles</h1>
            <p className="text-muted-foreground mt-2">Join a voice room and connect with others</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Room
          </Button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {rooms.map((room) => (
            <motion.div key={room.id} variants={itemVariants}>
              <Card className="p-6 hover:shadow-large transition-all">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">{room.title}</h3>
                  {room.isPrivate ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Globe className="w-5 h-5 text-primary" />
                  )}
                </div>

                <p className="text-muted-foreground mb-4 text-sm">{room.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {room.participants}/{room.maxParticipants} participants
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {room.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mb-4">Hosted by {room.host}</p>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full"
                    onClick={() => setJoinedRoom(room.id)}
                  >
                    Join Room
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Rooms;
