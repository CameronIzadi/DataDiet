// Run this script with: node scripts/addTestData.js
// Make sure you're in the iosapp directory

require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const testMeals = [
  {
    foods: [
      { name: 'Grilled Chicken Salad', portion: '1 bowl', container: 'none' },
      { name: 'Sparkling Water', portion: '500ml', container: 'plastic_bottle' }
    ],
    flags: ['plastic_bottle'],
    nutrition: { calories: 350, protein: 35, carbs: 15, fat: 12, sodium: 450 },
    imageUrl: null,
    loggedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
    createdAt: Timestamp.now(),
    status: 'completed',
    metadata: { source: 'phone_photo' }
  },
  {
    foods: [
      { name: 'Bacon Cheeseburger', portion: '1 burger', container: 'none' },
      { name: 'French Fries', portion: 'large', container: 'none' },
      { name: 'Coca-Cola', portion: '500ml', container: 'plastic_bottle' }
    ],
    flags: ['processed_meat', 'fried', 'high_sodium', 'plastic_bottle', 'high_sugar_beverage'],
    nutrition: { calories: 1200, protein: 45, carbs: 120, fat: 55, sodium: 1800 },
    imageUrl: null,
    loggedAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
    createdAt: Timestamp.now(),
    status: 'completed',
    metadata: { source: 'phone_photo' }
  },
  {
    foods: [
      { name: 'Pepperoni Pizza', portion: '3 slices', container: 'none' },
      { name: 'Beer', portion: '1 pint', container: 'glass' }
    ],
    flags: ['processed_meat', 'refined_grain', 'high_sodium', 'alcohol'],
    nutrition: { calories: 950, protein: 30, carbs: 90, fat: 45, sodium: 1500 },
    imageUrl: null,
    loggedAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.now(),
    status: 'completed',
    metadata: { source: 'phone_photo' }
  },
  {
    foods: [
      { name: 'Oatmeal with Berries', portion: '1 bowl', container: 'none' },
      { name: 'Black Coffee', portion: '12oz', container: 'none' }
    ],
    flags: ['caffeine'],
    nutrition: { calories: 280, protein: 8, carbs: 50, fat: 6, sodium: 100 },
    imageUrl: null,
    loggedAt: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 60 * 1000)),
    createdAt: Timestamp.now(),
    status: 'completed',
    metadata: { source: 'phone_photo' }
  },
  {
    foods: [
      { name: 'Hot Dog', portion: '2 hot dogs', container: 'none' },
      { name: 'Chips', portion: '1 bag', container: 'none' },
      { name: 'Energy Drink', portion: '16oz', container: 'can' }
    ],
    flags: ['processed_meat', 'ultra_processed', 'high_sodium', 'caffeine', 'high_sugar_beverage'],
    nutrition: { calories: 850, protein: 20, carbs: 85, fat: 40, sodium: 2200 },
    imageUrl: null,
    loggedAt: Timestamp.fromDate(new Date(Date.now() - 48 * 60 * 60 * 1000)),
    createdAt: Timestamp.now(),
    status: 'completed',
    metadata: { source: 'phone_photo' }
  }
];

async function addMeals() {
  try {
    // Sign in as test user
    console.log('Signing in as test@test.com...');
    const userCredential = await signInWithEmailAndPassword(auth, 'test@test.com', '123456');
    const userId = userCredential.user.uid;
    console.log('Signed in! User ID:', userId);

    // Add meals
    const mealsRef = collection(db, 'users', userId, 'meals');
    for (const meal of testMeals) {
      const docRef = await addDoc(mealsRef, meal);
      console.log('Added meal:', meal.foods[0].name, '- ID:', docRef.id);
    }

    console.log('\nDone! Added', testMeals.length, 'test meals for test@test.com');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMeals();
