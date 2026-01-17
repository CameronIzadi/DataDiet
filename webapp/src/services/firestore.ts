// Firestore Service for syncing meals and data across devices
// This enables the web dashboard to show data from the mobile app

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebaseClient';
import { Meal, BloodWork, MealFlag, Food, Nutrition } from '@/types';

// ============================================
// Type Converters (Firestore <-> App)
// ============================================

// iOS app stores meals in: users/{userId}/meals/{mealId}
// with fields: createdAt, flags (string[]), foods (array), imageUrl

interface FirestoreMealFromIOS {
  createdAt: Timestamp;
  foods: Array<{
    name: string;
    portion?: string;
    container?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>;
  flags: string[]; // iOS stores flags as simple strings like "ultra_processed", "late_meal"
  imageUrl?: string;
}

interface FirestoreBloodWork {
  userId: string;
  testDate: Timestamp;
  totalCholesterol: number;
  ldl: number;
  hdl: number;
  triglycerides: number;
  fastingGlucose: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Convert iOS meal to web app Meal format
function mealFromFirestoreIOS(id: string, data: FirestoreMealFromIOS): Meal {
  // Convert iOS foods to web app Food format
  const foods: Food[] = (data.foods || []).map(f => ({
    name: f.name || 'Unknown food',
    portion: f.portion || 'Unknown portion',
    container: f.container === 'none' ? undefined : f.container as Food['container'],
  }));

  // Convert iOS flags (strings) to web app MealFlag format
  const flags: MealFlag[] = (data.flags || []).map(flagStr => {
    // Map iOS flag strings to our flag types
    const flagMap: Record<string, MealFlag> = {
      'ultra_processed': 'ultra_processed',
      'processed': 'ultra_processed',
      'processed_meat': 'processed_meat',
      'late_meal': 'late_meal',
      'late_night': 'late_meal',
      'plastic': 'plastic_bottle',
      'plastic_bottle': 'plastic_bottle',
      'high_sodium': 'high_sodium',
    };
    
    return flagMap[flagStr] || 'ultra_processed';
  });

  // Calculate nutrition from food data if available
  let nutrition: Nutrition | undefined;
  const hasNutrition = data.foods?.some(f => f.calories !== undefined);
  if (hasNutrition) {
    nutrition = {
      calories: data.foods.reduce((sum, f) => sum + (f.calories || 0), 0),
      protein: data.foods.reduce((sum, f) => sum + (f.protein || 0), 0),
      carbs: data.foods.reduce((sum, f) => sum + (f.carbs || 0), 0),
      fat: data.foods.reduce((sum, f) => sum + (f.fat || 0), 0),
      sodium: 0,
    };
  }

  return {
    id,
    loggedAt: data.createdAt?.toDate() || new Date(),
    foods,
    flags,
    imageUrl: data.imageUrl,
    nutrition,
  };
}

// Convert web app meal to Firestore format (for saving from web)
function mealToFirestoreIOS(meal: Omit<Meal, 'id'>): Omit<FirestoreMealFromIOS, 'createdAt'> & { createdAt: Timestamp } {
  return {
    createdAt: Timestamp.fromDate(meal.loggedAt instanceof Date ? meal.loggedAt : new Date(meal.loggedAt)),
    foods: meal.foods.map(f => ({
      name: f.name,
      portion: f.portion,
      container: f.container || 'none',
    })),
    flags: meal.flags.map(f => f === 'late_meal' ? 'late_meal' : f),
    imageUrl: meal.imageUrl,
  };
}

function bloodWorkToFirestore(bloodWork: BloodWork, userId: string): Omit<FirestoreBloodWork, 'createdAt' | 'updatedAt'> {
  return {
    userId,
    testDate: Timestamp.fromDate(bloodWork.testDate instanceof Date ? bloodWork.testDate : new Date(bloodWork.testDate)),
    totalCholesterol: bloodWork.totalCholesterol,
    ldl: bloodWork.ldl,
    hdl: bloodWork.hdl,
    triglycerides: bloodWork.triglycerides,
    fastingGlucose: bloodWork.fastingGlucose,
  };
}

function bloodWorkFromFirestore(id: string, data: FirestoreBloodWork): BloodWork {
  return {
    id,
    testDate: data.testDate.toDate(),
    totalCholesterol: data.totalCholesterol,
    ldl: data.ldl,
    hdl: data.hdl,
    triglycerides: data.triglycerides,
    fastingGlucose: data.fastingGlucose,
  };
}

// ============================================
// Meals CRUD Operations
// iOS app stores meals at: users/{userId}/meals/{mealId}
// ============================================

/**
 * Fetch all meals for a user from users/{userId}/meals
 */
export async function fetchUserMeals(userId: string): Promise<Meal[]> {
  if (!db || !isFirebaseConfigured) {
    console.warn('Firestore not configured');
    return [];
  }

  try {
    // iOS app structure: users/{userId}/meals
    const mealsRef = collection(db, 'users', userId, 'meals');
    
    // Try with orderBy first
    try {
      const q = query(mealsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const meals: Meal[] = [];
      
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as FirestoreMealFromIOS;
        meals.push(mealFromFirestoreIOS(docSnapshot.id, data));
      });
      
      console.log(`📥 Fetched ${meals.length} meals for user ${userId}`);
      return meals;
    } catch (indexError) {
      // Fallback: no orderBy, sort client-side
      console.warn('Index not ready, fetching without order...');
      const snapshot = await getDocs(mealsRef);
      const meals: Meal[] = [];
      
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as FirestoreMealFromIOS;
        meals.push(mealFromFirestoreIOS(docSnapshot.id, data));
      });
      
      // Sort client-side by loggedAt (createdAt converted)
      return meals.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
    }
  } catch (error) {
    console.error('Error fetching meals:', error);
    return [];
  }
}

