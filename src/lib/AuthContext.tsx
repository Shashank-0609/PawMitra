import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Sync with legacy localStorage for compatibility if needed
      // Only set isLoggedIn to true if email is verified
      if (user && user.emailVerified) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', user.displayName || user.email?.split('@')[0] || 'User');
      } else {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('userName');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user && user.emailVerified }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
