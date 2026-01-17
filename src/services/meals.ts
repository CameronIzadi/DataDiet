import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Meal, FoodItem } from '../types';

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

  // Upload image
  try {
    const imageRef = ref(storage, `meals/${userId}/${Date.now()}.jpg`);
    const response = await fetch(`data:image/jpeg;base64,${imageBase64}`);
    const blob = await response.blob();
    await uploadBytes(imageRef, blob);
    imageUrl = await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error uploading image:', error);
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
