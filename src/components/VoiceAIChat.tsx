import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, PhoneOff, Volume2, ArrowLeft, Sparkles, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { agoraAPI } from "@/lib/api";
import { chatAPI } from "@/lib/api";
import AgoraRTC from "agora-rtc-sdk-ng";
import { checkMessageSafety } from "@/lib/safety";

interface VoiceAIChatProps {
  onBack: () => void;
  moodContext?: {
    todayMood?: {
      score: number;
      emoji: string;
      reflection?: string;
    };
    trend?: {
      direction: string;
      recentTrend: string;
      average: string;
    };
  };
}

const VoiceAIChat = ({ onBack, moodContext }: VoiceAIChatProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const clientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'assistant', content: string }>>([]);

  // STT: Web Speech API for speech recognition
  useEffect(() => {
    // Check browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          handleUserSpeech(finalTranscript.trim());
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: event.error === 'no-speech' 
            ? "No speech detected. Please try again." 
            : "Could not process speech. Please check your microphone.",
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        if (isListening) {
          // Auto-restart if still listening
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    // TTS: Web Speech Synthesis API
    synthesisRef.current = window.speechSynthesis;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [isListening]);

  // Initialize Agora RTC
  useEffect(() => {
    initializeAgora();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAgora = async () => {
    try {
      setIsLoading(true);
      
      // Clean up any existing connection first (only if client exists)
      const existingClient = clientRef.current;
      if (existingClient) {
        try {
          // Unpublish tracks first
          const tracks = await existingClient.getLocalAudioTracks();
          if (tracks && tracks.length > 0) {
            await existingClient.unpublish(tracks);
          }
          await existingClient.leave();
          existingClient.removeAllListeners();
        } catch (e) {
          // Ignore - might already be disconnected
        }
        clientRef.current = null;
      }
      if (localAudioTrackRef.current) {
        try {
          localAudioTrackRef.current.stop();
          localAudioTrackRef.current.close();
        } catch (e) {
          // Ignore
        }
        localAudioTrackRef.current = null;
      }
      // Note: No bot audio track to clean up (we use Web Speech Synthesis instead)
      
      // Create a unique channel name for AI voice chat
      const channelName = `ai-voice-${user?.id || 'user'}`;
      
      // Get Agora token for AI voice chat
      const response = await agoraAPI.getToken(channelName, "ai-voice");
      
      if (!response.token || !response.appId) {
        throw new Error("Failed to get Agora credentials");
      }

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      // Join the channel
      // For AI voice chat, use auto-assigned UID (null) to avoid conflicts
      const uid = response.autoUid ? null : (response.uid ? parseInt(response.uid) : null);
      
      // Join with auto-assigned UID (null) or specific UID
      const actualUid = await client.join(response.appId, channelName, response.token, uid);
      console.log("✅ Joined AI voice chat channel with UID:", actualUid);

      // Create and publish local audio track (user's microphone)
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "speech_standard",
      });
      localAudioTrackRef.current = localAudioTrack;
      await client.publish([localAudioTrack]);
      
      // Note: We don't publish bot audio track to Agora because:
      // 1. AI voice is played via Web Speech Synthesis API (browser-native TTS)
      // 2. This is a 1-on-1 conversation, so we don't need Agora for AI audio
      // 3. Bot audio tracks are complex and not needed for this use case

      setIsConnected(true);
      setIsLoading(false);

      // Load initial AI context
      loadAIContext();

      toast({
        title: "Connected!",
        description: "You're now in voice AI chat. Press and hold the mic button to speak.",
      });
    } catch (error: any) {
      console.error("Agora initialization error:", error);
      
      // Cleanup on error
      try {
        if (clientRef.current) {
          await clientRef.current.leave().catch(() => {});
          clientRef.current.removeAllListeners();
          clientRef.current = null;
        }
        if (localAudioTrackRef.current) {
          localAudioTrackRef.current.stop().catch(() => {});
          localAudioTrackRef.current.close().catch(() => {});
          localAudioTrackRef.current = null;
        }
      } catch (cleanupError) {
        console.warn("Error during cleanup:", cleanupError);
      }
      
      // Extract error message safely
      let errorMessage = "Failed to connect to voice AI chat";
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          if (error.message) {
            errorMessage = error.message;
          } else if (error.toString && typeof error.toString === 'function') {
            try {
              errorMessage = error.toString();
            } catch {
              errorMessage = "Unknown error occurred";
            }
          }
        }
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      setIsConnected(false);
    }
  };

  const loadAIContext = async () => {
    try {
      const response = await chatAPI.getContext();
      if (response.success && response.data) {
        // Store conversation ID if provided
        if (response.data.conversationId) {
          setConversationId(response.data.conversationId);
        }
        
        // Optionally speak the initial greeting
        if (response.data.initialMessage) {
          speakAIResponse(response.data.initialMessage);
        }
      }
    } catch (error) {
      console.error('Error loading AI context:', error);
    }
  };

  const handleUserSpeech = async (text: string) => {
    if (!text.trim()) return;

    console.log("🎤 User said:", text);
    
    // Safety check
    const safetyCheck = checkMessageSafety(text);
    if (!safetyCheck.isSafe) {
      toast({
        title: "Safety Warning",
        description: safetyCheck.message,
        variant: "destructive",
      });
      return;
    }

    // Add to conversation history
    conversationHistoryRef.current.push({ role: 'user', content: text });
    
    // Send to AI chat API (mark as voice message, use 8B model for faster responses)
    try {
      const response = await chatAPI.sendMessage(text, conversationId || undefined, 'voice', '8b');
      
      if (response.success && response.data) {
        const aiText = response.data.message;
        console.log("🤖 AI responded:", aiText);
        
        // Add to conversation history
        conversationHistoryRef.current.push({ role: 'assistant', content: aiText });
        
        // Store conversation ID
        if (response.data.conversationId && !conversationId) {
          setConversationId(response.data.conversationId);
        }
        
        // Speak AI response using TTS
        speakAIResponse(aiText);
        
        setAiResponse(aiText);
        
        // Clear after 5 seconds
        setTimeout(() => {
          setAiResponse(null);
        }, 5000);
      }
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      const fallbackResponse = "I'm sorry, I couldn't process that. Could you try again?";
      speakAIResponse(fallbackResponse);
      setAiResponse(fallbackResponse);
    }
  };

  const speakAIResponse = (text: string) => {
    if (!synthesisRef.current) return;

    // Cancel any ongoing speech
    synthesisRef.current.cancel();
    
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to find a pleasant voice
    const voices = synthesisRef.current.getVoices();
    const preferredVoices = voices.filter((v: any) => 
      v.name.includes('Samantha') || 
      v.name.includes('Alex') || 
      v.name.includes('Google') ||
      v.lang.startsWith('en')
    );
    
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0];
    }
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('TTS error:', event);
      setIsSpeaking(false);
    };
    
    synthesisRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not available in your browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error: any) {
      console.error('Error starting recognition:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // If we have a transcript, process it
    if (transcript.trim()) {
      handleUserSpeech(transcript.trim());
      setTranscript("");
    }
  };

  const cleanup = async () => {
    setIsListening(false);
    setIsConnected(false);
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }
    
    // Stop speech synthesis
    if (synthesisRef.current) {
      try {
        synthesisRef.current.cancel();
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Cleanup Agora tracks and client
    try {
      // Unpublish and close local audio track
      if (localAudioTrackRef.current) {
        try {
          await localAudioTrackRef.current.stop();
          localAudioTrackRef.current.close();
        } catch (e) {
          console.warn("Error closing local audio track:", e);
        }
        localAudioTrackRef.current = null;
      }
      
      // Note: No bot audio track to clean up (we use Web Speech Synthesis instead)
      
      // Leave channel and cleanup client
      if (clientRef.current) {
        try {
          // Unpublish all tracks first
          const tracks = await clientRef.current.getLocalAudioTracks();
          if (tracks && tracks.length > 0) {
            await clientRef.current.unpublish(tracks);
          }
          
          // Leave the channel
          await clientRef.current.leave();
          
          // Remove all event listeners
          clientRef.current.removeAllListeners();
        } catch (error) {
          console.error("Error during Agora cleanup:", error);
        } finally {
          clientRef.current = null;
        }
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const handleLeave = async () => {
    await cleanup();
    onBack();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card/80 backdrop-blur-lg border-b border-border px-4 py-4 shadow-soft sticky top-0 z-50 flex-shrink-0"
      >
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleLeave} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">MindLink AI Voice</h1>
                <p className="text-xs text-muted-foreground">Talk naturally with AI</p>
              </div>
            </div>
          </div>
          
          {isConnected && (
            <Badge variant="default" className="gap-2">
              <Wifi className="w-3 h-3" />
              Connected
            </Badge>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
        <div className="container mx-auto max-w-4xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"
                />
                <p className="text-muted-foreground">Connecting to voice AI...</p>
              </motion.div>
            </div>
          ) : !isConnected ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <WifiOff className="w-16 h-16 text-destructive mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Connection failed</p>
                <Button onClick={initializeAgora}>Retry Connection</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Instructions */}
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-2">How to use:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Press and hold the microphone button to speak</li>
                  <li>Release to send your message</li>
                  <li>AI will respond with voice automatically</li>
                  <li>Have a natural conversation!</li>
                </ul>
              </Card>

              {/* Transcript Display */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <Card className="px-4 py-3 bg-primary text-primary-foreground rounded-2xl rounded-tr-sm max-w-[80%]">
                    <p className="text-sm">{transcript}</p>
                  </Card>
                </motion.div>
              )}

              {/* AI Response Display */}
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <Card className="px-4 py-3 bg-card border-2 border-border rounded-2xl rounded-tl-sm max-w-[80%]">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{aiResponse}</p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="bg-card/80 backdrop-blur-lg border-t border-border px-4 py-6 shadow-soft sticky bottom-0 flex-shrink-0">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-4">
            {/* Main Mic Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <motion.div
                animate={
                  isListening
                    ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }
                    : isSpeaking
                    ? {
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary blur-2xl"
              />
              <Button
                size="lg"
                variant={isListening ? "destructive" : isSpeaking ? "default" : "default"}
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startListening();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopListening();
                }}
                disabled={!isConnected || isSpeaking}
                className="relative h-20 w-20 rounded-full text-lg shadow-xl"
              >
                {isListening ? (
                  <MicOff className="w-10 h-10" />
                ) : isSpeaking ? (
                  <Volume2 className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </Button>
            </motion.div>

            <p className="text-sm text-muted-foreground text-center">
              {isListening
                ? "Listening... Release to send"
                : isSpeaking
                ? "AI is speaking..."
                : "Hold to speak"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAIChat;

