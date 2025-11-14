import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Moon, Globe, ArrowLeft, MessageSquare, Mic, Trash2, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { chatAPI, authAPI } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser } = useUser();
  const { toast } = useToast();
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  // Load user data from API
  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile();
      loadChatHistory();
    }
  }, [isAuthenticated]);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setAnonymousMode(user.isAnonymous || false);
      setDisplayName(user.name || '');
      setEmail(user.email || '');
      // Load preferences if available
      const userData = localStorage.getItem('mindlink_user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (parsed.preferences) {
            setNotifications(parsed.preferences.notifications !== false);
            setDarkMode(parsed.preferences.theme === 'dark');
            setLanguage(parsed.preferences.language || 'en');
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await authAPI.getMe();
      if (response.success && response.user) {
        const userData = {
          id: response.user._id || response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          isAnonymous: response.user.isAnonymous,
          createdAt: new Date(response.user.createdAt),
          preferences: response.user.preferences,
        };
        setUser(userData);
        localStorage.setItem('mindlink_user', JSON.stringify(userData));
        
        // Update local state
        setDisplayName(response.user.name || '');
        setEmail(response.user.email || '');
        setAnonymousMode(response.user.isAnonymous || false);
        if (response.user.preferences) {
          setNotifications(response.user.preferences.notifications !== false);
          setDarkMode(response.user.preferences.theme === 'dark');
          setLanguage(response.user.preferences.language || 'en');
        }
      }
    } catch (error: any) {
      console.error('Error loading user profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await chatAPI.getHistory();
      if (response.success && response.data) {
        setChatHistory(response.data.messages || []);
      }
    } catch (error: any) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setIsUpdatingProfile(true);
      const response = await authAPI.updateProfile({
        name: displayName,
        preferences: {
          language,
          theme: darkMode ? 'dark' : 'light',
          notifications,
        },
      });

      if (response.success) {
        // Reload user profile to get updated data
        await loadUserProfile();
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      return;
    }

    try {
      await chatAPI.clearHistory();
      setChatHistory([]);
      toast({
        title: "Success",
        description: "Chat history cleared successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    if (!user) return;

    // Update local state first
    let updatedLanguage = language;
    let updatedTheme = darkMode ? 'dark' : 'light';
    let updatedNotifications = notifications;

    if (key === 'notifications') {
      updatedNotifications = value;
      setNotifications(value);
    } else if (key === 'theme') {
      updatedTheme = value;
      setDarkMode(value === 'dark');
    } else if (key === 'language') {
      updatedLanguage = value;
      setLanguage(value);
    }

    const newPreferences = {
      language: updatedLanguage,
      theme: updatedTheme,
      notifications: updatedNotifications,
    };

    try {
      await authAPI.updateProfile({
        preferences: newPreferences,
      });

      // Update user context
      const updatedUser = {
        ...user,
        preferences: newPreferences,
      };
      setUser(updatedUser);
      localStorage.setItem('mindlink_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Success",
        description: "Preference updated successfully",
      });
    } catch (error: any) {
      // Revert local state on error
      if (key === 'notifications') setNotifications(!value);
      if (key === 'theme') setDarkMode(value !== 'dark');
      if (key === 'language') setLanguage(language);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update preference",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm to-background flex flex-col">
      <NavBar />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 pt-24 max-w-4xl"
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
          className="mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-2"
          >
            Profile & Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground text-lg"
          >
            Manage your account and preferences
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50">
              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                  <p className="text-muted-foreground">Loading profile...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <User className="w-10 h-10 text-primary" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-foreground">
                          {user?.name || (user?.isAnonymous ? 'Anonymous User' : 'User')}
                        </h2>
                        {user?.role && user.role !== 'user' && (
                          <Badge variant="secondary" className="capitalize">
                            {user.role.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      {user?.email && !user.isAnonymous ? (
                        <p className="text-muted-foreground">{user.email}</p>
                      ) : (
                        <p className="text-muted-foreground italic">Anonymous account</p>
                      )}
                      {user?.createdAt && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    {!user?.isAnonymous && (
                      <>
                        <div>
                          <Label htmlFor="name">Display Name</Label>
                          <Input 
                            id="name" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="mt-2" 
                            placeholder="Enter your name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2" 
                            placeholder="Enter your email"
                          />
                        </div>
                      </>
                    )}
                    {user?.isAnonymous && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          You're using an anonymous account. To update your profile, please create a regular account with email and password.
                        </p>
                      </div>
                    )}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile || user?.isAnonymous}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Profile'
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Privacy & Safety</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymous" className="text-base">Anonymous Mode</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.isAnonymous 
                      ? 'You are using an anonymous account'
                      : 'Hide your identity in voice circles and chat'}
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={anonymousMode}
                  onCheckedChange={(checked) => {
                    setAnonymousMode(checked);
                    // Note: This is read-only for now, changing account type requires re-registration
                  }}
                  disabled={true}
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
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                />
              </div>
            </div>
          </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50">
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
                  onCheckedChange={(checked) => handlePreferenceChange('theme', checked ? 'dark' : 'light')}
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
                  value={language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full p-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </Card>
          </motion.div>

          {/* Chat History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 hover:shadow-large transition-all border-2 hover:border-primary/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">Chat History</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadChatHistory}
                    disabled={isLoadingHistory}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  {chatHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChatHistory(!showChatHistory)}
                    >
                      {showChatHistory ? 'Hide' : 'Show'} Messages
                    </Button>
                  )}
                </div>
              </div>
              
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full mx-auto mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Loading chat history...</p>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No chat history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start a conversation to see your messages here</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      You have <span className="font-semibold text-foreground">{chatHistory.length}</span> messages in your history
                    </p>
                  </div>
                  
                  <AnimatePresence>
                    {showChatHistory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 max-h-96 overflow-y-auto pr-2"
                      >
                        {chatHistory.map((msg, index) => {
                          const isUser = msg.role === 'user';
                          const isVoice = msg.messageType === 'voice';
                          
                          return (
                            <motion.div
                              key={`${msg.timestamp}-${index}`}
                              initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                  isUser
                                    ? 'bg-primary/10 text-foreground border border-primary/20'
                                    : 'bg-muted/50 text-foreground border border-border'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {!isUser && (
                                    <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      {isVoice && (
                                        <Badge variant="outline" className="text-xs py-0 px-1.5">
                                          <Mic className="w-3 h-3 mr-1" />
                                          Voice
                                        </Badge>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(msg.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                  {isUser && (
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      isVoice ? 'bg-primary/20' : 'bg-primary/10'
                                    }`}>
                                      {isVoice ? (
                                        <Mic className="w-3 h-3 text-primary" />
                                      ) : (
                                        <MessageSquare className="w-3 h-3 text-primary" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 border-destructive/20 hover:shadow-large transition-all border-2 hover:border-destructive/50">
            <h3 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These actions cannot be undone. Please be careful.
            </p>
            <div className="flex gap-3 flex-wrap">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline"
                  onClick={handleClearHistory}
                  disabled={chatHistory.length === 0}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Chat History
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="destructive">Delete Account</Button>
              </motion.div>
            </div>
          </Card>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default Profile;
