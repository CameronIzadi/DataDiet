'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthChange } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// Protected Route Component
// ============================================

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrap pages/components that require authentication
 * Redirects to home page if not authenticated
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Store the attempted URL for redirect after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-warm-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}

// ============================================
// Redirect After Login Helper
// ============================================

/**
 * Get the stored redirect URL after successful login
 */
export function getRedirectUrl(): string {
  if (typeof window === 'undefined') return '/app';
  const stored = sessionStorage.getItem('redirectAfterLogin');
  sessionStorage.removeItem('redirectAfterLogin');
  return stored || '/app';
}

