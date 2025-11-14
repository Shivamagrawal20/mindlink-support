import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowLeft, Clock, Plus, Eye, Edit, Trash2, UserCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { canCreateEvents } from "@/lib/roles";
import { eventsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import CreateEventDialog from "@/components/CreateEventDialog";
import EventViewDialog from "@/components/EventViewDialog";
import EditEventDialog from "@/components/EditEventDialog";
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
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

const Events = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [rsvpStatuses, setRsvpStatuses] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("approved");

  useEffect(() => {
    loadEvents();
  }, [statusFilter, user]);

  useEffect(() => {
    if (events.length > 0 && isAuthenticated) {
      checkAllRSVPStatuses();
    }
  }, [events, isAuthenticated]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      const response = await eventsAPI.getAll(filters);
      const eventsList = response.events || response.data || [];
      setEvents(eventsList);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message || "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAllRSVPStatuses = async () => {
    if (!isAuthenticated) return;
    
    const statuses: Record<string, boolean> = {};
    await Promise.all(
      events.map(async (event) => {
        try {
          const response = await eventsAPI.checkRSVPStatus(event._id || event.id);
          statuses[event._id || event.id] = response.hasRSVP || false;
        } catch (error) {
          // Silent fail
        }
      })
    );
    setRsvpStatuses(statuses);
  };

  const handleCreateEvent = async (event: any) => {
    toast({
      title: "Event Created!",
      description: "Your event has been submitted for approval.",
    });
    loadEvents();
  };

  const handleRSVP = async (eventId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to RSVP to events",
        variant: "destructive",
      });
      return;
    }

    try {
      await eventsAPI.rsvp(eventId);
      toast({
        title: "RSVP Successful!",
        description: "You've successfully RSVP'd to this event",
      });
      setRsvpStatuses(prev => ({ ...prev, [eventId]: true }));
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Failed to RSVP",
        description: error.message || "Could not RSVP to this event",
        variant: "destructive",
      });
    }
  };

  const handleCancelRSVP = async (eventId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await eventsAPI.cancelRSVP(eventId);
      toast({
        title: "RSVP Cancelled",
        description: "You've cancelled your RSVP",
      });
      setRsvpStatuses(prev => ({ ...prev, [eventId]: false }));
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Failed to cancel RSVP",
        description: error.message || "Could not cancel RSVP",
        variant: "destructive",
      });
    }
  };

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowViewDialog(true);
  };

  const handleEditEvent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEventId(eventId);
    setShowEditDialog(true);
  };

  const handleDeleteEvent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToDelete(eventId);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await eventsAPI.delete(eventToDelete);
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully",
      });
      setEventToDelete(null);
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleEventUpdated = () => {
    loadEvents();
    setShowEditDialog(false);
    setSelectedEventId(null);
  };

  const handleEventDeleted = () => {
    loadEvents();
    setShowViewDialog(false);
    setSelectedEventId(null);
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
    return (
      <Badge variant={variants[status] || "secondary"}>{status}</Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className="capitalize">
        {category}
      </Badge>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const canCreate = isAuthenticated && canCreateEvents(user?.role || "user");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col">
      <NavBar />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-2"
            >
              Community Events
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-muted-foreground text-lg"
            >
              Discover and join community events
            </motion.p>
          </div>
          {canCreate && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => setShowCreateEvent(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                Create Event
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All Events
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "live" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("live")}
          >
            Live
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-4">
              {canCreate ? "Create the first event!" : "No events at this time."}
            </p>
            {canCreate && (
              <Button onClick={() => setShowCreateEvent(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
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
            {events.map((event) => {
              const eventId = event._id || event.id;
              const hasRSVP = rsvpStatuses[eventId] || false;
              const isEventCreator = user && (event.hostId === user.id || event.hostId?._id === user.id);
              const isAdmin = user?.role === "admin" || user?.role === "super_admin";
              const canManage = isEventCreator || isAdmin;

              return (
                <motion.div key={eventId} variants={itemVariants}>
                  <Card 
                    className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50 group h-full flex flex-col cursor-pointer"
                    onClick={() => handleViewEvent(eventId)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(event.status)}
                        {canManage && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleEditEvent(eventId, e)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={(e) => handleDeleteEvent(eventId, e)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 text-sm flex-1 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        <span>
                          {event.currentParticipants || 0}/{event.maxParticipants || 50} attendees
                          {canManage && (
                            <Badge variant="secondary" className="ml-2">
                              {event.currentParticipants || 0} RSVPs
                            </Badge>
                          )}
                        </span>
                      </div>
                      {event.hostName && (
                        <p className="text-xs text-muted-foreground">Host: {event.hostName}</p>
                      )}
                    </div>

                    <div className="flex gap-2 mb-4">
                      {getCategoryBadge(event.category)}
                      {event.type && (
                        <Badge variant="outline" className="capitalize">
                          {event.type}
                        </Badge>
                      )}
                    </div>

                    {event.status === "approved" || event.status === "live" ? (
                      <div className="flex gap-2">
                        {hasRSVP ? (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={(e) => handleCancelRSVP(eventId, e)}
                              disabled={!isAuthenticated}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Already Registered
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                            <Button
                              className="w-full"
                              onClick={(e) => handleRSVP(eventId, e)}
                              disabled={!isAuthenticated || (event.currentParticipants >= event.maxParticipants)}
                            >
                              {!isAuthenticated 
                                ? "Login to RSVP" 
                                : (event.currentParticipants >= event.maxParticipants) 
                                ? "Event Full" 
                                : "RSVP"}
                            </Button>
                          </motion.div>
                        )}
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEvent(eventId);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button className="flex-1" variant="outline" disabled>
                          {event.status === "pending" ? "Pending Approval" : event.status}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEvent(eventId);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      <CreateEventDialog
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        onSuccess={handleCreateEvent}
      />

      <EventViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        eventId={selectedEventId}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventDeleted}
      />

      <EditEventDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        eventId={selectedEventId}
        onSuccess={handleEventUpdated}
      />

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Events;
