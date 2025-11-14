import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Moon, Globe, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Profile Information */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">John Doe</h2>
                <p className="text-muted-foreground">john.doe@example.com</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" defaultValue="John Doe" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" className="mt-2" />
              </div>
              <Button>Update Profile</Button>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Privacy & Safety</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymous" className="text-base">Anonymous Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hide your identity in voice circles and chat
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={anonymousMode}
                  onCheckedChange={setAnonymousMode}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive updates about events and messages
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Appearance</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkmode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  id="darkmode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="language" className="text-base flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5" />
                  Language
                </Label>
                <select
                  id="language"
                  className="w-full p-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/20">
            <h3 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These actions cannot be undone. Please be careful.
            </p>
            <div className="flex gap-3">
              <Button variant="outline">Delete All Chat History</Button>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
