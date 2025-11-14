import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MessageCircle,
  Plus,
  Users,
  Clock,
  ArrowLeft,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { canCreateEvents, canCreateSupportCircles } from "@/lib/roles";
import { eventsAPI, supportCirclesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import CreateEventDialog from "@/components/CreateEventDialog";
import CreateSupportCircleDialog from "@/components/CreateSupportCircleDialog";
import EventViewDialog from "@/components/EventViewDialog";
import EditEventDialog from "@/components/EditEventDialog";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { MapPin } from "lucide-react";
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

const LeaderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [myCircles, setMyCircles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's events and circles
  useEffect(() => {
    if (user && (canCreateEvents(user.role) || canCreateSupportCircles(user.role))) {
      loadMyEvents();
      loadMyCircles();
    }
  }, [user]);

  const loadMyEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsAPI.getAll();
      const allEvents = response.events || response.data || [];
      // Filter events where user is the host
      const userEvents = allEvents.filter(
        (event: any) => event.hostId === user?.id || event.hostId?._id === user?.id
      );
      setMyEvents(userEvents);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message || "Failed to load your events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyCircles = async () => {
    try {
      setIsLoading(true);
      const response = await supportCirclesAPI.getAll();
      const allCircles = response.circles || response.data || [];
      // Filter circles where user is the host
      const userCircles = allCircles.filter(
        (circle: any) => circle.hostId === user?.id || circle.hostId?._id === user?.id
      );
      setMyCircles(userCircles);
    } catch (error: any) {
      toast({
        title: "Error loading support circles",
        description: error.message || "Failed to load your support circles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (event: any) => {
    toast({
      title: "Event Created!",
      description: "Your event has been submitted for approval.",
    });
    loadMyEvents();
  };

  const handleCreateCircle = async (circle: any) => {
    toast({
      title: "Support Circle Created!",
      description: "Your support circle is now live.",
    });
    loadMyCircles();
  };

  const handleViewEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowViewDialog(true);
  };

  const handleEditEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowEditDialog(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await eventsAPI.delete(eventToDelete);
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully",
      });
      setEventToDelete(null);
      loadMyEvents();
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleEventUpdated = () => {
    loadMyEvents();
    setShowEditDialog(false);
    setSelectedEventId(null);
  };

  const handleEventDeleted = () => {
    loadMyEvents();
    setShowViewDialog(false);
    setSelectedEventId(null);
  };

  if (!user || (!canCreateEvents(user.role) && !canCreateSupportCircles(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col">
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-4xl font-bold text-foreground mb-2">Community Leader Dashboard</h1>
              <p className="text-muted-foreground">Create and manage events and support circles</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">Community Leader</Badge>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {canCreateEvents(user.role) && (
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-all"
                onClick={() => setShowCreateEvent(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">Create Event</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize community events and workshops
                    </p>
                  </div>
                  <Plus className="w-6 h-6 text-primary" />
                </div>
              </Card>
            </motion.div>
          )}

          {canCreateSupportCircles(user.role) && (
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-all"
                onClick={() => setShowCreateCircle(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">Create Support Circle</h3>
                    <p className="text-sm text-muted-foreground">
                      Start a voice room for support and connection
                    </p>
                  </div>
                  <Plus className="w-6 h-6 text-primary" />
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="circles">My Support Circles</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {myEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Events Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first community event to get started
                </p>
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Card>
            ) : (
              myEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                          <Badge
                            variant={event.status === "approved" ? "default" : "secondary"}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.currentParticipants || 0}/{event.maxParticipants || 50} participants
                            <Badge variant="secondary" className="ml-2">
                              {event.currentParticipants || 0} RSVPs
                            </Badge>
                          </div>
                        </div>
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {event.tags.map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewEvent(event._id || event.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditEvent(event._id || event.id)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteEvent(event._id || event.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="circles" className="space-y-4">
            {myCircles.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Support Circles Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first support circle to help others connect
                </p>
                <Button onClick={() => setShowCreateCircle(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Support Circle
                </Button>
              </Card>
            ) : (
              myCircles.map((circle) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{circle.topic}</h3>
                          <Badge variant="default">{circle.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {circle.participants}/{circle.maxParticipants} participants
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {circle.duration} minutes
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Room
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateEventDialog
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        onSuccess={handleCreateEvent}
      />

      <CreateSupportCircleDialog
        open={showCreateCircle}
        onOpenChange={setShowCreateCircle}
        onSuccess={handleCreateCircle}
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
            <AlertDialogAction onClick={confirmDeleteEvent} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default LeaderDashboard;


