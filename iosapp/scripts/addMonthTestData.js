// Run this script with: node scripts/addMonthTestData.js
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

// Typical American meals with flags
const breakfasts = [
  { foods: [{ name: 'Eggs and Bacon', portion: '2 eggs, 3 strips' }, { name: 'Toast', portion: '2 slices' }, { name: 'Coffee', portion: '12oz' }], flags: ['processed_meat', 'refined_grain', 'caffeine'], nutrition: { calories: 450, protein: 22, carbs: 30, fat: 28, sodium: 800 } },
  { foods: [{ name: 'Cereal with Milk', portion: '1.5 cups' }, { name: 'Orange Juice', portion: '8oz' }], flags: ['refined_grain', 'high_sugar_beverage'], nutrition: { calories: 380, protein: 10, carbs: 72, fat: 6, sodium: 320 } },
  { foods: [{ name: 'McDonald\'s Egg McMuffin', portion: '1 sandwich' }, { name: 'Hash Brown', portion: '1 piece' }, { name: 'Coffee', portion: '16oz' }], flags: ['processed_meat', 'refined_grain', 'fried', 'caffeine', 'ultra_processed'], nutrition: { calories: 580, protein: 20, carbs: 52, fat: 30, sodium: 1100 } },
  { foods: [{ name: 'Bagel with Cream Cheese', portion: '1 bagel' }, { name: 'Iced Latte', portion: '16oz' }], flags: ['refined_grain', 'caffeine'], nutrition: { calories: 520, protein: 14, carbs: 65, fat: 22, sodium: 580 } },
  { foods: [{ name: 'Pancakes with Syrup', portion: '3 pancakes' }, { name: 'Sausage Links', portion: '3 links' }, { name: 'Coffee', portion: '12oz' }], flags: ['refined_grain', 'processed_meat', 'caffeine'], nutrition: { calories: 720, protein: 18, carbs: 95, fat: 30, sodium: 950 } },
  { foods: [{ name: 'Greek Yogurt with Granola', portion: '1 cup' }, { name: 'Coffee', portion: '12oz' }], flags: ['caffeine'], nutrition: { calories: 320, protein: 18, carbs: 42, fat: 8, sodium: 120 } },
  { foods: [{ name: 'Breakfast Burrito', portion: '1 large' }, { name: 'Orange Juice', portion: '12oz' }], flags: ['refined_grain', 'high_sodium', 'high_sugar_beverage'], nutrition: { calories: 650, protein: 24, carbs: 58, fat: 35, sodium: 1200 } },
  { foods: [{ name: 'Donuts', portion: '2 donuts' }, { name: 'Coffee', portion: '16oz' }], flags: ['refined_grain', 'fried', 'ultra_processed', 'caffeine'], nutrition: { calories: 580, protein: 6, carbs: 68, fat: 32, sodium: 420 } },
  { foods: [{ name: 'Oatmeal', portion: '1 bowl' }, { name: 'Banana', portion: '1 medium' }, { name: 'Black Coffee', portion: '12oz' }], flags: ['caffeine'], nutrition: { calories: 350, protein: 10, carbs: 65, fat: 6, sodium: 150 } },
  { foods: [{ name: 'Starbucks Frappuccino', portion: '16oz' }, { name: 'Croissant', portion: '1 piece' }], flags: ['caffeine', 'high_sugar_beverage', 'refined_grain'], nutrition: { calories: 620, protein: 8, carbs: 85, fat: 28, sodium: 380 } },
];

