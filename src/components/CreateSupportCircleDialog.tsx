import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { supportCirclesAPI } from "@/lib/api";
import { MessageCircle, Clock, Users, Shield, Mic, Gamepad2 } from "lucide-react";

interface CreateSupportCircleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (circle: any) => void;
}

const CreateSupportCircleDialog = ({ open, onOpenChange, onSuccess }: CreateSupportCircleDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  
  // Determine duration options based on user role
  const getDurationOptions = () => {
    const role = user?.role || 'user';
    if (role === 'admin' || role === 'super_admin') {
      // Admins: 5 to 120 minutes (custom)
      return [
        { value: '20', label: '20 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '45', label: '45 minutes' },
        { value: '60', label: '60 minutes (1 hour)' },
        { value: '90', label: '90 minutes (1.5 hours)' },
        { value: '120', label: '120 minutes (2 hours)' },
      ];
    } else if (role === 'community_leader' || role === 'moderator') {
      // Leaders/Moderators: 5 to 45 minutes
      return [
        { value: '20', label: '20 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '45', label: '45 minutes' },
      ];
    } else {
      // Regular users: 20 minutes only
      return [
        { value: '20', label: '20 minutes' },
      ];
    }
  };

  const defaultDuration = () => {
    const role = user?.role || 'user';
    if (role === 'admin' || role === 'super_admin') return '60';
    if (role === 'community_leader' || role === 'moderator') return '45';
    return '20';
  };

  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    duration: defaultDuration(),
    maxParticipants: "15",
    isPrivate: false,
    anonymousMode: true,
    aiModeration: true,
    gameType: "none",
  });

  // Reset form duration when dialog opens or user changes
  useEffect(() => {
    if (open) {
      setFormData(prev => ({ ...prev, duration: defaultDuration() }));
    }
  }, [open, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const circleData = {
        topic: formData.topic,
        description: formData.description || undefined,
        duration: parseInt(formData.duration),
        maxParticipants: parseInt(formData.maxParticipants) || 15,
        isPrivate: formData.isPrivate,
        anonymousMode: formData.anonymousMode,
        aiModeration: formData.aiModeration,
        gameType: formData.gameType,
      };

      const response = await supportCirclesAPI.create(circleData);
      const circle = response.circle || response.data || response;

      toast({
        title: "Support Circle Created!",
        description: circle.joinCode
          ? `Your support circle is now live! Share join code: ${circle.joinCode}`
          : "Your support circle is now live. Share the link to invite participants.",
        duration: 8000,
      });

      // Show join code in an alert if available
      if (circle.joinCode) {
        setTimeout(() => {
          const message = `Your Support Circle Join Code: ${circle.joinCode}\n\nShare this code with others to let them join your circle!`;
          navigator.clipboard?.writeText(circle.joinCode).then(() => {
            toast({
              title: "Join Code Copied!",
              description: `Code ${circle.joinCode} copied to clipboard`,
            });
          });
        }, 500);
      }

      setIsLoading(false);
      onOpenChange(false);
      onSuccess?.(circle);
      
      // Reset form
      setFormData({
        topic: "",
        description: "",
        duration: defaultDuration(),
        maxParticipants: "15",
        isPrivate: false,
        anonymousMode: true,
        aiModeration: true,
        gameType: "none",
      });
    } catch (error: any) {
      toast({
        title: "Error creating support circle",
        description: error.message || "Failed to create support circle",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-xl sm:text-2xl">Create Support Circle</DialogTitle>
          <DialogDescription className="text-sm">
            Start a safe, time-limited voice room for support and connection. AI moderation will help keep it safe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-6 px-6 overflow-y-auto flex-1 pr-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Circle Topic *</Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Exam Stress Support"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will this circle focus on?"
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getDurationOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="pl-10"
                  min="3"
                  max="30"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameType">Game Type (Optional)</Label>
            <div className="relative">
              <Gamepad2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Select
                value={formData.gameType}
                onValueChange={(value) => setFormData({ ...formData, gameType: value })}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select a game (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Game - Just Voice Chat</SelectItem>
                  <SelectItem value="imposter">🎭 Catch the Imposter</SelectItem>
                  <SelectItem value="mafia">🐺 Mafia / Werewolf</SelectItem>
                  <SelectItem value="spyfall">🕵️ Spyfall</SelectItem>
                  <SelectItem value="scribble-words">💬 Scribble Words</SelectItem>
                  <SelectItem value="fastest-first">⚡ Fastest First</SelectItem>
                  <SelectItem value="memory-repeat">🧠 Memory Repeat</SelectItem>
                  <SelectItem value="five-seconds">⏱️ Five Seconds Game</SelectItem>
                  <SelectItem value="truth-or-lie">🎯 Truth or Lie</SelectItem>
                  <SelectItem value="red-flag-green-flag">🚩 Red Flag / Green Flag</SelectItem>
                  <SelectItem value="emoji-sound-guess">🎵 Emoji Sound Guess</SelectItem>
                  <SelectItem value="guard-the-leader">👑 Guard the Leader</SelectItem>
                  <SelectItem value="rapid-quiz">📚 Rapid Quiz Battles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose a fun multiplayer game to play in this room. Games use voice chat and real-time messaging.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="private">Private Circle</Label>
                <p className="text-sm text-muted-foreground">
                  Only people with the link can join
                </p>
              </div>
              <Switch
                id="private"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous">Anonymous Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Hide participant identities
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={formData.anonymousMode}
                onCheckedChange={(checked) => setFormData({ ...formData, anonymousMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="aiModeration">AI Moderation</Label>
                <p className="text-sm text-muted-foreground">
                  AI will help maintain safety and order
                </p>
              </div>
              <Switch
                id="aiModeration"
                checked={formData.aiModeration}
                onCheckedChange={(checked) => setFormData({ ...formData, aiModeration: checked })}
              />
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">Safety Guidelines</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Be respectful and supportive</li>
                  <li>No judgment or criticism</li>
                  <li>Share the floor - everyone deserves to be heard</li>
                  <li>Report any concerns to moderators</li>
                </ul>
              </div>
            </div>
          </div>

          </div>
          <div className="flex gap-3 px-6 py-4 mt-auto border-t border-border bg-background flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating..." : "Create Support Circle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupportCircleDialog;

