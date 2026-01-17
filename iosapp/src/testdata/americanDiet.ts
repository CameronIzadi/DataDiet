/**
 * Average American Diet Test Data Generator
 *
 * Generates realistic meal data representing a typical American diet
 * for various percentages of a year. Based on USDA dietary data and
 * common American eating patterns.
 *
 * Usage:
 * - generateAmericanDiet20(): ~73 days (20% of year)
 * - generateAmericanDiet50(): ~183 days (50% of year)
 * - generateAmericanDiet80(): ~292 days (80% of year)
 * - generateAmericanDiet100(): 365 days (full year)
 */

import { Meal, FoodItem, Nutrition } from '../types';

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);
const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ============================================================================
// AMERICAN DIET MEAL TEMPLATES
// Based on typical American eating patterns and nutritional profiles
// ============================================================================

type MealTemplate = {
  foods: { name: string; portion: string; container?: 'plastic_bottle' | 'glass' | 'can' | 'none' }[];
  nutrition: Nutrition;
  flags: string[];
};

// BREAKFAST - Average American breakfast patterns
const BREAKFASTS: MealTemplate[] = [
  // Fast food breakfast (common)
  {
    foods: [
      { name: 'Egg McMuffin', portion: '1 sandwich' },
      { name: 'Hash Browns', portion: '1 piece' },
      { name: 'Coffee', portion: '16 oz' },
    ],
    nutrition: { calories: 480, protein: 20, carbs: 48, fat: 24, sodium: 1050 },
    flags: ['processed_meat', 'ultra_processed', 'fried', 'caffeine', 'high_sodium'],
  },
  // Cereal breakfast (very common)
  {
    foods: [
      { name: 'Frosted Flakes', portion: '1.5 cups' },
      { name: 'Milk', portion: '1 cup' },
    ],
    nutrition: { calories: 280, protein: 6, carbs: 56, fat: 4, sodium: 320 },
    flags: ['refined_grain', 'ultra_processed'],
  },
  // Bacon and eggs
  {
    foods: [
      { name: 'Scrambled Eggs', portion: '2 eggs' },
      { name: 'Bacon', portion: '3 strips' },
      { name: 'White Toast', portion: '2 slices' },
      { name: 'Orange Juice', portion: '8 oz', container: 'plastic_bottle' },
    ],
    nutrition: { calories: 520, protein: 24, carbs: 36, fat: 32, sodium: 1020 },
    flags: ['processed_meat', 'refined_grain', 'high_sugar_beverage', 'plastic', 'high_sodium'],
  },
  // Pancakes
  {
    foods: [
      { name: 'Pancakes', portion: '3 pancakes' },
      { name: 'Maple Syrup', portion: '3 tbsp' },
      { name: 'Butter', portion: '2 tbsp' },
    ],
    nutrition: { calories: 580, protein: 10, carbs: 88, fat: 22, sodium: 680 },
    flags: ['refined_grain'],
  },
  // Bagel with cream cheese (common grab-and-go)
  {
    foods: [
      { name: 'Bagel', portion: '1 large' },
      { name: 'Cream Cheese', portion: '2 tbsp' },
      { name: 'Coffee', portion: '12 oz' },
    ],
    nutrition: { calories: 410, protein: 12, carbs: 62, fat: 14, sodium: 540 },
    flags: ['refined_grain', 'caffeine'],
  },
  // Breakfast burrito
  {
    foods: [
      { name: 'Breakfast Burrito', portion: '1 large' },
      { name: 'Salsa', portion: '2 tbsp' },
    ],
    nutrition: { calories: 480, protein: 20, carbs: 48, fat: 24, sodium: 980 },
    flags: ['refined_grain', 'high_sodium', 'acidic_trigger'],
  },
  // Oatmeal (healthier option, less common)
  {
    foods: [
      { name: 'Oatmeal', portion: '1 cup' },
      { name: 'Brown Sugar', portion: '2 tbsp' },
      { name: 'Banana', portion: '1 medium' },
    ],
    nutrition: { calories: 320, protein: 8, carbs: 64, fat: 5, sodium: 120 },
    flags: [],
  },
  // Donut and coffee (common quick breakfast)
  {
    foods: [
      { name: 'Glazed Donut', portion: '2 donuts' },
      { name: 'Coffee', portion: '16 oz' },
    ],
    nutrition: { calories: 460, protein: 6, carbs: 58, fat: 24, sodium: 340 },
    flags: ['refined_grain', 'fried', 'caffeine', 'ultra_processed'],
  },
  // Yogurt and granola
  {
    foods: [
      { name: 'Vanilla Yogurt', portion: '1 cup' },
      { name: 'Granola', portion: '1/2 cup' },
    ],
    nutrition: { calories: 380, protein: 12, carbs: 58, fat: 12, sodium: 180 },
    flags: ['ultra_processed'],
  },
  // Skip breakfast / just coffee (very common)
  {
    foods: [
      { name: 'Coffee', portion: '20 oz' },
      { name: 'Creamer', portion: '2 tbsp' },
    ],
    nutrition: { calories: 80, protein: 1, carbs: 8, fat: 5, sodium: 20 },
    flags: ['caffeine'],
  },
  // Drive-thru breakfast sandwich
  {
    foods: [
      { name: 'Sausage Biscuit', portion: '1 sandwich' },
      { name: 'Iced Coffee', portion: '16 oz', container: 'plastic_bottle' },
    ],
    nutrition: { calories: 620, protein: 18, carbs: 52, fat: 38, sodium: 1280 },
    flags: ['processed_meat', 'ultra_processed', 'caffeine', 'plastic', 'high_sodium'],
  },
  // French toast
  {
    foods: [
      { name: 'French Toast', portion: '3 slices' },
      { name: 'Syrup', portion: '3 tbsp' },
      { name: 'Sausage Links', portion: '2 links' },
    ],
    nutrition: { calories: 640, protein: 18, carbs: 72, fat: 32, sodium: 820 },
    flags: ['processed_meat', 'refined_grain'],
  },
];

