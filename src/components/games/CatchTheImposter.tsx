import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { gamesAPI } from "@/lib/api";
import { RTMClient } from "@/lib/rtm";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface CatchTheImposterProps {
  participants: any[];
  isHost: boolean;
  sessionId: string | null;
  rtmClient: RTMClient | null;
  onGameAction?: (action: string, data?: any) => void;
}

const CatchTheImposter = ({ participants, isHost, sessionId, rtmClient, onGameAction }: CatchTheImposterProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<'setup' | 'tasks' | 'discussion' | 'voting' | 'results'>('setup');
  const [roles, setRoles] = useState<Record<string, 'imposter' | 'crewmate'>>({});
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [imposter, setImposter] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<'imposter' | 'crewmate' | null>(null);

  // Listen for RTM messages
  useEffect(() => {
    if (!rtmClient) return;

    const handleRoleAssignment = (message: any) => {
      if (message.data?.userId === user?.id) {
        setMyRole(message.data.role);
        toast({
          title: "Role Assigned!",
          description: `You are a ${message.data.role === 'imposter' ? '🎭 IMPOSTER' : '✅ CREWMATE'}`,
        });
      }
      if (message.data?.roles) {
        setRoles(message.data.roles);
      }
    };

    const handlePhaseChange = (message: any) => {
      if (message.data?.phase) {
        setPhase(message.data.phase);
      }
    };

    const handleVoteUpdate = (message: any) => {
      if (message.data?.votes) {
        setVotes(message.data.votes);
      }
    };

    rtmClient.on('assign_role', handleRoleAssignment);
    rtmClient.on('game_phase_change', handlePhaseChange);
    rtmClient.on('vote_update', handleVoteUpdate);

    return () => {
      rtmClient.off('assign_role', handleRoleAssignment);
      rtmClient.off('game_phase_change', handlePhaseChange);
      rtmClient.off('vote_update', handleVoteUpdate);
    };
  }, [rtmClient, user]);

  const assignRoles = async () => {
    if (!sessionId || !isHost) return;

    try {
      // Randomly select one imposter
      const imposterIndex = Math.floor(Math.random() * participants.length);
      const newRoles: Record<string, 'imposter' | 'crewmate'> = {};
      
      participants.forEach((p, idx) => {
        newRoles[p.userId] = idx === imposterIndex ? 'imposter' : 'crewmate';
        if (idx === imposterIndex) {
          setImposter(p.userId);
        }
      });
      
      // Save roles to backend
      await gamesAPI.assignRoles(sessionId, newRoles);
      
      setRoles(newRoles);
      setPhase('tasks');
      
      // Send roles via RTM (secret messages to each player)
      if (rtmClient) {
        for (const p of participants) {
          await rtmClient.sendDirectMessage(p.userId, 'assign_role', {
            userId: p.userId,
            role: newRoles[p.userId],
            imposterId: imposterIndex === participants.indexOf(p) ? p.userId : null,
          });
        }
      }

      // Update phase on backend
      await gamesAPI.updatePhase(sessionId, 'tasks');
      
      // Broadcast phase change
      if (rtmClient) {
        await rtmClient.sendMessage('game_phase_change', { phase: 'tasks' });
      }
    } catch (error: any) {
      console.error('Error assigning roles:', error);
      toast({
        title: "Error",
        description: "Failed to assign roles",
        variant: "destructive",
      });
    }
  };

  const handleStartDiscussion = () => {
    setPhase('discussion');
    // Start discussion timer (2 minutes)
    setTimeout(() => {
      setPhase('voting');
    }, 120000);
  };

  const handleVote = async (targetId: string) => {
    if (!sessionId || !user?.id) return;

    try {
      // Submit vote to backend
      await gamesAPI.vote(sessionId, targetId);
      
      // Update local state
      setVotes((prev) => ({ ...prev, [user.id!]: targetId }));
      
      // Broadcast vote update via RTM
      if (rtmClient) {
        await rtmClient.sendMessage('vote_update', {
          votes: { ...votes, [user.id!]: targetId },
        });
      }
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    }
  };

  const handleEndVoting = () => {
    // Count votes
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach((targetId) => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    const mostVoted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0];
    
    setPhase('results');
    
    // Reveal results
    if (mostVoted && mostVoted[0] === imposter) {
      onGameAction?.('game_result', { winner: 'crewmates', eliminated: mostVoted[0] });
    } else {
      onGameAction?.('game_result', { winner: 'imposter', eliminated: mostVoted?.[0] });
    }
  };

  const currentRole = roles[participants.find(p => p.userId)?.userId || ''] || 'crewmate';

  return (
    <Card className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg">🎭 Catch the Imposter</h4>
          <Badge>Round {round}</Badge>
        </div>

        {phase === 'setup' && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              {isHost ? 'Click to assign roles and start the game' : 'Waiting for host to start...'}
            </p>
            {isHost && (
              <Button onClick={assignRoles} disabled={participants.length < 4}>
                Assign Roles & Start
              </Button>
            )}
          </div>
        )}

        {phase === 'tasks' && (
          <div className="space-y-3">
            <div className="bg-background/50 p-3 rounded-lg">
              <p className="font-semibold mb-2">Your Role:</p>
              {myRole ? (
                <Badge variant={myRole === 'imposter' ? 'destructive' : 'default'}>
                  {myRole === 'imposter' ? '🎭 You are the IMPOSTER!' : '✅ You are a CREWMATE'}
                </Badge>
              ) : (
                <Badge variant="secondary">Waiting for role assignment...</Badge>
              )}
            </div>
            {myRole && (
              <p className="text-sm text-muted-foreground">
                {myRole === 'imposter' 
                  ? 'Your goal: Blend in and eliminate crewmates without being caught!'
                  : 'Your goal: Complete tasks and find the imposter!'}
              </p>
            )}
            {isHost && (
              <Button onClick={handleStartDiscussion} className="w-full">
                Start Discussion Phase
              </Button>
            )}
          </div>
        )}

        {phase === 'discussion' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Discussion Phase - Use voice chat to discuss!</span>
            </div>
            <p className="text-sm">
              Discuss what happened and try to identify the imposter. The host will start voting when ready.
            </p>
            {isHost && (
              <Button onClick={() => setPhase('voting')} className="w-full">
                Start Voting
              </Button>
            )}
          </div>
        )}

        {phase === 'voting' && (
          <div className="space-y-3">
            <p className="font-semibold">Vote for who you think is the imposter:</p>
            <div className="grid grid-cols-2 gap-2">
              {participants.map((p) => {
                const hasVoted = votes[user?.id || ''] === p.userId;
                return (
                  <Button
                    key={p.userId}
                    variant={hasVoted ? 'default' : 'outline'}
                    onClick={() => handleVote(p.userId)}
                    disabled={hasVoted}
                    className="text-sm"
                  >
                    {p.displayName} {hasVoted && '✓'}
                  </Button>
                );
              })}
            </div>
            {isHost && (
              <Button onClick={handleEndVoting} className="w-full" disabled={Object.keys(votes).length < participants.length}>
                End Voting ({Object.keys(votes).length}/{participants.length})
              </Button>
            )}
          </div>
        )}

        {phase === 'results' && (
          <div className="space-y-3">
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="font-bold text-lg mb-2">Game Results</p>
              <p className="text-sm text-muted-foreground">
                The imposter was: {imposter ? participants.find(p => p.userId === imposter)?.displayName : 'Unknown'}
              </p>
            </div>
            {isHost && (
              <Button onClick={() => { setRound(round + 1); setPhase('setup'); setVotes({}); }} className="w-full">
                Play Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CatchTheImposter;

