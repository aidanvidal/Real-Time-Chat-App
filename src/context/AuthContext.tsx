import React, { createContext, useContext, useEffect, useState } from "react";
import { Auth, User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, Timestamp, Firestore } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  auth: Auth;
  db: Firestore;
  children: React.ReactNode;
}

export const AuthProvider = ({ auth, db, children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to update online status
  const updateOnlineStatus = async (userId: string, status: boolean) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        online: status,
        lastSeen: Timestamp.now(),
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Firebase error updating status:", error.message);
      } else {
        console.error("Error updating status:", error);
      }
    }
  };

  useEffect(() => {
    // Handle auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Update online status when user logs in
      if (user) {
        updateOnlineStatus(user.uid, true);
      }
    });

    // Handle tab close/refresh
    const handleTabClose = async () => {
      if (user) {
        await updateOnlineStatus(user.uid, false);
      }
    };

    // Handle visibility change
    const handleVisibilityChange = async () => {
      if (!user) return;
      
      if (document.hidden) {
        await updateOnlineStatus(user.uid, false);
      } else {
        await updateOnlineStatus(user.uid, true);
      }
    };

    // Set up event listeners
    window.addEventListener("beforeunload", handleTabClose);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      unsubscribeAuth();
      window.removeEventListener("beforeunload", handleTabClose);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      // Update offline status when provider unmounts
      if (user) {
        updateOnlineStatus(user.uid, false);
      }
    };
  }, [auth, db, user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};