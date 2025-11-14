import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, PhoneOff, Users, Radio, Wifi, WifiOff, Volume2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { agoraAPI } from "@/lib/api";
import AgoraRTC from "agora-rtc-sdk-ng";
import { motion } from "framer-motion";
import GameEngine from "./GameEngine";
import { GameType } from "@/lib/games";

interface VoiceRoomProps {
  circle: {
    _id?: string;
    id?: string;
    channelName: string;
    topic: string;
    description?: string;
    currentParticipants?: number;
    maxParticipants?: number;
    hostName?: string;
    hostId?: string;
    anonymousMode?: boolean;
    gameType?: GameType | string;
  };
  onLeave: () => void;
}

const VoiceRoom = ({ circle, onLeave }: VoiceRoomProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const clientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const remoteAudioTracksRef = useRef<Map<number, any>>(new Map());
  const tokenRef = useRef<string | null>(null);
  const appIdRef = useRef<string | null>(null);

  useEffect(() => {
    initializeAgora();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAgora = async () => {
    try {
      setIsLoading(true);

      // Get Agora token from backend
      const response = await agoraAPI.getToken(circle.channelName, "support-circle");
      tokenRef.current = response.token;
      appIdRef.current = response.appId;

      if (!tokenRef.current || !appIdRef.current) {
        throw new Error("Failed to get Agora credentials");
      }

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      // Set up event handlers (bound to stable callbacks)
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      client.on("user-left", handleUserLeft);
      client.on("connection-state-change", handleConnectionStateChange);
      client.on("user-joined", (user: any) => {
        console.log("✅ User joined channel:", user.uid);
      });
      
      // Also listen for users already in channel
      client.on("user-info-updated", (uid: number, msg: string) => {
        console.log("User info updated:", uid, msg);
      });

      // Join the channel
      // Use the UID from the token response (must match token)
      const uid = response.uid ? parseInt(response.uid) : null;
      
      if (!uid || isNaN(uid)) {
        throw new Error("Invalid UID received from token generation");
      }
      
      await client.join(appIdRef.current, circle.channelName, tokenRef.current, uid);
      
      console.log("✅ Joined channel:", circle.channelName, "with UID:", uid);

      // Create and publish local audio track
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "speech_standard", // Optimize for voice
      });
      localAudioTrackRef.current = localAudioTrack;
      await client.publish([localAudioTrack]);
      
      console.log("✅ Published local audio track");

      // Check for users already in the channel and subscribe to them
      const remoteUsersInChannel = client.remoteUsers || [];
      if (remoteUsersInChannel.length > 0) {
        console.log("📋 Found", remoteUsersInChannel.length, "users already in channel");
        // Subscribe to existing users' audio tracks
        for (const existingUser of remoteUsersInChannel) {
          if (existingUser.hasAudio) {
            try {
              await handleUserPublished(existingUser, "audio");
            } catch (e) {
              console.error("Error subscribing to existing user:", e);
            }
          }
        }
      }

      setIsConnected(true);
      setIsLoading(false);

      toast({
        title: "Connected!",
        description: "You're now in the voice room",
      });
    } catch (error: any) {
      console.error("Agora initialization error:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to voice room",
        variant: "destructive",
      });
      setIsLoading(false);
      // Fallback to non-voice mode
      setIsConnected(false);
    }
  };

  const handleUserPublished = useCallback(async (user: any, mediaType: string) => {
    try {
      if (mediaType === "audio") {
        console.log("🔊 User published audio:", user.uid);
        
        // Subscribe to the remote user
        await clientRef.current.subscribe(user, mediaType);
        
        // In Agora SDK v4, the audioTrack is available on the user object after subscribe
        // Wait a moment for the track to be ready
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Get the remote audio track - try multiple ways
        let remoteAudioTrack = user.audioTrack;
        
        // If not found, try getting from AgoraRTC
        if (!remoteAudioTrack && user.hasAudio) {
          // The track might be in a different property
          remoteAudioTrack = user.audioTrack || (user as any)._audioTrack;
        }
        
        if (remoteAudioTrack) {
          // Store the track reference
          remoteAudioTracksRef.current.set(user.uid, remoteAudioTrack);
          
          // Play the audio track
          try {
            await remoteAudioTrack.play();
            console.log("✅ Playing audio for user:", user.uid);
          } catch (playError: any) {
            console.error("❌ Error playing audio track:", playError);
            // Browser might require user interaction - try with delays
            const retryPlay = async (attempt: number = 1) => {
              if (attempt > 3) {
                console.error("Failed to play after 3 attempts");
                return;
              }
              await new Promise(resolve => setTimeout(resolve, 200 * attempt));
              try {
                await remoteAudioTrack.play();
                console.log("✅ Retry play succeeded (attempt", attempt, ") for user:", user.uid);
              } catch (e) {
                console.warn("Retry attempt", attempt, "failed, trying again...");
                retryPlay(attempt + 1);
              }
            };
            retryPlay();
          }
        } else {
          console.warn("⚠️ No audio track found for user:", user.uid, "User object:", user);
          // Try again after a delay - sometimes track appears later
          setTimeout(async () => {
            const delayedTrack = user.audioTrack;
            if (delayedTrack) {
              remoteAudioTracksRef.current.set(user.uid, delayedTrack);
              try {
                await delayedTrack.play();
                console.log("✅ Delayed play succeeded for user:", user.uid);
              } catch (e) {
                console.error("Delayed play failed:", e);
              }
            }
          }, 300);
        }
        
        // Update remote users list with stable state management
        setRemoteUsers((prev) => {
          const existingIndex = prev.findIndex((u) => u.uid === user.uid);
          
          if (existingIndex === -1) {
            // Add new user
            const newUser = {
              uid: user.uid,
              hasAudio: user.hasAudio !== false,
              hasVideo: user.hasVideo || false,
              joinedAt: Date.now(),
            };
            return [...prev, newUser];
          } else {
            // Update existing user - create new array with updated user
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              hasAudio: user.hasAudio !== false,
              hasVideo: user.hasVideo || false,
            };
            return updated;
          }
        });
      }
    } catch (error: any) {
      console.error("Error handling user published:", error);
      toast({
        title: "Connection Issue",
        description: `Failed to connect to user audio: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleUserUnpublished = useCallback(async (user: any, mediaType: string) => {
    try {
      if (mediaType === "audio") {
        console.log("🔇 User unpublished audio:", user.uid);
        
        // Stop and remove the audio track
        const audioTrack = remoteAudioTracksRef.current.get(user.uid);
        if (audioTrack) {
          try {
            audioTrack.stop();
          } catch (e) {
            console.error("Error stopping track:", e);
          }
          remoteAudioTracksRef.current.delete(user.uid);
        }
        
        // Don't remove from list immediately - just mark as no audio
        // Only remove if they actually leave (handleUserLeft)
        setRemoteUsers((prev) => 
          prev.map((u) => 
            u.uid === user.uid 
              ? { ...u, hasAudio: false }
              : u
          ).filter(Boolean) // Remove any null/undefined entries
        );
      }
    } catch (error) {
      console.error("Error handling user unpublished:", error);
    }
  }, []);

  const handleUserLeft = useCallback(async (user: any) => {
    try {
      console.log("👋 User left:", user.uid);
      
      // Stop and remove the audio track
      const audioTrack = remoteAudioTracksRef.current.get(user.uid);
      if (audioTrack) {
        try {
          audioTrack.stop();
        } catch (e) {
          console.error("Error stopping track:", e);
        }
        remoteAudioTracksRef.current.delete(user.uid);
      }
      
      // Remove from remote users list with stable update
      setRemoteUsers((prev) => {
        const filtered = prev.filter((u) => u && u.uid !== user.uid);
        console.log("Remote users after left:", filtered.length);
        return filtered;
      });
    } catch (error) {
      console.error("Error handling user left:", error);
    }
  }, []);

  const handleConnectionStateChange = (curState: string, revState: string) => {
    console.log("Connection state changed:", curState, revState);
    if (curState === "DISCONNECTED") {
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "You've been disconnected from the voice room",
        variant: "destructive",
      });
    }
  };

  const toggleMute = async () => {
    if (!localAudioTrackRef.current) return;

    try {
      if (isMuted) {
        await localAudioTrackRef.current.setMuted(false);
        setIsMuted(false);
      } else {
        await localAudioTrackRef.current.setMuted(true);
        setIsMuted(true);
      }
    } catch (error: any) {
      console.error("Mute toggle error:", error);
      toast({
        title: "Error",
        description: "Failed to toggle microphone",
        variant: "destructive",
      });
    }
  };

  const handleLeave = async () => {
    await cleanup();
    onLeave();
  };

  const cleanup = async () => {
    try {
      // Stop and cleanup all remote audio tracks
      remoteAudioTracksRef.current.forEach((track, uid) => {
        try {
          track.stop();
        } catch (e) {
          console.error(`Error stopping track for user ${uid}:`, e);
        }
      });
      remoteAudioTracksRef.current.clear();

      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }

      if (clientRef.current) {
        // Unpublish local tracks first
        try {
          await clientRef.current.unpublish();
        } catch (e) {
          console.error("Error unpublishing:", e);
        }
        
        // Remove all event listeners
        clientRef.current.removeAllListeners();
        
        // Leave the channel
        await clientRef.current.leave();
        clientRef.current = null;
      }

      setRemoteUsers([]);
      setIsConnected(false);
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const displayName = circle.anonymousMode
    ? `User ${remoteUsers.length + 1}`
    : user?.name || "You";

  // Check if current user is the host
  // hostId can be an ObjectId string or a populated object with _id
  const hostIdValue = typeof circle.hostId === 'object' && circle.hostId?._id 
    ? circle.hostId._id.toString() 
    : circle.hostId?.toString();
  const isHost = user?.id && hostIdValue && user.id.toString() === hostIdValue;

  // Get game type, default to 'none' if not set
  const gameType: GameType = (circle.gameType as GameType) || 'none';

  // Create participants list for game engine
  const participants = [
    { userId: user?.id, displayName },
    ...remoteUsers.map((ru, idx) => ({
      userId: ru.uid,
      displayName: circle.anonymousMode ? `User ${ru.uid}` : `User ${ru.uid}`,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 dark:via-purple-950/20 to-background flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 md:py-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="ghost"
              onClick={handleLeave}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <PhoneOff className="w-4 h-4" />
              Leave Room
            </Button>
          </motion.div>
          {isConnected && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="default" className="gap-2 px-3 py-1.5">
                <Wifi className="w-3 h-3" />
                Connected
              </Badge>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="p-6 md:p-8 lg:p-10 shadow-xl border-2">
            {/* Room Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
              >
                <Radio className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {circle.topic}
              </h2>
              {circle.description && (
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-base">
                  {circle.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    <span className="text-primary font-semibold">{remoteUsers.length + 1}</span>
                    <span className="text-muted-foreground">/{circle.maxParticipants || 15}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Game Engine */}
            {isConnected && gameType !== 'none' && (
              <GameEngine
                gameType={gameType}
                roomId={circle._id || circle.id || ''}
                channelName={circle.channelName}
                participants={participants}
                isHost={!!isHost}
              />
            )}

            {isLoading ? (
              <div className="py-16 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary mb-4"
                />
                <p className="text-muted-foreground font-medium">Connecting to voice room...</p>
              </div>
            ) : !isConnected ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                  <WifiOff className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-muted-foreground mb-6 font-medium">
                  Voice connection unavailable. You can still view the room.
                </p>
                <Button onClick={initializeAgora} size="lg">
                  Retry Connection
                </Button>
              </div>
            ) : (
              <>
                {/* Local User Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-10"
                >
                  <div className="relative max-w-xs mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl" />
                    <div className="relative bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-6 border-2 border-primary/20">
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={{
                            scale: isMuted ? 1 : [1, 1.1, 1],
                            boxShadow: isMuted
                              ? "0 0 0 0 rgba(59, 130, 246, 0)"
                              : "0 0 20px 10px rgba(59, 130, 246, 0.3)",
                          }}
                          transition={{ duration: 2, repeat: isMuted ? 0 : Infinity }}
                          className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                            isMuted
                              ? "bg-muted/50"
                              : "bg-gradient-to-br from-primary to-purple-600"
                          }`}
                        >
                          {isMuted ? (
                            <MicOff className="w-12 h-12 text-muted-foreground" />
                          ) : (
                            <Mic className="w-12 h-12 text-white" />
                          )}
                        </motion.div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-foreground mb-1">{displayName}</p>
                          <Badge variant={isMuted ? "secondary" : "default"} className="gap-1.5">
                            <Volume2 className="w-3 h-3" />
                            {isMuted ? "Muted" : "Speaking"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Remote Users */}
                {remoteUsers.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-10"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Other Participants
                        <Badge variant="secondary" className="ml-2">
                          {remoteUsers.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {remoteUsers
                        .filter((u) => u && u.uid)
                        .map((remoteUser, index) => {
                          const hasAudioTrack = remoteAudioTracksRef.current.has(remoteUser.uid);
                          const audioTrack = remoteAudioTracksRef.current.get(remoteUser.uid);
                          let isMuted = true;
                          
                          if (audioTrack) {
                            try {
                              isMuted = audioTrack.isMuted?.() ?? true;
                            } catch (e) {
                              isMuted = !remoteUser.hasAudio;
                            }
                          }
                          
                          const isSpeaking = hasAudioTrack && !isMuted && remoteUser.hasAudio;
                          const stableKey = `user-${remoteUser.uid}-${remoteUser.joinedAt || 0}`;
                          
                          return (
                            <motion.div
                              key={stableKey}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.1 * index }}
                              className="group relative"
                            >
                              <Card
                                className={`p-4 transition-all duration-300 hover:shadow-lg ${
                                  isSpeaking
                                    ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/20"
                                    : "border-border hover:border-primary/30"
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <motion.div
                                    animate={
                                      isSpeaking
                                        ? {
                                            scale: [1, 1.05, 1],
                                            boxShadow: [
                                              "0 0 0 0 rgba(59, 130, 246, 0)",
                                              "0 0 15px 5px rgba(59, 130, 246, 0.4)",
                                              "0 0 0 0 rgba(59, 130, 246, 0)",
                                            ],
                                          }
                                        : {}
                                    }
                                    transition={{ duration: 1.5, repeat: isSpeaking ? Infinity : 0 }}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                                      isSpeaking
                                        ? "bg-gradient-to-br from-primary to-purple-600"
                                        : "bg-muted/50"
                                    }`}
                                  >
                                    {hasAudioTrack && !isMuted ? (
                                      <Mic className="w-7 h-7 text-white" />
                                    ) : (
                                      <MicOff className="w-7 h-7 text-muted-foreground" />
                                    )}
                                  </motion.div>
                                  <p className="text-sm font-semibold text-center mb-2 truncate w-full">
                                    {circle.anonymousMode ? `User ${remoteUser.uid}` : `User ${remoteUser.uid}`}
                                  </p>
                                  <Badge
                                    variant={hasAudioTrack ? (isMuted ? "secondary" : "default") : "outline"}
                                    className="text-xs"
                                  >
                                    {hasAudioTrack ? (isMuted ? "Muted" : "Connected") : "Connecting..."}
                                  </Badge>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                    </div>
                  </motion.div>
                )}

                {/* Controls */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-6 pt-8 border-t border-border"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <motion.div
                      animate={
                        !isMuted
                          ? {
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }
                          : {}
                      }
                      transition={{ duration: 2, repeat: !isMuted ? Infinity : 0 }}
                      className="absolute inset-0 rounded-full bg-primary blur-2xl"
                    />
                    <Button
                      size="lg"
                      variant={isMuted ? "destructive" : "default"}
                      onClick={toggleMute}
                      className="relative h-24 w-24 rounded-full text-lg shadow-xl"
                    >
                      {isMuted ? (
                        <MicOff className="w-10 h-10" />
                      ) : (
                        <Mic className="w-10 h-10" />
                      )}
                    </Button>
                  </motion.div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {isMuted ? "Tap to unmute and speak" : "Tap to mute your microphone"}
                  </p>
                </motion.div>
              </>
            )}

            {/* Guidelines */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 pt-8 border-t border-border"
            >
              <div className="flex items-start gap-3 max-w-2xl mx-auto bg-muted/30 rounded-lg p-4">
                <div className="mt-0.5">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Remember:</span> This is a judgment-free zone.
                  Be kind, supportive, and respectful to all participants.
                </p>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VoiceRoom;