// LUNCH - Average American lunch patterns
const LUNCHES: MealTemplate[] = [
  // Fast food burger combo (very common)
  {
    foods: [
      { name: 'Cheeseburger', portion: '1 burger' },
      { name: 'French Fries', portion: 'medium' },
      { name: 'Coca-Cola', portion: '20 oz', container: 'plastic_bottle' },
    ],
    nutrition: { calories: 1180, protein: 32, carbs: 126, fat: 58, sodium: 1720 },
    flags: ['fried', 'high_sugar_beverage', 'plastic', 'high_sodium', 'ultra_processed'],
  },
  // Sandwich shop sub
  {
    foods: [
      { name: 'Turkey Sub', portion: '12 inch' },
      { name: 'Chips', portion: '1 bag' },
      { name: 'Diet Coke', portion: '20 oz', container: 'plastic_bottle' },
    ],
    nutrition: { calories: 780, protein: 38, carbs: 82, fat: 32, sodium: 2280 },
    flags: ['processed_meat', 'refined_grain', 'plastic', 'high_sodium', 'ultra_processed'],
  },
  // Pizza slice lunch
  {
    foods: [
      { name: 'Pepperoni Pizza', portion: '2 slices' },
      { name: 'Soda', portion: '12 oz', container: 'can' },
    ],
    nutrition: { calories: 680, protein: 26, carbs: 72, fat: 32, sodium: 1580 },
    flags: ['processed_meat', 'refined_grain', 'high_sugar_beverage', 'high_sodium'],
  },
  // Salad (healthier lunch option)
  {
    foods: [
      { name: 'Caesar Salad', portion: '1 large' },
      { name: 'Grilled Chicken', portion: '4 oz' },
      { name: 'Croutons', portion: '1/4 cup' },
    ],
    nutrition: { calories: 420, protein: 32, carbs: 18, fat: 26, sodium: 820 },
    flags: ['refined_grain', 'high_sodium'],
  },
  // Leftovers / meal prep
  {
    foods: [
      { name: 'Leftover Pasta', portion: '2 cups' },
      { name: 'Water', portion: '16 oz' },
    ],
    nutrition: { calories: 480, protein: 16, carbs: 72, fat: 14, sodium: 680 },
    flags: ['refined_grain'],
  },
  // Chinese takeout
  {
    foods: [
      { name: 'Orange Chicken', portion: '1 serving' },
      { name: 'Fried Rice', portion: '1 cup' },
      { name: 'Egg Roll', portion: '1 roll' },
    ],
    nutrition: { calories: 920, protein: 32, carbs: 98, fat: 42, sodium: 1980 },
    flags: ['fried', 'refined_grain', 'high_sodium', 'ultra_processed'],
  },
  // Mexican fast food
  {
    foods: [
      { name: 'Burrito Bowl', portion: '1 bowl' },
      { name: 'Chips', portion: 'side' },
    ],
    nutrition: { calories: 820, protein: 36, carbs: 88, fat: 34, sodium: 1520 },
    flags: ['high_sodium'],
  },
  // Deli sandwich
  {
    foods: [
      { name: 'Ham & Cheese Sandwich', portion: '1 sandwich' },
      { name: 'Pickle', portion: '1 spear' },
      { name: 'Chips', portion: '1 oz bag' },
    ],
    nutrition: { calories: 620, protein: 28, carbs: 52, fat: 34, sodium: 1680 },
    flags: ['processed_meat', 'refined_grain', 'high_sodium'],
  },
  // Soup and sandwich combo
  {
    foods: [
      { name: 'Tomato Soup', portion: '1 cup' },
      { name: 'Grilled Cheese', portion: '1 sandwich' },
    ],
    nutrition: { calories: 540, protein: 16, carbs: 52, fat: 30, sodium: 1380 },
    flags: ['refined_grain', 'acidic_trigger', 'high_sodium'],
  },
  // Chicken nuggets meal
  {
    foods: [
      { name: 'Chicken Nuggets', portion: '10 pieces' },
      { name: 'BBQ Sauce', portion: '2 packets' },
      { name: 'Fries', portion: 'medium' },
      { name: 'Sprite', portion: '16 oz', container: 'plastic_bottle' },
    ],
    nutrition: { calories: 920, protein: 32, carbs: 98, fat: 44, sodium: 1520 },
    flags: ['fried', 'high_sugar_beverage', 'plastic', 'high_sodium', 'ultra_processed'],
  },
  // Hot dog from food cart
  {
    foods: [
      { name: 'Hot Dog', portion: '2 hot dogs' },
      { name: 'Soda', portion: '12 oz', container: 'can' },
    ],
    nutrition: { calories: 580, protein: 18, carbs: 52, fat: 32, sodium: 1480 },
    flags: ['processed_meat', 'high_sugar_beverage', 'high_sodium', 'ultra_processed'],
  },
  // Ramen (quick lunch)
  {
    foods: [
      { name: 'Instant Ramen', portion: '1 package' },
      { name: 'Egg', portion: '1 boiled' },
    ],
    nutrition: { calories: 480, protein: 14, carbs: 62, fat: 18, sodium: 1820 },
    flags: ['refined_grain', 'ultra_processed', 'high_sodium'],
  },
];

