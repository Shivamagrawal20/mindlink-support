import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Brain,
  Menu,
  X,
  Home,
  Users,
  Calendar,
  BookOpen,
  User,
  LogOut,
  Settings,
  Shield,
  Crown,
  Gauge,
  MessageSquare,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import {
  canCreateEvents,
  canModerate,
  canAccessAdminPanel,
} from "@/lib/roles";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavBarProps {
  onAuthClick?: () => void;
}

const NavBar = ({ onAuthClick }: NavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { label: "AI Chat", path: "/", icon: MessageSquare },
    { label: "Voice Rooms", path: "/rooms", icon: Users },
    { label: "Events", path: "/events", icon: Calendar },
    { label: "Resources", path: "/resources", icon: BookOpen },
  ];

  const adminNavItems = [
    {
      label: "Leader Dashboard",
      path: "/leader",
      icon: Crown,
      condition: () => canCreateEvents(user?.role || "user"),
    },
    {
      label: "Moderator",
      path: "/moderator",
      icon: Shield,
      condition: () => canModerate(user?.role || "user"),
    },
    {
      label: "Admin",
      path: "/admin",
      icon: Gauge,
      condition: () => canAccessAdminPanel(user?.role || "user"),
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (user?.isAnonymous) return "A";
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              />
              <Brain className="w-8 h-8 text-primary relative z-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MindLink AI
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-3">
                  {adminNavItems
                    .filter((item) => item.condition())
                    .map((item) => (
                      <motion.button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                        title={item.label}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.button>
                    ))}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden xl:flex flex-col items-start">
                          <span className="text-sm font-medium text-foreground">
                            {user?.isAnonymous
                              ? "Anonymous"
                              : user?.name || "User"}
                          </span>
                          {user?.role && user.role !== "user" && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0 h-4 capitalize"
                            >
                              {user.role.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground hidden xl:block" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {user?.isAnonymous
                              ? "Anonymous User"
                              : user?.name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email || "No email"}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/profile");
                        }}
                        className="cursor-pointer"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/profile");
                        }}
                        className="cursor-pointer"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-primary" />
                        MindLink AI
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 space-y-6">
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {user?.isAnonymous
                              ? "Anonymous User"
                              : user?.name || "User"}
                          </p>
                          {user?.role && user.role !== "user" && (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-xs capitalize"
                            >
                              {user.role.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Main Navigation */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                          Navigation
                        </p>
                        {mainNavItems.map((item) => {
                          const active = isActive(item.path);
                          return (
                            <motion.button
                              key={item.path}
                              onClick={() => {
                                navigate(item.path);
                                setMobileMenuOpen(false);
                              }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <item.icon className="w-5 h-5" />
                              {item.label}
                              {active && (
                                <Sparkles className="w-4 h-4 ml-auto" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Admin Navigation */}
                      {adminNavItems.some((item) => item.condition()) && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                            Admin
                          </p>
                          {adminNavItems
                            .filter((item) => item.condition())
                            .map((item) => {
                              const active = isActive(item.path);
                              return (
                                <motion.button
                                  key={item.path}
                                  onClick={() => {
                                    navigate(item.path);
                                    setMobileMenuOpen(false);
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                    active
                                      ? "bg-primary/10 text-primary"
                                      : "text-foreground hover:bg-muted/50"
                                  }`}
                                >
                                  <item.icon className="w-5 h-5" />
                                  {item.label}
                                </motion.button>
                              );
                            })}
                        </div>
                      )}

                      {/* Profile Actions */}
                      <div className="space-y-1 pt-4 border-t">
                        <motion.button
                          onClick={() => {
                            navigate("/profile");
                            setMobileMenuOpen(false);
                          }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          Profile & Settings
                        </motion.button>
                        <motion.button
                          onClick={handleLogout}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </motion.button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="hidden md:flex"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  onClick={onAuthClick || (() => navigate("/"))}
                  className="hidden md:flex"
                >
                  Get Started
                </Button>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-primary" />
                        MindLink AI
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 space-y-4">
                      {mainNavItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                          <motion.button
                            key={item.path}
                            onClick={() => {
                              navigate(item.path);
                              setMobileMenuOpen(false);
                            }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                          </motion.button>
                        );
                      })}
                      <div className="pt-4 border-t">
                        <Button
                          onClick={() => {
                            onAuthClick?.() || navigate("/");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          Get Started
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default NavBar;
