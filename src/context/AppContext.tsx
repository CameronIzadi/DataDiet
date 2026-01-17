'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { Meal, BloodWork, Insights } from '@/types';
import { DEMO_MEALS, DEMO_BLOOD_WORK } from '@/data/demoData';
import { calculateInsights } from '@/services/insights';
import { onAuthChange } from '@/services/auth';
import { isFirebaseConfigured } from '@/lib/firebaseClient';
import { 
  subscribeToMeals, 
  subscribeToBloodWork, 
  addUserMeal, 
  saveUserBloodWork,
  deleteUserMeal 
} from '@/services/firestore';

interface AppContextType {
  meals: Meal[];
  bloodWork: BloodWork | null;
  insights: Insights;
  isLoading: boolean;
  isSyncing: boolean;
  user: User | null;
  addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  setBloodWork: (bloodWork: BloodWork) => Promise<void>;
  loadDemoData: () => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [bloodWork, setBloodWorkState] = useState<BloodWork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [insights, setInsights] = useState<Insights>(() => calculateInsights([]));

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      if (!authUser) {
        // User signed out - load from localStorage or demo data
        loadLocalData();
      }
    });
    return () => unsubscribe();
  }, []);

  // Load local data (localStorage or demo)
  const loadLocalData = useCallback(() => {
    const savedMeals = localStorage.getItem('dietary-blackbox-meals');
    const savedBloodWork = localStorage.getItem('dietary-blackbox-bloodwork');
    
    if (savedMeals) {
      try {
        const parsed = JSON.parse(savedMeals);
        const mealsWithDates = parsed.map((m: Meal) => ({
          ...m,
          loggedAt: new Date(m.loggedAt)
        }));
        setMeals(mealsWithDates);
      } catch (e) {
        console.error('Error parsing saved meals:', e);
        setMeals(DEMO_MEALS);
        setBloodWorkState(DEMO_BLOOD_WORK);
      }
    } else {
      // Load demo data by default
      setMeals(DEMO_MEALS);
      setBloodWorkState(DEMO_BLOOD_WORK);
    }
    
    if (savedBloodWork) {
      try {
        const parsed = JSON.parse(savedBloodWork);
        setBloodWorkState({
          ...parsed,
          testDate: new Date(parsed.testDate)
        });
      } catch (e) {
        console.error('Error parsing saved blood work:', e);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Subscribe to Firestore when user is logged in
  useEffect(() => {
    if (!user || !isFirebaseConfigured) {
      // Not logged in or Firebase not configured - use local data
      loadLocalData();
      return;
    }

    setIsLoading(true);
    setIsSyncing(true);

    // Debug: Log user info
    console.log('🔐 Logged in user:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });

    let unsubscribeMeals: () => void = () => {};
    let unsubscribeBloodWork: () => void = () => {};

    // Subscribe to real-time meals updates
    try {
      unsubscribeMeals = subscribeToMeals(
        user.uid,
        (firestoreMeals) => {
          console.log('📥 Received meals from Firestore:', firestoreMeals.length, 'meals');
          if (firestoreMeals.length > 0) {
            console.log('📋 Sample meal:', firestoreMeals[0]);
          }
          setMeals(firestoreMeals);
          setIsLoading(false);
          setIsSyncing(false);
        },
        (error) => {
          // Silently handle permission errors - they're expected if rules aren't configured
          // Fall back to empty array on error
          setMeals([]);
          setIsLoading(false);
          setIsSyncing(false);
        }
      );
    } catch (e) {
      console.error('Failed to subscribe to meals:', e);
      setMeals([]);
      setIsLoading(false);
      setIsSyncing(false);
    }

    // Subscribe to real-time blood work updates (optional, don't block if fails)
    try {
      unsubscribeBloodWork = subscribeToBloodWork(
        user.uid,
        (firestoreBloodWork) => {
          setBloodWorkState(firestoreBloodWork);
        },
        (error) => {
          // Blood work is optional - silently continue
          setBloodWorkState(null);
        }
      );
    } catch (e) {
      console.warn('Failed to subscribe to blood work:', e);
      setBloodWorkState(null);
    }

    return () => {
      unsubscribeMeals();
      unsubscribeBloodWork();
    };
  }, [user, loadLocalData]);

  // Recalculate insights when meals change
  useEffect(() => {
    setInsights(calculateInsights(meals));
  }, [meals]);

  // Save to localStorage when data changes (for non-logged-in users)
  useEffect(() => {
    if (!isLoading && !user) {
      localStorage.setItem('dietary-blackbox-meals', JSON.stringify(meals));
    }
  }, [meals, isLoading, user]);

  useEffect(() => {
    if (!isLoading && !user && bloodWork) {
      localStorage.setItem('dietary-blackbox-bloodwork', JSON.stringify(bloodWork));
    }
  }, [bloodWork, isLoading, user]);

  // Add meal - saves to Firestore if logged in, localStorage otherwise
  const addMeal = useCallback(async (meal: Omit<Meal, 'id'>) => {
    if (user && isFirebaseConfigured) {
      // Save to Firestore
      setIsSyncing(true);
      const newMeal = await addUserMeal(user.uid, meal);
      setIsSyncing(false);
      
      if (!newMeal) {
        // Fallback to local if Firestore fails
        const localMeal: Meal = {
          ...meal,
          id: `meal_${Date.now()}`,
          loggedAt: meal.loggedAt instanceof Date ? meal.loggedAt : new Date(meal.loggedAt),
        };
        setMeals(prev => [localMeal, ...prev]);
      }
      // If successful, the subscription will update the meals automatically
    } else {
      // Save locally
      const newMeal: Meal = {
        ...meal,
        id: `meal_${Date.now()}`,
        loggedAt: meal.loggedAt instanceof Date ? meal.loggedAt : new Date(meal.loggedAt),
      };
      setMeals(prev => [newMeal, ...prev]);
    }
  }, [user]);

  // Delete meal
  const deleteMeal = useCallback(async (mealId: string) => {
    if (user && isFirebaseConfigured) {
      setIsSyncing(true);
      await deleteUserMeal(user.uid, mealId);
      setIsSyncing(false);
      // Subscription will update meals automatically
    } else {
      setMeals(prev => prev.filter(m => m.id !== mealId));
    }
  }, [user]);

  // Set blood work - saves to Firestore if logged in
  const setBloodWork = useCallback(async (bw: BloodWork) => {
    if (user && isFirebaseConfigured) {
      setIsSyncing(true);
      await saveUserBloodWork(user.uid, bw);
      setIsSyncing(false);
      // Subscription will update blood work automatically
    } else {
      setBloodWorkState(bw);
    }
  }, [user]);

  const loadDemoData = useCallback(() => {
    setMeals(DEMO_MEALS);
    setBloodWorkState(DEMO_BLOOD_WORK);
  }, []);

  const clearData = useCallback(() => {
    setMeals([]);
    setBloodWorkState(null);
    localStorage.removeItem('dietary-blackbox-meals');
    localStorage.removeItem('dietary-blackbox-bloodwork');
  }, []);

  return (
    <AppContext.Provider value={{
      meals,
      bloodWork,
      insights,
      isLoading,
      isSyncing,
      user,
      addMeal,
      deleteMeal,
      setBloodWork,
      loadDemoData,
      clearData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