// DINNER - Average American dinner patterns
const DINNERS: MealTemplate[] = [
  // Steak dinner (weekend/special occasion)
  {
    foods: [
      { name: 'Ribeye Steak', portion: '10 oz' },
      { name: 'Baked Potato', portion: '1 large' },
      { name: 'Sour Cream', portion: '2 tbsp' },
      { name: 'Steamed Broccoli', portion: '1 cup' },
    ],
    nutrition: { calories: 820, protein: 58, carbs: 48, fat: 42, sodium: 520 },
    flags: ['charred_grilled'],
  },
  // Spaghetti and meatballs (classic American-Italian)
  {
    foods: [
      { name: 'Spaghetti', portion: '2 cups' },
      { name: 'Meatballs', portion: '4 meatballs' },
      { name: 'Marinara Sauce', portion: '1 cup' },
      { name: 'Garlic Bread', portion: '2 slices' },
    ],
    nutrition: { calories: 880, protein: 38, carbs: 98, fat: 36, sodium: 1480 },
    flags: ['refined_grain', 'acidic_trigger', 'high_sodium'],
  },
  // Fried chicken dinner
  {
    foods: [
      { name: 'Fried Chicken', portion: '2 pieces' },
      { name: 'Mashed Potatoes', portion: '1 cup' },
      { name: 'Gravy', portion: '1/4 cup' },
      { name: 'Coleslaw', portion: '1/2 cup' },
    ],
    nutrition: { calories: 920, protein: 42, carbs: 58, fat: 56, sodium: 1680 },
    flags: ['fried', 'high_sodium'],
  },
  // Grilled chicken and vegetables
  {
    foods: [
      { name: 'Grilled Chicken Breast', portion: '6 oz' },
      { name: 'Rice', portion: '1 cup' },
      { name: 'Mixed Vegetables', portion: '1 cup' },
    ],
    nutrition: { calories: 520, protein: 44, carbs: 52, fat: 12, sodium: 380 },
    flags: [],
  },
  // Pizza delivery (very common)
  {
    foods: [
      { name: 'Pepperoni Pizza', portion: '3 slices' },
      { name: 'Breadsticks', portion: '2 sticks' },
      { name: 'Beer', portion: '12 oz', container: 'can' },
    ],
    nutrition: { calories: 1020, protein: 38, carbs: 108, fat: 48, sodium: 2280 },
    flags: ['processed_meat', 'refined_grain', 'alcohol', 'high_sodium'],
  },
  // Tacos (Taco Tuesday)
  {
    foods: [
      { name: 'Ground Beef Tacos', portion: '3 tacos' },
      { name: 'Chips & Salsa', portion: '1 serving' },
      { name: 'Margarita', portion: '8 oz' },
    ],
    nutrition: { calories: 880, protein: 32, carbs: 72, fat: 42, sodium: 1380 },
    flags: ['acidic_trigger', 'alcohol', 'high_sodium'],
  },
  // Burger and fries at home
  {
    foods: [
      { name: 'Homemade Burger', portion: '1 burger' },
      { name: 'Frozen Fries', portion: '1 cup' },
      { name: 'Beer', portion: '12 oz', container: 'can' },
    ],
    nutrition: { calories: 820, protein: 36, carbs: 62, fat: 46, sodium: 1080 },
    flags: ['fried', 'alcohol'],
  },
  // BBQ ribs (weekend)
  {
    foods: [
      { name: 'BBQ Ribs', portion: '1/2 rack' },
      { name: 'Corn on the Cob', portion: '1 ear' },
      { name: 'Baked Beans', portion: '1/2 cup' },
      { name: 'Beer', portion: '12 oz', container: 'can' },
    ],
    nutrition: { calories: 1080, protein: 52, carbs: 68, fat: 62, sodium: 1820 },
    flags: ['charred_grilled', 'processed_meat', 'alcohol', 'high_sodium'],
  },
  // Salmon dinner (healthier option)
  {
    foods: [
      { name: 'Baked Salmon', portion: '6 oz' },
      { name: 'Quinoa', portion: '1 cup' },
      { name: 'Asparagus', portion: '6 spears' },
      { name: 'White Wine', portion: '5 oz', container: 'glass' },
    ],
    nutrition: { calories: 620, protein: 46, carbs: 42, fat: 26, sodium: 420 },
    flags: ['alcohol'],
  },
  // Chicken stir fry
  {
    foods: [
      { name: 'Chicken Stir Fry', portion: '2 cups' },
      { name: 'White Rice', portion: '1.5 cups' },
    ],
    nutrition: { calories: 680, protein: 38, carbs: 72, fat: 24, sodium: 1080 },
    flags: ['refined_grain', 'high_sodium'],
  },
  // Mac and cheese with hot dogs (comfort food)
  {
    foods: [
      { name: 'Mac and Cheese', portion: '2 cups' },
      { name: 'Hot Dogs', portion: '2 hot dogs' },
    ],
    nutrition: { calories: 920, protein: 32, carbs: 78, fat: 52, sodium: 2080 },
    flags: ['processed_meat', 'refined_grain', 'ultra_processed', 'high_sodium'],
  },
  // Takeout Chinese
  {
    foods: [
      { name: 'General Tsos Chicken', portion: '1 order' },
      { name: 'Fried Rice', portion: '1.5 cups' },
      { name: 'Egg Roll', portion: '2 rolls' },
    ],
    nutrition: { calories: 1280, protein: 42, carbs: 128, fat: 62, sodium: 2580 },
    flags: ['fried', 'refined_grain', 'high_sodium', 'ultra_processed'],
  },
  // Meatloaf dinner
  {
    foods: [
      { name: 'Meatloaf', portion: '2 slices' },
      { name: 'Mashed Potatoes', portion: '1 cup' },
      { name: 'Green Beans', portion: '1 cup' },
    ],
    nutrition: { calories: 720, protein: 42, carbs: 52, fat: 36, sodium: 1180 },
    flags: ['high_sodium'],
  },
  // Pasta Alfredo
  {
    foods: [
      { name: 'Fettuccine Alfredo', portion: '2 cups' },
      { name: 'Garlic Bread', portion: '2 slices' },
      { name: 'Red Wine', portion: '5 oz', container: 'glass' },
    ],
    nutrition: { calories: 980, protein: 28, carbs: 92, fat: 52, sodium: 1380 },
    flags: ['refined_grain', 'alcohol', 'high_sodium'],
  },
  // Fish and chips
  {
    foods: [
      { name: 'Fried Fish', portion: '2 pieces' },
      { name: 'French Fries', portion: '1 cup' },
      { name: 'Tartar Sauce', portion: '2 tbsp' },
      { name: 'Beer', portion: '12 oz', container: 'can' },
    ],
    nutrition: { calories: 920, protein: 38, carbs: 72, fat: 52, sodium: 1420 },
    flags: ['fried', 'alcohol', 'high_sodium'],
  },
  // Rotisserie chicken (store-bought convenience)
  {
    foods: [
      { name: 'Rotisserie Chicken', portion: '1/4 chicken' },
      { name: 'Dinner Roll', portion: '2 rolls' },
      { name: 'Mashed Potatoes (store)', portion: '1 cup' },
    ],
    nutrition: { calories: 620, protein: 42, carbs: 48, fat: 28, sodium: 1280 },
    flags: ['refined_grain', 'high_sodium'],
  },
];

