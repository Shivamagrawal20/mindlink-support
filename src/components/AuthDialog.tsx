import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/lib/roles";
import { authAPI } from "@/lib/api";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (authMethod?: "email" | "google" | "anonymous") => void;
}

const AuthDialog = ({ open, onOpenChange, onSuccess }: AuthDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useUser();

  const createUser = (role: UserRole = "user", isAnonymous: boolean = false) => {
    return {
      id: `user_${Date.now()}`,
      email: isAnonymous ? undefined : "user@example.com",
      name: isAnonymous ? undefined : "User",
      role,
      isAnonymous,
      createdAt: new Date(),
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, mode: "login" | "signup") => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const emailRaw = formData.get(mode === "login" ? "login-email" : "signup-email") as string | null;
      const passwordRaw = formData.get(mode === "login" ? "login-password" : "signup-password") as string | null;
      const nameRaw = mode === "signup" ? (formData.get("signup-name") as string | null) : null;

      // Process and validate form data
      const email = emailRaw ? emailRaw.trim() : undefined;
      const password = passwordRaw ? passwordRaw.trim() : undefined;
      const name = nameRaw ? nameRaw.trim() : undefined;

      // Client-side validation
      if (mode === "signup") {
        if (!email || email.length === 0) {
          throw new Error("Email is required");
        }
        if (!email.includes('@') || !email.includes('.')) {
          throw new Error("Please enter a valid email address");
        }
        if (!password || password.length === 0) {
          throw new Error("Password is required");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (!name || name.length === 0) {
          throw new Error("Name is required");
        }
        if (name.length < 2) {
          throw new Error("Name must be at least 2 characters");
        }
      } else {
        if (!email || email.length === 0) {
          throw new Error("Email is required");
        }
        if (!password || password.length === 0) {
          throw new Error("Password is required");
        }
      }

      // Build request payload - only include defined values
      const payload: any = {};
      if (email) payload.email = email;
      if (password) payload.password = password;
      if (name) payload.name = name;

      let response;
      if (mode === "signup") {
        response = await authAPI.register(payload);
      } else {
        response = await authAPI.login(payload);
      }

      // Store token with user data
      const userData = {
        ...response.user,
        token: response.token,
      };
      localStorage.setItem("mindlink_user", JSON.stringify(userData));
      login(userData);

      toast({
        title: mode === "login" ? "Welcome back!" : "Account created!",
        description: "You're now connected to MindLink AI",
      });
      setIsLoading(false);
      onSuccess("email");
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // TODO: Implement Google OAuth
    toast({
      title: "Google OAuth",
      description: "Google authentication coming soon",
    });
    setIsLoading(false);
  };

  const handleAnonymousAuth = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.register({ isAnonymous: true });
      const userData = {
        ...response.user,
        token: response.token,
      };
      localStorage.setItem("mindlink_user", JSON.stringify(userData));
      login(userData);

      toast({
        title: "Anonymous Mode Activated",
        description: "Your privacy is protected. No personal information is stored.",
      });
      setIsLoading(false);
      onSuccess("anonymous");
    } catch (error: any) {
      toast({
        title: "Failed to start anonymous session",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to MindLink AI</DialogTitle>
            <DialogDescription>
              Sign in to access empathetic AI support and community features
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="login" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={(e) => handleSubmit(e, "login")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    name="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    name="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={(e) => handleSubmit(e, "signup")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    name="signup-name"
                    type="text"
                    placeholder="Your name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    name="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Your privacy is protected. All conversations are confidential.
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
