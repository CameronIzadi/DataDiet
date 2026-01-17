import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { app } from '../config/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ONBOARDING_KEY = '@datadiet_onboarding_complete';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth(app);

  // Format Firebase user to our User type
  const formatUser = (firebaseUser: FirebaseUser): User => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  });

  // Check onboarding status
  const checkOnboardingStatus = useCallback(async (uid: string) => {
    try {
      const completed = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${uid}`);
      setHasCompletedOnboarding(completed === 'true');
    } catch (err) {
      console.error('Error checking onboarding status:', err);
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(formatUser(firebaseUser));
        await checkOnboardingStatus(firebaseUser.uid);
      } else {
        setUser(null);
        setHasCompletedOnboarding(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [auth, checkOnboardingStatus]);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = getErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    }
  }, [auth]);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setError(null);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
        setUser(formatUser(firebaseUser));
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = getErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    }
  }, [auth]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      console.error('Logout error:', err);
      throw err;
    }
  }, [auth]);

  const updateUserProfile = useCallback(async (data: { displayName?: string; photoURL?: string }) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No user logged in');

    try {
      await updateProfile(currentUser, data);
      setUser(formatUser(currentUser));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      console.error('Update profile error:', err);
      throw err;
    }
  }, [auth]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(`${ONBOARDING_KEY}_${user.uid}`, 'true');
      setHasCompletedOnboarding(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Error completing onboarding:', err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasCompletedOnboarding,
        login,
        signup,
        logout,
        updateUserProfile,
        completeOnboarding,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to get user-friendly error messages
function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
}