/**
 * Add a new meal for a user (saves to users/{userId}/meals)
 */
export async function addUserMeal(userId: string, meal: Omit<Meal, 'id'>): Promise<Meal | null> {
  if (!db || !isFirebaseConfigured) {
    console.warn('Firestore not configured');
    return null;
  }

  try {
    // iOS app structure: users/{userId}/meals
    const mealsRef = collection(db, 'users', userId, 'meals');
    const mealData = mealToFirestoreIOS(meal);
    
    const docRef = await addDoc(mealsRef, mealData);
    
    console.log(`✅ Added meal ${docRef.id} for user ${userId}`);
    
    return {
      id: docRef.id,
      ...meal,
      loggedAt: meal.loggedAt instanceof Date ? meal.loggedAt : new Date(meal.loggedAt),
    };
  } catch (error) {
    console.error('Error adding meal:', error);
    return null;
  }
}

/**
 * Delete a meal (from users/{userId}/meals)
 */
export async function deleteUserMeal(userId: string, mealId: string): Promise<boolean> {
  if (!db || !isFirebaseConfigured) {
    console.warn('Firestore not configured');
    return false;
  }

  try {
    await deleteDoc(doc(db, 'users', userId, 'meals', mealId));
    console.log(`🗑️ Deleted meal ${mealId}`);
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    return false;
  }
}

/**
 * Subscribe to real-time meal updates for a user (from users/{userId}/meals)
 */
export function subscribeToMeals(
  userId: string, 
  onMealsUpdate: (meals: Meal[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!db || !isFirebaseConfigured) {
    console.warn('Firestore not configured');
    return () => {};
  }

  // iOS app structure: users/{userId}/meals
  const mealsRef = collection(db, 'users', userId, 'meals');
  
  console.log(`🔔 Subscribing to meals for user: ${userId}`);
  
  // Try with orderBy first
  const orderedQuery = query(mealsRef, orderBy('createdAt', 'desc'));
  
  const processSnapshot = (snapshot: import('firebase/firestore').QuerySnapshot) => {
    const meals: Meal[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as FirestoreMealFromIOS;
      meals.push(mealFromFirestoreIOS(docSnapshot.id, data));
    });
    
    console.log(`📥 Real-time update: ${meals.length} meals`);
    onMealsUpdate(meals);
  };
  
  // Subscribe to real-time updates
  const unsubscribe = onSnapshot(
    orderedQuery, 
    processSnapshot,
    (error) => {
      // Don't log permission errors - they're expected if rules aren't configured
      const isPermissionError = error.message?.includes('permission') || error.code === 'permission-denied';
      
      // If index error, fall back to unordered query
      if (error.message.includes('index')) {
        onSnapshot(
          mealsRef,
          (snapshot) => {
            const meals: Meal[] = [];
            snapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data() as FirestoreMealFromIOS;
              meals.push(mealFromFirestoreIOS(docSnapshot.id, data));
            });
            // Sort client-side
            meals.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
            onMealsUpdate(meals);
          },
          (fallbackError) => {
            if (!fallbackError.message?.includes('permission')) {
              console.error('Error in fallback meals subscription:', fallbackError);
            }
            if (onError) onError(fallbackError);
          }
        );
      } else if (!isPermissionError) {
        console.error('Error in meals subscription:', error);
        if (onError) onError(error);
      } else {
        // Silently pass permission errors to handler
        if (onError) onError(error);
      }
    }
  );
  
  return unsubscribe;
}

// ============================================
// Blood Work Operations
// ============================================

/**
 * Fetch blood work for a user
 */
export async function fetchUserBloodWork(userId: string): Promise<BloodWork | null> {
  if (!db || !isFirebaseConfigured) {
    console.warn('Firestore not configured');
    return null;
  }

  try {
    const bloodWorkRef = doc(db, 'bloodwork', userId);
    const snapshot = await getDoc(bloodWorkRef);
    
    if (snapshot.exists()) {
      return bloodWorkFromFirestore(snapshot.id, snapshot.data() as FirestoreBloodWork);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching blood work:', error);
    return null;
  }
}

/**
 * Save blood work for a user (upsert)
 */
export async function saveUserBloodWork(userId: string, bloodWork: BloodWork): Promise<boolean> {
  if (!db || !isFirebaseConfigured) {
    console.warn('Firestore not configured');
    return false;
  }

  try {
    const bloodWorkRef = doc(db, 'bloodwork', userId);
    const now = Timestamp.now();
    
    await setDoc(bloodWorkRef, {
      ...bloodWorkToFirestore(bloodWork, userId),
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error saving blood work:', error);
    return false;
  }
}

/**
 * Subscribe to blood work updates for a user
 */
export function subscribeToBloodWork(
  userId: string,
  onBloodWorkUpdate: (bloodWork: BloodWork | null) => void,
  onError?: (error: Error) => void
): () => void {
  if (!db || !isFirebaseConfigured) {
    return () => {};
  }

  try {
    const bloodWorkRef = doc(db, 'bloodwork', userId);
    
    const unsubscribe = onSnapshot(
      bloodWorkRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onBloodWorkUpdate(bloodWorkFromFirestore(snapshot.id, snapshot.data() as FirestoreBloodWork));
        } else {
          onBloodWorkUpdate(null);
        }
      },
      (error: any) => {
        // Don't log permission errors - they're expected if rules aren't configured
        const isPermissionError = error.message?.includes('permission') || error.code === 'permission-denied';
        if (!isPermissionError) {
          console.error('Error in blood work subscription:', error);
        }
        // Return null for bloodwork on any error
        onBloodWorkUpdate(null);
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    return () => {};
  }
}