// SNACKS - American snacking patterns
const SNACKS: MealTemplate[] = [
  // Chips and dip
  {
    foods: [{ name: 'Tortilla Chips', portion: '1 oz' }, { name: 'Queso', portion: '2 tbsp' }],
    nutrition: { calories: 220, protein: 4, carbs: 22, fat: 14, sodium: 380 },
    flags: ['ultra_processed', 'high_sodium'],
  },
  // Energy drink
  {
    foods: [{ name: 'Red Bull', portion: '12 oz', container: 'can' }],
    nutrition: { calories: 160, protein: 0, carbs: 40, fat: 0, sodium: 200 },
    flags: ['caffeine', 'high_sugar_beverage', 'ultra_processed'],
  },
  // Protein bar
  {
    foods: [{ name: 'Protein Bar', portion: '1 bar' }],
    nutrition: { calories: 220, protein: 20, carbs: 24, fat: 8, sodium: 220 },
    flags: ['ultra_processed'],
  },
  // Soda
  {
    foods: [{ name: 'Coca-Cola', portion: '20 oz', container: 'plastic_bottle' }],
    nutrition: { calories: 240, protein: 0, carbs: 65, fat: 0, sodium: 75 },
    flags: ['high_sugar_beverage', 'plastic'],
  },
  // Coffee drink
  {
    foods: [{ name: 'Starbucks Frappuccino', portion: '16 oz', container: 'plastic_bottle' }],
    nutrition: { calories: 380, protein: 5, carbs: 58, fat: 15, sodium: 220 },
    flags: ['caffeine', 'high_sugar_beverage', 'plastic'],
  },
  // Cookies
  {
    foods: [{ name: 'Oreos', portion: '5 cookies' }],
    nutrition: { calories: 270, protein: 3, carbs: 40, fat: 12, sodium: 230 },
    flags: ['refined_grain', 'ultra_processed'],
  },
  // Trail mix
  {
    foods: [{ name: 'Trail Mix', portion: '1/4 cup' }],
    nutrition: { calories: 180, protein: 5, carbs: 16, fat: 12, sodium: 80 },
    flags: [],
  },
  // Candy bar
  {
    foods: [{ name: 'Snickers Bar', portion: '1 bar' }],
    nutrition: { calories: 280, protein: 4, carbs: 36, fat: 14, sodium: 140 },
    flags: ['ultra_processed'],
  },
  // Ice cream
  {
    foods: [{ name: 'Ice Cream', portion: '1 cup' }],
    nutrition: { calories: 320, protein: 5, carbs: 38, fat: 17, sodium: 120 },
    flags: [],
  },
  // Popcorn
  {
    foods: [{ name: 'Microwave Popcorn', portion: '3 cups' }],
    nutrition: { calories: 180, protein: 3, carbs: 22, fat: 10, sodium: 320 },
    flags: ['ultra_processed'],
  },
  // Beer
  {
    foods: [{ name: 'Beer', portion: '12 oz', container: 'can' }],
    nutrition: { calories: 150, protein: 1, carbs: 13, fat: 0, sodium: 14 },
    flags: ['alcohol'],
  },
  // Wine
  {
    foods: [{ name: 'Wine', portion: '6 oz', container: 'glass' }],
    nutrition: { calories: 150, protein: 0, carbs: 5, fat: 0, sodium: 8 },
    flags: ['alcohol'],
  },
  // Granola bar
  {
    foods: [{ name: 'Granola Bar', portion: '1 bar' }],
    nutrition: { calories: 140, protein: 3, carbs: 24, fat: 5, sodium: 120 },
    flags: ['ultra_processed'],
  },
  // Cheese and crackers
  {
    foods: [{ name: 'Cheese Crackers', portion: '1 pack' }],
    nutrition: { calories: 200, protein: 4, carbs: 22, fat: 11, sodium: 380 },
    flags: ['refined_grain', 'ultra_processed', 'high_sodium'],
  },
  // Apple
  {
    foods: [{ name: 'Apple', portion: '1 medium' }],
    nutrition: { calories: 95, protein: 0, carbs: 25, fat: 0, sodium: 2 },
    flags: [],
  },
  // Afternoon coffee
  {
    foods: [{ name: 'Coffee', portion: '16 oz' }, { name: 'Creamer', portion: '2 tbsp' }],
    nutrition: { calories: 80, protein: 1, carbs: 8, fat: 5, sodium: 20 },
    flags: ['caffeine'],
  },
];

