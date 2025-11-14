import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { eventsAPI } from "@/lib/api";
import { Calendar, MapPin, Clock, Users, Tag } from "lucide-react";

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
  onSuccess?: () => void;
}

const EditEventDialog = ({ open, onOpenChange, eventId, onSuccess }: EditEventDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "offline" as "offline" | "online" | "hybrid",
    category: "wellness" as "wellness" | "civic" | "learning" | "support" | "general",
    maxParticipants: "50",
    tags: "",
  });

  useEffect(() => {
    if (open && eventId) {
      loadEvent();
    }
  }, [open, eventId]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      const response = await eventsAPI.getById(eventId!);
      const event = response.event || response.data || response;
      
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().split('T')[0];

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: formattedDate,
        time: event.time || "",
        location: event.location || "",
        type: event.type || "offline",
        category: event.category || "wellness",
        maxParticipants: (event.maxParticipants || 50).toString(),
        tags: event.tags ? (Array.isArray(event.tags) ? event.tags.join(", ") : event.tags) : "",
      });
    } catch (error: any) {
      toast({
        title: "Error loading event",
        description: error.message || "Failed to load event details",
        variant: "destructive",
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        type: formData.type,
        category: formData.category,
        maxParticipants: parseInt(formData.maxParticipants) || 50,
        tags: tagsArray.join(","),
      };

      await eventsAPI.update(eventId!, eventData);

      toast({
        title: "Event Updated!",
        description: "Your event has been updated successfully.",
      });

      setIsLoading(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error updating event",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Event</DialogTitle>
          <DialogDescription>
            Update the details of your event
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Event Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Campus Wellness Workshop"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time">Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="edit-time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Central Park or 'Online Voice Room'"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Event Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "offline" | "online" | "hybrid") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Offline Event</SelectItem>
                    <SelectItem value="online">Online Voice Room</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "wellness" | "civic" | "learning" | "support" | "general") => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="civic">Civic Engagement</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="support">Support Group</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-maxParticipants">Max Participants</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  className="pl-10"
                  min="1"
                  max="500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., anxiety, stress, students"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Updating..." : "Update Event"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;

