import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import NavBar from "@/components/NavBar";
import {
  Users,
  Calendar,
  MessageCircle,
  Shield,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Settings,
  BarChart3,
  Ban,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Eye,
  Edit,
  Trash2,
  X,
  PowerOff,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/lib/roles";
import { eventsAPI, supportCirclesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import CreateEventDialog from "./CreateEventDialog";
import CreateSupportCircleDialog from "./CreateSupportCircleDialog";
import EventViewDialog from "./EventViewDialog";
import EditEventDialog from "./EditEventDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const AdminDashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [events, setEvents] = useState<any[]>([]);
  const [supportCircles, setSupportCircles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRooms: 0,
    pendingEvents: 0,
    flaggedContent: 0,
    communityLeaders: 0,
    totalEvents: 0,
  });

  // Load events
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      const response = await eventsAPI.getAll(filters);
      setEvents(response.events || response.data || []);
      
      // Update stats
      const allEvents = await eventsAPI.getAll();
      const allEventsList = allEvents.events || allEvents.data || [];
      setStats(prev => ({
        ...prev,
        totalEvents: allEventsList.length,
        pendingEvents: allEventsList.filter((e: any) => e.status === 'pending').length,
      }));
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

  // Load support circles
  const loadSupportCircles = async () => {
    try {
      setIsLoading(true);
      // For admin dashboard, we want to see ALL circles including private ones
      // Don't send status filter if "all" - backend will handle it
      const filters: any = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      // Note: Backend automatically includes all private circles for admins
      const response = await supportCirclesAPI.getAll(filters);
      // Backend returns { success: true, data: [...] }
      const circles = response.data || response.circles || [];
      console.log('Admin loaded circles:', circles.length, 'circles'); // Debug log
      setSupportCircles(circles);
      
      // Update stats - get all circles without status filter for accurate count
      const allCirclesResponse = await supportCirclesAPI.getAll({});
      const allCirclesList = allCirclesResponse.data || allCirclesResponse.circles || [];
      setStats(prev => ({
        ...prev,
        activeRooms: allCirclesList.filter((c: any) => c.status === 'active').length,
      }));
    } catch (error: any) {
      console.error('Error loading support circles:', error);
      toast({
        title: "Error loading support circles",
        description: error.message || "Failed to load support circles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      loadEvents();
      loadSupportCircles();
    }
  }, [user, statusFilter]);

  const handleApproveEvent = async (eventId: string) => {
    try {
      await eventsAPI.approve(eventId);
      toast({
        title: "Event Approved",
        description: "The event has been approved and is now visible.",
      });
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Error approving event",
        description: error.message || "Failed to approve event",
        variant: "destructive",
      });
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      await eventsAPI.reject(eventId);
      toast({
        title: "Event Rejected",
        description: "The event has been rejected.",
      });
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Error rejecting event",
        description: error.message || "Failed to reject event",
        variant: "destructive",
      });
    }
  };

  const handleCreateEvent = async (event: any) => {
    try {
      await eventsAPI.create(event);
      toast({
        title: "Event Created",
        description: "Event created successfully and is now active.",
      });
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Error creating event",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleCreateCircle = async (circle: any) => {
    try {
      await supportCirclesAPI.create(circle);
      toast({
        title: "Support Circle Created",
        description: "Support circle created successfully.",
      });
      loadSupportCircles();
    } catch (error: any) {
      toast({
        title: "Error creating support circle",
        description: error.message || "Failed to create support circle",
        variant: "destructive",
      });
    }
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

  // Handle close support circle
  const handleCloseRoom = async (circleId: string) => {
    try {
      await supportCirclesAPI.end(circleId);
      toast({
        title: "Room Closed",
        description: "Support circle has been closed successfully",
      });
      loadSupportCircles();
    } catch (error: any) {
      toast({
        title: "Error closing room",
        description: error.message || "Failed to close support circle",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.hostName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCircles = supportCircles.filter((circle) =>
    circle.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    circle.hostName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      active: "default",
      ended: "secondary",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>{status}</Badge>
    );
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, events, and system settings</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {user.role === "super_admin" ? "Super Admin" : "Admin"}
            </Badge>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-primary" />
                <TrendingUp className="w-5 h-5 text-mood-positive" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-8 h-8 text-primary" />
                <TrendingUp className="w-5 h-5 text-mood-positive" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.activeRooms}</p>
              <p className="text-sm text-muted-foreground">Active Rooms</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-primary" />
                <AlertTriangle className="w-5 h-5 text-mood-negative" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.pendingEvents}</p>
              <p className="text-sm text-muted-foreground">Pending Events</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-primary" />
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalEvents}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.flaggedContent}</p>
              <p className="text-sm text-muted-foreground">Flagged Content</p>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="circles">Support Circles</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Pending Event Approvals
                </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTab("events");
                      setStatusFilter("pending");
                    }}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {events
                    .filter((e) => e.status === "pending")
                    .slice(0, 5)
                    .map((event) => (
                    <div
                        key={event._id || event.id}
                      className="p-4 border border-border rounded-lg flex items-center justify-between"
                    >
                        <div className="flex-1">
                        <p className="font-semibold text-foreground">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Host: {event.hostName || "Unknown"} • {event.date}
                        </p>
                      </div>
                      <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveEvent(event._id || event.id)}
                          >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectEvent(event._id || event.id)}
                          >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {events.filter((e) => e.status === "pending").length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No pending events</p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Active Support Circles
                </h3>
                <div className="space-y-4">
                  {supportCircles
                    .filter((c) => c.status === "active")
                    .slice(0, 5)
                    .map((circle) => (
                      <div
                        key={circle._id || circle.id}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-foreground">{circle.topic}</p>
                          {getStatusBadge(circle.status)}
                      </div>
                        <p className="text-sm text-muted-foreground">
                          Participants: {circle.currentParticipants || 0}/{circle.maxParticipants || 15}
                        </p>
                    </div>
                  ))}
                  {supportCircles.filter((c) => c.status === "active").length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No active support circles</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">All Events</h3>
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Events List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No events found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <motion.div
                      key={event._id || event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-semibold text-foreground">{event.title}</h4>
                              {getStatusBadge(event.status)}
                            </div>
                            <p className="text-muted-foreground mb-3">{event.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                              {event.hostName && (
                                <div className="flex items-center gap-1">
                                  Host: {event.hostName}
                                </div>
                              )}
                            </div>
                            {event.tags && event.tags.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {event.tags.map((tag: string, idx: number) => (
                                  <Badge key={idx} variant="outline">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-border">
                          {event.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveEvent(event._id || event.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectEvent(event._id || event.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewEvent(event._id || event.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditEvent(event._id || event.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive"
                            onClick={() => handleDeleteEvent(event._id || event.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="circles" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">All Support Circles</h3>
                <Button onClick={() => setShowCreateCircle(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Support Circle
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search support circles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Circles List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading support circles...</p>
                </div>
              ) : filteredCircles.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No support circles found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCircles.map((circle) => (
                    <motion.div
                      key={circle._id || circle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-semibold text-foreground">{circle.topic}</h4>
                              {getStatusBadge(circle.status)}
                            </div>
                            {circle.description && (
                              <p className="text-muted-foreground mb-3">{circle.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {circle.currentParticipants || 0}/{circle.maxParticipants || 15} participants
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {circle.duration} minutes
                              </div>
                              {circle.hostName && (
                                <div className="flex items-center gap-1">
                                  Host: {circle.hostName}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-border">
                          {circle.status === 'active' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCloseRoom(circle._id || circle.id)}
                            >
                              <PowerOff className="w-4 h-4 mr-1" />
                              Close Room
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">User Management</h3>
              <p className="text-muted-foreground">User management interface coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                System Settings
              </h3>
              <p className="text-muted-foreground">System configuration interface coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
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
    </div>
  );
};

export default AdminDashboard;