// ============================================================================
// MEAL GENERATION LOGIC
// ============================================================================

function createMeal(
  userId: string,
  template: MealTemplate,
  loggedAt: Date
): Meal {
  const hour = loggedAt.getHours();
  const isLateMeal = hour >= 21 || hour < 5;

  const flags = [...template.flags];
  if (isLateMeal && !flags.includes('late_meal')) {
    flags.push('late_meal');
  }

  return {
    id: generateId(),
    userId,
    loggedAt: new Date(loggedAt),
    foods: template.foods.map(f => ({
      name: f.name,
      portion: f.portion,
      container: f.container,
    })),
    nutrition: { ...template.nutrition },
    flags,
    metadata: {
      source: randomFrom(['phone_photo', 'gallery', 'phone_photo'] as const),
    },
  };
}

function generateDaysOfMeals(userId: string, numDays: number): Meal[] {
  const meals: Meal[] = [];
  const endDate = new Date();
  endDate.setHours(12, 0, 0, 0); // Normalize to noon

  // Distribute days randomly throughout the year instead of consecutive
  const totalDaysInYear = 365;
  const skipRate = Math.max(1, Math.floor(totalDaysInYear / numDays));

  // For realistic data, we'll generate meals for numDays spread throughout the year
  let daysGenerated = 0;
  let currentDate = addDays(endDate, -365);

  while (daysGenerated < numDays && currentDate <= endDate) {
    // Randomly decide if we log this day (weighted by desired coverage)
    const shouldLogToday = Math.random() < (numDays / totalDaysInYear) * 1.1;

    if (shouldLogToday) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isFriday = dayOfWeek === 5;

      // Generate breakfast (75% chance on weekdays, 85% on weekends)
      if (Math.random() < (isWeekend ? 0.85 : 0.75)) {
        const breakfastTime = new Date(currentDate);
        breakfastTime.setHours(randomBetween(6, 10), randomBetween(0, 59));
        meals.push(createMeal(userId, randomFrom(BREAKFASTS), breakfastTime));
      }

      // Generate lunch (80% chance)
      if (Math.random() < 0.80) {
        const lunchTime = new Date(currentDate);
        lunchTime.setHours(randomBetween(11, 14), randomBetween(0, 59));
        meals.push(createMeal(userId, randomFrom(LUNCHES), lunchTime));
      }

      // Generate dinner (90% chance)
      if (Math.random() < 0.90) {
        const dinnerTime = new Date(currentDate);

        // Late dinners more common on weekends and Fridays
        if ((isWeekend || isFriday) && Math.random() < 0.35) {
          dinnerTime.setHours(randomBetween(21, 23), randomBetween(0, 59));
        } else {
          dinnerTime.setHours(randomBetween(17, 20), randomBetween(0, 59));
        }
        meals.push(createMeal(userId, randomFrom(DINNERS), dinnerTime));
      }

      // Generate snacks (65% chance, higher on weekends)
      const snackChance = isWeekend ? 0.80 : 0.65;
      if (Math.random() < snackChance) {
        const snackTime = new Date(currentDate);
        const snackHour = randomBetween(10, 22);
        snackTime.setHours(snackHour, randomBetween(0, 59));
        meals.push(createMeal(userId, randomFrom(SNACKS), snackTime));
      }

      // Second snack (35% chance)
      if (Math.random() < 0.35) {
        const snackTime = new Date(currentDate);
        snackTime.setHours(randomBetween(14, 21), randomBetween(0, 59));
        meals.push(createMeal(userId, randomFrom(SNACKS), snackTime));
      }

      daysGenerated++;
    }

    currentDate = addDays(currentDate, 1);
  }

  // Sort by date descending (most recent first)
  meals.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

  return meals;
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

