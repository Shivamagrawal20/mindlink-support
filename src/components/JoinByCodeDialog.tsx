import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supportCirclesAPI } from "@/lib/api";
import { Key } from "lucide-react";

interface JoinByCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (circle: any) => void;
}

const JoinByCodeDialog = ({ open, onOpenChange, onSuccess }: JoinByCodeDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode || joinCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit join code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await supportCirclesAPI.joinByCode(joinCode);
      const circle = response.circle || response.data || response;
      const message = response.message || "You've joined";

      toast({
        title: message.includes("Re-joined") ? "Re-joined!" : "Joined Successfully!",
        description: message.includes("Re-joined")
          ? `Welcome back to "${circle.topic}"`
          : `You've joined "${circle.topic}"`,
      });

      setIsLoading(false);
      onOpenChange(false);
      setJoinCode("");
      onSuccess?.(circle);
    } catch (error: any) {
      if (error.message?.includes("Already joined")) {
        // Allow re-joining even if backend says already joined
        const codeToSearch = joinCode;
        toast({
          title: "Re-joining Room",
          description: "Entering the voice room...",
        });
        setIsLoading(false);
        onOpenChange(false);
        // Try to get circle data anyway
        try {
          const response = await supportCirclesAPI.getAll();
          const circles = response.circles || response.data || [];
          const circle = circles.find((c: any) => c.joinCode === codeToSearch);
          if (circle) {
            onSuccess?.(circle);
          }
        } catch (e) {
          // Silent fail
        }
        setJoinCode("");
      } else {
        toast({
          title: "Failed to Join",
          description: error.message || "Invalid or expired join code",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Key className="w-6 h-6 text-primary" />
            Join by Code
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit code to join a support circle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="joinCode">Join Code</Label>
            <Input
              id="joinCode"
              value={joinCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setJoinCode(value);
              }}
              placeholder="123456"
              className="text-2xl text-center font-mono tracking-widest"
              maxLength={6}
              required
            />
            <p className="text-xs text-muted-foreground text-center">
              Enter the 6-digit code shared by the circle host
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setJoinCode("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || joinCode.length !== 6} className="flex-1">
              {isLoading ? "Joining..." : "Join Circle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinByCodeDialog;

