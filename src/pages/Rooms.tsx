import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Globe, Plus, ArrowLeft, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { canCreateSupportCircles } from "@/lib/roles";
import { supportCirclesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import CreateSupportCircleDialog from "@/components/CreateSupportCircleDialog";
import JoinByCodeDialog from "@/components/JoinByCodeDialog";
import VoiceRoom from "@/components/VoiceRoom";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { getGameDisplayName } from "@/lib/games";

const Rooms = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [showJoinByCode, setShowJoinByCode] = useState(false);
  const [userHasActiveCircle, setUserHasActiveCircle] = useState(false);
  const [fetchingRoom, setFetchingRoom] = useState<string | null>(null);

  // Load support circles
  useEffect(() => {
    loadRooms();
    checkUserActiveCircle();
  }, [user]);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const response = await supportCirclesAPI.getAll({ status: "active" });
      // Backend returns { success: true, data: [...] }
      const circles = response.data || response.circles || [];
      // Backend now handles including private circles for authenticated users
      setRooms(circles);
    } catch (error: any) {
      toast({
        title: "Error loading rooms",
        description: error.message || "Failed to load support circles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserActiveCircle = async () => {
    if (!user) return;
    try {
      const response = await supportCirclesAPI.getAll();
      // Backend returns { success: true, data: [...] }
      const allCircles = response.data || response.circles || [];
      const userCircle = allCircles.find(
        (circle: any) => {
          const hostId = circle.hostId?._id || circle.hostId || circle.host;
          return (hostId === user.id || hostId?.toString() === user.id?.toString()) &&
            (circle.status === "active" || circle.status === "scheduled");
        }
      );
      setUserHasActiveCircle(!!userCircle);
    } catch (error) {
      // Silent fail - just don't set the flag
    }
  };

  const handleCreateCircle = async (circle: any) => {
    const newRoom = circle.circle || circle.data || circle;
    const circleId = newRoom._id || newRoom.id;
    
    toast({
      title: "Support Circle Created!",
      description: newRoom.joinCode
        ? `Share join code: ${newRoom.joinCode}`
        : "Your support circle is now live!",
      duration: 8000,
    });
    
    // Immediately add the created room to the list
    if (circleId) {
      // Add the room to state immediately (even if incomplete)
      setRooms((prevRooms) => {
        const exists = prevRooms.some(
          (r: any) => (r._id || r.id) === circleId
        );
        if (!exists) {
          return [newRoom, ...prevRooms];
        }
        // Update if exists
        return prevRooms.map((r: any) => 
          (r._id || r.id) === circleId ? newRoom : r
        );
      });

      // Fetch full details to ensure all fields are populated (in background)
      try {
        const fullCircle = await supportCirclesAPI.getById(circleId);
        const roomData = fullCircle.circle || fullCircle.data || fullCircle;
        
        if (roomData) {
          // Update with full data
          setRooms((prevRooms) => {
            return prevRooms.map((r: any) => 
              (r._id || r.id) === (roomData._id || roomData.id) ? roomData : r
            );
          });
        }
      } catch (error: any) {
        console.error('Error fetching created room details:', error);
        // Room already added, so continue
      }
    }
    
    // Reload rooms to ensure we have the latest data (including private circles)
    await loadRooms();
    checkUserActiveCircle();
  };

  const handleJoin = async (roomId: string, isPrivate: boolean = false) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to join a support circle",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await supportCirclesAPI.join(roomId);
      const message = response.message || "You've joined the support circle";
      toast({
        title: message.includes("Re-joined") ? "Re-joined!" : "Joined Successfully!",
        description: message.includes("Re-joined") 
          ? "Welcome back to the support circle" 
          : message,
      });
      setJoinedRoom(roomId);
      loadRooms();
    } catch (error: any) {
      if (error.message?.includes("code") || isPrivate) {
        toast({
          title: "Private Circle",
          description: "This circle requires a join code",
          variant: "destructive",
        });
      } else if (error.message?.includes("Already joined")) {
        // Allow re-joining even if backend says already joined
        toast({
          title: "Re-joining Room",
          description: "Entering the voice room...",
        });
        setJoinedRoom(roomId);
        loadRooms();
      } else {
        toast({
          title: "Failed to Join",
          description: error.message || "Could not join the circle",
          variant: "destructive",
        });
      }
    }
  };

  const handleLeaveRoom = () => {
    setJoinedRoom(null);
    loadRooms();
  };

  const handleJoinByCode = async (circle: any) => {
    const circleId = circle._id || circle.id;
    if (!circleId) {
      toast({
        title: "Error",
        description: "Invalid circle data",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure we have the full circle data by fetching it
      const fullCircle = await supportCirclesAPI.getById(circleId);
      const roomData = fullCircle.circle || fullCircle.data || fullCircle;

      // Add to rooms list if not already present
      setRooms((prevRooms) => {
        const exists = prevRooms.some(
          (r: any) => (r._id || r.id) === (roomData._id || roomData.id)
        );
        if (!exists) {
          return [roomData, ...prevRooms];
        }
        // Update existing room
        return prevRooms.map((r: any) => 
          (r._id || r.id) === (roomData._id || roomData.id) ? roomData : r
        );
      });

      toast({
        title: "Joined Successfully!",
        description: `You've joined "${roomData.topic || circle.topic}"`,
      });

      // Set joined room after ensuring it's in the state
      setJoinedRoom(circleId);
      
      // Reload rooms in background to ensure we have latest data
      loadRooms();
    } catch (error: any) {
      console.error('Error fetching circle after join:', error);
      // Still try to set joined room with the data we have
      setRooms((prevRooms) => {
        const exists = prevRooms.some(
          (r: any) => (r._id || r.id) === circleId
        );
        if (!exists) {
          return [circle, ...prevRooms];
        }
        return prevRooms;
      });
      setJoinedRoom(circleId);
      loadRooms();
    }
  };

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

  // Fetch room if not found in state
  useEffect(() => {
    if (joinedRoom && !rooms.find((r: any) => (r._id || r.id) === joinedRoom) && !fetchingRoom) {
      setFetchingRoom(joinedRoom);
      const fetchRoom = async () => {
        try {
          const fullCircle = await supportCirclesAPI.getById(joinedRoom);
          const roomData = fullCircle.circle || fullCircle.data || fullCircle;
          if (roomData) {
            setRooms((prevRooms) => {
              const exists = prevRooms.some(
                (r: any) => (r._id || r.id) === (roomData._id || roomData.id)
              );
              if (!exists) {
                return [roomData, ...prevRooms];
              }
              return prevRooms.map((r: any) => 
                (r._id || r.id) === (roomData._id || roomData.id) ? roomData : r
              );
            });
            setFetchingRoom(null);
          } else {
            // If still not found, go back
            setFetchingRoom(null);
            setJoinedRoom(null);
            toast({
              title: "Room Not Found",
              description: "The room may have been closed or doesn't exist",
              variant: "destructive",
            });
          }
        } catch (error) {
          // If fetch fails, go back
          setFetchingRoom(null);
          setJoinedRoom(null);
          toast({
            title: "Room Not Found",
            description: "The room may have been closed or doesn't exist",
            variant: "destructive",
          });
        }
      };
      fetchRoom();
    }
  }, [joinedRoom, rooms, fetchingRoom, toast]);

  if (joinedRoom) {
    const room = rooms.find((r: any) => (r._id || r.id) === joinedRoom);
    if (!room && fetchingRoom === joinedRoom) {
      // Show loading state while fetching
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Loading room...</p>
            <Button onClick={handleLeaveRoom}>Go Back</Button>
          </Card>
        </div>
      );
    }
    if (!room && fetchingRoom !== joinedRoom) {
      // Room not found and not fetching - show error
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Room not found</p>
            <Button onClick={handleLeaveRoom}>Go Back</Button>
          </Card>
        </div>
      );
    }
    if (room) {
      return <VoiceRoom circle={room} onLeave={handleLeaveRoom} />;
    }
  }

  const canCreate = isAuthenticated && canCreateSupportCircles(user?.role || "user");
  const showCreateButton = canCreate && !userHasActiveCircle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col">
      <NavBar />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              Voice Support Circles
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-muted-foreground mt-2 text-lg"
            >
              Join a voice room and connect with others
            </motion.p>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowJoinByCode(true)}
                  className="gap-2"
                >
                  <Key className="w-5 h-5" />
                  Join by Code
                </Button>
              </motion.div>
            )}
            {showCreateButton && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" onClick={() => setShowCreateCircle(true)} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Room
                </Button>
              </motion.div>
            )}
            {userHasActiveCircle && (
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                You have an active circle
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading support circles...</p>
          </div>
        ) : rooms.length === 0 ? (
          <Card className="p-12 text-center">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Circles</h3>
            <p className="text-muted-foreground mb-4">
              {canCreate ? "Create the first support circle!" : "Be the first to create one!"}
            </p>
            {showCreateButton && (
              <Button onClick={() => setShowCreateCircle(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Support Circle
              </Button>
            )}
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {rooms.map((room: any) => (
              <motion.div
                key={room._id || room.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50 group">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
                      {room.topic}
                    </h3>
                    {room.isPrivate ? (
                      <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                    ) : (
                      <Globe className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {room.description && (
                    <p className="text-muted-foreground mb-4 text-sm">{room.description}</p>
                  )}

                  {room.gameType && room.gameType !== 'none' && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs">
                        {getGameDisplayName(room.gameType)}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {room.currentParticipants || 0}/{room.maxParticipants || 15} participants
                    </span>
                  </div>

                  {room.hostName && (
                    <p className="text-xs text-muted-foreground mb-4">Hosted by {room.hostName}</p>
                  )}

                  {room.joinCode && user && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
                      <Key className="w-4 h-4 text-primary" />
                      <span className="text-xs font-mono font-semibold">{room.joinCode}</span>
                      <Badge variant="secondary" className="text-xs">Join Code</Badge>
                    </div>
                  )}

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="w-full"
                      onClick={() => handleJoin(room._id || room.id, room.isPrivate)}
                      disabled={!isAuthenticated}
                      variant={
                        user && room.participants?.some(
                          (p: any) => p.userId === user.id || p.userId?._id === user.id
                        )
                          ? "outline"
                          : "default"
                      }
                    >
                      {!isAuthenticated 
                        ? "Login to Join" 
                        : (user && room.participants?.some(
                            (p: any) => p.userId === user.id || p.userId?._id === user.id
                          ))
                        ? "Re-join Room"
                        : "Join Room"}
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <CreateSupportCircleDialog
        open={showCreateCircle}
        onOpenChange={setShowCreateCircle}
        onSuccess={handleCreateCircle}
      />

      <JoinByCodeDialog
        open={showJoinByCode}
        onOpenChange={setShowJoinByCode}
        onSuccess={handleJoinByCode}
      />

      <Footer />
    </div>
  );
};

export default Rooms;
