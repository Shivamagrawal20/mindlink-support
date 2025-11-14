import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Users, Play, Pause } from "lucide-react";
import { GameType, getGameConfig } from "@/lib/games";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { gamesAPI } from "@/lib/api";
import { RTMClient } from "@/lib/rtm";
import CatchTheImposter from "./games/CatchTheImposter";

interface GameEngineProps {
  gameType: GameType;
  roomId: string;
  channelName: string;
  participants: any[];
  isHost: boolean;
}

const GameEngine = ({ gameType, roomId, channelName, participants, isHost }: GameEngineProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<'waiting' | 'starting' | 'active' | 'paused' | 'ended'>('waiting');
  const [gameData, setGameData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const rtmClientRef = useRef<RTMClient | null>(null);

  const gameConfig = getGameConfig(gameType);

  // Initialize RTM and game session
  useEffect(() => {
    if (gameType === 'none') return;

    const initializeGame = async () => {
      try {
        // Initialize RTM client
        const rtm = new RTMClient();
        await rtm.initialize(channelName, 'support-circle');
        rtmClientRef.current = rtm;

        // Listen for game messages
        rtm.on('game_action', (message) => {
          handleGameMessage(message);
        });
        rtm.on('game_state_update', (message) => {
          handleGameMessage(message);
        });

        // Create or get game session
        const sessionResponse = await gamesAPI.createSession(roomId, gameType);
        const session = sessionResponse.data;
        setSessionId(session._id);
        
        // Sync game state from backend
        if (session.status === 'active') {
          setGameState('active');
          setGameData(session.gameData || {});
        } else {
          setGameState(session.status || 'waiting');
        }
      } catch (error: any) {
        console.error('Error initializing game:', error);
        toast({
          title: "Game Initialization Error",
          description: error.message || "Failed to initialize game",
          variant: "destructive",
        });
      }
    };

    initializeGame();

    return () => {
      // Cleanup RTM on unmount
      if (rtmClientRef.current) {
        rtmClientRef.current.leave();
        rtmClientRef.current = null;
      }
    };
  }, [gameType, roomId, channelName]);

  const handleGameMessage = (message: any) => {
    if (message.data?.state) {
      setGameState(message.data.state);
    }
    if (message.data?.gameData) {
      setGameData(message.data.gameData);
    }
  };

  // Check if we have enough players
  const hasEnoughPlayers = participants.length >= gameConfig.minPlayers;
  const hasTooManyPlayers = participants.length > gameConfig.maxPlayers;

  const handleStartGame = useCallback(async () => {
    if (!hasEnoughPlayers) {
      toast({
        title: "Not Enough Players",
        description: `This game requires at least ${gameConfig.minPlayers} players`,
        variant: "destructive",
      });
      return;
    }

    if (hasTooManyPlayers) {
      toast({
        title: "Too Many Players",
        description: `This game supports up to ${gameConfig.maxPlayers} players`,
        variant: "destructive",
      });
      return;
    }

    if (!sessionId) {
      toast({
        title: "Error",
        description: "Game session not initialized",
        variant: "destructive",
      });
      return;
    }

    try {
      setGameState('starting');
      
      // Start session on backend
      await gamesAPI.startSession(sessionId);
      
      setGameState('active');
      
      // Broadcast game start via RTM
      if (rtmClientRef.current) {
        await rtmClientRef.current.sendMessage('game_state_update', {
          state: 'active',
          gameType,
        });
      }

      toast({
        title: "Game Starting!",
        description: `${gameConfig.name} is beginning...`,
      });
    } catch (error: any) {
      console.error('Error starting game:', error);
      toast({
        title: "Error Starting Game",
        description: error.message || "Failed to start game",
        variant: "destructive",
      });
      setGameState('waiting');
    }
  }, [hasEnoughPlayers, hasTooManyPlayers, gameConfig, toast, sessionId, gameType]);

  const handleEndGame = async () => {
    if (!sessionId) return;

    try {
      // End session on backend
      await gamesAPI.endSession(sessionId);
      
      setGameState('ended');
      setGameData(null);

      // Broadcast game end via RTM
      if (rtmClientRef.current) {
        await rtmClientRef.current.sendMessage('game_state_update', {
          state: 'ended',
          gameType,
        });
      }

      toast({
        title: "Game Ended",
        description: "Thanks for playing!",
      });
    } catch (error: any) {
      console.error('Error ending game:', error);
      toast({
        title: "Error",
        description: "Failed to end game properly",
        variant: "destructive",
      });
    }
  };

  // Don't render if no game is selected
  if (gameType === 'none') {
    return null;
  }

  return (
    <Card className="p-6 mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Gamepad2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              {gameConfig.emoji} {gameConfig.name}
            </h3>
            <p className="text-sm text-muted-foreground">{gameConfig.description}</p>
          </div>
        </div>
        <Badge variant={gameState === 'active' ? 'default' : 'secondary'}>
          {gameState === 'waiting' && 'Waiting'}
          {gameState === 'starting' && 'Starting...'}
          {gameState === 'active' && 'Active'}
          {gameState === 'paused' && 'Paused'}
          {gameState === 'ended' && 'Ended'}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Player Count */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {participants.length} / {gameConfig.maxPlayers} players
          </span>
          {!hasEnoughPlayers && (
            <Badge variant="outline" className="ml-2">
              Need {gameConfig.minPlayers - participants.length} more
            </Badge>
          )}
        </div>

        {/* Game Controls */}
        {gameState === 'waiting' && (
          <div className="flex gap-2">
            {isHost && (
              <Button
                onClick={handleStartGame}
                disabled={!hasEnoughPlayers || hasTooManyPlayers}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            )}
            {!isHost && (
              <div className="text-sm text-muted-foreground flex-1 text-center py-2">
                Waiting for host to start the game...
              </div>
            )}
          </div>
        )}

        {gameState === 'active' && (
          <div className="space-y-4">
            {/* Render game-specific components */}
            {gameType === 'imposter' && (
              <CatchTheImposter
                participants={participants}
                isHost={isHost}
                sessionId={sessionId}
                rtmClient={rtmClientRef.current}
                onGameAction={async (action, data) => {
                  // Handle game actions via RTM
                  if (rtmClientRef.current) {
                    await rtmClientRef.current.sendMessage('game_action', {
                      action,
                      data,
                      gameType,
                    });
                  }
                }}
              />
            )}
            
            {/* Placeholder for other games */}
            {gameType !== 'imposter' && (
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  {gameConfig.name} is in progress! Use voice chat to play.
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Game-specific UI for {gameConfig.name} will be implemented soon.
                </p>
              </div>
            )}

            {isHost && (
              <Button
                onClick={handleEndGame}
                variant="destructive"
                className="w-full"
              >
                End Game
              </Button>
            )}
          </div>
        )}

        {gameState === 'ended' && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Game has ended.</p>
            {isHost && (
              <Button onClick={() => setGameState('waiting')} variant="outline">
                Start New Game
              </Button>
            )}
          </div>
        )}

        {/* Game Instructions */}
        {gameState === 'waiting' && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p className="font-semibold mb-1">How to play:</p>
            <p>{gameConfig.description}</p>
            <p className="mt-2">
              Min players: {gameConfig.minPlayers} | Max players: {gameConfig.maxPlayers} | 
              Est. duration: {gameConfig.estimatedDuration} min
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GameEngine;