const lunches = [
  { foods: [{ name: 'Cheeseburger', portion: '1 burger' }, { name: 'Fries', portion: 'medium' }, { name: 'Coke', portion: '20oz', container: 'plastic_bottle' }], flags: ['fried', 'high_sodium', 'refined_grain', 'high_sugar_beverage', 'plastic_bottle'], nutrition: { calories: 1150, protein: 32, carbs: 135, fat: 52, sodium: 1650 } },
  { foods: [{ name: 'Subway Turkey Sub', portion: '12 inch' }, { name: 'Chips', portion: '1 bag' }, { name: 'Diet Coke', portion: '20oz', container: 'plastic_bottle' }], flags: ['processed_meat', 'refined_grain', 'high_sodium', 'ultra_processed', 'plastic_bottle'], nutrition: { calories: 780, protein: 35, carbs: 95, fat: 28, sodium: 2100 } },
  { foods: [{ name: 'Caesar Salad with Chicken', portion: '1 large' }, { name: 'Bread Roll', portion: '1 piece' }, { name: 'Iced Tea', portion: '16oz' }], flags: ['refined_grain'], nutrition: { calories: 520, protein: 38, carbs: 32, fat: 28, sodium: 850 } },
  { foods: [{ name: 'Pizza', portion: '3 slices' }, { name: 'Pepsi', portion: '20oz', container: 'plastic_bottle' }], flags: ['refined_grain', 'high_sodium', 'high_sugar_beverage', 'plastic_bottle'], nutrition: { calories: 980, protein: 28, carbs: 115, fat: 42, sodium: 1850 } },
  { foods: [{ name: 'Chipotle Burrito Bowl', portion: '1 bowl' }, { name: 'Chips and Guac', portion: '1 serving' }, { name: 'Lemonade', portion: '16oz' }], flags: ['high_sodium', 'high_sugar_beverage'], nutrition: { calories: 1100, protein: 45, carbs: 98, fat: 52, sodium: 2200 } },
  { foods: [{ name: 'Chicken Nuggets', portion: '10 piece' }, { name: 'Fries', portion: 'large' }, { name: 'Sprite', portion: '16oz' }], flags: ['fried', 'ultra_processed', 'high_sodium', 'high_sugar_beverage'], nutrition: { calories: 980, protein: 28, carbs: 105, fat: 48, sodium: 1450 } },
  { foods: [{ name: 'Tuna Sandwich', portion: '1 sandwich' }, { name: 'Apple', portion: '1 medium' }, { name: 'Water', portion: '16oz', container: 'plastic_bottle' }], flags: ['refined_grain', 'plastic_bottle'], nutrition: { calories: 450, protein: 28, carbs: 52, fat: 14, sodium: 680 } },
  { foods: [{ name: 'Ramen Noodles', portion: '1 bowl' }, { name: 'Soda', portion: '12oz' }], flags: ['ultra_processed', 'high_sodium', 'refined_grain', 'high_sugar_beverage'], nutrition: { calories: 580, protein: 12, carbs: 85, fat: 18, sodium: 1800 } },
  { foods: [{ name: 'Grilled Chicken Wrap', portion: '1 wrap' }, { name: 'Side Salad', portion: '1 small' }, { name: 'Unsweetened Tea', portion: '16oz' }], flags: ['refined_grain'], nutrition: { calories: 420, protein: 32, carbs: 38, fat: 16, sodium: 750 } },
  { foods: [{ name: 'Hot Dog', portion: '2 dogs' }, { name: 'Chips', portion: '1 bag' }, { name: 'Mountain Dew', portion: '20oz', container: 'plastic_bottle' }], flags: ['processed_meat', 'ultra_processed', 'high_sodium', 'high_sugar_beverage', 'plastic_bottle'], nutrition: { calories: 850, protein: 18, carbs: 95, fat: 42, sodium: 1950 } },
];

const dinners = [
  { foods: [{ name: 'Grilled Steak', portion: '8oz' }, { name: 'Baked Potato', portion: '1 large' }, { name: 'Steamed Broccoli', portion: '1 cup' }, { name: 'Beer', portion: '12oz' }], flags: ['alcohol', 'charred_grilled'], nutrition: { calories: 820, protein: 55, carbs: 52, fat: 35, sodium: 680 } },
  { foods: [{ name: 'Spaghetti with Meat Sauce', portion: '2 cups' }, { name: 'Garlic Bread', portion: '2 slices' }, { name: 'Wine', portion: '6oz' }], flags: ['refined_grain', 'high_sodium', 'alcohol'], nutrition: { calories: 950, protein: 32, carbs: 105, fat: 38, sodium: 1250 } },
  { foods: [{ name: 'Fried Chicken', portion: '3 pieces' }, { name: 'Mashed Potatoes', portion: '1 cup' }, { name: 'Coleslaw', portion: '1/2 cup' }, { name: 'Sweet Tea', portion: '16oz' }], flags: ['fried', 'high_sodium', 'high_sugar_beverage'], nutrition: { calories: 1150, protein: 48, carbs: 95, fat: 62, sodium: 1850 } },
  { foods: [{ name: 'Pepperoni Pizza', portion: '4 slices' }, { name: 'Buffalo Wings', portion: '6 wings' }, { name: 'Beer', portion: '2 bottles' }], flags: ['processed_meat', 'refined_grain', 'high_sodium', 'fried', 'alcohol'], nutrition: { calories: 1650, protein: 58, carbs: 125, fat: 85, sodium: 3200 } },
  { foods: [{ name: 'Salmon Fillet', portion: '6oz' }, { name: 'Rice Pilaf', portion: '1 cup' }, { name: 'Asparagus', portion: '6 spears' }, { name: 'White Wine', portion: '6oz' }], flags: ['alcohol'], nutrition: { calories: 680, protein: 42, carbs: 48, fat: 28, sodium: 520 } },
  { foods: [{ name: 'Tacos', portion: '3 tacos' }, { name: 'Chips and Salsa', portion: '1 basket' }, { name: 'Margarita', portion: '12oz' }], flags: ['refined_grain', 'high_sodium', 'alcohol', 'fried'], nutrition: { calories: 1100, protein: 28, carbs: 98, fat: 52, sodium: 1650 } },
  { foods: [{ name: 'Cheeseburger', portion: '1 large' }, { name: 'Onion Rings', portion: '1 order' }, { name: 'Milkshake', portion: '16oz' }], flags: ['fried', 'refined_grain', 'high_sodium', 'high_sugar_beverage'], nutrition: { calories: 1450, protein: 38, carbs: 145, fat: 78, sodium: 1950 } },
  { foods: [{ name: 'Roast Chicken', portion: '1/4 chicken' }, { name: 'Roasted Vegetables', portion: '1 cup' }, { name: 'Dinner Roll', portion: '1 roll' }], flags: ['refined_grain'], nutrition: { calories: 580, protein: 42, carbs: 38, fat: 28, sodium: 720 } },
  { foods: [{ name: 'BBQ Ribs', portion: '1/2 rack' }, { name: 'Corn on the Cob', portion: '1 ear' }, { name: 'Baked Beans', portion: '1/2 cup' }, { name: 'Beer', portion: '12oz' }], flags: ['processed_meat', 'charred_grilled', 'high_sodium', 'alcohol'], nutrition: { calories: 1250, protein: 52, carbs: 85, fat: 68, sodium: 2100 } },
  { foods: [{ name: 'Frozen Lasagna', portion: '1 serving' }, { name: 'Garlic Bread', portion: '2 slices' }, { name: 'Soda', portion: '12oz' }], flags: ['ultra_processed', 'refined_grain', 'high_sodium', 'high_sugar_beverage'], nutrition: { calories: 920, protein: 28, carbs: 98, fat: 45, sodium: 1650 } },
];

