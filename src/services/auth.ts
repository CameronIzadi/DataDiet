// Firebase Authentication Service
// Supports both Google OAuth and Email/Password authentication
// Uses the same Firebase project as mobile for shared user accounts

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebaseClient';

let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  googleProvider = new GoogleAuthProvider();
  // Add scopes for Google OAuth
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
}

// ============================================
// Google Authentication
// ============================================

/**
 * Sign in with Google using popup
 */
export async function signInWithGoogle(): Promise<User> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    
    // Handle specific error codes
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign in cancelled');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site.');
    }
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign in cancelled');
    }
    
    throw new Error('Failed to sign in with Google');
  }
}

// ============================================
// Email/Password Authentication
// ============================================

/**
 * Create a new user with email and password
 */
export async function registerWithEmail(
  email: string, 
  password: string, 
  displayName?: string
): Promise<User> {
  if (!auth) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
  }
  
  try {
    const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    return result.user;
  } catch (error: any) {
    // Expected user errors - don't log to console
    const expectedErrors = [
      'auth/email-already-in-use',
      'auth/invalid-email',
      'auth/weak-password'
    ];
    
    if (!expectedErrors.includes(error.code)) {
      console.error('Email registration error:', error);
    }
    
    // Handle specific error codes with user-friendly messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters');
    }
    
    throw new Error('Failed to create account');
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
  }
  
  try {
    const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    // These are expected user errors - don't log to console
    const expectedErrors = [
      'auth/invalid-email',
      'auth/user-disabled', 
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/invalid-credential',
      'auth/too-many-requests'
    ];
    
    if (!expectedErrors.includes(error.code)) {
      console.error('Email sign in error:', error);
    }
    
    // Handle specific error codes with user-friendly messages
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }
    if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled');
    }
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    }
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    
    throw new Error('Failed to sign in');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    // Expected user errors - don't log to console
    const expectedErrors = ['auth/invalid-email', 'auth/user-not-found'];
    
    if (!expectedErrors.includes(error.code)) {
      console.error('Password reset error:', error);
    }
    
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    }
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email');
    }
    
    throw new Error('Failed to send password reset email');
  }
}

// ============================================
// Common Auth Functions
// ============================================

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  if (!auth) {
    console.warn('Firebase is not configured');
    return;
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    // If Firebase isn't configured, immediately call with null and return a no-op unsubscribe
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user
 */
export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (!auth) return false;
  return auth.currentUser !== null;
}

/**
 * Check if Firebase is configured
 */
export { isFirebaseConfigured } from '@/lib/firebaseClient';
