import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavBar from "@/components/NavBar";
import {
  MessageCircle,
  Users,
  AlertTriangle,
  Mic,
  MicOff,
  UserX,
  Shield,
  Volume2,
  VolumeX,
  Ban,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const ModeratorPanel = () => {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState("rooms");

  // Mock data
  const activeRooms = [
    {
      id: "1",
      name: "Evening Support Circle",
      participants: 8,
      host: "Sarah M.",
      flags: 0,
      status: "active",
    },
    {
      id: "2",
      name: "Student Wellness Group",
      participants: 5,
      host: "Alex K.",
      flags: 1,
      status: "active",
    },
  ];

  const flaggedMessages = [
    {
      id: "1",
      room: "Evening Support Circle",
      user: "User 05",
      message: "Inappropriate content detected",
      timestamp: "5 minutes ago",
      severity: "medium",
    },
  ];

  const reports = [
    {
      id: "1",
      type: "Abusive Language",
      room: "Student Wellness Group",
      reportedBy: "User 03",
      reportedUser: "User 07",
      timestamp: "10 minutes ago",
      status: "pending",
    },
  ];

  if (!user || (user.role !== "moderator" && user.role !== "admin" && user.role !== "super_admin")) {
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
              <h1 className="text-4xl font-bold text-foreground mb-2">Moderator Panel</h1>
              <p className="text-muted-foreground">Monitor and moderate active rooms in real-time</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">Moderator</Badge>
          </div>
        </motion.div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="rooms">Active Rooms</TabsTrigger>
            <TabsTrigger value="flags">Flagged Content</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-4">
            {activeRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageCircle className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-semibold text-foreground">{room.name}</h3>
                        {room.flags > 0 && (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {room.flags} flags
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">Host: {room.host}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {room.participants} participants
                        </div>
                        <Badge variant="outline" className="text-mood-positive">
                          {room.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline">View Room</Button>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="font-semibold text-foreground mb-3">Quick Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">
                        <Volume2 className="w-4 h-4 mr-1" />
                        Mute All
                      </Button>
                      <Button size="sm" variant="outline">
                        <UserX className="w-4 h-4 mr-1" />
                        Remove User
                      </Button>
                      <Button size="sm" variant="outline">
                        <Shield className="w-4 h-4 mr-1" />
                        Send Warning
                      </Button>
                      <Button size="sm" variant="destructive">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        End Session
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="flags" className="space-y-4">
            {flaggedMessages.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 border-2 border-destructive/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h3 className="font-semibold text-foreground">Flagged Message</h3>
                        <Badge
                          variant={item.severity === "high" ? "destructive" : "secondary"}
                        >
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">Room: {item.room}</p>
                      <p className="text-muted-foreground mb-2">User: {item.user}</p>
                      <p className="text-sm bg-card p-3 rounded-lg border border-border">
                        {item.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">{item.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Review</Button>
                    <Button size="sm" variant="destructive">
                      <UserX className="w-4 h-4 mr-1" />
                      Remove Message
                    </Button>
                    <Button size="sm" variant="outline">
                      <MicOff className="w-4 h-4 mr-1" />
                      Mute User
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h3 className="font-semibold text-foreground">{report.type}</h3>
                        <Badge variant="secondary">{report.status}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-1">Room: {report.room}</p>
                      <p className="text-muted-foreground mb-1">
                        Reported by: {report.reportedBy}
                      </p>
                      <p className="text-muted-foreground mb-1">
                        Reported user: {report.reportedUser}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">{report.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Investigate</Button>
                    <Button size="sm" variant="destructive">
                      <Ban className="w-4 h-4 mr-1" />
                      Take Action
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModeratorPanel;