/**
 * Generate 20% of a year's worth of American diet data (~73 days)
 */
export function generateAmericanDiet20(userId: string = 'demo_user'): Meal[] {
  return generateDaysOfMeals(userId, 73);
}

/**
 * Generate 50% of a year's worth of American diet data (~183 days)
 */
export function generateAmericanDiet50(userId: string = 'demo_user'): Meal[] {
  return generateDaysOfMeals(userId, 183);
}

/**
 * Generate 80% of a year's worth of American diet data (~292 days)
 */
export function generateAmericanDiet80(userId: string = 'demo_user'): Meal[] {
  return generateDaysOfMeals(userId, 292);
}

/**
 * Generate 100% of a year's worth of American diet data (365 days)
 */
export function generateAmericanDiet100(userId: string = 'demo_user'): Meal[] {
  return generateDaysOfMeals(userId, 365);
}

/**
 * Generate custom percentage of year
 */
export function generateAmericanDiet(userId: string, percentage: number): Meal[] {
  const days = Math.round((percentage / 100) * 365);
  return generateDaysOfMeals(userId, days);
}

// Summary statistics for validation
export function getDatasetSummary(meals: Meal[]) {
  if (meals.length === 0) return null;

  const dates = meals.map(m => new Date(m.loggedAt).toDateString());
  const uniqueDays = new Set(dates).size;

  const totalCalories = meals.reduce((sum, m) => sum + (m.nutrition?.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.nutrition?.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.nutrition?.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.nutrition?.fat || 0), 0);

  return {
    totalMeals: meals.length,
    uniqueDays,
    avgMealsPerDay: (meals.length / uniqueDays).toFixed(1),
    avgDailyCalories: Math.round(totalCalories / uniqueDays),
    avgDailyProtein: Math.round(totalProtein / uniqueDays),
    avgDailyCarbs: Math.round(totalCarbs / uniqueDays),
    avgDailyFat: Math.round(totalFat / uniqueDays),
    dateRange: {
      start: new Date(Math.min(...meals.map(m => new Date(m.loggedAt).getTime()))).toLocaleDateString(),
      end: new Date(Math.max(...meals.map(m => new Date(m.loggedAt).getTime()))).toLocaleDateString(),
    },
    flagCounts: meals.reduce((counts, m) => {
      m.flags.forEach(flag => {
        counts[flag] = (counts[flag] || 0) + 1;
      });
      return counts;
    }, {} as Record<string, number>),
  };
}