const snacks = [
  { foods: [{ name: 'Potato Chips', portion: '1 bag' }, { name: 'Soda', portion: '12oz' }], flags: ['ultra_processed', 'high_sodium', 'fried', 'high_sugar_beverage'], nutrition: { calories: 450, protein: 4, carbs: 65, fat: 22, sodium: 580 } },
  { foods: [{ name: 'Ice Cream', portion: '2 scoops' }], flags: ['ultra_processed'], nutrition: { calories: 320, protein: 5, carbs: 38, fat: 18, sodium: 120 } },
  { foods: [{ name: 'Cookies', portion: '4 cookies' }, { name: 'Milk', portion: '8oz' }], flags: ['refined_grain', 'ultra_processed'], nutrition: { calories: 420, protein: 8, carbs: 58, fat: 18, sodium: 280 } },
  { foods: [{ name: 'Energy Drink', portion: '16oz' }], flags: ['caffeine', 'high_sugar_beverage'], nutrition: { calories: 220, protein: 0, carbs: 54, fat: 0, sodium: 180 } },
  { foods: [{ name: 'Candy Bar', portion: '1 bar' }], flags: ['ultra_processed'], nutrition: { calories: 280, protein: 4, carbs: 35, fat: 14, sodium: 120 } },
  { foods: [{ name: 'Popcorn', portion: '1 bag' }, { name: 'Beer', portion: '12oz' }], flags: ['high_sodium', 'alcohol'], nutrition: { calories: 420, protein: 6, carbs: 52, fat: 18, sodium: 650 } },
  { foods: [{ name: 'Nachos with Cheese', portion: '1 plate' }], flags: ['ultra_processed', 'high_sodium', 'fried'], nutrition: { calories: 580, protein: 12, carbs: 55, fat: 35, sodium: 1100 } },
  { foods: [{ name: 'Apple with Peanut Butter', portion: '1 apple, 2 tbsp' }], flags: [], nutrition: { calories: 280, protein: 8, carbs: 32, fat: 16, sodium: 150 } },
  { foods: [{ name: 'Protein Bar', portion: '1 bar' }], flags: ['ultra_processed'], nutrition: { calories: 250, protein: 20, carbs: 28, fat: 8, sodium: 220 } },
  { foods: [{ name: 'Cheese and Crackers', portion: '6 crackers, 2oz cheese' }], flags: ['refined_grain', 'high_sodium'], nutrition: { calories: 320, protein: 12, carbs: 22, fat: 22, sodium: 480 } },
];

