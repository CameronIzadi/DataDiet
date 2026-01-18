import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Meal, FoodItem } from '../types';
import { analyzeFood } from './gemini';

const DEMO_USER_ID = 'demo_user';

export async function saveMeal(
  userId: string = DEMO_USER_ID,
  foods: FoodItem[],
  flags: string[],
  nutrition?: any,
  imageBase64?: string
): Promise<string> {
  let imageUrl: string | undefined;

  // Upload image if provided
  if (imageBase64) {
    try {
      const imageRef = ref(storage, `meals/${userId}/${Date.now()}.jpg`);
      const response = await fetch(`data:image/jpeg;base64,${imageBase64}`);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      imageUrl = await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  const loggedAt = new Date();

  // Save to Firebase Firestore
  const mealsRef = collection(db, 'users', userId, 'meals');
  const docRef = await addDoc(mealsRef, {
    foods,
    flags,
    nutrition: nutrition || null,
    imageUrl: imageUrl || null,
    loggedAt: Timestamp.fromDate(loggedAt),
    createdAt: Timestamp.now(),
    metadata: {
      source: imageBase64 ? 'phone_photo' : 'manual'
    }
  });

  return docRef.id;
}

export async function getMeals(
  userId: string = DEMO_USER_ID,
  startDate?: Date,
  endDate?: Date,
  maxResults: number = 100
): Promise<Meal[]> {
  // Fetch from Firebase Firestore
  const mealsRef = collection(db, 'users', userId, 'meals');

  let q;
  if (startDate && endDate) {
    q = query(
      mealsRef,
      where('loggedAt', '>=', Timestamp.fromDate(startDate)),
      where('loggedAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('loggedAt', 'desc'),
      limit(maxResults)
    );
  } else {
    q = query(mealsRef, orderBy('loggedAt', 'desc'), limit(maxResults));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    userId,
    ...doc.data(),
    loggedAt: doc.data().loggedAt?.toDate() || new Date(),
  })) as Meal[];
}

export async function getRecentMeals(
  userId: string = DEMO_USER_ID,
  count: number = 10
): Promise<Meal[]> {
  return getMeals(userId, undefined, undefined, count);
}

/**
 * Save a pending meal immediately with just the image.
 * Returns the meal ID for later update.
 */
export async function savePendingMeal(
  userId: string = DEMO_USER_ID,
  imageBase64: string
): Promise<string> {
  let imageUrl: string | undefined;

  // Upload image with timeout
  try {
    console.log('Starting image upload for user:', userId);
    const imageRef = ref(storage, `meals/${userId}/${Date.now()}.jpg`);
    const response = await fetch(`data:image/jpeg;base64,${imageBase64}`);
    const blob = await response.blob();
    console.log('Blob created, size:', blob.size);

    // Add timeout for upload (60 seconds)
    console.log('Starting uploadBytes...');
    const uploadPromise = uploadBytes(imageRef, blob);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout after 60s')), 60000)
    );

    await Promise.race([uploadPromise, timeoutPromise]);
    console.log('Upload complete, getting download URL...');
    imageUrl = await getDownloadURL(imageRef);
    console.log('Image uploaded successfully:', imageUrl);
  } catch (error: any) {
    console.error('Error uploading image:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    // Continue without image - meal will still be saved
  }

  const loggedAt = new Date();

  // Save pending meal to Firebase
  const mealsRef = collection(db, 'users', userId, 'meals');
  const docRef = await addDoc(mealsRef, {
    foods: [],
    flags: [],
    nutrition: null,
    imageUrl: imageUrl || null,
    loggedAt: Timestamp.fromDate(loggedAt),
    createdAt: Timestamp.now(),
    status: 'pending',
    metadata: {
      source: 'phone_photo'
    }
  });

  return docRef.id;
}

/**
 * Update an existing meal with Gemini analysis results.
 */
export async function updateMealWithAnalysis(
  userId: string = DEMO_USER_ID,
  mealId: string,
  foods: FoodItem[],
  flags: string[],
  nutrition?: any
): Promise<void> {
  const mealRef = doc(db, 'users', userId, 'meals', mealId);

  await updateDoc(mealRef, {
    foods,
    flags,
    nutrition: nutrition || null,
    status: 'completed',
    analyzedAt: Timestamp.now()
  });
}

/**
 * Mark a meal as failed if analysis fails.
 */
export async function markMealFailed(
  userId: string = DEMO_USER_ID,
  mealId: string,
  error?: string
): Promise<void> {
  const mealRef = doc(db, 'users', userId, 'meals', mealId);

  await updateDoc(mealRef, {
    status: 'failed',
    errorMessage: error || 'Analysis failed'
  });
}

/**
 * Delete a meal.
 */
export async function deleteMeal(
  userId: string = DEMO_USER_ID,
  mealId: string
): Promise<void> {
  const mealRef = doc(db, 'users', userId, 'meals', mealId);
  await deleteDoc(mealRef);
}

/**
 * Subscribe to real-time meal updates.
 * Returns an unsubscribe function.
 */
export function subscribeMeals(
  userId: string = DEMO_USER_ID,
  maxResults: number = 10,
  onUpdate: (meals: Meal[]) => void
): () => void {
  const mealsRef = collection(db, 'users', userId, 'meals');
  const q = query(mealsRef, orderBy('loggedAt', 'desc'), limit(maxResults));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const meals = snapshot.docs.map(doc => ({
      id: doc.id,
      userId,
      ...doc.data(),
      loggedAt: doc.data().loggedAt?.toDate() || new Date(),
    })) as Meal[];
    onUpdate(meals);
  });

  return unsubscribe;
}

/**
 * Retry analysis for pending meals.
 * Called when app opens to recover from interrupted analyses.
 */
export async function retryPendingMeals(
  userId: string = DEMO_USER_ID
): Promise<void> {
  try {
    const mealsRef = collection(db, 'users', userId, 'meals');
    const q = query(
      mealsRef,
      where('status', '==', 'pending'),
      limit(10)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No pending meals to retry');
      return;
    }

    console.log(`Found ${snapshot.docs.length} pending meals to retry`);

    for (const mealDoc of snapshot.docs) {
      const meal = mealDoc.data();
      const mealId = mealDoc.id;

      // Skip if no image URL (can't analyze without image)
      if (!meal.imageUrl) {
        console.log(`Meal ${mealId} has no image, marking as failed`);
        await markMealFailed(userId, mealId, 'No image available for analysis');
        continue;
      }

      try {
        console.log(`Retrying analysis for meal ${mealId}...`);

        // Fetch the image and convert to base64
        const response = await fetch(meal.imageUrl);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);

        // Analyze with Gemini
        const analysis = await analyzeFood(base64);

        // Add late_meal flag if needed
        const loggedAt = meal.loggedAt?.toDate() || new Date();
        const hour = loggedAt.getHours();
        if ((hour >= 21 || hour < 5) && !analysis.flags.includes('late_meal')) {
          analysis.flags.push('late_meal');
        }

        // Update meal with results
        await updateMealWithAnalysis(
          userId,
          mealId,
          analysis.foods,
          analysis.flags,
          analysis.estimated_nutrition
        );

        console.log(`Retry successful for meal ${mealId}`);
      } catch (error: any) {
        console.error(`Retry failed for meal ${mealId}:`, error);
        await markMealFailed(userId, mealId, error?.message || 'Retry failed');
      }
    }
  } catch (error) {
    console.error('Error retrying pending meals:', error);
  }
}

// Helper to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
