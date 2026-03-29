import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Package } from 'lucide-react';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-6">
      {/* Animated glow background */}
      <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[0_0_40px_rgba(59,130,246,0.5)]">
          <Package size={40} className="text-white" />
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-spin [animation-duration:3s]" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Velox</h1>
          <p className="text-textMuted text-sm mt-1">Conectando con el servidor...</p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
            style={{ width: '60%', animation: 'shimmer 1.5s ease-in-out infinite' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-200%); width: 40%; }
          50% { width: 70%; }
          100% { transform: translateX(300%); width: 40%; }
        }
      `}</style>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    logout
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

