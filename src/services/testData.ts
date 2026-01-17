import { Meal, FoodItem, Nutrition } from '../types';

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to get a random item from array
const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number between min and max
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to add/subtract days from a date
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// US American meal templates by type
const BREAKFAST_MEALS = [
  {
    foods: [{ name: 'Scrambled Eggs', portion: '2 eggs' }, { name: 'Bacon', portion: '3 strips' }, { name: 'Toast', portion: '2 slices' }],
    nutrition: { calories: 450, protein: 22, carbs: 28, fat: 28, sodium: 980 },
    flags: ['processed_meat', 'refined_grain'],
  },
  {
    foods: [{ name: 'Pancakes', portion: '3 pancakes' }, { name: 'Maple Syrup', portion: '3 tbsp' }, { name: 'Orange Juice', portion: '8 oz', container: 'plastic_bottle' as const }],
    nutrition: { calories: 620, protein: 10, carbs: 98, fat: 18, sodium: 650 },
    flags: ['refined_grain', 'high_sugar_beverage', 'plastic'],
  },
  {
    foods: [{ name: 'Cereal', portion: '1.5 cups' }, { name: 'Milk', portion: '1 cup' }],
    nutrition: { calories: 320, protein: 10, carbs: 52, fat: 8, sodium: 380 },
    flags: ['refined_grain', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Bagel with Cream Cheese', portion: '1 bagel' }, { name: 'Coffee', portion: '12 oz' }],
    nutrition: { calories: 410, protein: 12, carbs: 58, fat: 16, sodium: 520 },
    flags: ['refined_grain', 'caffeine'],
  },
  {
    foods: [{ name: 'Sausage McMuffin', portion: '1 sandwich' }, { name: 'Hash Browns', portion: '1 piece' }, { name: 'Coffee', portion: '16 oz' }],
    nutrition: { calories: 580, protein: 18, carbs: 45, fat: 35, sodium: 1150 },
    flags: ['processed_meat', 'ultra_processed', 'high_sodium', 'fried', 'caffeine'],
  },
  {
    foods: [{ name: 'Avocado Toast', portion: '2 slices' }, { name: 'Poached Eggs', portion: '2 eggs' }],
    nutrition: { calories: 420, protein: 18, carbs: 32, fat: 26, sodium: 420 },
    flags: [],
  },
  {
    foods: [{ name: 'Oatmeal', portion: '1 cup' }, { name: 'Banana', portion: '1 medium' }, { name: 'Coffee', portion: '12 oz' }],
    nutrition: { calories: 350, protein: 10, carbs: 62, fat: 8, sodium: 180 },
    flags: ['caffeine'],
  },
  {
    foods: [{ name: 'Breakfast Burrito', portion: '1 large' }, { name: 'Salsa', portion: '2 tbsp' }],
    nutrition: { calories: 520, protein: 22, carbs: 48, fat: 26, sodium: 920 },
    flags: ['acidic_trigger', 'high_sodium', 'refined_grain'],
  },
  {
    foods: [{ name: 'French Toast', portion: '3 slices' }, { name: 'Sausage Links', portion: '3 links' }],
    nutrition: { calories: 580, protein: 18, carbs: 52, fat: 32, sodium: 780 },
    flags: ['processed_meat', 'refined_grain'],
  },
  {
    foods: [{ name: 'Smoothie Bowl', portion: '1 bowl' }, { name: 'Granola', portion: '1/4 cup' }],
    nutrition: { calories: 380, protein: 8, carbs: 68, fat: 10, sodium: 120 },
    flags: [],
  },
  {
    foods: [{ name: 'Donuts', portion: '2 donuts' }, { name: 'Coffee', portion: '16 oz' }],
    nutrition: { calories: 520, protein: 6, carbs: 62, fat: 28, sodium: 380 },
    flags: ['refined_grain', 'fried', 'caffeine', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Greek Yogurt', portion: '1 cup' }, { name: 'Berries', portion: '1/2 cup' }, { name: 'Honey', portion: '1 tbsp' }],
    nutrition: { calories: 280, protein: 18, carbs: 38, fat: 6, sodium: 80 },
    flags: [],
  },
];

const LUNCH_MEALS = [
  {
    foods: [{ name: 'Turkey Sandwich', portion: '1 sandwich' }, { name: 'Chips', portion: '1 oz bag' }, { name: 'Soda', portion: '12 oz', container: 'plastic_bottle' as const }],
    nutrition: { calories: 620, protein: 24, carbs: 72, fat: 26, sodium: 1450 },
    flags: ['processed_meat', 'refined_grain', 'high_sugar_beverage', 'plastic', 'high_sodium', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Caesar Salad', portion: '1 large' }, { name: 'Grilled Chicken', portion: '6 oz' }],
    nutrition: { calories: 480, protein: 38, carbs: 18, fat: 28, sodium: 820 },
    flags: ['high_sodium'],
  },
  {
    foods: [{ name: 'Cheeseburger', portion: '1 burger' }, { name: 'French Fries', portion: 'medium' }, { name: 'Coke', portion: '20 oz', container: 'plastic_bottle' as const }],
    nutrition: { calories: 1150, protein: 32, carbs: 118, fat: 58, sodium: 1680 },
    flags: ['fried', 'high_sugar_beverage', 'plastic', 'high_sodium', 'refined_grain', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Burrito Bowl', portion: '1 bowl' }, { name: 'Chips & Guac', portion: 'side' }],
    nutrition: { calories: 780, protein: 34, carbs: 82, fat: 32, sodium: 1420 },
    flags: ['high_sodium'],
  },
  {
    foods: [{ name: 'Pizza', portion: '3 slices' }, { name: 'Diet Coke', portion: '16 oz', container: 'plastic_bottle' as const }],
    nutrition: { calories: 720, protein: 28, carbs: 84, fat: 32, sodium: 1580 },
    flags: ['refined_grain', 'plastic', 'high_sodium', 'acidic_trigger', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Soup & Salad', portion: '1 combo' }, { name: 'Bread', portion: '1 roll' }],
    nutrition: { calories: 420, protein: 18, carbs: 52, fat: 16, sodium: 980 },
    flags: ['refined_grain'],
  },
  {
    foods: [{ name: 'Chicken Nuggets', portion: '10 pieces' }, { name: 'Honey Mustard', portion: '2 packets' }, { name: 'Fries', portion: 'medium' }],
    nutrition: { calories: 780, protein: 28, carbs: 68, fat: 42, sodium: 1380 },
    flags: ['fried', 'ultra_processed', 'high_sodium'],
  },
  {
    foods: [{ name: 'Tuna Salad', portion: '1 sandwich' }, { name: 'Apple', portion: '1 medium' }],
    nutrition: { calories: 420, protein: 26, carbs: 42, fat: 16, sodium: 720 },
    flags: ['refined_grain'],
  },
  {
    foods: [{ name: 'Ramen', portion: '1 large bowl' }],
    nutrition: { calories: 580, protein: 22, carbs: 68, fat: 22, sodium: 1820 },
    flags: ['high_sodium', 'refined_grain', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Grilled Cheese', portion: '1 sandwich' }, { name: 'Tomato Soup', portion: '1 cup' }],
    nutrition: { calories: 520, protein: 18, carbs: 48, fat: 28, sodium: 1280 },
    flags: ['refined_grain', 'acidic_trigger', 'high_sodium'],
  },
  {
    foods: [{ name: 'Sushi Roll', portion: '8 pieces' }, { name: 'Miso Soup', portion: '1 cup' }, { name: 'Edamame', portion: '1/2 cup' }],
    nutrition: { calories: 520, protein: 24, carbs: 62, fat: 18, sodium: 980 },
    flags: [],
  },
  {
    foods: [{ name: 'Hot Dog', portion: '2 hot dogs' }, { name: 'Chips', portion: '1 oz bag' }, { name: 'Lemonade', portion: '16 oz', container: 'plastic_bottle' as const }],
    nutrition: { calories: 680, protein: 18, carbs: 72, fat: 36, sodium: 1520 },
    flags: ['processed_meat', 'plastic', 'high_sodium', 'high_sugar_beverage', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Poke Bowl', portion: '1 regular' }],
    nutrition: { calories: 580, protein: 32, carbs: 62, fat: 22, sodium: 820 },
    flags: [],
  },
  {
    foods: [{ name: 'Tacos', portion: '3 tacos' }, { name: 'Mexican Rice', portion: '1/2 cup' }, { name: 'Horchata', portion: '12 oz' }],
    nutrition: { calories: 720, protein: 28, carbs: 82, fat: 32, sodium: 1180 },
    flags: ['high_sodium'],
  },
];

const DINNER_MEALS = [
  {
    foods: [{ name: 'Grilled Steak', portion: '8 oz' }, { name: 'Baked Potato', portion: '1 large' }, { name: 'Steamed Broccoli', portion: '1 cup' }],
    nutrition: { calories: 680, protein: 52, carbs: 48, fat: 28, sodium: 420 },
    flags: ['charred_grilled'],
  },
  {
    foods: [{ name: 'Spaghetti & Meatballs', portion: '2 cups' }, { name: 'Garlic Bread', portion: '2 slices' }, { name: 'Red Wine', portion: '5 oz', container: 'glass' as const }],
    nutrition: { calories: 880, protein: 32, carbs: 92, fat: 38, sodium: 1280 },
    flags: ['refined_grain', 'acidic_trigger', 'alcohol', 'high_sodium'],
  },
  {
    foods: [{ name: 'Fried Chicken', portion: '2 pieces' }, { name: 'Mac & Cheese', portion: '1 cup' }, { name: 'Coleslaw', portion: '1/2 cup' }],
    nutrition: { calories: 920, protein: 42, carbs: 62, fat: 52, sodium: 1580 },
    flags: ['fried', 'high_sodium', 'ultra_processed', 'refined_grain'],
  },
  {
    foods: [{ name: 'Salmon', portion: '6 oz' }, { name: 'Quinoa', portion: '1 cup' }, { name: 'Asparagus', portion: '6 spears' }],
    nutrition: { calories: 520, protein: 42, carbs: 38, fat: 22, sodium: 380 },
    flags: [],
  },
  {
    foods: [{ name: 'BBQ Ribs', portion: '1/2 rack' }, { name: 'Cornbread', portion: '2 pieces' }, { name: 'Beer', portion: '12 oz', container: 'can' as const }],
    nutrition: { calories: 1020, protein: 48, carbs: 68, fat: 56, sodium: 1820 },
    flags: ['charred_grilled', 'alcohol', 'high_sodium'],
  },
  {
    foods: [{ name: 'Chicken Stir Fry', portion: '2 cups' }, { name: 'White Rice', portion: '1 cup' }],
    nutrition: { calories: 580, protein: 36, carbs: 62, fat: 18, sodium: 980 },
    flags: ['refined_grain'],
  },
  {
    foods: [{ name: 'Pasta Alfredo', portion: '2 cups' }, { name: 'Breadsticks', portion: '2 sticks' }],
    nutrition: { calories: 920, protein: 28, carbs: 98, fat: 46, sodium: 1420 },
    flags: ['refined_grain', 'high_sodium', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Burgers on the Grill', portion: '2 patties' }, { name: 'Corn on the Cob', portion: '1 ear' }, { name: 'Beer', portion: '12 oz', container: 'can' as const }],
    nutrition: { calories: 780, protein: 42, carbs: 52, fat: 42, sodium: 920 },
    flags: ['charred_grilled', 'alcohol'],
  },
  {
    foods: [{ name: 'Shrimp Scampi', portion: '1.5 cups' }, { name: 'Angel Hair Pasta', portion: '1.5 cups' }, { name: 'White Wine', portion: '5 oz', container: 'glass' as const }],
    nutrition: { calories: 720, protein: 32, carbs: 72, fat: 32, sodium: 880 },
    flags: ['refined_grain', 'alcohol'],
  },
  {
    foods: [{ name: 'Meatloaf', portion: '2 slices' }, { name: 'Mashed Potatoes', portion: '1 cup' }, { name: 'Green Beans', portion: '1 cup' }],
    nutrition: { calories: 680, protein: 38, carbs: 52, fat: 32, sodium: 1080 },
    flags: ['high_sodium'],
  },
  {
    foods: [{ name: 'Teriyaki Chicken', portion: '6 oz' }, { name: 'Fried Rice', portion: '1.5 cups' }],
    nutrition: { calories: 720, protein: 38, carbs: 82, fat: 24, sodium: 1320 },
    flags: ['refined_grain', 'high_sodium', 'fried'],
  },
  {
    foods: [{ name: 'Fish Tacos', portion: '3 tacos' }, { name: 'Margarita', portion: '8 oz' }],
    nutrition: { calories: 680, protein: 28, carbs: 58, fat: 32, sodium: 920 },
    flags: ['alcohol', 'fried'],
  },
  {
    foods: [{ name: 'Roast Chicken', portion: '1/4 chicken' }, { name: 'Roasted Vegetables', portion: '1.5 cups' }, { name: 'Dinner Roll', portion: '1 roll' }],
    nutrition: { calories: 580, protein: 42, carbs: 38, fat: 28, sodium: 620 },
    flags: [],
  },
  {
    foods: [{ name: 'Philly Cheesesteak', portion: '1 sandwich' }, { name: 'Onion Rings', portion: '8 rings' }],
    nutrition: { calories: 980, protein: 42, carbs: 78, fat: 52, sodium: 1680 },
    flags: ['fried', 'refined_grain', 'high_sodium', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Thai Curry', portion: '2 cups' }, { name: 'Jasmine Rice', portion: '1 cup' }],
    nutrition: { calories: 680, protein: 28, carbs: 72, fat: 32, sodium: 1180 },
    flags: ['spicy_irritant', 'high_sodium'],
  },
  {
    foods: [{ name: 'Pepperoni Pizza', portion: '4 slices' }, { name: 'Beer', portion: '12 oz', container: 'can' as const }],
    nutrition: { calories: 1020, protein: 38, carbs: 98, fat: 48, sodium: 2180 },
    flags: ['processed_meat', 'refined_grain', 'alcohol', 'high_sodium', 'acidic_trigger'],
  },
];

const SNACKS = [
  {
    foods: [{ name: 'Chips & Salsa', portion: '1 serving' }],
    nutrition: { calories: 280, protein: 4, carbs: 38, fat: 14, sodium: 520 },
    flags: ['acidic_trigger', 'ultra_processed', 'high_sodium'],
  },
  {
    foods: [{ name: 'Energy Drink', portion: '16 oz', container: 'can' as const }],
    nutrition: { calories: 220, protein: 0, carbs: 54, fat: 0, sodium: 180 },
    flags: ['caffeine', 'high_sugar_beverage', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Trail Mix', portion: '1/4 cup' }],
    nutrition: { calories: 180, protein: 5, carbs: 16, fat: 12, sodium: 80 },
    flags: [],
  },
  {
    foods: [{ name: 'Protein Bar', portion: '1 bar' }],
    nutrition: { calories: 220, protein: 20, carbs: 22, fat: 8, sodium: 240 },
    flags: ['ultra_processed'],
  },
  {
    foods: [{ name: 'Soda', portion: '20 oz', container: 'plastic_bottle' as const }],
    nutrition: { calories: 240, protein: 0, carbs: 65, fat: 0, sodium: 75 },
    flags: ['high_sugar_beverage', 'plastic'],
  },
  {
    foods: [{ name: 'Popcorn', portion: '3 cups' }],
    nutrition: { calories: 150, protein: 3, carbs: 18, fat: 8, sodium: 280 },
    flags: [],
  },
  {
    foods: [{ name: 'Cookies', portion: '3 cookies' }],
    nutrition: { calories: 280, protein: 3, carbs: 38, fat: 14, sodium: 180 },
    flags: ['refined_grain', 'ultra_processed'],
  },
  {
    foods: [{ name: 'Ice Cream', portion: '1 cup' }],
    nutrition: { calories: 320, protein: 5, carbs: 38, fat: 17, sodium: 120 },
    flags: [],
  },
  {
    foods: [{ name: 'Candy Bar', portion: '1 bar' }],
    nutrition: { calories: 280, protein: 4, carbs: 36, fat: 14, sodium: 140 },
    flags: ['ultra_processed'],
  },
  {
    foods: [{ name: 'Coffee', portion: '16 oz' }],
    nutrition: { calories: 5, protein: 0, carbs: 0, fat: 0, sodium: 10 },
    flags: ['caffeine'],
  },
  {
    foods: [{ name: 'Iced Coffee', portion: '16 oz', container: 'plastic_bottle' as const }],
    nutrition: { calories: 180, protein: 2, carbs: 38, fat: 3, sodium: 80 },
    flags: ['caffeine', 'plastic', 'high_sugar_beverage'],
  },
  {
    foods: [{ name: 'Cheese & Crackers', portion: '1 serving' }],
    nutrition: { calories: 220, protein: 8, carbs: 18, fat: 14, sodium: 380 },
    flags: ['refined_grain'],
  },
  {
    foods: [{ name: 'Apple with Peanut Butter', portion: '1 apple + 2 tbsp' }],
    nutrition: { calories: 290, protein: 8, carbs: 32, fat: 16, sodium: 140 },
    flags: [],
  },
  {
    foods: [{ name: 'Pretzels', portion: '1 oz' }],
    nutrition: { calories: 110, protein: 3, carbs: 23, fat: 1, sodium: 450 },
    flags: ['refined_grain', 'ultra_processed', 'high_sodium'],
  },
  {
    foods: [{ name: 'Beer', portion: '12 oz', container: 'can' as const }],
    nutrition: { calories: 150, protein: 1, carbs: 13, fat: 0, sodium: 14 },
    flags: ['alcohol'],
  },
  {
    foods: [{ name: 'Wine', portion: '5 oz', container: 'glass' as const }],
    nutrition: { calories: 125, protein: 0, carbs: 4, fat: 0, sodium: 6 },
    flags: ['alcohol'],
  },
];

const DESSERTS = [
  {
    foods: [{ name: 'Chocolate Cake', portion: '1 slice' }],
    nutrition: { calories: 380, protein: 5, carbs: 52, fat: 18, sodium: 320 },
    flags: ['refined_grain'],
  },
  {
    foods: [{ name: 'Cheesecake', portion: '1 slice' }],
    nutrition: { calories: 420, protein: 7, carbs: 38, fat: 28, sodium: 280 },
    flags: ['refined_grain'],
  },
  {
    foods: [{ name: 'Brownie', portion: '1 large' }],
    nutrition: { calories: 320, protein: 4, carbs: 42, fat: 16, sodium: 180 },
    flags: ['refined_grain'],
  },
  {
    foods: [{ name: 'Apple Pie', portion: '1 slice' }, { name: 'Vanilla Ice Cream', portion: '1 scoop' }],
    nutrition: { calories: 480, protein: 5, carbs: 68, fat: 22, sodium: 320 },
    flags: ['refined_grain'],
  },
  {
    foods: [{ name: 'Milkshake', portion: '16 oz', container: 'plastic_bottle' as const }],
    nutrition: { calories: 580, protein: 12, carbs: 82, fat: 24, sodium: 280 },
    flags: ['plastic', 'high_sugar_beverage'],
  },
];

// Holiday-specific meals
const HOLIDAY_MEALS = {
  thanksgiving: [
    {
      foods: [
        { name: 'Roast Turkey', portion: '6 oz' },
        { name: 'Stuffing', portion: '1 cup' },
        { name: 'Mashed Potatoes & Gravy', portion: '1 cup' },
        { name: 'Cranberry Sauce', portion: '1/4 cup' },
        { name: 'Green Bean Casserole', portion: '1/2 cup' },
      ],
      nutrition: { calories: 1200, protein: 58, carbs: 128, fat: 48, sodium: 2100 },
      flags: ['refined_grain', 'high_sodium'],
    },
    {
      foods: [{ name: 'Pumpkin Pie', portion: '1 slice' }, { name: 'Whipped Cream', portion: '2 tbsp' }],
      nutrition: { calories: 380, protein: 5, carbs: 48, fat: 20, sodium: 280 },
      flags: ['refined_grain'],
    },
  ],
  christmas: [
    {
      foods: [
        { name: 'Prime Rib', portion: '8 oz' },
        { name: 'Yorkshire Pudding', portion: '2 pieces' },
        { name: 'Roasted Vegetables', portion: '1 cup' },
        { name: 'Red Wine', portion: '6 oz', container: 'glass' as const },
      ],
      nutrition: { calories: 980, protein: 52, carbs: 42, fat: 58, sodium: 920 },
      flags: ['alcohol'],
    },
    {
      foods: [{ name: 'Ham', portion: '6 oz' }, { name: 'Scalloped Potatoes', portion: '1 cup' }, { name: 'Rolls', portion: '2 rolls' }],
      nutrition: { calories: 820, protein: 38, carbs: 68, fat: 42, sodium: 1680 },
      flags: ['processed_meat', 'refined_grain', 'high_sodium'],
    },
    {
      foods: [{ name: 'Eggnog', portion: '8 oz' }],
      nutrition: { calories: 340, protein: 10, carbs: 34, fat: 19, sodium: 130 },
      flags: ['alcohol'],
    },
  ],
  fourthOfJuly: [
    {
      foods: [
        { name: 'Grilled Burgers', portion: '2 burgers' },
        { name: 'Hot Dogs', portion: '1 hot dog' },
        { name: 'Potato Salad', portion: '1 cup' },
        { name: 'Beer', portion: '24 oz', container: 'can' as const },
      ],
      nutrition: { calories: 1380, protein: 52, carbs: 82, fat: 78, sodium: 2280 },
      flags: ['processed_meat', 'charred_grilled', 'alcohol', 'high_sodium'],
    },
    {
      foods: [{ name: 'Watermelon', portion: '2 cups' }, { name: 'Corn on the Cob', portion: '2 ears' }],
      nutrition: { calories: 220, protein: 6, carbs: 52, fat: 3, sodium: 20 },
      flags: [],
    },
    {
      foods: [{ name: 'Ice Cream Sundae', portion: '1 large' }],
      nutrition: { calories: 480, protein: 8, carbs: 68, fat: 22, sodium: 180 },
      flags: [],
    },
  ],
  superbowl: [
    {
      foods: [
        { name: 'Buffalo Wings', portion: '10 wings' },
        { name: 'Nachos', portion: '1 plate' },
        { name: 'Beer', portion: '24 oz', container: 'can' as const },
      ],
      nutrition: { calories: 1580, protein: 58, carbs: 92, fat: 98, sodium: 3200 },
      flags: ['fried', 'alcohol', 'high_sodium', 'spicy_irritant'],
    },
    {
      foods: [{ name: 'Pizza', portion: '4 slices' }, { name: 'Beer', portion: '12 oz', container: 'can' as const }],
      nutrition: { calories: 1120, protein: 38, carbs: 108, fat: 52, sodium: 2180 },
      flags: ['refined_grain', 'alcohol', 'high_sodium', 'acidic_trigger'],
    },
  ],
  halloween: [
    {
      foods: [{ name: 'Candy Corn', portion: '1/2 cup' }, { name: 'Chocolate Bars', portion: '3 mini bars' }],
      nutrition: { calories: 420, protein: 3, carbs: 82, fat: 12, sodium: 140 },
      flags: ['ultra_processed'],
    },
  ],
  easter: [
    {
      foods: [
        { name: 'Glazed Ham', portion: '6 oz' },
        { name: 'Deviled Eggs', portion: '4 halves' },
        { name: 'Rolls', portion: '2 rolls' },
        { name: 'White Wine', portion: '5 oz', container: 'glass' as const },
      ],
      nutrition: { calories: 780, protein: 42, carbs: 52, fat: 38, sodium: 1580 },
      flags: ['processed_meat', 'refined_grain', 'alcohol', 'high_sodium'],
    },
  ],
};

// Generate one year of test data
export function generateYearOfTestData(userId: string = 'demo_user'): Meal[] {
  const meals: Meal[] = [];
  const endDate = new Date();
  const startDate = addDays(endDate, -365);

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const month = currentDate.getMonth();
    const dayOfMonth = currentDate.getDate();

    // Determine if it's a holiday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isThanksgiving = month === 10 && dayOfWeek === 4 && dayOfMonth >= 22 && dayOfMonth <= 28;
    const isChristmas = month === 11 && (dayOfMonth === 24 || dayOfMonth === 25);
    const isFourthOfJuly = month === 6 && dayOfMonth === 4;
    const isSuperbowlSunday = month === 1 && dayOfWeek === 0 && dayOfMonth >= 1 && dayOfMonth <= 14;
    const isHalloween = month === 9 && dayOfMonth === 31;
    const isEaster = month === 3 && dayOfWeek === 0 && dayOfMonth >= 1 && dayOfMonth <= 25;

    // Generate breakfast (80% chance)
    if (Math.random() < 0.8) {
      const breakfastTime = new Date(currentDate);
      breakfastTime.setHours(randomBetween(6, 10), randomBetween(0, 59));

      const breakfast = randomFrom(BREAKFAST_MEALS);
      meals.push(createMeal(userId, breakfast, breakfastTime));
    }

    // Generate lunch (85% chance)
    if (Math.random() < 0.85) {
      const lunchTime = new Date(currentDate);
      lunchTime.setHours(randomBetween(11, 14), randomBetween(0, 59));

      const lunch = randomFrom(LUNCH_MEALS);
      meals.push(createMeal(userId, lunch, lunchTime));
    }

    // Generate dinner
    if (isThanksgiving) {
      const dinnerTime = new Date(currentDate);
      dinnerTime.setHours(randomBetween(15, 17), randomBetween(0, 59));
      meals.push(createMeal(userId, HOLIDAY_MEALS.thanksgiving[0], dinnerTime));

      // Thanksgiving dessert
      const dessertTime = new Date(currentDate);
      dessertTime.setHours(randomBetween(19, 21), randomBetween(0, 59));
      meals.push(createMeal(userId, HOLIDAY_MEALS.thanksgiving[1], dessertTime));
    } else if (isChristmas) {
      const dinnerTime = new Date(currentDate);
      dinnerTime.setHours(randomBetween(17, 19), randomBetween(0, 59));
      meals.push(createMeal(userId, randomFrom(HOLIDAY_MEALS.christmas), dinnerTime));
    } else if (isFourthOfJuly) {
      // Afternoon BBQ
      const bbqTime = new Date(currentDate);
      bbqTime.setHours(randomBetween(14, 16), randomBetween(0, 59));
      meals.push(createMeal(userId, HOLIDAY_MEALS.fourthOfJuly[0], bbqTime));

      // Sides/snacks
      const snackTime = new Date(currentDate);
      snackTime.setHours(randomBetween(17, 19), randomBetween(0, 59));
      meals.push(createMeal(userId, HOLIDAY_MEALS.fourthOfJuly[1], snackTime));

      // Dessert
      const dessertTime = new Date(currentDate);
      dessertTime.setHours(randomBetween(20, 22), randomBetween(0, 59));
      meals.push(createMeal(userId, HOLIDAY_MEALS.fourthOfJuly[2], dessertTime));
    } else if (isSuperbowlSunday) {
      const partyTime = new Date(currentDate);
      partyTime.setHours(randomBetween(17, 19), randomBetween(0, 59));
      meals.push(createMeal(userId, randomFrom(HOLIDAY_MEALS.superbowl), partyTime));
    } else if (isHalloween) {
      // Regular dinner
      const dinnerTime = new Date(currentDate);
      dinnerTime.setHours(randomBetween(17, 19), randomBetween(0, 59));
      meals.push(createMeal(userId, randomFrom(DINNER_MEALS), dinnerTime));

      // Halloween candy
      const candyTime = new Date(currentDate);
      candyTime.setHours(randomBetween(20, 22), randomBetween(0, 59));
      meals.push(createMeal(userId, HOLIDAY_MEALS.halloween[0], candyTime));
    } else if (isEaster) {
      const dinnerTime = new Date(currentDate);
      dinnerTime.setHours(randomBetween(14, 16), randomBetween(0, 59));
      meals.push(createMeal(userId, HOLIDAY_MEALS.easter[0], dinnerTime));
    } else {
      // Regular dinner (95% chance)
      if (Math.random() < 0.95) {
        const dinnerTime = new Date(currentDate);

        // Late meals more common on weekends and Fridays
        const isLateNightProne = isWeekend || dayOfWeek === 5;
        if (isLateNightProne && Math.random() < 0.35) {
          dinnerTime.setHours(randomBetween(21, 23), randomBetween(0, 59));
        } else {
          dinnerTime.setHours(randomBetween(17, 20), randomBetween(0, 59));
        }

        const dinner = randomFrom(DINNER_MEALS);
        meals.push(createMeal(userId, dinner, dinnerTime));
      }
    }

    // Generate snacks (60% chance, higher on weekends)
    const snackChance = isWeekend ? 0.75 : 0.6;
    if (Math.random() < snackChance) {
      const snackTime = new Date(currentDate);
      const snackHour = randomBetween(10, 22);
      snackTime.setHours(snackHour, randomBetween(0, 59));

      const snack = randomFrom(SNACKS);
      // Add late_meal flag if after 9pm and has caffeine
      const snackMeal = createMeal(userId, snack, snackTime);
      if (snackHour >= 14 && snack.flags.includes('caffeine')) {
        // Keep track of late caffeine
      }
      meals.push(snackMeal);
    }

    // Second snack chance (30%)
    if (Math.random() < 0.3) {
      const snackTime = new Date(currentDate);
      snackTime.setHours(randomBetween(14, 17), randomBetween(0, 59));

      const snack = randomFrom(SNACKS);
      meals.push(createMeal(userId, snack, snackTime));
    }

    // Dessert (40% chance)
    if (Math.random() < 0.4) {
      const dessertTime = new Date(currentDate);
      dessertTime.setHours(randomBetween(19, 22), randomBetween(0, 59));

      const dessert = randomFrom(DESSERTS);
      meals.push(createMeal(userId, dessert, dessertTime));
    }

    currentDate = addDays(currentDate, 1);
  }

  // Sort by date
  meals.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

  return meals;
}

function createMeal(
  userId: string,
  template: {
    foods: { name: string; portion: string; container?: 'plastic_bottle' | 'glass' | 'can' | 'none' }[];
    nutrition: Nutrition;
    flags: string[];
  },
  loggedAt: Date
): Meal {
  // Check for late meal
  const hour = loggedAt.getHours();
  const isLateMeal = hour >= 21 || hour < 5;

  const flags = [...template.flags];
  if (isLateMeal && !flags.includes('late_meal')) {
    flags.push('late_meal');
  }

  return {
    id: generateId(),
    userId,
    loggedAt,
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

// Cache for generated test data (so it doesn't change on each refresh)
const testDataCache: Map<string, Meal[]> = new Map();

// Export a function to get test data (can be called from meals service)
export function getTestData(userId: string = 'demo_user'): Meal[] {
  // Return cached data if available
  if (testDataCache.has(userId)) {
    return testDataCache.get(userId)!;
  }

  // Generate and cache the data
  const meals = generateYearOfTestData(userId);
  testDataCache.set(userId, meals);
  return meals;
}

// Clear cache (useful for testing or forcing regeneration)
export function clearTestDataCache(): void {
  testDataCache.clear();
}
