import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/lib/roles";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    // In production, save to localStorage or session
    localStorage.setItem("mindlink_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mindlink_user");
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem("mindlink_user", JSON.stringify(updatedUser));
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("mindlink_user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (userData.createdAt) {
          userData.createdAt = new Date(userData.createdAt);
        }
        setUser(userData);
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateUserRole,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

