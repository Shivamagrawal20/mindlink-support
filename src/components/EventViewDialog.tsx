import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { eventsAPI } from "@/lib/api";
import { Calendar, MapPin, Clock, Users, Tag, UserCheck, Edit, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EditEventDialog from "./EditEventDialog";

interface EventViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
  onEventUpdated?: () => void;
  onEventDeleted?: () => void;
}

const EventViewDialog = ({ open, onOpenChange, eventId, onEventUpdated, onEventDeleted }: EventViewDialogProps) => {
  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRSVP, setHasRSVP] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (open && eventId) {
      loadEvent();
      if (user) {
        checkRSVPStatus();
      }
    }
  }, [open, eventId, user]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      const response = await eventsAPI.getById(eventId!);
      setEvent(response.event || response.data || response);
    } catch (error: any) {
      toast({
        title: "Error loading event",
        description: error.message || "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkRSVPStatus = async () => {
    try {
      const response = await eventsAPI.checkRSVPStatus(eventId!);
      setHasRSVP(response.hasRSVP || false);
    } catch (error) {
      // Silent fail
    }
  };

  const loadRSVPs = async () => {
    if (!user) return;
    try {
      const response = await eventsAPI.getRSVPs(eventId!);
      setRsvps(response.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading RSVPs",
        description: error.message || "Failed to load RSVPs",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    try {
      await eventsAPI.delete(eventId);
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully",
      });
      setShowDeleteConfirm(false);
      onOpenChange(false);
      setEvent(null);
      onEventDeleted?.();
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleRSVP = async () => {
    if (!eventId) return;
    try {
      await eventsAPI.rsvp(eventId);
      toast({
        title: "RSVP Successful!",
        description: "You've successfully RSVP'd to this event",
      });
      setHasRSVP(true);
      loadEvent();
      checkRSVPStatus();
    } catch (error: any) {
      toast({
        title: "Failed to RSVP",
        description: error.message || "Could not RSVP to this event",
        variant: "destructive",
      });
    }
  };

  const handleCancelRSVP = async () => {
    if (!eventId) return;
    try {
      await eventsAPI.cancelRSVP(eventId);
      toast({
        title: "RSVP Cancelled",
        description: "You've cancelled your RSVP",
      });
      setHasRSVP(false);
      loadEvent();
      checkRSVPStatus();
    } catch (error: any) {
      toast({
        title: "Failed to cancel RSVP",
        description: error.message || "Could not cancel RSVP",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      live: "default",
      finished: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const isEventCreator = event && user && (event.hostId === user.id || event.hostId?._id === user.id);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const canManage = isEventCreator || isAdmin;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{event?.title || "Event Details"}</DialogTitle>
                <DialogDescription>
                  {event && getStatusBadge(event.status)}
                </DialogDescription>
              </div>
              {event && canManage && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {!event && !isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Event not found</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading event details...</p>
            </div>
          ) : (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                {event && canManage && (
                  <TabsTrigger value="rsvps" onClick={loadRSVPs}>
                    RSVPs ({event.currentParticipants || 0})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <Card className="p-6">
                  <p className="text-muted-foreground mb-4">{event?.description || ""}</p>

                  {event && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span>
                            {event.currentParticipants || 0}/{event.maxParticipants || 50} attendees
                          </span>
                        </div>
                        {event.hostName && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Host: {event.hostName}</span>
                          </div>
                        )}
                      </div>

                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {event.tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      )}

                      {(event.status === "approved" || event.status === "live") && user && !isEventCreator && (
                    <div className="mt-6 pt-4 border-t border-border">
                      {hasRSVP ? (
                        <Button variant="outline" className="w-full" onClick={handleCancelRSVP}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Already Registered - Cancel RSVP
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={handleRSVP} disabled={event.currentParticipants >= event.maxParticipants}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          {event.currentParticipants >= event.maxParticipants ? "Event Full" : "RSVP to Event"}
                        </Button>
                      )}
                    </div>
                      )}
                    </>
                  )}
                </Card>
              </TabsContent>

              {event && canManage && (
                <TabsContent value="rsvps" className="mt-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Registered Attendees</h3>
                      <Badge variant="secondary">{rsvps.length} RSVPs</Badge>
                    </div>
                    {rsvps.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No RSVPs yet</p>
                    ) : (
                      <div className="space-y-2">
                        {rsvps.map((rsvp: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">
                                {rsvp.userId?.name || rsvp.userId?.email || "Anonymous User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                RSVP'd {new Date(rsvp.rsvpAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditEventDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        eventId={eventId}
        onSuccess={() => {
          setShowEditDialog(false);
          loadEvent();
          onEventUpdated?.();
        }}
      />
    </>
  );
};

export default EventViewDialog;

