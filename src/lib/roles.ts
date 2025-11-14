// Role-based access control for MindLink AI

export type UserRole = "user" | "community_leader" | "moderator" | "admin" | "super_admin";

export interface User {
  id: string;
  email?: string;
  name?: string;
  role: UserRole;
  isAnonymous: boolean;
  createdAt: Date;
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}

export interface RolePermissions {
  canChatWithAI: boolean;
  canJoinSupportCircles: boolean;
  canJoinEvents: boolean;
  canCreateSupportCircles: boolean;
  canCreateEvents: boolean;
  canModerate: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
  canManageSystem: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    canChatWithAI: true,
    canJoinSupportCircles: true,
    canJoinEvents: true,
    canCreateSupportCircles: true, // Users can create 1 support circle
    canCreateEvents: false,
    canModerate: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
    canManageSystem: false,
  },
  community_leader: {
    canChatWithAI: true,
    canJoinSupportCircles: true,
    canJoinEvents: true,
    canCreateSupportCircles: true,
    canCreateEvents: true,
    canModerate: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
    canManageSystem: false,
  },
  moderator: {
    canChatWithAI: true,
    canJoinSupportCircles: true,
    canJoinEvents: true,
    canCreateSupportCircles: false,
    canCreateEvents: false,
    canModerate: true,
    canManageUsers: false,
    canAccessAdminPanel: false,
    canManageSystem: false,
  },
  admin: {
    canChatWithAI: true,
    canJoinSupportCircles: true,
    canJoinEvents: true,
    canCreateSupportCircles: true,
    canCreateEvents: true,
    canModerate: true,
    canManageUsers: true,
    canAccessAdminPanel: true,
    canManageSystem: false,
  },
  super_admin: {
    canChatWithAI: true,
    canJoinSupportCircles: true,
    canJoinEvents: true,
    canCreateSupportCircles: true,
    canCreateEvents: true,
    canModerate: true,
    canManageUsers: true,
    canAccessAdminPanel: true,
    canManageSystem: true,
  },
};

export const getRolePermissions = (role: UserRole): RolePermissions => {
  return ROLE_PERMISSIONS[role];
};

export const hasPermission = (userRole: UserRole, permission: keyof RolePermissions): boolean => {
  return ROLE_PERMISSIONS[userRole][permission];
};

export const canCreateEvents = (role: UserRole): boolean => {
  return hasPermission(role, "canCreateEvents");
};

export const canCreateSupportCircles = (role: UserRole): boolean => {
  return hasPermission(role, "canCreateSupportCircles");
};

export const canModerate = (role: UserRole): boolean => {
  return hasPermission(role, "canModerate");
};

export const canAccessAdminPanel = (role: UserRole): boolean => {
  return hasPermission(role, "canAccessAdminPanel");
};

