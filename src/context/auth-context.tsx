import React, { createContext, useContext, useState } from "react";
import { UserProfile, UserRole } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mock-data";

interface AuthContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  hasPermission: (permission: "manage_team" | "view_finances" | "edit_billing" | "create_delivery" | "handover_parcel") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]); // Default to Owner

  const switchUser = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const hasPermission = (permission: "manage_team" | "view_finances" | "edit_billing" | "create_delivery" | "handover_parcel") => {
    const role: UserRole = currentUser.role;
    switch (permission) {
      case "manage_team":
        return role === "owner";
      case "edit_billing":
        return role === "owner";
      case "view_finances":
        return role === "owner" || role === "accountant" || role === "manager";
      case "create_delivery":
        return role === "owner" || role === "manager" || role === "preparer";
      case "handover_parcel":
        return role === "owner" || role === "manager" || role === "preparer";
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: MOCK_USERS,
        switchUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
