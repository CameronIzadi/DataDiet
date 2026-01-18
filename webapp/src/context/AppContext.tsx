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
  deleteUserMeal,
  deleteUserBloodWork
} from '@/services/firestore';
import { debugLog } from '@/lib/debug';

interface AppContextType {
  meals: Meal[];
  bloodWork: BloodWork | null; // Most recent blood work (for AI chat)
  bloodWorkHistory: BloodWork[]; // All blood work records
  insights: Insights;
  isLoading: boolean;
  isSyncing: boolean;
  user: User | null;
  addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  addBloodWork: (bloodWork: BloodWork) => Promise<void>;
  deleteBloodWork: (bloodWorkId: string) => Promise<void>;
  loadDemoData: () => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [bloodWorkHistory, setBloodWorkHistory] = useState<BloodWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [insights, setInsights] = useState<Insights>(() => calculateInsights([]));

  // Get most recent blood work for AI chat
  const bloodWork = bloodWorkHistory.length > 0
    ? bloodWorkHistory.reduce((latest, current) =>
        new Date(current.testDate) > new Date(latest.testDate) ? current : latest
      )
    : null;

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
        setBloodWorkHistory([DEMO_BLOOD_WORK]);
      }
    } else {
      // Load demo data by default
      setMeals(DEMO_MEALS);
      setBloodWorkHistory([DEMO_BLOOD_WORK]);
    }

    if (savedBloodWork) {
      try {
        const parsed = JSON.parse(savedBloodWork);
        // Handle both old single object and new array format
        if (Array.isArray(parsed)) {
          setBloodWorkHistory(parsed.map((bw: BloodWork) => ({
            ...bw,
            testDate: new Date(bw.testDate)
          })));
        } else {
          // Legacy single blood work - convert to array
          setBloodWorkHistory([{
            ...parsed,
            testDate: new Date(parsed.testDate)
          }]);
        }
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

    // Debug log (no PII)
    debugLog('User authenticated', { uid: user.uid });

    let unsubscribeMeals: () => void = () => {};
    let unsubscribeBloodWork: () => void = () => {};

    // Subscribe to real-time meals updates
    try {
      unsubscribeMeals = subscribeToMeals(
        user.uid,
        (firestoreMeals) => {
          debugLog('Received meals from Firestore', { count: firestoreMeals.length });
          setMeals(firestoreMeals);
          setIsLoading(false);
          setIsSyncing(false);
        },
        () => {
          // Silently handle permission errors - they're expected if rules aren't configured
          // Fall back to empty array on error
          setMeals([]);
          setIsLoading(false);
          setIsSyncing(false);
        }
      );
    } catch (e) {
      debugLog('Failed to subscribe to meals');
      setMeals([]);
      setIsLoading(false);
      setIsSyncing(false);
    }

    // Subscribe to real-time blood work updates (optional, don't block if fails)
    try {
      unsubscribeBloodWork = subscribeToBloodWork(
        user.uid,
        (bloodWorkList) => {
          // Now receives BloodWork[] directly from the subscription
          setBloodWorkHistory(bloodWorkList);
        },
        () => {
          // Blood work is optional - silently continue
          setBloodWorkHistory([]);
        }
      );
    } catch (e) {
      debugLog('Failed to subscribe to blood work');
      setBloodWorkHistory([]);
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
    if (!isLoading && !user && bloodWorkHistory.length > 0) {
      localStorage.setItem('dietary-blackbox-bloodwork', JSON.stringify(bloodWorkHistory));
    }
  }, [bloodWorkHistory, isLoading, user]);

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

  // Add blood work - saves to Firestore if logged in
  const addBloodWork = useCallback(async (bw: BloodWork) => {
    if (user && isFirebaseConfigured) {
      setIsSyncing(true);
      await saveUserBloodWork(user.uid, bw);
      setIsSyncing(false);
      // Subscription will update blood work automatically
    } else {
      setBloodWorkHistory(prev => [bw, ...prev]);
    }
  }, [user]);

  // Delete blood work
  const deleteBloodWork = useCallback(async (bloodWorkId: string) => {
    if (user && isFirebaseConfigured) {
      setIsSyncing(true);
      await deleteUserBloodWork(user.uid, bloodWorkId);
      setIsSyncing(false);
      // Subscription will update blood work history automatically
    } else {
      setBloodWorkHistory(prev => prev.filter(bw => bw.id !== bloodWorkId));
    }
  }, [user]);

  const loadDemoData = useCallback(() => {
    setMeals(DEMO_MEALS);
    setBloodWorkHistory([DEMO_BLOOD_WORK]);
  }, []);

  const clearData = useCallback(() => {
    setMeals([]);
    setBloodWorkHistory([]);
    localStorage.removeItem('dietary-blackbox-meals');
    localStorage.removeItem('dietary-blackbox-bloodwork');
  }, []);

  return (
    <AppContext.Provider value={{
      meals,
      bloodWork,
      bloodWorkHistory,
      insights,
      isLoading,
      isSyncing,
      user,
      addMeal,
      deleteMeal,
      addBloodWork,
      deleteBloodWork,
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