const lateNightSnacks = [
  { foods: [{ name: 'Pizza Rolls', portion: '10 pieces' }, { name: 'Soda', portion: '12oz' }], flags: ['ultra_processed', 'high_sodium', 'fried', 'high_sugar_beverage', 'late_meal'], nutrition: { calories: 480, protein: 8, carbs: 58, fat: 22, sodium: 850 } },
  { foods: [{ name: 'Ice Cream', portion: '1 bowl' }], flags: ['ultra_processed', 'late_meal'], nutrition: { calories: 380, protein: 6, carbs: 45, fat: 20, sodium: 140 } },
  { foods: [{ name: 'Leftover Pizza', portion: '2 slices' }], flags: ['refined_grain', 'high_sodium', 'late_meal'], nutrition: { calories: 520, protein: 18, carbs: 58, fat: 24, sodium: 1100 } },
  { foods: [{ name: 'Chips and Dip', portion: '1 serving' }, { name: 'Beer', portion: '12oz' }], flags: ['ultra_processed', 'high_sodium', 'alcohol', 'late_meal'], nutrition: { calories: 520, protein: 6, carbs: 48, fat: 28, sodium: 780 } },
  { foods: [{ name: 'Instant Ramen', portion: '1 pack' }], flags: ['ultra_processed', 'high_sodium', 'refined_grain', 'late_meal'], nutrition: { calories: 380, protein: 8, carbs: 52, fat: 14, sodium: 1650 } },
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMealsForDay(dayOffset) {
  const meals = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - dayOffset);

  // Breakfast (7-9am)
  const breakfastTime = new Date(baseDate);
  breakfastTime.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
  const breakfast = { ...randomChoice(breakfasts) };
  breakfast.loggedAt = Timestamp.fromDate(breakfastTime);
  breakfast.createdAt = Timestamp.fromDate(breakfastTime);
  breakfast.status = 'completed';
  breakfast.imageUrl = null;
  breakfast.metadata = { source: 'phone_photo' };
  meals.push(breakfast);

  // Lunch (11:30am-1:30pm)
  const lunchTime = new Date(baseDate);
  lunchTime.setHours(11 + Math.floor(Math.random() * 2), 30 + Math.floor(Math.random() * 60), 0, 0);
  const lunch = { ...randomChoice(lunches) };
  lunch.loggedAt = Timestamp.fromDate(lunchTime);
  lunch.createdAt = Timestamp.fromDate(lunchTime);
  lunch.status = 'completed';
  lunch.imageUrl = null;
  lunch.metadata = { source: 'phone_photo' };
  meals.push(lunch);

  // Dinner (6-8pm)
  const dinnerTime = new Date(baseDate);
  dinnerTime.setHours(18 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
  const dinner = { ...randomChoice(dinners) };
  dinner.loggedAt = Timestamp.fromDate(dinnerTime);
  dinner.createdAt = Timestamp.fromDate(dinnerTime);
  dinner.status = 'completed';
  dinner.imageUrl = null;
  dinner.metadata = { source: 'phone_photo' };
  meals.push(dinner);

  // 60% chance of afternoon snack (2-4pm)
  if (Math.random() < 0.6) {
    const snackTime = new Date(baseDate);
    snackTime.setHours(14 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
    const snack = { ...randomChoice(snacks) };
    snack.loggedAt = Timestamp.fromDate(snackTime);
    snack.createdAt = Timestamp.fromDate(snackTime);
    snack.status = 'completed';
    snack.imageUrl = null;
    snack.metadata = { source: 'phone_photo' };
    meals.push(snack);
  }

  // 30% chance of late night snack (10pm-midnight) - more likely on weekends
  const isWeekend = baseDate.getDay() === 0 || baseDate.getDay() === 6;
  if (Math.random() < (isWeekend ? 0.5 : 0.25)) {
    const lateTime = new Date(baseDate);
    lateTime.setHours(22 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
    const lateSnack = { ...randomChoice(lateNightSnacks) };
    lateSnack.loggedAt = Timestamp.fromDate(lateTime);
    lateSnack.createdAt = Timestamp.fromDate(lateTime);
    lateSnack.status = 'completed';
    lateSnack.imageUrl = null;
    lateSnack.metadata = { source: 'phone_photo' };
    meals.push(lateSnack);
  }

  return meals;
}

async function addMeals() {
  try {
    console.log('Signing in as test@test.com...');
    const userCredential = await signInWithEmailAndPassword(auth, 'test@test.com', '123456');
    const userId = userCredential.user.uid;
    console.log('Signed in! User ID:', userId);

    // Generate 30 days of meals
    const allMeals = [];
    for (let day = 0; day < 30; day++) {
      const dayMeals = generateMealsForDay(day);
      allMeals.push(...dayMeals);
    }

    console.log(`Generated ${allMeals.length} meals for 30 days`);

    // Add all meals to Firestore
    const mealsRef = collection(db, 'users', userId, 'meals');
    let count = 0;
    for (const meal of allMeals) {
      await addDoc(mealsRef, meal);
      count++;
      if (count % 10 === 0) {
        console.log(`Added ${count}/${allMeals.length} meals...`);
      }
    }

    console.log(`\nDone! Added ${allMeals.length} meals for test@test.com`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMeals();
